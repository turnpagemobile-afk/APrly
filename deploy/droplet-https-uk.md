# Дроплет: HTTPS через nip.io + Let’s Encrypt — повний порядок (команди)

Ціль: публічний сайт **`https://134-122-126-71.nip.io`** (без DNS замовника) з довіреним сертифікатом LE, щоб **Stripe / Plaid / браузер** не скаржились на HTTP / невалідний TLS.

**Константи (ваш поточний дроплет):**

| Що | Значення |
|----|----------|
| IP дроплета | `134.122.126.71` |
| TLS hostname (nip.io) | `134-122-126-71.nip.io` |
| Каталог репозиторію | `/var/www/aprly` |
| ACME webroot на хості | `/var/www/aprly/certbot-www` |
| PEM для nginx у Docker | `/var/www/aprly/nginx-ssl/fullchain.pem`, `privkey.pem` |

Усі команди нижче — **на дроплеті**, якщо не сказано інакше. Користувач за замовчуванням: **`ubuntu`** (як у [README.md](./README.md)).

---

## 0. Підготовка: SSH і Docker

### 0.1. Зайти по SSH

```bash
ssh ubuntu@134.122.126.71
```

### 0.2. Docker без `sudo` (рекомендовано)

Перевірка:

```bash
docker ps
```

Якщо помилка на кшталт **«permission denied»** / **«connect: permission denied»**:

```bash
sudo usermod -aG docker ubuntu
```

Потім **вийти з SSH і зайти знову** (або `newgrp docker`), знову:

```bash
docker ps
```

### 0.3. Змінна для Compose (кожна нова сесія shell)

```bash
export COMPOSE="docker compose -f /var/www/aprly/docker-compose.prod.yml --env-file /var/www/aprly/.env.prod"
```

Перевірка:

```bash
cd /var/www/aprly && $COMPOSE ps
```

---

## 1. Каталоги на хості та права (важливо)

### 1.1. Чому недостатньо лише `chown ubuntu:ubuntu`

- **Certbot** зазвичай запускають під **`sudo`** → файли challenge в webroot часто **`root:root`**. Це нормально, якщо на файлах є **читання для «інших»** (`644` / `755`), бо nginx у контейнері читає їх **не обов’язково від root**.
- **Приватний ключ** для nginx після копіювання має бути читабельний **процесом nginx у контейнері** (master зазвичай під **root**). Якщо залишити ключ **`ubuntu:ubuntu` з `chmod 600`**, контейнер **не зможе** прочитати `privkey.pem` → TLS зламається. Тому для ключів у проді зазвичай **`root:root`** і **`640`** (або `644` лише для `fullchain.pem`).

### 1.2. Якщо каталоги вже існують і «ломлені» правами Docker

Якщо раніше `docker compose` сам створив порожні mount-point’и від **root**:

```bash
sudo ls -la /var/www/aprly/
```

Якщо потрібно пересоздати (обережно: видаляє лише порожні/робочі каталоги для ACME/ssl, **не** сам репозиторій):

```bash
sudo rm -rf /var/www/aprly/certbot-www /var/www/aprly/nginx-ssl
```

### 1.3. Створити каталоги і базові права

```bash
sudo mkdir -p /var/www/aprly/certbot-www /var/www/aprly/nginx-ssl
sudo chown -R ubuntu:ubuntu /var/www/aprly/certbot-www /var/www/aprly/nginx-ssl
sudo chmod 755 /var/www/aprly/certbot-www /var/www/aprly/nginx-ssl
```

Після **успішного** `certbot` (крок 6) варто дати **обхідний для читання** webroot (якщо certbot створив підкаталоги з обмеженими правами):

```bash
sudo chmod -R a+rX /var/www/aprly/certbot-www
```

(Це не відкриває запис усім — лише **читання + execute** на каталогах для проходу шляху та читання файлів challenge.)

---

## 2. Код на дроплеті (останній `main`)

```bash
cd /var/www/aprly
git fetch --all --prune
git checkout main
git reset --hard origin/main
git log -1 --oneline
```

---

## 3. Змінні середовища `.env.prod`

Відкрийте файл:

