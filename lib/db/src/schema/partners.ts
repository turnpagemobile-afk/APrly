import { boolean, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const partnersTable = pgTable(
  "partners",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("partners_name_idx").on(table.name)],
);

export type Partner = typeof partnersTable.$inferSelect;
export type InsertPartner = typeof partnersTable.$inferInsert;
