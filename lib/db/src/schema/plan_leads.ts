import {
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { usersTable } from "./users";
import { userCardsTable } from "./user_cards";
import { partnersTable } from "./partners";

export const planLeadStatusValues = [
  "recommended",
  "in_progress",
  "won",
  "denied",
] as const;

export type PlanLeadStatus = (typeof planLeadStatusValues)[number];

export const planLeadsTable = pgTable(
  "plan_leads",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    userCardId: integer("user_card_id").references(() => userCardsTable.id, {
      onDelete: "set null",
    }),
    plaidAccountId: text("plaid_account_id"),
    brand: text("brand").notNull(),
    balance: numeric("balance", { precision: 14, scale: 2 }).notNull(),
    currentApr: numeric("current_apr", { precision: 6, scale: 3 }).notNull(),
    targetApr: numeric("target_apr", { precision: 6, scale: 3 }).notNull(),
    estimatedAnnualSavings: numeric("estimated_annual_savings", {
      precision: 14,
      scale: 2,
    }).notNull(),
    status: text("status").notNull().$type<PlanLeadStatus>(),
    partnerId: integer("partner_id").references(() => partnersTable.id, {
      onDelete: "set null",
    }),
    sentToPartnerAt: timestamp("sent_to_partner_at", { withTimezone: true }),
    partnerAcceptedAt: timestamp("partner_accepted_at", { withTimezone: true }),
    hardshipStepsCompleted: integer("hardship_steps_completed").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("plan_leads_user_plaid_idx")
      .on(table.userId, table.plaidAccountId)
      .where(sql`${table.plaidAccountId} is not null`),
    uniqueIndex("plan_leads_user_card_idx")
      .on(table.userId, table.userCardId)
      .where(sql`${table.userCardId} is not null`),
  ],
);

export type PlanLead = typeof planLeadsTable.$inferSelect;
export type InsertPlanLead = typeof planLeadsTable.$inferInsert;
