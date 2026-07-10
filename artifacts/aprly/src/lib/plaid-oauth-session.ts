import type { CardEntry } from "@/components/landing/types";

export const PLAID_OAUTH_PATH = "/plaid/oauth";

export type PlaidOAuthFlow = "landing" | "create-plan" | "add-plan-cards";

export type PlaidOAuthSession = {
  linkToken: string;
  flow: PlaidOAuthFlow;
  returnTo: string;
  planLeadId?: number;
};

const KEY_LINK_TOKEN = "aprly_plaid_link_token";
const KEY_FLOW = "aprly_plaid_flow";
const KEY_RETURN_TO = "aprly_plaid_return_to";
const KEY_PLAN_LEAD_ID = "aprly_plaid_plan_lead_id";
const KEY_PENDING_ACCOUNTS = "aprly_plaid_pending_accounts";

function storage(): Storage | null {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage;
}

export function isPlaidOAuthReturnUrl(search: string): boolean {
  return new URLSearchParams(search).has("oauth_state_id");
}

export function savePlaidOAuthSession(session: PlaidOAuthSession): void {
  const s = storage();
  if (!s) return;
  s.setItem(KEY_LINK_TOKEN, session.linkToken);
  s.setItem(KEY_FLOW, session.flow);
  s.setItem(KEY_RETURN_TO, session.returnTo);
  if (session.planLeadId != null) {
    s.setItem(KEY_PLAN_LEAD_ID, String(session.planLeadId));
  } else {
    s.removeItem(KEY_PLAN_LEAD_ID);
  }
}

export function loadPlaidOAuthSession(): PlaidOAuthSession | null {
  const s = storage();
  if (!s) return null;

  const linkToken = s.getItem(KEY_LINK_TOKEN)?.trim();
  const flow = s.getItem(KEY_FLOW) as PlaidOAuthFlow | null;
  const returnTo = s.getItem(KEY_RETURN_TO)?.trim();

  if (!linkToken || !flow || !returnTo) return null;
  if (flow !== "landing" && flow !== "create-plan" && flow !== "add-plan-cards") {
    return null;
  }

  const rawPlanLeadId = s.getItem(KEY_PLAN_LEAD_ID);
  const planLeadId = rawPlanLeadId ? Number(rawPlanLeadId) : undefined;

  return {
    linkToken,
    flow,
    returnTo,
    ...(planLeadId != null && Number.isInteger(planLeadId) && planLeadId > 0
      ? { planLeadId }
      : {}),
  };
}

export function clearPlaidOAuthSession(): void {
  const s = storage();
  if (!s) return;
  s.removeItem(KEY_LINK_TOKEN);
  s.removeItem(KEY_FLOW);
  s.removeItem(KEY_RETURN_TO);
  s.removeItem(KEY_PLAN_LEAD_ID);
}

export function savePlaidPendingAccounts(accounts: CardEntry[]): void {
  const s = storage();
  if (!s) return;
  s.setItem(KEY_PENDING_ACCOUNTS, JSON.stringify(accounts));
}

export function loadAndClearPlaidPendingAccounts(): CardEntry[] | null {
  const s = storage();
  if (!s) return null;
  const raw = s.getItem(KEY_PENDING_ACCOUNTS);
  s.removeItem(KEY_PENDING_ACCOUNTS);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CardEntry[];
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}
