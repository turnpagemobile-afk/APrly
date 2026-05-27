# APRly droplet runbook

Quick reference for operating the production droplet.

## Hosts and paths

- Host: `ubuntu@134.122.126.71` (SSH key auth only, root login allowed but unused)
- Repo on droplet: `/var/www/aprly` (owned by `ubuntu:ubuntu`)
- Env file: `/var/www/aprly/.env.prod` (mode `0600`, NOT in git). Must define
  Postgres + `DATABASE_URL`, OpenAI (`AI_INTEGRATIONS_OPENAI_*`), and for Plaid
  routes: `PLAID_CLIENT_ID`, `PLAID_SECRET`, `PLAID_ENV` (`sandbox` /
  `development` / `production`). Optional: `PLAID_REDIRECT_URI` (required for
  some Link flows once DNS/TLS is live).
- Super admin seed (passed into the `db-seed` container via compose):
  `ADMIN_SEED_EMAIL` (default `super.admin@aprly.ai`) and **`ADMIN_SEED_PASSWORD`**
  (required — if empty, seed skips admin and `/admin/login` will always 401).
- Public listener: `nginx` container on **TCP 80** (legacy `http://<IP>/`) and **TCP 443** (HTTPS for `https://134-122-126-71.nip.io/` — Stripe / Plaid / cookies).
- TLS files on host: `/var/www/aprly/nginx-ssl/` (`fullchain.pem`, `privkey.pem`). Until real certs exist, the image entrypoint drops a **short-lived self-signed** pair so nginx can bind `:443` (replace after Certbot; see **HTTPS** below).
- ACME webroot on host: `/var/www/aprly/certbot-www/` — used for Let's Encrypt **HTTP-01** (mounted read-only into nginx).
- Private services (docker network only): `db` (postgres:16), `api-server` (node)
- Postgres data volume: `aprly-pgdata`

## Compose entry points

All commands assume `cd /var/www/aprly`.

```bash
COMPOSE="docker compose -f docker-compose.prod.yml --env-file .env.prod"
```

| Action | Command |
| --- | --- |
| Status | `$COMPOSE ps` |
| All logs (follow) | `$COMPOSE logs -f` |
| Logs for one service | `$COMPOSE logs -f api-server` (or `frontend`, `db`) |
| Last 200 lines | `$COMPOSE logs --tail=200 api-server` |
| Restart one service | `$COMPOSE up -d --no-deps --force-recreate api-server` |
| Stop everything | `$COMPOSE down` |
| Stop + delete db volume | `$COMPOSE down -v` (DESTROYS DATA) |

## CI/CD overview

- `validate` (`.github/workflows/ci.yml`) runs on every PR and push to `main` /
  `petrychenko_dev`. Pragmatic typecheck and sanity builds.
- `deploy` (`.github/workflows/deploy.yml`) auto-triggers when `validate`
  finishes successfully on `main`. Also exposed as `workflow_dispatch`.
- Deploy script: `git fetch + reset --hard origin/main` -> sequential `build` (`api-server`, `frontend`, `db-migrate`) with
  `COMPOSE_PARALLEL_LIMIT=1` -> `up -d` -> `db-migrate` -> `db-seed` -> healthcheck `https://dev.aprly.ai/api/healthz`.
- SSH step timeout **45m** (job **50m**). Full log append: `/var/www/aprly/.deploy-last.log`.

## Manual deployment (when CI is unavailable)

**Always update git before `compose build`** — Docker builds whatever is on disk; without `git reset` you rebuild old code.

```bash
cd /var/www/aprly
export COMPOSE_PARALLEL_LIMIT=1
COMPOSE="docker compose -f docker-compose.prod.yml --env-file .env.prod"

git fetch --all --prune
git checkout main
git reset --hard origin/main
git log -1 --oneline

$COMPOSE build api-server
$COMPOSE build frontend
$COMPOSE --profile ops build db-migrate
$COMPOSE up -d
$COMPOSE --profile ops run --rm db-migrate
$COMPOSE --profile ops run --rm db-seed
curl -fsS https://dev.aprly.ai/api/healthz && echo OK
# Legacy HTTP by IP (still served on port 80 default_server):
curl -fsS http://134.122.126.71/api/healthz && echo OK
```

