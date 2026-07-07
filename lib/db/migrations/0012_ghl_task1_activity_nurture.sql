ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_active_at" timestamp with time zone;

--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "inactivity_warning_at" timestamp with time zone;

--> statement-breakpoint
UPDATE "users" SET "last_active_at" = "created_at" WHERE "last_active_at" IS NULL;

--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "last_active_at" SET DEFAULT now();

--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "last_active_at" SET NOT NULL;

--> statement-breakpoint
ALTER TABLE "debt_leads" ADD COLUMN IF NOT EXISTS "nurture_sent_at" timestamp with time zone;
