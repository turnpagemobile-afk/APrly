# Threat Model

## Project Overview

APRly is a pnpm-workspace TypeScript monorepo for a fintech-style web application. The production-relevant pieces are a React + Vite frontend in `artifacts/aprly`, an Express 5 API in `artifacts/api-server`, generated OpenAPI/Zod client libraries in `lib/api-client-react` and `lib/api-zod`, and a PostgreSQL/Drizzle data layer in `lib/db`.

The currently implemented production API is mostly public and prototype-oriented: lead capture persists to Postgres, the optimizer performs calculations in memory, and the Plaid/Stripe routes are explicitly sandbox-simulated. There is no implemented user authentication or admin role system in production code today. Per project assumptions, production runs with `NODE_ENV=production`, TLS is provided by the platform, and the `artifacts/mockup-sandbox` app is dev-only and should not be treated as production-reachable unless proven otherwise.

## Assets

- **Lead and contact data** — names, email addresses, debt amounts, interest-rate information submitted through `/api/leads`. This is personal financial intake data and should not be exposed, corrupted, or mass-collected abusively.
- **Prospective payment card data entered on the paywall** — the frontend currently renders card-number, expiry, CVC, ZIP, and name fields. Even if the backend does not persist them, the application must treat these values as highly sensitive because they enter first-party browser state.
- **Application availability and database capacity** — the public API can be reached anonymously. Unbounded writes or computational abuse can consume database/storage resources and degrade service.
- **Environment secrets and infrastructure configuration** — `DATABASE_URL`, deployment ports, and any future Stripe/Plaid secrets must remain server-only.
- **API contract integrity** — OpenAPI schemas and generated Zod/client code define what the backend accepts and returns. Relaxed schemas can widen the attack surface across both frontend and backend simultaneously.

## Trust Boundaries

- **Browser to API** — every frontend call to `/api/*` crosses from an untrusted client into the backend. All request bodies, query parameters, and headers must be treated as attacker-controlled.
- **API to PostgreSQL** — `/api/leads` crosses into the database boundary and can create persistent records. Abuse here can impact confidentiality, integrity, and availability.
- **Public to privileged financial integrations** — the app presents Plaid/Stripe-branded flows, but the current backend endpoints are sandbox-simulated. Future upgrades to real integrations will create high-sensitivity boundaries that must not inherit prototype shortcuts.
- **Production to dev-only tooling** — `artifacts/mockup-sandbox` and related preview code are not production by assumption and should be ignored for production findings unless deployment reachability is demonstrated.
- **Server configuration boundary** — CORS, request parsing, logging, and environment variables in `artifacts/api-server/src/app.ts` and `src/lib/logger.ts` affect every route globally.

## Scan Anchors

- **Production entry points**: `artifacts/api-server/src/index.ts`, `artifacts/api-server/src/app.ts`, `artifacts/api-server/src/routes/*`, `artifacts/aprly/src/App.tsx`, `artifacts/aprly/src/pages/*`, `lib/db/src/*`.
- **Highest-risk code areas**: public write endpoint `artifacts/api-server/src/routes/leads.ts`; checkout flow `artifacts/aprly/src/pages/paywall.tsx`; Plaid/Stripe simulation routes and client flows in `artifacts/api-server/src/routes/plaid.ts`, `artifacts/api-server/src/routes/stripe.ts`, and `artifacts/aprly/src/components/plaid-link-button.tsx`.
- **Public vs authenticated vs admin surfaces**: all implemented frontend routes and API routes are currently public; there are no authenticated or admin-only server surfaces in production code.
- **Usually ignore unless proven reachable**: `artifacts/mockup-sandbox/**` and development-only Vite plugins/preview helpers.

## Threat Categories

### Tampering

Because the application accepts anonymous JSON requests and persists lead records, the server must validate and constrain all public inputs, not merely parse them. Public write endpoints must resist abusive or malformed submissions, and any future financial integrations must keep all pricing, subscription, and account-linking state authoritative on the server.

Required guarantees:
- Public POST routes MUST enforce validation strong enough to prevent malformed or oversized persistence.
- State-changing routes MUST include anti-abuse controls appropriate for anonymous traffic, such as rate limits and/or other admission controls.
- Prototype sandbox behaviors MUST NOT be reused for real Stripe/Plaid flows without server-side verification.

### Information Disclosure

APRly handles personal financial intake data and presents a checkout form that collects raw cardholder fields in the browser. Sensitive values must stay out of logs, error surfaces, analytics, and unnecessary client-side handling. Public routes that return mock data today must remain non-sensitive until real user data is introduced, at which point authentication and response scoping become mandatory.

Required guarantees:
- Lead data and any future linked-account or subscription data MUST NOT be exposed to unauthorized callers.
- Raw payment card details MUST NOT be unnecessarily handled by first-party application code when a provider-hosted tokenization flow is available.
- Logs and error responses MUST avoid leaking secrets, tokens, cookies, and personal financial data.

### Denial of Service

The backend is a small public Express API backed by Postgres. Anonymous endpoints that write to the database or trigger repeated calculations can be abused for spam, storage growth, or general service degradation if they lack throttling and bounded inputs.

Required guarantees:
- Anonymous routes MUST have request-size and abuse controls proportionate to their cost.
- Database-backed write paths MUST prevent trivial mass-submission and storage exhaustion.
- External-service integrations added later MUST use timeouts and bounded retries.

### Spoofing

There is no current user authentication system, so scans should not report missing auth on purely public mock/prototype surfaces unless sensitive per-user state is actually exposed. However, once real Plaid/Stripe integrations or user dashboards are introduced, the application must authenticate end users and verify third-party callbacks server-side.

Required guarantees:
- Any future protected user data or billing state MUST require server-enforced authentication before exposure or mutation.
- Any future Stripe/Plaid webhook or callback endpoint MUST verify origin/signatures before trusting incoming requests.
