# GHL — один workflow (Task 1)

**Без змін коду APrly.** Один існуючий workflow + існуючий `GHL_WEBHOOK_URL`.

Пов’язано: [README.md](./README.md) (cron), [ghl-e2e-test-checklist.md](./ghl-e2e-test-checklist.md), `scripts/ghl-test-webhook-events.sh`.

## Що вже є

- Workflow **`APrly Inbound Events (sandbox)`** — Inbound Webhook trigger, Published
- `GHL_WEBHOOK_URL` у `.env` / `.env.prod` (не змінювати)
- Шаблони листів у GHL
- Custom fields (ID у `.env.example` → `GHL_CF_*`)

## Що шле APrly

| Подія | Як | Лист у GHL |
|-------|-----|------------|
| Реєстрація з планом | API + тег `aprly-registered-with-plan` | E1a Welcome A |
| Реєстрація без плану | API + тег `aprly-registered-no-plan` | E1b Welcome B |
| Оплата $39 | API + тег `aprly-paid-39` | E3 05 |
| Решта (partner, nurture, inactivity…) | POST JSON на webhook, поле `event_type` | див. таблицю нижче |

Один workflow: **4 тригери** → **If/Else** → **Send Email**.

```
[Inbound Webhook] ──┐
[Tag: with-plan]  ──┤
[Tag: no-plan]    ──┼→ [If event_type empty?]
[Tag: paid-39]    ──┘         │
                    Yes → If/Else по тегу → E1a / E1b / E3 05
                    No  → Create/Update Contact → If/Else по event_type → 12 листів
```

---

## Крок 1. Тригери (4 в одному workflow)

**Automation → Workflows → `APrly Inbound Events (sandbox)` → Builder**

Біля Inbound Webhook — **+ Add new trigger**. Додати 3 Contact Tag:

| Тригер | Умова |
|--------|--------|
| (є) Inbound Webhook | — |
| + Contact Tag | `aprly-registered-with-plan` |
| + Contact Tag | `aprly-registered-no-plan` |
| + Contact Tag | `aprly-paid-39` |

Усі 4 сходяться в одну дію нижче.

## Крок 2. Видалити debug

Видалити ноду **`APrly webhook (sandbox debug)`**.

## Крок 3. Перша розвилка

**+ → If/Else**

- **Condition:** `{{inboundWebhookRequest.event_type}}` **Is Empty**
- **Yes** → крок 4 (тег)
- **No** → крок 5 (webhook)

Чому: після реєстрації контакт має тег, але наступні події (`plan_sent` тощо) приходять з `event_type` — welcome не дублюється.

## Крок 4. Гілка «за тегом» (Yes)

Послідовні **If/Else** — умова **Contact has tag**:

| Тег | Send Email |
|-----|------------|
| `aprly-registered-with-plan` | E1a 01 Welcome A |
| `aprly-registered-no-plan` | E1b 02 Welcome B |
| `aprly-paid-39` | E3 05 Payment confirmation ($39) |

Контакт уже створений через API — окремий Create Contact не потрібен.

## Крок 5. Гілка «за event_type» (No)

**Create/Update Contact:**

| Поле | Merge field |
|------|-------------|
| Email | `{{inboundWebhookRequest.email}}` |
| Has paid audit | `{{inboundWebhookRequest.has_paid_audit}}` |
| Lead ID | `{{inboundWebhookRequest.lead_id}}` |
| Plan index | `{{inboundWebhookRequest.plan_index}}` |
| Partner name | `{{inboundWebhookRequest.partner_name}}` |
| App base URL | `{{inboundWebhookRequest.app_base_url}}` |

Якщо merge field не працює — **Execution logs** після тесту (може бути `trigger.inboundWebhookRequest.*`).

Далі **If/Else** — `{{inboundWebhookRequest.event_type}}` **Equals**:

| event_type | Send Email |
|------------|------------|
| `payment_declined` | E3 06 Payment declined |
| `nurture_unlock` | E2 03 Nurture - Unlock |
| `nurture_need_send` | E2 03b Nurture - Need send |
| `inactivity_warning_free` | 04a 14 days before delete (free) |
| `inactivity_warning_paid` | 04b 14 days before delete (paid) |
| `account_saved` | 05 account saved |
| `account_deleted` | 03 account deleted |
| `plan_sent` | E4 07 Sent-to-partner |
| `partner_review_started` | 09a plan accepted |
| `plan_denied` | 09b plan declined |
| `hardship_step` | 10 milestone completed |
| `plan_won` | 11 plan won |

## Крок 6. Settings

**Settings → Allow Re-entry: ON** (для `hardship_step` та інших повторних подій). Save → Publish.

## Крок 7. Тест

1. **Webhook:** Test Workflow або  
   `export GHL_WEBHOOK_URL='...' && ./scripts/ghl-test-webhook-events.sh test@example.com`
2. **Тег:** контакту додати `aprly-registered-with-plan` → E1a
3. **Execution logs** — правильна гілка, лист відправлено
4. Реєстрація / оплата на dev.aprly.ai

### Приклад JSON (webhook)

```json
{
  "event_type": "plan_sent",
  "email": "test@example.com",
  "lead_id": "42",
  "plan_index": 1,
  "has_paid_audit": true,
  "partner_name": "Test",
  "app_base_url": "https://dev.aprly.ai",
  "timestamp": "2026-07-03T12:00:00.000Z"
}
```

---

## Custom fields (разова перевірка)

**Settings → Custom Fields → Contact** — ID = `GHL_CF_*` у `.env.prod` (див. `.env.example`).

---

## Cron (scheduler, один раз на дроплеті)

Див. [README.md](./README.md) → «GHL daily scheduler». Код уже на сервері; GHL URL не чіпати.

---

## Чеклист

1. [ ] Custom fields ID = env
2. [ ] 3 Contact Tag тригери додані
3. [ ] Debug видалено
4. [ ] If/Else: empty event_type → теги; інакше → Create Contact + event_type
5. [ ] Allow Re-entry ON, Publish
6. [ ] Тест webhook + тег + реєстрація на сайті
7. [ ] Cron `0 0 * * *` (якщо ще немає)

## Типові помилки

| Симптом | Рішення |
|---------|---------|
| Webhook 200, листа нема | Додати Create/Update Contact на webhook-гілці |
| If/Else не спрацьовує | Execution logs → правильний merge field |
| Welcome при `plan_sent` | Перша розвилка має бути **event_type Is Empty**, не перевірка тегу |
| hardship_step один раз | Allow Re-entry ON |

## Не робити

- Нові workflows
- Зміни `GHL_WEBHOOK_URL` / коду APrly
- Окремі workflow під теги
