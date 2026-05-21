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
import { debtLeadsTable } from "./debt_leads";
import { userCardsTable } from "./user_cards";

export const leadCardsTable = pgTable(
  "lead_cards",
  {
    id: serial("id").primaryKey(),
    leadId: integer("lead_id")
      .notNull()
      .references(() => debtLeadsTable.id, { onDelete: "cascade" }),
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
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("lead_cards_lead_plaid_idx")
      .on(table.leadId, table.plaidAccountId)
      .where(sql`${table.plaidAccountId} is not null`),
    uniqueIndex("lead_cards_lead_user_card_idx")
      .on(table.leadId, table.userCardId)
      .where(sql`${table.userCardId} is not null`),
  ],
);

export type LeadCard = typeof leadCardsTable.$inferSelect;
export type InsertLeadCard = typeof leadCardsTable.$inferInsert;