```bash
nano /var/www/aprly/.env.prod
```

**Мінімум для HTTPS nip (додати або змінити):**

```bash
FRONTEND_ORIGIN=https://134-122-126-71.nip.io
```

Якщо використовуєте Plaid з redirect:

- додайте **`PLAID_REDIRECT_URI=https://134-122-126-71.nip.io/...`** (точний шлях як у коді / Plaid Dashboard),
- у **Plaid Dashboard** додайте **той самий** URI в allowlist.

Збережіть файл (`Ctrl+O`, Enter, `Ctrl+X`).

---

## 4. Збірка і запуск стеку

```bash
cd /var/www/aprly
export COMPOSE="docker compose -f docker-compose.prod.yml --env-file .env.prod"
# Обов’язково `--profile ops build`, інакше образ `aprly-migrate:local` не
# перезбирається і `db-migrate` може впасти з ERR_PNPM_RECURSIVE_RUN_NO_SCRIPT.
$COMPOSE --profile ops build
$COMPOSE up -d
$COMPOSE --profile ops run --rm db-migrate
$COMPOSE --profile ops run --rm db-seed
```

Перевірка:

```bash
$COMPOSE ps
curl -fsS http://127.0.0.1/api/healthz 2>/dev/null || true
curl -fsSI http://134.122.126.71/api/healthz
```

Перевірка, що **ACME-шлях** для nip віддається (має бути **404** або порожня відповідь, але **не** редирект HTML з помилкою nginx):

```bash
curl -fsSI "http://134-122-126-71.nip.io/.well-known/acme-challenge/test" || true
```

---

## 5. Certbot на хості (не в контейнері)

### 5.1. Встановлення

```bash
sudo apt update
sudo apt install -y certbot
certbot --version
```

### 5.2. Отримання сертифіката (HTTP-01, webroot)

**Інтерактивно** (зручно вперше — запитає email і ToS):

```bash
sudo certbot certonly --webroot \
  -w /var/www/aprly/certbot-www \
  -d 134-122-126-71.nip.io
```

**Неінтерактивно** (замініть email):

```bash
sudo certbot certonly --webroot \
  -w /var/www/aprly/certbot-www \
  -d 134-122-126-71.nip.io \
  --agree-tos \
  -m you@example.com \
  --non-interactive
```

Якщо certbot скаржиться на webroot — ще раз:

```bash
sudo chmod -R a+rX /var/www/aprly/certbot-www
```

і повторіть `certbot certonly ...`.

Перевірка наявності файлів:

```bash
sudo ls -la /etc/letsencrypt/live/134-122-126-71.nip.io/
```

---

## 6. Копіювання PEM у каталог, який монтує Docker

Файли в `live/` — **симлінки**; для стабільної копії в docker volume використовуйте **`cp -L`**:

```bash
sudo cp -L /etc/letsencrypt/live/134-122-126-71.nip.io/fullchain.pem /var/www/aprly/nginx-ssl/fullchain.pem
sudo cp -L /etc/letsencrypt/live/134-122-126-71.nip.io/privkey.pem /var/www/aprly/nginx-ssl/privkey.pem
```

**Права, щоб nginx у контейнері міг читати ключ (обов’язково):**

```bash
sudo chown root:root /var/www/aprly/nginx-ssl/fullchain.pem /var/www/aprly/nginx-ssl/privkey.pem
sudo chmod 644 /var/www/aprly/nginx-ssl/fullchain.pem
sudo chmod 640 /var/www/aprly/nginx-ssl/privkey.pem
```

Перевірка:

```bash
sudo ls -la /var/www/aprly/nginx-ssl/
```

---

## 7. Перезапуск лише `frontend` (підхопити нові PEM)

```bash
cd /var/www/aprly
export COMPOSE="docker compose -f docker-compose.prod.yml --env-file .env.prod"
$COMPOSE up -d --no-deps --force-recreate frontend
```

Перевірка HTTPS (має бути **HTTP/2 200** або **200** без `-k`):

```bash
curl -fsSI https://134-122-126-71.nip.io/api/healthz
```

Якщо `curl` пише про сертифікат — подивіться логи:

```bash
$COMPOSE logs --tail=80 frontend
```

