export type CardEntry = {
  brand: string;
  balance: string;
  rate: string;
  /** Plaid `account_id` when row came from import; used for deduplication */
  accountId?: string;
};
