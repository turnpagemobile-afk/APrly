#!/usr/bin/env sh
# POST sample payloads for every GHL inbound event_type (Task 1).
# Usage:
#   export GHL_WEBHOOK_URL='https://services.leadconnectorhq.com/hooks/...'
#   ./scripts/ghl-test-webhook-events.sh test@example.com
#
# Optional: GHL_TEST_DELAY_SEC=2 between requests (default 1).

set -eu

EMAIL="${1:-test@example.com}"
URL="${GHL_WEBHOOK_URL:-}"

if [ -z "$URL" ]; then
  echo "error: set GHL_WEBHOOK_URL" >&2
  exit 1
fi

DELAY="${GHL_TEST_DELAY_SEC:-1}"
TS="$(date -u +%Y-%m-%dT%H:%M:%S.000Z)"

post() {
  event_type="$1"
  body="$2"
  echo "--- POST event_type=$event_type ---"
  code=$(curl -sS -o /tmp/ghl-webhook-test-out.txt -w "%{http_code}" \
    -X POST "$URL" \
    -H "Content-Type: application/json" \
    -d "$body")
  echo "HTTP $code"
  head -c 200 /tmp/ghl-webhook-test-out.txt 2>/dev/null || true
  echo ""
  sleep "$DELAY"
}

# User-level events (no lead_id)
post "payment_declined" "{\"event_type\":\"payment_declined\",\"email\":\"$EMAIL\",\"has_paid_audit\":false,\"timestamp\":\"$TS\"}"
post "inactivity_warning_free" "{\"event_type\":\"inactivity_warning_free\",\"email\":\"$EMAIL\",\"has_paid_audit\":false,\"timestamp\":\"$TS\"}"
post "inactivity_warning_paid" "{\"event_type\":\"inactivity_warning_paid\",\"email\":\"$EMAIL\",\"has_paid_audit\":true,\"timestamp\":\"$TS\"}"
post "account_saved" "{\"event_type\":\"account_saved\",\"email\":\"$EMAIL\",\"timestamp\":\"$TS\"}"
post "account_deleted" "{\"event_type\":\"account_deleted\",\"email\":\"$EMAIL\",\"timestamp\":\"$TS\"}"

# Lead-level events
post "nurture_unlock" "{\"event_type\":\"nurture_unlock\",\"email\":\"$EMAIL\",\"lead_id\":\"1\",\"plan_index\":1,\"has_paid_audit\":false,\"timestamp\":\"$TS\"}"
post "nurture_need_send" "{\"event_type\":\"nurture_need_send\",\"email\":\"$EMAIL\",\"lead_id\":\"1\",\"plan_index\":1,\"has_paid_audit\":true,\"timestamp\":\"$TS\"}"
post "plan_sent" "{\"event_type\":\"plan_sent\",\"email\":\"$EMAIL\",\"lead_id\":\"42\",\"plan_index\":1,\"has_paid_audit\":true,\"partner_name\":\"Test Partner\",\"timestamp\":\"$TS\"}"
post "partner_review_started" "{\"event_type\":\"partner_review_started\",\"email\":\"$EMAIL\",\"lead_id\":\"42\",\"plan_index\":1,\"has_paid_audit\":true,\"partner_name\":\"Test Partner\",\"timestamp\":\"$TS\"}"
post "plan_denied" "{\"event_type\":\"plan_denied\",\"email\":\"$EMAIL\",\"lead_id\":\"42\",\"plan_index\":1,\"has_paid_audit\":true,\"partner_name\":\"Test Partner\",\"timestamp\":\"$TS\"}"
post "hardship_step" "{\"event_type\":\"hardship_step\",\"email\":\"$EMAIL\",\"lead_id\":\"42\",\"plan_index\":1,\"has_paid_audit\":true,\"partner_name\":\"Test Partner\",\"hardship_step_index\":2,\"timestamp\":\"$TS\"}"
post "plan_won" "{\"event_type\":\"plan_won\",\"email\":\"$EMAIL\",\"lead_id\":\"42\",\"plan_index\":1,\"has_paid_audit\":true,\"partner_name\":\"Test Partner\",\"hardship_step_index\":5,\"timestamp\":\"$TS\"}"

echo "Done. Check GHL workflow Enrollment history / Execution logs for $EMAIL"
