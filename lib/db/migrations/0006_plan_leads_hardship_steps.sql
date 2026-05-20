ALTER TABLE "plan_leads" ADD COLUMN "hardship_steps_completed" integer NOT NULL DEFAULT 0;

UPDATE "plan_leads" SET "hardship_steps_completed" = 8 WHERE "status" = 'won';
