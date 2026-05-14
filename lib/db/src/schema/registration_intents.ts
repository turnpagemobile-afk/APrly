import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

/** pending → paid after webhook; abandoned on cancel (optional). */
export const registrationIntentsTable = pgTable(
  "registration_intents",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    termsAcceptedAt: timestamp("terms_accepted_at", { withTimezone: true }).notNull(),
    stripeCheckoutSessionId: text("stripe_checkout_session_id"),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("registration_intents_session_idx").on(table.stripeCheckoutSessionId)],
);

export type RegistrationIntentRow = typeof registrationIntentsTable.$inferSelect;
