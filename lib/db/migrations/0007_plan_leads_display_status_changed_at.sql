ALTER TABLE "plan_leads" ADD COLUMN "display_status_changed_at" timestamptz NOT NULL DEFAULT now();

UPDATE "plan_leads"
SET "display_status_changed_at" = "created_at"
WHERE "status" = 'recommended';

UPDATE "plan_leads"
SET "display_status_changed_at" = COALESCE("sent_to_partner_at", "created_at")
WHERE "status" = 'in_progress' AND "partner_accepted_at" IS NULL;

UPDATE "plan_leads"
SET "display_status_changed_at" = COALESCE("partner_accepted_at", "sent_to_partner_at", "created_at")
WHERE "status" = 'in_progress' AND "partner_accepted_at" IS NOT NULL;

UPDATE "plan_leads"
SET "display_status_changed_at" = "updated_at"
WHERE "status" IN ('won', 'denied');
