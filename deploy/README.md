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
- Deploy script: `git fetch + reset --hard origin/main` -> `compose --profile ops build` (includes **`aprly-migrate`**) ->
  `up -d` -> `db-migrate` -> `db-seed` -> healthcheck `https://134-122-126-71.nip.io/api/healthz`.

## Manual deployment (when CI is unavailable)

```bash
cd /var/www/aprly
git fetch --all --prune
git checkout main
git reset --hard origin/main
$COMPOSE --profile ops build
$COMPOSE up -d
$COMPOSE --profile ops run --rm db-migrate
$COMPOSE --profile ops run --rm db-seed
curl -fsS https://134-122-126-71.nip.io/api/healthz && echo OK
# Legacy HTTP by IP (still served on port 80 default_server):
curl -fsS http://134.122.126.71/api/healthz && echo OK
```

## Rolling back

Two equivalent paths.

### Option A — re-run CI deploy from a previous SHA

1. GitHub -> Actions -> deploy -> Run workflow.
2. Choose Branch / Tag dropdown -> pick the older commit on `main`.
3. Run; deploy.yml will reset the droplet checkout to that commit.

### Option B — direct on the droplet

```bash
cd /var/www/aprly
git log --oneline -10                 # find the good commit
git reset --hard <SHA>
$COMPOSE --profile ops build
$COMPOSE up -d
```

After rollback, fix the bug on `petrychenko_dev` and merge a forward fix to
`main` so CI/CD can resume normal flow.

## Database operations

| Action | Command |
| --- | --- |
| Open psql | `$COMPOSE exec db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"` |
| Re-run migrations only | `$COMPOSE --profile ops run --rm db-migrate` (applies SQL from `lib/db/migrations/` via `drizzle-kit migrate`) |
| Re-run seed only | `$COMPOSE --profile ops run --rm db-seed` |
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

## HTTPS (nip.io + Let’s Encrypt)

Canonical production URL until the customer provides DNS: **`https://134-122-126-71.nip.io`**.

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
