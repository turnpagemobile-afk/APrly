import "./load-env.js";
import bcrypt from "bcryptjs";
import { db, leadsTable, partnersTable, usersTable, pool } from "./index";

const SEED_LEADS = [
  {
    name: "Demo Lead Aurora",
    email: "demo+aurora@aprly.dev",
    totalDebt: "12500.00",
    interestRate: "24.99",
  },
  {
    name: "Demo Lead Bryce",
    email: "demo+bryce@aprly.dev",
    totalDebt: "27800.00",
    interestRate: "21.500",
  },
  {
    name: "Demo Lead Casey",
    email: "demo+casey@aprly.dev",
    totalDebt: "8400.50",
    interestRate: "29.990",
  },
] as const;

const SEED_ADMINS = [
  { email: "super.admin@aprly.ai", firstName: "Super", lastName: "Admin" },
  { email: "cliff@aprly.ai", firstName: "Cliff", lastName: "Owner" },
  { email: "maxim@aprly.ai", firstName: "Maksym", lastName: "Markin" },
] as const;

const ADMIN_PASSWORD = process.env["ADMIN_SEED_PASSWORD"] ?? "";

async function seedAdmins(): Promise<void> {
  if (!ADMIN_PASSWORD) {
    console.log(
      "[seed] skip admin users (ADMIN_SEED_PASSWORD is empty — set it in .env.prod and pass it to the db-seed container)",
    );
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  for (const admin of SEED_ADMINS) {
    const email = admin.email.trim().toLowerCase();
    const [row] = await db
      .insert(usersTable)
      .values({
        email,
        passwordHash,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: "admin",
      })
      .onConflictDoUpdate({
        target: usersTable.email,
        set: {
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: "admin",
          passwordHash,
        },
      })
      .returning({ id: usersTable.id, email: usersTable.email });

    if (row) {
      console.log(`[seed] admin user id=${row.id} email=${row.email}`);
    }
  }
}

async function main(): Promise<void> {
  const partnerRows = await db
    .insert(partnersTable)
    .values({ name: "Custom partner" })
    .onConflictDoNothing({ target: partnersTable.name })
    .returning({ id: partnersTable.id, name: partnersTable.name });

  if (partnerRows.length > 0) {
    console.log(`[seed] inserted partner id=${partnerRows[0]!.id}`);
  }

  await seedAdmins();

  console.log(`[seed] inserting ${SEED_LEADS.length} demo leads (ON CONFLICT DO NOTHING)`);

  const inserted = await db
    .insert(leadsTable)
    .values([...SEED_LEADS])
    .onConflictDoNothing({ target: leadsTable.email })
    .returning({ id: leadsTable.id, email: leadsTable.email });

  if (inserted.length === 0) {
    console.log("[seed] no new rows (existing demo leads kept)");
  } else {
    for (const row of inserted) {
      console.log(`[seed]   inserted id=${row.id} email=${row.email}`);
    }
  }

  console.log(`[seed] done (${inserted.length} new marketing lead(s))`);
}

main()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("[seed] failed:", err);
    await pool.end().catch(() => {
      /* ignore */
    });
    process.exit(1);
  });
