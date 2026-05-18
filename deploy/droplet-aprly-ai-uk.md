# Дроплет: перехід з nip.io на **aprly.ai**

DNS: **A** (або **ALIAS/ANAME** apex) на IP дроплета `134.122.126.71`. За бажанням **www** → CNAME на `aprly.ai` або окремий A.

Канонічний URL: **`https://aprly.ai`** (`www` редіректиться на apex у nginx).

---

## 0. Оновити код на дроплеті

```bash
cd /var/www/aprly
git fetch origin
git checkout main
git reset --hard origin/main
git log -1 --oneline
```

## 1. Змінна Compose

```bash
export COMPOSE="docker compose -f /var/www/aprly/docker-compose.prod.yml --env-file /var/www/aprly/.env.prod"
```

## 2. `.env.prod` на сервері

```bash
nano /var/www/aprly/.env.prod
```

Мінімум:

```bash
FRONTEND_ORIGIN=https://aprly.ai
```

Якщо є Plaid redirect — оновіть **`PLAID_REDIRECT_URI`** на **https** з `aprly.ai` і той самий URI в Plaid Dashboard.

## 3. Перезібрати frontend (новий `nginx/aprly.conf`)

```bash
cd /var/www/aprly
$COMPOSE build frontend
$COMPOSE up -d
```

Перевірка HTTP (до нового LE — можливий self-signed на 443):

```bash
curl -fsSI "http://aprly.ai/.well-known/acme-challenge/test" || true
```

## 4. Certbot — новий сертифікат для aprly.ai

Якщо **www** ще не в DNS — використовуйте лише `-d aprly.ai`. Якщо **www** вже вказує на сервер:

```bash
sudo certbot certonly --webroot \
  -w /var/www/aprly/certbot-www \
  -d aprly.ai -d www.aprly.ai
```

Лише apex:

```bash
sudo certbot certonly --webroot \
  -w /var/www/aprly/certbot-www \
  -d aprly.ai
```

При 403/404 на challenge:

```bash
sudo chmod -R a+rX /var/www/aprly/certbot-www
```

## 5. PEM у mount для Docker

Шлях `live/` залежить від імені в certbot (зазвичай перший `-d`):

```bash
sudo cp -L /etc/letsencrypt/live/aprly.ai/fullchain.pem /var/www/aprly/nginx-ssl/fullchain.pem
sudo cp -L /etc/letsencrypt/live/aprly.ai/privkey.pem /var/www/aprly/nginx-ssl/privkey.pem
sudo chown root:root /var/www/aprly/nginx-ssl/fullchain.pem /var/www/aprly/nginx-ssl/privkey.pem
sudo chmod 644 /var/www/aprly/nginx-ssl/fullchain.pem
sudo chmod 640 /var/www/aprly/nginx-ssl/privkey.pem
```

## 6. Перезапуск nginx + API

```bash
$COMPOSE up -d --no-deps --force-recreate frontend
$COMPOSE up -d --no-deps --force-recreate api-server
```

## 7. Перевірка

```bash
curl -fsS https://aprly.ai/api/healthz && echo OK
curl -fsSI https://www.aprly.ai/ | head -5
```

У браузері: `https://aprly.ai`.

## 8. Stripe / зовнішні сервіси (вручну)

- Webhook URL: **`https://aprly.ai/api/stripe/webhook`** (новий endpoint або зміна URL; новий **`whsec_`** → `.env.prod` → recreate **api-server**).
- Checkout success/cancel URL формуються з **`FRONTEND_ORIGIN`** — після кроку 2 достатньо recreate api-server.

## 9. Renew + deploy-hook (оновити шляхи)

У `/usr/local/sbin/aprly-ssl-deploy.sh` (якщо вже є) замініть шляхи на:

```sh
cp -L "/etc/letsencrypt/live/aprly.ai/fullchain.pem" /var/www/aprly/nginx-ssl/fullchain.pem
cp -L "/etc/letsencrypt/live/aprly.ai/privkey.pem" /var/www/aprly/nginx-ssl/privkey.pem
```

Перевірка:

```bash
sudo certbot renew --dry-run --deploy-hook /usr/local/sbin/aprly-ssl-deploy.sh
```

Старий сертифікат **nip.io** можна залишити в `/etc/letsencrypt` — він не заважає, якщо nginx більше не використовує ці PEM.

---

Попередній runbook (nip): [droplet-https-uk.md](./droplet-https-uk.md).
