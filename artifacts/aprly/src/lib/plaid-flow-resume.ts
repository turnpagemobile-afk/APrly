import type { PlaidLinkOnSuccessMetadata } from "react-plaid-link";
import {
  createDetailedPlan,
  exchangePlaidPublicToken,
  getPlanLead,
} from "@workspace/api-client-react";
import type { CardEntry } from "@/components/landing/types";
import { mapCardEntriesToImportItems } from "@/components/cards/mapCardEntries";
import type { PlaidImportedCard } from "@/components/cards/usePlaidCardImport";
import { createPlanContent } from "@/content/create-plan";
import { planLeadDetailContent } from "@/content/plan-lead-detail";
import { goToCabinet, goToLanding } from "@/lib/app-navigation";
import { mapLeadCardsToImport } from "@/lib/plan-lead-cards";
import { pickNewestCreatedPlan, visiblePlanIndex } from "@/lib/pick-newest-created-plan";
import { planLeadHref } from "@/lib/plan-lead-navigation";
import { updatePlanLeadCards } from "@/lib/payment-api";
import {
  clearPlaidOAuthSession,
  type PlaidOAuthSession,
  savePlaidPendingAccounts,
} from "@/lib/plaid-oauth-session";

function plaidRowsToCardEntries(rows: PlaidImportedCard[]): CardEntry[] {
  return rows.map((r) => ({
    brand: r.brand,
    balance: String(r.balance),
    rate: String(r.rate),
    accountId: r.accountId,
  }));
}

function mapExchangeRows(
  importedCards: { brand: string; balance: number; rate: number; accountId?: string }[],
): PlaidImportedCard[] {
  return importedCards.map((r) => ({
    brand: r.brand,
    balance: r.balance,
    rate: r.rate,
    accountId: r.accountId,
  }));
}

async function exchangeImportedCards(
  publicToken: string,
  metadata: PlaidLinkOnSuccessMetadata,
): Promise<PlaidImportedCard[]> {
  const result = await exchangePlaidPublicToken({
    publicToken,
    institutionName: metadata.institution?.name,
  });
  return mapExchangeRows(result.importedCards);
}

async function resumeLandingFlow(
  session: PlaidOAuthSession,
  rows: PlaidImportedCard[],
): Promise<void> {
  if (!rows.length) {
    goToLanding(session.returnTo || "/");
    return;
  }
  savePlaidPendingAccounts(plaidRowsToCardEntries(rows));
  goToLanding("/");
}

async function resumeCreatePlanFlow(
  session: PlaidOAuthSession,
  rows: PlaidImportedCard[],
): Promise<void> {
  const cards = mapCardEntriesToImportItems(plaidRowsToCardEntries(rows));
  if (!cards.length) {
    goToCabinet(session.returnTo);
    return;
  }

  const response = await createDetailedPlan({ cards });
  const newest = pickNewestCreatedPlan(response);
  if (!newest) {
    goToCabinet(session.returnTo);
    return;
  }

  const planIndex = visiblePlanIndex(response.plans);
  goToCabinet(planLeadHref(newest.id, session.returnTo, { planIndex }));
}

async function resumeAddPlanCardsFlow(
  session: PlaidOAuthSession,
  rows: PlaidImportedCard[],
): Promise<void> {
  const planLeadId = session.planLeadId;
  if (!planLeadId) {
    goToCabinet(session.returnTo);
    return;
  }

  const newCards = mapCardEntriesToImportItems(plaidRowsToCardEntries(rows));
  if (!newCards.length) {
    goToCabinet(session.returnTo);
    return;
  }

  const detail = await getPlanLead(planLeadId);
  const merged = [...mapLeadCardsToImport(detail.cards), ...newCards];
  await updatePlanLeadCards(planLeadId, merged);
  goToCabinet(session.returnTo);
}

export async function completePlaidOAuthImport(
  session: PlaidOAuthSession,
  publicToken: string,
  metadata: PlaidLinkOnSuccessMetadata,
): Promise<{ flow: PlaidOAuthSession["flow"]; cardCount: number }> {
  try {
    const rows = await exchangeImportedCards(publicToken, metadata);
    clearPlaidOAuthSession();

    switch (session.flow) {
      case "landing":
        await resumeLandingFlow(session, rows);
        break;
      case "create-plan":
        await resumeCreatePlanFlow(session, rows);
        break;
      case "add-plan-cards":
        await resumeAddPlanCardsFlow(session, rows);
        break;
    }

    return { flow: session.flow, cardCount: rows.length };
  } catch (err) {
    clearPlaidOAuthSession();
    throw err;
  }
}

export function redirectAfterPlaidOAuthExit(session: PlaidOAuthSession): void {
  clearPlaidOAuthSession();
  if (session.flow === "landing") {
    goToLanding(session.returnTo || "/");
    return;
  }
  goToCabinet(session.returnTo);
}

export const plaidOAuthMessages = {
  connecting: "Completing bank connection…",
  missingState: "This page is only used when returning from your bank. Go back to APrly to connect your accounts.",
  sessionExpired: "Your bank connection session expired. Please try connecting again.",
  exchangeFailed: "Could not load bank cards",
  noCards: "Plaid returned no credit-card balances with APR. Try another institution or add cards manually.",
  createPlanFailed: createPlanContent.errorDescription,
  addCardsFailed: planLeadDetailContent.addCardsErrorDescription,
};