## Troubleshooting deploy

| Symptom | What to do |
| --- | --- |
| GitHub Actions SSH step failed; UI log won't expand / no Download archive | SSH to droplet: `tail -100 /var/www/aprly/.deploy-last.log` |
| `ERR_PNPM_META_FETCH_FAIL`, `ECONNRESET` during `api-server` build | Unstable npm from droplet; retry `$COMPOSE build api-server`. Check `curl -I https://registry.npmjs.org` |
| Build succeeded but site old | You skipped `git reset --hard origin/main` before build |
| `Killed` / exit 137 during build | OOM on 1 vCPU / 2 GB VPS; use `COMPOSE_PARALLEL_LIMIT=1`, retry off-peak |
| Missing PDF logo | Not `local_docs/` (gitignored). Asset: `artifacts/api-server/assets/aprly-logo.png` on `main` |

First prod build after a Dockerfile change can take **30–45+ minutes** on the small droplet; later builds use Docker layer cache.

## Cabinet PWA (scoped `/dashboard`)

Install is intended **only from the logged-in user cabinet**, not the marketing landing page.

| Asset | Purpose |
| --- | --- |
| `artifacts/aprly/public/manifest-cabinet.webmanifest` | `scope: /dashboard`, `start_url: /dashboard?tab=home` |
| `artifacts/aprly/public/icons/*.png` | Install icons (192, 512, Apple 180) |
| Service worker | Generated at build via `vite-plugin-pwa` (`registerType: autoUpdate`); registered from `DashboardShell` |
| `/var/www/aprly/.deploy-last.log` | CI deploy log on droplet (not PWA-specific) |

### Updates after deploy

1. Deploy on `main` rebuilds the frontend and publishes a new `/dashboard/sw.js` + precached assets (nginx serves cabinet `sw.js` with `no-cache`). Root `/sw.js` is a one-shot cleanup worker for the old mono PWA only.
2. Cabinet uses Workbox `autoUpdate` (`skipWaiting` + `clientsClaim`). On **online**, **focus**, **tab visible**, and **PWA resume** the app calls `registration.update()` to fetch a new `sw.js`.
3. **Installed PWA (standalone):** when an update is found, the app reloads automatically (or on `controllerchange` after `skipWaiting`).
4. **Browser tab:** banner **“A new version of APRly is ready”** + **Refresh app** (activates the waiting worker and reloads).
5. If UI is still stale: DevTools → Application → Unregister service workers → Clear site data, then reopen `/dashboard/`.

**Stale UI after multi-SPA deploy (new landing, old cabinet):** an older site-wide service worker (mono build, scope `/`) can keep serving cached `/dashboard/*` assets. After deploy, open `/` once (hard refresh), complete registration again, or DevTools → Application → Service Workers → Unregister all → Clear site data. New builds unregister non-cabinet workers on landing and cabinet boot.

**Manifest scope changes** (e.g. `/dashboard/` → `/dashboard`): existing installs may keep the old scope until the user **removes and re-adds** the home-screen app.

After a failed deploy or PWA issue on prod:

```bash
tail -100 /var/www/aprly/.deploy-last.log   # CI
# Browser: install from /dashboard Home tab; offline banner when navigator.onLine is false
curl -fsS https://dev.aprly.ai/api/healthz
```

**Smoke checklist**

- [ ] `/` does not offer site-wide install (no global manifest link in `index.html`)
- [ ] `/dashboard?tab=home` with active subscription: Install / Add to Home Screen works
- [ ] Installed app: **Home** and **Dashboard** tabs both render (URLs `/dashboard?tab=home` and `?tab=dashboard`)
- [ ] `/api/*` is not cached offline (banner + blocked Plaid/create plan)
- [ ] `sw.js` returns `Cache-Control: no-cache` from nginx
- [ ] After a new deploy, update banner appears or hard reload shows a new `index-*.js` hash in Network

