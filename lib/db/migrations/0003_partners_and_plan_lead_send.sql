CREATE TABLE IF NOT EXISTS "partners" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "partners_name_idx" ON "partners" USING btree ("name");
--> statement-breakpoint
INSERT INTO "partners" ("name") VALUES ('Custom partner') ON CONFLICT DO NOTHING;
--> statement-breakpoint
ALTER TABLE "plan_leads" ADD COLUMN IF NOT EXISTS "partner_id" integer;
--> statement-breakpoint
ALTER TABLE "plan_leads" ADD COLUMN IF NOT EXISTS "sent_to_partner_at" timestamp with time zone;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plan_leads" ADD CONSTRAINT "plan_leads_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN NULL;
END $$;
