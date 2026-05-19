import { db, leadsTable, partnersTable, pool } from "./index";

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

async function main(): Promise<void> {
  const partnerRows = await db
    .insert(partnersTable)
    .values({ name: "Custom partner" })
    .onConflictDoNothing({ target: partnersTable.name })
    .returning({ id: partnersTable.id, name: partnersTable.name });

  if (partnerRows.length > 0) {
    console.log(`[seed] inserted partner id=${partnerRows[0]!.id}`);
  }

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

  console.log(`[seed] done (${inserted.length} new lead(s))`);
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
