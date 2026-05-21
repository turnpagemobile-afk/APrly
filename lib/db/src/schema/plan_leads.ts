/** @deprecated Use debtLeadsTable and leadCardsTable. Kept for type aliases during transition. */
export {
  debtLeadStatusValues as planLeadStatusValues,
  type DebtLeadStatus as PlanLeadStatus,
  debtLeadsTable as planLeadsTable,
  type DebtLead as PlanLead,
  type InsertDebtLead as InsertPlanLead,
} from "./debt_leads";

export { leadCardsTable, type LeadCard, type InsertLeadCard } from "./lead_cards";
