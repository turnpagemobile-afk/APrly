# Дроплет: dev.aprly.ai + Let's Encrypt

**Передумова (GoDaddy):**

- A `dev` → `134.122.126.71`
- A `@` на дроплет **видалено**; `aprly.ai` / `www` — Domain Parking (не наш nginx)
- `dig +short dev.aprly.ai A` → `134.122.126.71`
- `dig +short aprly.ai A` → порожньо або IP GoDaddy (не дроплет)

**Константи:**

| Що | Значення |
|----|----------|
| IP | `134.122.126.71` |
| Публічний застосунок | `dev.aprly.ai` |
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
git checkout main
git reset --hard origin/main
git log -1 --oneline
```

У коміті має бути `nginx/aprly.conf` з `server_name dev.aprly.ai` (без `aprly.ai` / `www`).

---

## 2. `.env.prod` — FRONTEND_ORIGIN (і Plaid)

```bash
nano /var/www/aprly/.env.prod
```

```bash
FRONTEND_ORIGIN=https://dev.aprly.ai
```

Bit (ElevenLabs) — також у `.env.prod` (значення з локального `.env`, не в git):

```bash
ELEVENLABS_API_KEY=...
AI_ASSISSTANT_ID=agent_...
```

Ці змінні мають бути в блоці `environment` сервісу `api-server` у `docker-compose.prod.yml` (інакше контейнер їх не побачить). Після зміни `.env.prod` або pull compose:

```bash
$COMPOSE up -d --no-deps --force-recreate api-server
```

`PLAID_REDIRECT_URI` на deployed host:

- **не задано** → api-server шле `{FRONTEND_ORIGIN}/plaid/oauth` (URI має бути в [Plaid Dashboard → API](https://dashboard.plaid.com/developers/api));
- **`off`** / `none` / `false` → як localhost: `redirect_uri` у link-token **не** передається (роут `/plaid/oauth` лишається в SPA);
- явний URL → використовується він.

Для dev без allowlist у Plaid:

```bash
PLAID_REDIRECT_URI=off
```

Коли OAuth-банки потрібні — зареєструйте URI і поставте:

```bash
PLAID_REDIRECT_URI=https://dev.aprly.ai/plaid/oauth
```

Після **будь-якої** зміни `.env.prod` — не `build`, а recreate **api-server** (крок 6).

---

## 3. Збірка frontend (новий nginx) і старт

```bash
cd /var/www/aprly
export COMPOSE_PARALLEL_LIMIT=1
$COMPOSE build frontend
$COMPOSE up -d
```

На `:443` до Certbot може бути **self-signed** (CN=dev.aprly.ai) — браузер покаже попередження.

```bash
curl -fsSI http://dev.aprly.ai/.well-known/acme-challenge/test || true
curl -fsSI http://dev.aprly.ai/ | head -5
```

---

## 4. Certbot — сертифікат тільки для dev.aprly.ai

```bash
sudo chmod -R a+rX /var/www/aprly/certbot-www
```

**Перший раз (інтерактивно):**

```bash
sudo certbot certonly --webroot \
  -w /var/www/aprly/certbot-www \
  -d dev.aprly.ai
```

**Повторно (non-interactive):**

```bash
sudo certbot certonly --webroot \
  -w /var/www/aprly/certbot-www \
  -d dev.aprly.ai \
  --agree-tos \
  -m admin@aprly.ai \
  --non-interactive
```

Перевірка:

```bash
sudo ls -la /etc/letsencrypt/live/dev.aprly.ai/
```

*(Якщо certbot створив інший каталог у `live/` — використайте фактичний шлях.)*

---

## 5. Скопіювати PEM у nginx-ssl

```bash
sudo cp -L /etc/letsencrypt/live/dev.aprly.ai/fullchain.pem /var/www/aprly/nginx-ssl/fullchain.pem
sudo cp -L /etc/letsencrypt/live/dev.aprly.ai/privkey.pem /var/www/aprly/nginx-ssl/privkey.pem
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
curl -fsSI https://dev.aprly.ai/api/healthz
echo | openssl s_client -connect dev.aprly.ai:443 -servername dev.aprly.ai 2>/dev/null | openssl x509 -noout -subject
```

У браузері: `https://dev.aprly.ai` — APRly без попередження TLS.

```bash
$COMPOSE ps
$COMPOSE logs --tail=40 frontend
```

**Apex (не дроплет):**

```bash
dig +short aprly.ai A    # не 134.122.126.71 після propagation
```

У браузері `https://aprly.ai` — сторінка GoDaddy parking, не SPA.

---

## 8. Stripe і Plaid (вручну в Dashboard)

| Сервіс | URL |
|--------|-----|
| Stripe webhook | `https://dev.aprly.ai/api/stripe/webhook` |
| Checkout return | `https://dev.aprly.ai/...` (через `FRONTEND_ORIGIN`) |
| Plaid redirect | `https://dev.aprly.ai/` |

Після нового webhook secret:

```bash
# оновити STRIPE_WEBHOOK_SECRET у .env.prod
$COMPOSE up -d --no-deps --force-recreate api-server
```

---

## nip.io та aprly.ai (legacy)

- `https://134-122-126-71.nip.io` — окремий legacy vhost / старий cert (див. [droplet-https-uk.md](./droplet-https-uk.md))
- Старий runbook apex: [droplet-aprly-ai-uk.md](./droplet-aprly-ai-uk.md) (застарілий після переходу на dev)

---

## Помилки

| Симптом | Дія |
|---------|-----|
| Certbot 403/404 | `chmod -R a+rX certbot-www`; nginx `:80` `server_name dev.aprly.ai` + `/.well-known` |
| NET::ERR_CERT_COMMON_NAME_INVALID | PEM ще для `aprly.ai` — перевипустити certbot `-d dev.aprly.ai`, крок 5–6 |
| `cannot load certificate` | PEM: `root:root`, `privkey` **640** |
| API CORS / cookies | `FRONTEND_ORIGIN=https://dev.aprly.ai`, recreate **api-server** |
| `aprly.ai` ще показує SPA | DNS cache; `dig @8.8.8.8 aprly.ai A` |
| Сайт на IP | `http://134.122.126.71` — `default_server` :80 |

---

## Renewal

Після `certbot renew` знову скопіюйте PEM у `nginx-ssl/` і `force-recreate frontend` (див. [droplet-https-uk.md](./droplet-https-uk.md) §11).
