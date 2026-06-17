ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "ghl_contact_id" text;

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ghl_sync_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_type" text NOT NULL,
	"user_id" integer NOT NULL,
	"payload" jsonb NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"next_retry_at" timestamp with time zone,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);

--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ghl_sync_queue" ADD CONSTRAINT "ghl_sync_queue_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ghl_sync_queue_pending_idx" ON "ghl_sync_queue" USING btree ("completed_at","next_retry_at");
