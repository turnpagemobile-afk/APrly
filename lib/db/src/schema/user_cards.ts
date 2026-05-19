import { integer, numeric, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const userCardsTable = pgTable("user_cards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  brand: text("brand").notNull(),
  balance: numeric("balance", { precision: 14, scale: 2 }).notNull(),
  rate: numeric("rate", { precision: 6, scale: 3 }).notNull(),
  plaidAccountId: text("plaid_account_id"),
  source: text("source")
    .notNull()
    .$type<"manual" | "plaid" | "optimizer" | "cabinet">(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type UserCard = typeof userCardsTable.$inferSelect;
export type InsertUserCard = typeof userCardsTable.$inferInsert;
