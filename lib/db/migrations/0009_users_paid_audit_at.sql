ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "paid_audit_at" timestamp with time zone;

--> statement-breakpoint
UPDATE "users"
SET "paid_audit_at" = COALESCE("paid_audit_at", "created_at")
WHERE "stripe_subscription_id" IS NOT NULL
  AND trim("stripe_subscription_id") <> '';
