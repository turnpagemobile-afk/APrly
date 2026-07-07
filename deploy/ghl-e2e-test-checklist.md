# GHL Task 1 — E2E test checklist

Після налаштування **одного** workflow за [ghl-panel-setup.md](./ghl-panel-setup.md).

## Передумови

- [ ] `GHL_ENABLED=true`, `GHL_*` у `.env.prod`
- [ ] `GHL_WEBHOOK_URL` уже налаштований (не змінювали)
- [ ] Workflow `APrly Inbound Events (sandbox)` — 4 тригери, If/Else, **Published**
- [ ] Міграція `0012_ghl_task1_activity_nurture` застосована (якщо scheduler)
- [ ] Stripe webhook на `/api/stripe/webhook`

## Події task1

| # | Дія в APrly | Тригер у GHL | Очікуваний лист |
|---|-------------|--------------|-----------------|
| 1 | Register з планом | Contact Tag `aprly-registered-with-plan` | E1a |
| 2 | Register без плану | Contact Tag `aprly-registered-no-plan` | E1b |
| 3 | Оплата $39 | Contact Tag `aprly-paid-39` | E3 05 |
| 4 | Failed Stripe checkout | webhook `payment_declined` | E3 06 |
| 5 | План 7+ днів без send | webhook `nurture_unlock` / `nurture_need_send` | E2 |
| 6 | Send to partner | webhook `plan_sent` | E4 07 |
| 7 | Admin: accept | webhook `partner_review_started` | 09a |
| 8 | Admin: deny | webhook `plan_denied` | 09b |
| 9 | Admin: hardship step | webhook `hardship_step` | 10 |
| 10 | Admin: plan won | webhook `plan_won` | 11 |
| 11 | 6 міс. неактивність | webhook `inactivity_warning_*` | 04a/04b |
| 12 | Login після warn | webhook `account_saved` | 05 |
| 13 | 14 днів без login | webhook `account_deleted` | 03 |

## Швидкі тести

**Webhook (12 подій):**

```bash
export GHL_WEBHOOK_URL='...'   # з .env.prod
./scripts/ghl-test-webhook-events.sh your-test@example.com
```

**Теги (E1/E3):** контакту вручну додати тег → перевірити Enrollment history / лист.

**Реальний flow:** реєстрація та оплата на dev.aprly.ai.

## Scheduler

```bash
cd /var/www/aprly
docker compose -f docker-compose.prod.yml --env-file .env.prod --profile ops run --rm ghl-scheduler
```

## SQL (прискорення scheduler-тестів)

Nurture:

```sql
UPDATE debt_leads
SET created_at = now() - interval '8 days',
    nurture_sent_at = NULL,
    sent_to_partner_at = NULL
WHERE id = <lead_id>;
```

Inactivity warning:

```sql
UPDATE users
SET last_active_at = now() - interval '7 months',
    inactivity_warning_at = NULL
WHERE email = 'test@example.com';
```

Inactivity delete:

```sql
UPDATE users
SET inactivity_warning_at = now() - interval '15 days',
    last_active_at = inactivity_warning_at - interval '1 day'
WHERE email = 'test@example.com';
```

Після SQL — `ghl-scheduler`.
