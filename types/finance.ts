export type DashboardHomeData = {
  today: {
    gross_amount_minor: number;
    net_amount_minor: number;
    successful_payments: number;
    total_payments: number;
    success_rate: number;
    by_channel: Record<string, any>;
  };
  pending_transfer_count: number;
  balances: Array<{
    currency: string;
    pending_amount_minor: number;
    available_amount_minor: number;
    held_amount_minor: number;
    settlement_payable_amount_minor: number;
    paid_amount_minor: number;
  }>;
  next_settlement: string | null;
};

export type DashboardHomeResponse = {
  status: boolean;
  data: DashboardHomeData;
};

export type BalanceItem = {
  currency: string;
  pendingAmountMinor: number;
  availableAmountMinor: number;
  heldAmountMinor: number;
  settlementPayableAmountMinor: number;
  paidAmountMinor: number;
};

export type BalancesResponse = {
  status: boolean;
  data: BalanceItem[];
};

export type SettlementBatch = {
  id: string;
  merchantId: string;
  environment: string;
  currency: string;
  channel: string;
  provider: string;
  status: string;
  reconciliationStatus: string;
  grossAmountMinor: number;
  feeAmountMinor: number;
  netAmountMinor: number;
  itemCount: number;
  payableLedgerGroupId?: string;
  approvedAt?: string;
  paidAt?: string;
  createdAt: string;
};

export type SettlementsResponse = {
  status: boolean;
  data: SettlementBatch[];
};

export type SettlementDetail = {
  batch: SettlementBatch;
  items: Array<{
    ledgerGroupId: string;
    reference: string;
    amountMinor: number;
    currency: string;
    feeMinor: number;
    netMinor: number;
    channel: string;
    status: string;
    settledAt?: string;
  }>;
  payout?: {
    id: string;
    amountMinor: number;
    currency: string;
    paidAt: string;
    reference: string;
  } | null;
};

export type SettlementDetailResponse = {
  status: boolean;
  data: SettlementDetail;
};
