import { and, asc, eq, isNull } from "drizzle-orm";
import {
  db,
  debtLeadsTable,
  leadCardsTable,
  userCardsTable,
  type DebtLead,
  type LeadCard,
} from "@workspace/db";
import { CABINET_TARGET_APR, calculateAnnualSavings } from "./optimizer-math";
import { isValidImportCardForPlanLead } from "./plan-lead-validation";
import { buildHardshipPortal } from "./build-hardship-portal";
import { mapDebtLeadDetail, mapDebtLeadSummary, mapPlanLeadRow } from "./lead-mapper";
import { partnersTable } from "@workspace/db";

type DbTx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type ImportCardInput = {
  brand: string;
  balance: number;
  rate: number;
  accountId?: string;
};

async function findExistingLeadCard(
  tx: DbTx,
  leadId: number,
  userCardId: number | null,
  plaidAccountId: string | null,
  brand: string,
  balance: string,
  currentApr: string,
) {
  if (plaidAccountId) {
    const [byPlaid] = await tx
      .select()
      .from(leadCardsTable)
      .where(
        and(
          eq(leadCardsTable.leadId, leadId),
          eq(leadCardsTable.plaidAccountId, plaidAccountId),
        ),
      )
      .limit(1);
    if (byPlaid) return byPlaid;
  }

  if (userCardId) {
    const [byCard] = await tx
      .select()
      .from(leadCardsTable)
      .where(
        and(eq(leadCardsTable.leadId, leadId), eq(leadCardsTable.userCardId, userCardId)),
      )
      .limit(1);
    if (byCard) return byCard;
  }

  const [bySnapshot] = await tx
    .select()
    .from(leadCardsTable)
    .where(
      and(
        eq(leadCardsTable.leadId, leadId),
        eq(leadCardsTable.brand, brand),
        eq(leadCardsTable.balance, balance),
        eq(leadCardsTable.currentApr, currentApr),
        isNull(leadCardsTable.plaidAccountId),
      ),
    )
    .limit(1);

  return bySnapshot ?? null;
}

export async function loadLeadCards(leadId: number): Promise<LeadCard[]> {
  return db
    .select()
    .from(leadCardsTable)
    .where(eq(leadCardsTable.leadId, leadId))
    .orderBy(asc(leadCardsTable.id));
}

export async function loadDebtLeadForUser(
  leadId: number,
  userId: number,
): Promise<{ lead: DebtLead; cards: LeadCard[] } | null> {
  const [lead] = await db
    .select()
    .from(debtLeadsTable)
    .where(and(eq(debtLeadsTable.id, leadId), eq(debtLeadsTable.userId, userId)))
    .limit(1);
  if (!lead) return null;
  const cards = await loadLeadCards(leadId);
  return { lead, cards };
}

export async function loadDebtLeadDetailForUser(leadId: number, userId: number) {
  const loaded = await loadDebtLeadForUser(leadId, userId);
  if (!loaded) return null;

  let partner: { id: number; name: string } | null = null;
  if (loaded.lead.partnerId) {
    const [partnerRow] = await db
      .select({ id: partnersTable.id, name: partnersTable.name })
      .from(partnersTable)
      .where(eq(partnersTable.id, loaded.lead.partnerId))
      .limit(1);
    partner = partnerRow ?? null;
  }

  const hardshipPortal =
    loaded.lead.partnerAcceptedAt != null && loaded.lead.status === "in_progress"
      ? buildHardshipPortal(loaded.lead.hardshipStepsCompleted)
      : loaded.lead.status === "won"
        ? buildHardshipPortal(8)
        : null;

  return mapDebtLeadDetail(loaded.lead, loaded.cards, { partner, hardshipPortal });
}

export async function listDebtLeadsForUser(userId: number) {
  const leads = await db
    .select()
    .from(debtLeadsTable)
    .where(eq(debtLeadsTable.userId, userId))
    .orderBy(asc(debtLeadsTable.createdAt));

  const result = [];
  for (const lead of leads) {
    const cards = await loadLeadCards(lead.id);
    result.push(mapDebtLeadSummary(lead, cards));
  }
  return result;
}

export async function listPlanLeadRowsForUser(userId: number) {
  const leads = await db
    .select()
    .from(debtLeadsTable)
    .where(eq(debtLeadsTable.userId, userId))
    .orderBy(asc(debtLeadsTable.createdAt));

  return Promise.all(
    leads.map(async (lead) => {
      const cards = await loadLeadCards(lead.id);
      return mapPlanLeadRow(lead, cards);
    }),
  );
}