Regenerate icons: `pnpm --filter @workspace/aprly run pwa:icons` (requires `pnpm approve-builds sharp` or macOS `sips`).

## Rolling back

Two equivalent paths.

### Option A — re-run CI deploy from a previous SHA

1. GitHub -> Actions -> deploy -> Run workflow.
2. Choose Branch / Tag dropdown -> pick the older commit on `main`.
3. Run; deploy.yml will reset the droplet checkout to that commit.

### Option B — direct on the droplet

```bash
cd /var/www/aprly
export COMPOSE_PARALLEL_LIMIT=1
COMPOSE="docker compose -f docker-compose.prod.yml --env-file .env.prod"
git log --oneline -10                 # find the good commit
git reset --hard <SHA>
$COMPOSE build api-server
$COMPOSE build frontend
$COMPOSE --profile ops build db-migrate
$COMPOSE up -d
```

After rollback, fix the bug on `petrychenko_dev` and merge a forward fix to
`main` so CI/CD can resume normal flow.

## Database operations

| Action | Command |
| --- | --- |
| Open psql | `$COMPOSE exec db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"` |
| Re-run migrations only | `$COMPOSE --profile ops run --rm db-migrate` (applies SQL from `lib/db/migrations/` via `drizzle-kit migrate`) |
| Local dev (repo root) | `pnpm run db:migrate` with `DATABASE_URL`, or `docker compose run --rm db-migrate` after new files in `lib/db/migrations/` |
| Re-run seed only | `$COMPOSE --profile ops run --rm db-seed` (check logs for `[seed] admin user id=…`; `skip admin user` means `ADMIN_SEED_PASSWORD` was not passed into the container) |
| Quick row count | `$COMPOSE exec db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c 'SELECT count(*) FROM leads;'` |
| Backup (tar+psql dump) | `$COMPOSE exec db pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > /var/www/aprly/backups/aprly-$(date -u +%Y%m%dT%H%M%SZ).sql` |

`POSTGRES_USER` / `POSTGRES_DB` come from `.env.prod`; `psql` reads them when
shelled inside the `db` container.

Backups directory `/var/www/aprly/backups/` should be created with `mkdir -p`
the first time. Off-droplet backups are out of scope for this runbook.

## Editing `.env.prod`

```bash
cd /var/www/aprly
sudo -n true 2>/dev/null || true        # we own the file as ubuntu
nano .env.prod
$COMPOSE up -d                          # re-reads env on container restart
```

For changes that affect the build (rare; almost everything we use is runtime
env), follow with
`$COMPOSE --profile ops build db-migrate && $COMPOSE build api-server frontend && $COMPOSE up -d`
(or `$COMPOSE --profile ops build` to rebuild all images that have a `build:` section).

## Common failure modes

- **`Permission denied (publickey)` in deploy logs**: regenerate `aprly_ci`
  pair, append the new pubkey to `~/.ssh/authorized_keys`, replace the
  `DROPLET_SSH_KEY` GitHub secret with the new private key.
- **`workflow_run` does not start deploy**: check that `validate` finished on
  `main` (head_branch matters). Manual re-run via `workflow_dispatch`.
- **`relation "leads" already exists` during `db-migrate`**: production DB often
  had `leads` created earlier via `drizzle-kit push` without the migrations
  journal. The bundled `0000_auth_registration.sql` is **idempotent** (`IF NOT EXISTS`);
  pull latest `main`, rebuild the migrate image, and re-run `db-migrate`.
  If you changed `0000_*.sql` **after** it was already applied on a machine,
  Drizzle may report a checksum mismatch — fix by restoring the file that was
  applied or by manual intervention on `__drizzle_migrations` (avoid on prod
  without a backup).
- **Healthcheck times out**: usually means `api-server` is up but unable to
  reach `db`. Inspect `$COMPOSE logs api-server` for connection errors and
  `$COMPOSE logs db` for startup state.
- **Disk full warnings**: `docker system prune -af` (no volumes) and check
  `/var/lib/docker/volumes/aprly-pgdata/_data` size.
- **Out-of-band git changes on the droplet**: `deploy.yml` resets hard, so
  any uncommitted edits in `/var/www/aprly` are wiped on next deploy. Make
  edits in the repo and push instead.
