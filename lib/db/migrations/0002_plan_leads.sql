CREATE TABLE IF NOT EXISTS "plan_leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"user_card_id" integer,
	"plaid_account_id" text,
	"brand" text NOT NULL,
	"balance" numeric(14, 2) NOT NULL,
	"current_apr" numeric(6, 3) NOT NULL,
	"target_apr" numeric(6, 3) NOT NULL,
	"estimated_annual_savings" numeric(14, 2) NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plan_leads" ADD CONSTRAINT "plan_leads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plan_leads" ADD CONSTRAINT "plan_leads_user_card_id_user_cards_id_fk" FOREIGN KEY ("user_card_id") REFERENCES "public"."user_cards"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "plan_leads_user_plaid_idx" ON "plan_leads" ("user_id","plaid_account_id") WHERE "plaid_account_id" is not null;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "plan_leads_user_card_idx" ON "plan_leads" ("user_id","user_card_id") WHERE "user_card_id" is not null;