async function upsertUserCard(
  tx: DbTx,
  userId: number,
  card: ImportCardInput,
  source: "optimizer" | "cabinet",
): Promise<number | null> {
  const brand = card.brand.trim();
  const balance = card.balance;
  const rate = card.rate;
  const plaidAccountId = card.accountId?.trim() || null;

  if (plaidAccountId) {
    const [existingCard] = await tx
      .select()
      .from(userCardsTable)
      .where(
        and(
          eq(userCardsTable.userId, userId),
          eq(userCardsTable.plaidAccountId, plaidAccountId),
        ),
      )
      .limit(1);

    if (existingCard) {
      const [updated] = await tx
        .update(userCardsTable)
        .set({
          brand,
          balance: balance.toString(),
          rate: rate.toString(),
          source,
        })
        .where(eq(userCardsTable.id, existingCard.id))
        .returning();
      return updated?.id ?? existingCard.id;
    }

    const [inserted] = await tx
      .insert(userCardsTable)
      .values({
        userId,
        brand,
        balance: balance.toString(),
        rate: rate.toString(),
        plaidAccountId,
        source,
      })
      .returning({ id: userCardsTable.id });
    return inserted?.id ?? null;
  }

  const [inserted] = await tx
    .insert(userCardsTable)
    .values({
      userId,
      brand,
      balance: balance.toString(),
      rate: rate.toString(),
      plaidAccountId: null,
      source,
    })
    .returning({ id: userCardsTable.id });
  return inserted?.id ?? null;
}

async function replaceLeadCards(
  tx: DbTx,
  leadId: number,
  cards: ImportCardInput[],
  userId: number | null,
  cardSource: "optimizer" | "cabinet",
) {
  await tx.delete(leadCardsTable).where(eq(leadCardsTable.leadId, leadId));

  const now = new Date();
  for (const card of cards) {
    if (!isValidImportCardForPlanLead(card)) continue;

    const brand = card.brand.trim();
    const balanceStr = card.balance.toString();
    const rateStr = card.rate.toString();
    const plaidAccountId = card.accountId?.trim() || null;
    let userCardId: number | null = null;

    if (userId) {
      userCardId = await upsertUserCard(tx, userId, card, cardSource);
    }

    const annualSavings = calculateAnnualSavings(card.balance, card.rate, CABINET_TARGET_APR);

    await tx.insert(leadCardsTable).values({
      leadId,
      userCardId,
      plaidAccountId,
      brand,
      balance: balanceStr,
      currentApr: rateStr,
      targetApr: CABINET_TARGET_APR.toString(),
      estimatedAnnualSavings: annualSavings.toString(),
      createdAt: now,
      updatedAt: now,
    });
  }
}

export async function upsertGuestDebtLead(input: {
  guestSessionId: string;
  name?: string;
  email?: string;
  cards: ImportCardInput[];
}) {
  const guestSessionId = input.guestSessionId.trim();
  if (!guestSessionId) {
    throw new Error("guestSessionId is required");
  }

  const validCards = input.cards.filter(isValidImportCardForPlanLead);
  const now = new Date();

  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(debtLeadsTable)
      .where(eq(debtLeadsTable.guestSessionId, guestSessionId))
      .limit(1);

    let leadId: number;
    if (existing) {
      leadId = existing.id;
      await tx
        .update(debtLeadsTable)
        .set({
          contactName: input.name?.trim() || existing.contactName,
          contactEmail: input.email?.trim().toLowerCase() || existing.contactEmail,
          updatedAt: now,
        })
        .where(eq(debtLeadsTable.id, leadId));
    } else {
      const [inserted] = await tx
        .insert(debtLeadsTable)
        .values({
          guestSessionId,
          contactName: input.name?.trim() || null,
          contactEmail: input.email?.trim().toLowerCase() || null,
          source: "optimizer",
          status: "recommended",
          displayStatusChangedAt: now,
          createdAt: now,
          updatedAt: now,
        })
        .returning({ id: debtLeadsTable.id });
      leadId = inserted!.id;
    }

    await replaceLeadCards(tx, leadId, validCards, null, "optimizer");

    const [lead] = await tx
      .select()
      .from(debtLeadsTable)
      .where(eq(debtLeadsTable.id, leadId))
      .limit(1);
    const cardRows = await tx
      .select()
      .from(leadCardsTable)
      .where(eq(leadCardsTable.leadId, leadId))
      .orderBy(asc(leadCardsTable.id));

    return { lead: lead!, cards: cardRows };
  });
}

