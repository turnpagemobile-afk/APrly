ALTER TABLE "plan_leads" ADD COLUMN "partner_accepted_at" timestamp with time zone;

UPDATE "plan_leads"
SET "partner_accepted_at" = "sent_to_partner_at"
WHERE "status" = 'in_progress'
  AND "partner_id" IS NOT NULL
  AND "sent_to_partner_at" IS NOT NULL;