---

## 8. Застосувати `FRONTEND_ORIGIN` (і Stripe) в API

Після змін `.env.prod`:

```bash
cd /var/www/aprly
export COMPOSE="docker compose -f docker-compose.prod.yml --env-file .env.prod"
$COMPOSE up -d --no-deps --force-recreate api-server
```

---

## 9. Stripe

1. У [Stripe Dashboard](https://dashboard.stripe.com/) → **Developers → Webhooks** додайте endpoint:  
   `https://134-122-126-71.nip.io/api/stripe/webhook`
2. Скопіюйте **Signing secret** (`whsec_...`) у **`.env.prod`** → **`STRIPE_WEBHOOK_SECRET=...`**
3. Знову:

```bash
$COMPOSE up -d --no-deps --force-recreate api-server
```

---

## 10. Файрвол (якщо увімкнено `ufw`)

Перевірка:

```bash
sudo ufw status
```

Якщо `active`, дозвольте HTTP/HTTPS (SSH не чіпайте, якщо не впевнені):

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

На **DigitalOcean Cloud Firewall** також мають бути відкриті **80** і **443** до дроплета.

---

## 11. Продовження сертифіката (renew)

Перевірка сухого прогону:

```bash
sudo certbot renew --dry-run
```

Після реального `renew` (cron двічі на день за замовчуванням) **скопіюйте PEM знову** (крок 6) і **перезапустіть `frontend`**, або додайте deploy-hook. Приклад hook-скрипта (збережіть як `/usr/local/sbin/aprly-ssl-deploy.sh`, `sudo chmod +x`):

```bash
#!/bin/sh
set -e
cp -L "/etc/letsencrypt/live/134-122-126-71.nip.io/fullchain.pem" /var/www/aprly/nginx-ssl/fullchain.pem
cp -L "/etc/letsencrypt/live/134-122-126-71.nip.io/privkey.pem" /var/www/aprly/nginx-ssl/privkey.pem
chown root:root /var/www/aprly/nginx-ssl/fullchain.pem /var/www/aprly/nginx-ssl/privkey.pem
chmod 644 /var/www/aprly/nginx-ssl/fullchain.pem
chmod 640 /var/www/aprly/nginx-ssl/privkey.pem
cd /var/www/aprly
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --no-deps --force-recreate frontend
```

Підключення через **`/etc/cron.d/`** (файл має містити **користувача** — поле після розкладу):

```bash
sudo sh -c 'printf "%s\n" "SHELL=/bin/sh" "PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin" "" "0 3 * * * root certbot renew -q --deploy-hook /usr/local/sbin/aprly-ssl-deploy.sh" > /etc/cron.d/certbot-aprly-ssl'
sudo chmod 644 /etc/cron.d/certbot-aprly-ssl
```

Альтернатива — **systemd timer** від пакета `certbot` (залежить від дистрибутива).

---

## 12. Коли з’явиться домен замовника

1. DNS **A** на `134.122.126.71`
2. Новий сертифікат Certbot для реального імені
3. Оновити **`FRONTEND_ORIGIN`**, nginx `server_name` / шляхи в репозиторії (або окремий vhost), Stripe webhook URL, Plaid redirect
4. За бажанням залишити **HTTP по IP** лише для редіректу або вимкнути

---

## Швидкий чеклист помилок

| Симптом | Що перевірити |
|---------|----------------|
| `curl: (7) Failed to connect` до 443 | `ufw` / Cloud Firewall / `$COMPOSE ps` |
| TLS ok у curl, браузер скаржиться | Чи відкриваєте саме **`https://134-122-126-71.nip.io`**, а не IP |
| nginx: `cannot load certificate key` | `privkey.pem` **не** `600` від `ubuntu` — поверніться до кроку 6 (`root:root`, `640`) |
| ACME **403/404** | `chmod -R a+rX /var/www/aprly/certbot-www`, чи працює контейнер `frontend` на `:80` |
| Stripe webhook не заходить | URL у Dashboard **https** + **`STRIPE_WEBHOOK_SECRET`** від цього endpoint |

Англомовний короткий runbook далі в [README.md](./README.md).
