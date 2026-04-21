# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## APRly App

`artifacts/aprly` — premium dark-mode FinTech web app (React + Vite + Tailwind). Features:
- Hero "Debt Interest Optimizer" calculator (live, animated, accessible)
- Voice Assistant mode (Web Speech API: synthesis + recognition)
- Plaid Link integration (sandbox, simulated backend)
- Stripe-style $39/mo paywall
- Dashboard with credit score gauge, rate reductions, hardship portal stepper
- Backend routes in `artifacts/api-server/src/routes/`: leads, optimizer, plaid, stripe, dashboard
- Postgres (Drizzle) `leads` table in `lib/db/src/schema/leads.ts`

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
