import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { usersTable } from "./users";
import { partnersTable } from "./partners";

export const debtLeadStatusValues = [
  "recommended",
  "in_progress",
  "won",
  "denied",
] as const;

export type DebtLeadStatus = (typeof debtLeadStatusValues)[number];

export const debtLeadSourceValues = ["optimizer", "cabinet"] as const;
export type DebtLeadSource = (typeof debtLeadSourceValues)[number];

export const debtLeadsTable = pgTable(
  "debt_leads",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => usersTable.id, { onDelete: "cascade" }),
    guestSessionId: text("guest_session_id"),
    contactName: text("contact_name"),
    contactEmail: text("contact_email"),
    source: text("source").notNull().$type<DebtLeadSource>().default("cabinet"),
    status: text("status").notNull().$type<DebtLeadStatus>(),
    partnerId: integer("partner_id").references(() => partnersTable.id, {
      onDelete: "set null",
    }),
    sentToPartnerAt: timestamp("sent_to_partner_at", { withTimezone: true }),
    nurtureSentAt: timestamp("nurture_sent_at", { withTimezone: true }),
    partnerAcceptedAt: timestamp("partner_accepted_at", { withTimezone: true }),
    hardshipStepsCompleted: integer("hardship_steps_completed").notNull().default(0),
    displayStatusChangedAt: timestamp("display_status_changed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("debt_leads_guest_session_idx")
      .on(table.guestSessionId)
      .where(sql`${table.guestSessionId} is not null`),
  ],
);

export type DebtLead = typeof debtLeadsTable.$inferSelect;
export type InsertDebtLead = typeof debtLeadsTable.$inferInsert;