export async function attachGuestLeadsToUser(
  userId: number,
  guestSessionId: string | null | undefined,
): Promise<number> {
  const sid = guestSessionId?.trim();
  if (!sid) return 0;

  const now = new Date();
  const result = await db
    .update(debtLeadsTable)
    .set({
      userId,
      guestSessionId: null,
      updatedAt: now,
    })
    .where(
      and(eq(debtLeadsTable.guestSessionId, sid), isNull(debtLeadsTable.userId)),
    )
    .returning({ id: debtLeadsTable.id });

  for (const row of result) {
    const cards = await loadLeadCards(row.id);
    for (const card of cards) {
      if (!card.plaidAccountId && !card.userCardId) {
        const importCard: ImportCardInput = {
          brand: card.brand,
          balance: Number(card.balance),
          rate: Number(card.currentApr),
        };
        const userCardId = await db.transaction(async (tx) =>
          upsertUserCard(tx, userId, importCard, "optimizer"),
        );
        if (userCardId) {
          await db
            .update(leadCardsTable)
            .set({ userCardId, updatedAt: now })
            .where(eq(leadCardsTable.id, card.id));
        }
      } else if (card.plaidAccountId) {
        const importCard: ImportCardInput = {
          brand: card.brand,
          balance: Number(card.balance),
          rate: Number(card.currentApr),
          accountId: card.plaidAccountId,
        };
        const userCardId = await db.transaction(async (tx) =>
          upsertUserCard(tx, userId, importCard, "optimizer"),
        );
        if (userCardId) {
          await db
            .update(leadCardsTable)
            .set({ userCardId, updatedAt: now })
            .where(eq(leadCardsTable.id, card.id));
        }
      }
    }
  }

  return result.length;
}

export async function createDetailedDebtLead(
  userId: number,
  cards: ImportCardInput[],
): Promise<{ createdCount: number; plans: Awaited<ReturnType<typeof listPlanLeadRowsForUser>> }> {
  const validCards = cards.filter(isValidImportCardForPlanLead);
  let createdCount = 0;

  await db.transaction(async (tx) => {
    const now = new Date();
    const [lead] = await tx
      .insert(debtLeadsTable)
      .values({
        userId,
        source: "cabinet",
        status: "recommended",
        displayStatusChangedAt: now,
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: debtLeadsTable.id });

    const leadId = lead!.id;

    for (const card of validCards) {
      const brand = card.brand.trim();
      const balanceStr = card.balance.toString();
      const rateStr = card.rate.toString();
      const plaidAccountId = card.accountId?.trim() || null;
      const userCardId = await upsertUserCard(tx, userId, card, "cabinet");

      const existing = await findExistingLeadCard(
        tx,
        leadId,
        userCardId,
        plaidAccountId,
        brand,
        balanceStr,
        rateStr,
      );
      if (existing) {
        if (userCardId && !existing.userCardId) {
          await tx
            .update(leadCardsTable)
            .set({ userCardId, updatedAt: now })
            .where(eq(leadCardsTable.id, existing.id));
        }
        continue;
      }

      const annualSavings = calculateAnnualSavings(
        card.balance,
        card.rate,
        CABINET_TARGET_APR,
      );

      await tx.insert(leadCardsTable).values({
        leadId,
        userCardId,
        plaidAccountId,
        brand,
        balance: balanceStr,
        currentApr: rateStr,
        targetApr: CABINET_TARGET_APR.toString(),
        estimatedAnnualSavings: annualSavings.toString(),
        createdAt: now,
        updatedAt: now,
      });
      createdCount += 1;
    }
  });

  const plans = await listPlanLeadRowsForUser(userId);
  return { createdCount, plans };
}

export async function replacePlanLeadCards(
  leadId: number,
  userId: number,
  cards: ImportCardInput[],
): Promise<Awaited<ReturnType<typeof loadDebtLeadDetailForUser>> | null> {
  const loaded = await loadDebtLeadForUser(leadId, userId);
  if (!loaded) return null;
  if (loaded.lead.status !== "recommended" || loaded.lead.sentToPartnerAt) {
    return null;
  }

  const validCards = cards.filter(isValidImportCardForPlanLead);
  if (validCards.length === 0) return null;

  const now = new Date();

  await db.transaction(async (tx) => {
    await tx.delete(leadCardsTable).where(eq(leadCardsTable.leadId, leadId));

    for (const card of validCards) {
      const brand = card.brand.trim();
      const balanceStr = card.balance.toString();
      const rateStr = card.rate.toString();
      const plaidAccountId = card.accountId?.trim() || null;
      const userCardId = await upsertUserCard(tx, userId, card, "cabinet");

      const annualSavings = calculateAnnualSavings(
        card.balance,
        card.rate,
        CABINET_TARGET_APR,
      );

      await tx.insert(leadCardsTable).values({
        leadId,
        userCardId,
        plaidAccountId,
        brand,
        balance: balanceStr,
        currentApr: rateStr,
        targetApr: CABINET_TARGET_APR.toString(),
        estimatedAnnualSavings: annualSavings.toString(),
        createdAt: now,
        updatedAt: now,
      });
    }

    await tx
      .update(debtLeadsTable)
      .set({ updatedAt: now })
      .where(eq(debtLeadsTable.id, leadId));
  });

  return loadDebtLeadDetailForUser(leadId, userId);
}

export async function loadDebtLeadById(leadId: number): Promise<DebtLead | null> {
  const [row] = await db
    .select()
    .from(debtLeadsTable)
    .where(eq(debtLeadsTable.id, leadId))
    .limit(1);
  return row ?? null;
}
