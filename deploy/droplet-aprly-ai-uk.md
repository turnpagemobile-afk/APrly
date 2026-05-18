# Дроплет: aprly.ai + Let's Encrypt (крок 2 після DNS)

**Передумова:** у GoDaddy A `@` → `134.122.126.71`, CNAME `www` → `aprly.ai`; `dig +short aprly.ai A` показує IP дроплета.

**Константи:**

| Що | Значення |
|----|----------|
| IP | `134.122.126.71` |
| Домен | `aprly.ai`, `www.aprly.ai` |
| Каталог | `/var/www/aprly` |
| ACME webroot | `/var/www/aprly/certbot-www` |
| PEM для Docker | `/var/www/aprly/nginx-ssl/fullchain.pem`, `privkey.pem` |

---

## 0. SSH і COMPOSE

```bash
ssh ubuntu@134.122.126.71
export COMPOSE="docker compose -f /var/www/aprly/docker-compose.prod.yml --env-file /var/www/aprly/.env.prod"
```

---

## 1. Оновити код на дроплеті

```bash
cd /var/www/aprly
git fetch --all --prune
git checkout main   # або гілка з merge aprly.ai nginx
git pull origin main
git log -1 --oneline
```

У коміті мають бути `nginx/aprly.conf` з `server_name aprly.ai www.aprly.ai`.

---

## 2. `.env.prod` — FRONTEND_ORIGIN

```bash
nano /var/www/aprly/.env.prod
```

Встановіть (або додайте):

```bash
FRONTEND_ORIGIN=https://aprly.ai
```

За потреби Plaid:

```bash
PLAID_REDIRECT_URI=https://aprly.ai/
```

Зберегти. **api-server** треба перезапустити після зміни (крок 6).

---

## 3. Збірка frontend (новий nginx) і старт

```bash
cd /var/www/aprly
$COMPOSE build frontend
$COMPOSE up -d
```

На `:443` спочатку може бути **self-signed** (CN=aprly.ai) — це нормально до Certbot.

Перевірка HTTP (ACME + редірект):

```bash
curl -fsSI http://aprly.ai/.well-known/acme-challenge/test || true
curl -fsSI http://aprly.ai/ | head -5
```

---

## 4. Certbot — сертифікат для aprly.ai + www

```bash
sudo chmod -R a+rX /var/www/aprly/certbot-www
```

**Перший раз (інтерактивно):**

```bash
sudo certbot certonly --webroot \
  -w /var/www/aprly/certbot-www \
  -d aprly.ai \
  -d www.aprly.ai
```

**Повторно (non-interactive, замініть email):**

```bash
sudo certbot certonly --webroot \
  -w /var/www/aprly/certbot-www \
  -d aprly.ai \
  -d www.aprly.ai \
  --agree-tos \
  -m admin@aprly.ai \
  --non-interactive
```

Перевірка:

```bash
sudo ls -la /etc/letsencrypt/live/aprly.ai/
```

*(Якщо certbot створив каталог з іншим ім’ям — використайте шлях з `live/`.)*

---

## 5. Скопіювати PEM у nginx-ssl

```bash
sudo cp -L /etc/letsencrypt/live/aprly.ai/fullchain.pem /var/www/aprly/nginx-ssl/fullchain.pem
sudo cp -L /etc/letsencrypt/live/aprly.ai/privkey.pem /var/www/aprly/nginx-ssl/privkey.pem
sudo chown root:root /var/www/aprly/nginx-ssl/fullchain.pem /var/www/aprly/nginx-ssl/privkey.pem
sudo chmod 644 /var/www/aprly/nginx-ssl/fullchain.pem
sudo chmod 640 /var/www/aprly/nginx-ssl/privkey.pem
```

---

## 6. Перезапуск frontend + api-server

```bash
cd /var/www/aprly
$COMPOSE up -d --no-deps --force-recreate frontend
$COMPOSE up -d --no-deps --force-recreate api-server
```

---

## 7. Перевірки

```bash
curl -fsSI https://aprly.ai/api/healthz
curl -fsSI https://www.aprly.ai/api/healthz
```

У браузері: `https://aprly.ai` — APRly без попередження TLS.

```bash
$COMPOSE ps
$COMPOSE logs --tail=40 frontend
```

---

## 8. Після цього — Stripe (окремий крок)

У Stripe Dashboard → Webhooks:

- Endpoint: `https://aprly.ai/api/stripe/webhook`
- Оновити `STRIPE_WEBHOOK_SECRET` у `.env.prod` → `$COMPOSE up -d --no-deps --force-recreate api-server`

Деталі: [deploy/README.md](./README.md).

---

## nip.io (legacy)

Після перемикання nginx на `aprly.ai` **`https://134-122-126-71.nip.io`** перестане мати валідний LE-сертифікат для nip (якщо не додавати окремий vhost). Прод — **`https://aprly.ai`**.

---

## Помилки

| Симптом | Дія |
|---------|-----|
| Certbot 403/404 на challenge | `chmod -R a+rX certbot-www`; nginx слухає `aprly.ai:80` з `location /.well-known` |
| `cannot load certificate` | Права PEM: `root:root`, `privkey` **640** |
| API CORS / cookies | `FRONTEND_ORIGIN=https://aprly.ai`, recreate **api-server** |
| Старий сайт на IP | `http://134.122.126.71` — `default_server` на :80, ок |

---

## Renewal

Після `certbot renew` знову скопіюйте PEM у `nginx-ssl/` і `force-recreate frontend` (див. [droplet-https-uk.md](./droplet-https-uk.md) §11).
