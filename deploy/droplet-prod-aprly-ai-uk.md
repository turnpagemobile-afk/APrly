# Дроплет: aprly.ai (prod) — waitlist → повний стек

**Константи:**

| Що | Значення |
|----|----------|
| IP | `162.243.244.118` |
| Домен | `aprly.ai`, `www.aprly.ai` |
| Git гілка | `dev` |
| Каталог | `/var/www/aprly` |
| ACME webroot | `/var/www/aprly/certbot-www` |
| PEM для Docker | `/var/www/aprly/nginx-ssl/fullchain.pem`, `privkey.pem` |

Dev-сервер (`dev.aprly.ai`, `134.122.126.71`) — [droplet-dev-aprly-ai-uk.md](./droplet-dev-aprly-ai-uk.md).

---

## 0. SSH і COMPOSE

```bash
ssh ubuntu@162.243.244.118
export COMPOSE="docker compose -f /var/www/aprly/docker-compose.prod.yml --env-file /var/www/aprly/.env.prod"
```

---

## 1. Перший clone (один раз)

```bash
cd /var/www/aprly
git clone https://github.com/turnpagemobile-afk/APrly.git .
git checkout dev
git log -1 --oneline
mkdir -p certbot-www nginx-ssl
chmod -R a+rX certbot-www
```

---

## 2. `.env.prod` — waitlist (мінімум)

```bash
nano /var/www/aprly/.env.prod
```

```env
POSTGRES_USER=aprly
POSTGRES_PASSWORD=<strong-secret>
POSTGRES_DB=aprly
DATABASE_URL=postgres://aprly:<strong-secret>@db:5432/aprly
JWT_SECRET=<random-32-chars-min>
FRONTEND_ORIGIN=https://aprly.ai
SITE_MODE=waitlist
FRONTEND_DOCKERFILE=Dockerfile.waitlist
```

---

## 3. Міграції і старт (waitlist)

```bash
cd /var/www/aprly
export COMPOSE_PARALLEL_LIMIT=1
$COMPOSE --profile ops run --rm db-migrate
$COMPOSE build frontend api-server
$COMPOSE up -d
$COMPOSE ps
curl -fsSI http://127.0.0.1/ | head -5
```

Перевірка API:

```bash
curl -fsS -X POST http://127.0.0.1/api/waitlist \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com"}'
```

---

## 4. DNS

GoDaddy: A `@` → `162.243.244.118`, CNAME `www` → `aprly.ai` (якщо ще немає).

```bash
dig +short aprly.ai A
```

---

## 5. Certbot

```bash
sudo certbot certonly --webroot \
  -w /var/www/aprly/certbot-www \
  -d aprly.ai -d www.aprly.ai \
  --agree-tos -m admin@aprly.ai --non-interactive
```

Скопіювати PEM (як у [droplet-dev-aprly-ai-uk.md](./droplet-dev-aprly-ai-uk.md) §5):

```bash
sudo cp -L /etc/letsencrypt/live/aprly.ai/fullchain.pem /var/www/aprly/nginx-ssl/fullchain.pem
sudo cp -L /etc/letsencrypt/live/aprly.ai/privkey.pem /var/www/aprly/nginx-ssl/privkey.pem
sudo chown root:root /var/www/aprly/nginx-ssl/*.pem
sudo chmod 644 /var/www/aprly/nginx-ssl/fullchain.pem
sudo chmod 640 /var/www/aprly/nginx-ssl/privkey.pem
$COMPOSE up -d --force-recreate frontend
```

---

## 6. Оновлення waitlist-коду

```bash
cd /var/www/aprly
git fetch --all --prune
git checkout dev
git pull origin dev
$COMPOSE --profile ops run --rm db-migrate
$COMPOSE build frontend api-server
$COMPOSE up -d
```

---

## 7. Перехід на повний сайт (live)

У `.env.prod`:

```env
SITE_MODE=live
# FRONTEND_DOCKERFILE=Dockerfile.frontend   # або видалити рядок — default
FRONTEND_ORIGIN=https://aprly.ai
# + повні секрети: STRIPE_*, PLAID_*, SENDGRID_*, GHL_*, ...
```

```bash
$COMPOSE --profile ops run --rm db-migrate
export COMPOSE_PARALLEL_LIMIT=1
$COMPOSE build frontend api-server
$COMPOSE up -d
```

Той самий Postgres volume (`aprly-pgdata`), той самий `/var/www/aprly`.
