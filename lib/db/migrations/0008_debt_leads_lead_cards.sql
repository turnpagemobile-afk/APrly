CREATE TABLE IF NOT EXISTS "debt_leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"guest_session_id" text,
	"contact_name" text,
	"contact_email" text,
	"source" text DEFAULT 'cabinet' NOT NULL,
	"status" text NOT NULL,
	"partner_id" integer,
	"sent_to_partner_at" timestamp with time zone,
	"partner_accepted_at" timestamp with time zone,
	"hardship_steps_completed" integer DEFAULT 0 NOT NULL,
	"display_status_changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "debt_leads" ADD CONSTRAINT "debt_leads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "debt_leads" ADD CONSTRAINT "debt_leads_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "debt_leads_guest_session_idx" ON "debt_leads" ("guest_session_id") WHERE "guest_session_id" is not null;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lead_cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer NOT NULL,
	"user_card_id" integer,
	"plaid_account_id" text,
	"brand" text NOT NULL,
	"balance" numeric(14, 2) NOT NULL,
	"current_apr" numeric(6, 3) NOT NULL,
	"target_apr" numeric(6, 3) NOT NULL,
	"estimated_annual_savings" numeric(14, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lead_cards" ADD CONSTRAINT "lead_cards_lead_id_debt_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."debt_leads"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lead_cards" ADD CONSTRAINT "lead_cards_user_card_id_user_cards_id_fk" FOREIGN KEY ("user_card_id") REFERENCES "public"."user_cards"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "lead_cards_lead_plaid_idx" ON "lead_cards" ("lead_id","plaid_account_id") WHERE "plaid_account_id" is not null;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "lead_cards_lead_user_card_idx" ON "lead_cards" ("lead_id","user_card_id") WHERE "user_card_id" is not null;
--> statement-breakpoint
INSERT INTO "debt_leads" (
	"id",
	"user_id",
	"status",
	"partner_id",
	"sent_to_partner_at",
	"partner_accepted_at",
	"hardship_steps_completed",
	"display_status_changed_at",
	"created_at",
	"updated_at",
	"source"
)
SELECT
	"id",
	"user_id",
	"status",
	"partner_id",
	"sent_to_partner_at",
	"partner_accepted_at",
	"hardship_steps_completed",
	"display_status_changed_at",
	"created_at",
	"updated_at",
	'cabinet'
FROM "plan_leads"
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
INSERT INTO "lead_cards" (
	"id",
	"lead_id",
	"user_card_id",
	"plaid_account_id",
	"brand",
	"balance",
	"current_apr",
	"target_apr",
	"estimated_annual_savings",
	"created_at",
	"updated_at"
)
SELECT
	"id",
	"id",
	"user_card_id",
	"plaid_account_id",
	"brand",
	"balance",
	"current_apr",
	"target_apr",
	"estimated_annual_savings",
	"created_at",
	"updated_at"
FROM "plan_leads"
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
SELECT setval(
	pg_get_serial_sequence('debt_leads', 'id'),
	COALESCE((SELECT MAX("id") FROM "debt_leads"), 1)
);
--> statement-breakpoint
SELECT setval(
	pg_get_serial_sequence('lead_cards', 'id'),
	COALESCE((SELECT MAX("id") FROM "lead_cards"), 1)
);
--> statement-breakpoint
DROP TABLE IF EXISTS "plan_leads";
--> statement-breakpoint
ALTER TABLE "registration_intents" ADD COLUMN IF NOT EXISTS "guest_session_id" text;