- **Missing system libraries / `Error loading shared library` on the droplet**:
  production `api-server` and `db-migrate` are meant to run **only inside Docker**
  images built from the repo (`Dockerfile.api`, `Dockerfile.migrate`). Do not
  install Node or `pnpm` on the host to run the API. Build stages install
  `python3`, `make`, `g++` where **native npm addons** may compile; the runtime
  stage is minimal `node:*-slim` with the bundled `dist/index.mjs` only. New
  dependencies with native binaries must be validated in `docker compose … build`
  (not only on a dev laptop). Auth passwords use **bcryptjs** (pure JS) to avoid
  shipping `bcrypt` `.node` bindings into that minimal runtime.
- **`ERR_MODULE_NOT_FOUND` for `plaid`, `stripe`, etc. inside `api-server` container**:
  the production image has **no** `node_modules` — only the esbuild output under
  `dist/`. If `artifacts/api-server/build.mjs` lists a runtime dependency under
  `external`, it will not be bundled and the process will crash at import. Only
  add names to `external` for packages that truly cannot be bundled; see the
  comment block above `external` in `build.mjs`.

## HTTPS (dev.aprly.ai + Let’s Encrypt)

Canonical production URL: **`https://dev.aprly.ai`** (DNS A `dev` → droplet). Apex **`aprly.ai`** / **`www`** stay on GoDaddy parking (not this nginx).

**Step-by-step (Ukrainian):** [deploy/droplet-dev-aprly-ai-uk.md](./droplet-dev-aprly-ai-uk.md)

Legacy apex runbook (superseded): [deploy/droplet-aprly-ai-uk.md](./droplet-aprly-ai-uk.md)

Legacy nip.io URL (until decommissioned): **`https://134-122-126-71.nip.io`** — see [droplet-https-uk.md](./droplet-https-uk.md).

**Full step-by-step commands (permissions, Certbot, PEM copy, Stripe, renewal)** — Ukrainian: **[deploy/droplet-https-uk.md](./droplet-https-uk.md)**.

Short English notes were kept below for quick orientation only.

### Host paths (recap)

- ACME webroot: `/var/www/aprly/certbot-www` → mounted read-only into nginx as `/var/www/certbot`.
- TLS PEMs: `/var/www/aprly/nginx-ssl/{fullchain.pem,privkey.pem}` — **must be readable by nginx in Docker** (after `cp -L` from `/etc/letsencrypt/live/...`, use **`root:root`** and **`chmod 644` / `640`**; see UA doc — `chown ubuntu:ubuntu` alone on `privkey.pem` often breaks TLS).

### `.env.prod` (recap)

```bash
FRONTEND_ORIGIN=https://134-122-126-71.nip.io
```

### Install Certbot (host)

```bash
sudo apt update && sudo apt install -y certbot
```

### Issue cert (stack must be up for HTTP-01)

```bash
sudo certbot certonly --webroot -w /var/www/aprly/certbot-www -d 134-122-126-71.nip.io
```

### Copy PEMs + reload `frontend`

See **[deploy/droplet-https-uk.md](./droplet-https-uk.md)** — sections 6–7 (exact `cp -L`, `chown`, `chmod`, `$COMPOSE … force-recreate frontend`).

### Stripe webhook (recap)

`https://134-122-126-71.nip.io/api/stripe/webhook` → signing secret → `STRIPE_WEBHOOK_SECRET` → recreate **`api-server`**.

### Renewal

Use `certbot renew` + re-copy PEMs + recreate `frontend`, or a `--deploy-hook`; full example in **[deploy/droplet-https-uk.md](./droplet-https-uk.md)** section 11.

**Fix cron example:** files under `/etc/cron.d/` must include a user column, e.g.  
`0 3 * * * root certbot renew -q --deploy-hook /usr/local/sbin/aprly-ssl-deploy.sh`

## What is NOT here yet

- Off-droplet backups (S3/Spaces).
- Slack/Telegram deploy notifications.
- Branch protection / required CI on `main` — pending Admin role.
