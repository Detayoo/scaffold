import { v1AuthenticatedApi, v1AdminAuthenticatedApi } from "../api";

export const getTransactionsFn = async ({
  reference,
  status,
  channel,
  createdFrom,
  createdTo,
  amountMin,
  amountMax,
}: {
  reference?: string;
  status?: string;
  channel?: string;
  createdFrom?: string;
  createdTo?: string;
  amountMin?: number;
  amountMax?: number;
} = {}) => {
  const params: Record<string, string> = {};
  if (reference) params.reference = reference;
  if (status) params.status = status;
  if (channel) params.channel = channel;
  if (createdFrom) params.createdFrom = createdFrom;
  if (createdTo) params.createdTo = createdTo;
  if (amountMin) params.amountMin = String(amountMin);
  if (amountMax) params.amountMax = String(amountMax);
  const { data } = await v1AuthenticatedApi().get("/transactions", { params });
  return data;
};

export const getTransactionDetailFn = async ({ reference }: { reference: string }) => {
  const { data } = await v1AuthenticatedApi().get(`/transactions/${reference}/detail`);
  return data;
};

export const getTransactionTimelineFn = async ({ reference }: { reference: string }) => {
  const { data } = await v1AuthenticatedApi().get(`/transactions/${reference}/timeline`);
  return data;
};

export const getAuditLogsFn = async ({
  action,
  targetType,
  actorId,
}: {
  action?: string;
  targetType?: string;
  actorId?: string;
} = {}) => {
  const params: Record<string, string> = {};
  if (action) params.action = action;
  if (targetType) params.targetType = targetType;
  if (actorId) params.actorId = actorId;
  const { data } = await v1AdminAuthenticatedApi().get("/admin/audit-logs", { params });
  return data;
};

export const getProviderHealthFn = async ({
  provider,
  channel,
  environment,
}: {
  provider?: string;
  channel?: string;
  environment?: string;
} = {}) => {
  const params: Record<string, string> = {};
  if (provider) params.provider = provider;
  if (channel) params.channel = channel;
  if (environment) params.environment = environment;
  const { data } = await v1AdminAuthenticatedApi().get("/admin/provider-health", { params });
  return data;
};

export const updateProviderHealthFn = async (payload: {
  provider: string;
  channel: string;
  environment: string;
  status: string;
  routingEnabled: boolean;
}) => {
  const { data } = await v1AdminAuthenticatedApi().post("/admin/provider-health", payload);
  return data;
};

export const reviewMerchantFn = async ({
  id,
  status,
  riskTier,
  note,
}: {
  id: string;
  status: string;
  riskTier: string;
  note?: string;
}) => {
  const { data } = await v1AdminAuthenticatedApi().post(`/admin/merchants/${id}/review`, {
    status,
    riskTier,
    note,
  });
  return data;
};

export const getCollectionOptionsFn = async () => {
  const { data } = await v1AuthenticatedApi().get("/collection-options");
  return data;
};

export const toggleCollectionChannelFn = async ({
  channel,
  enabled,
}: {
  channel: string;
  enabled: boolean;
}) => {
  const { data } = await v1AuthenticatedApi().post("/collection-options", { channel, enabled });
  return data;
};

export const getAdminRefundsFn = async ({
  reference,
  status,
}: {
  reference?: string;
  status?: string;
} = {}) => {
  const params: Record<string, string> = {};
  if (reference) params.reference = reference;
  if (status) params.status = status;
  const { data } = await v1AdminAuthenticatedApi().get("/admin/refunds", { params });
  return data;
};

export const createAdminRefundFn = async (payload: {
  amount: number;
  reference: string;
  currency: string;
  reason?: string;
}) => {
  const { data } = await v1AdminAuthenticatedApi().post("/admin/refunds", payload);
  return data;
};

export const approveAdminRefundFn = async ({ id, note }: { id: string; note?: string }) => {
  const { data } = await v1AdminAuthenticatedApi().post(`/admin/refunds/${id}/approve`, { note });
  return data;
};

export const rejectAdminRefundFn = async ({ id, reason }: { id: string; reason?: string }) => {
  const { data } = await v1AdminAuthenticatedApi().post(`/admin/refunds/${id}/reject`, { reason });
  return data;
};

export const processAdminRefundFn = async ({
  id,
  executionMode,
  provider,
}: {
  id: string;
  executionMode: string;
  provider: string;
}) => {
  const { data } = await v1AdminAuthenticatedApi().post(`/admin/refunds/${id}/process`, { executionMode, provider });
  return data;
};

export const markAdminRefundSucceededFn = async ({
  id,
  providerReference,
  succeededAt,
}: {
  id: string;
  providerReference: string;
  succeededAt: string;
}) => {
  const { data } = await v1AdminAuthenticatedApi().post(`/admin/refunds/${id}/mark-succeeded`, {
    providerReference,
    evidence: { operator: "Admin" },
    succeededAt,
  });
  return data;
};

export const markAdminRefundFailedFn = async ({ id, reason }: { id: string; reason?: string }) => {
  const { data } = await v1AdminAuthenticatedApi().post(`/admin/refunds/${id}/mark-failed`, {
    reason: reason ?? "Processing failed",
    evidence: {},
  });
  return data;
};

export const getAdminDisputesFn = async ({
  reference,
  status,
}: {
  reference?: string;
  status?: string;
} = {}) => {
  const params: Record<string, string> = {};
  if (reference) params.reference = reference;
  if (status) params.status = status;
  const { data } = await v1AdminAuthenticatedApi().get("/admin/disputes", { params });
  return data;
};

export const createAdminDisputeFn = async (payload: {
  paymentReference: string;
  amountMinor: number;
  currency: string;
  reason: string;
  evidenceDueAt?: string;
  metadata?: Record<string, string>;
}) => {
  const { data } = await v1AdminAuthenticatedApi().post("/admin/disputes", payload);
  return data;
};

export const holdAdminDisputeFn = async ({
  id,
  amountMinor,
  holdScope,
}: {
  id: string;
  amountMinor: number;
  holdScope: string;
}) => {
  const { data } = await v1AdminAuthenticatedApi().post(`/admin/disputes/${id}/hold`, {
    amountMinor,
    currency: "NGN",
    holdScope,
  });
  return data;
};

export const assignAdminDisputeFn = async ({
  id,
  ownerId,
  ownerName,
}: {
  id: string;
  ownerId: string;
  ownerName: string;
}) => {
  const { data } = await v1AdminAuthenticatedApi().post(`/admin/disputes/${id}/assign`, {
    ownerId,
    ownerName,
  });
  return data;
};

export const outcomeAdminDisputeFn = async ({
  id,
  outcome,
  note,
}: {
  id: string;
  outcome: string;
  note?: string;
}) => {
  const { data } = await v1AdminAuthenticatedApi().post(`/admin/disputes/${id}/outcome`, {
    outcome,
    note,
  });
  return data;
};

export const closeAdminDisputeFn = async ({
  id,
  note,
}: {
  id: string;
  note?: string;
}) => {
  const { data } = await v1AdminAuthenticatedApi().post(`/admin/disputes/${id}/close`, {
    note: note ?? "Closed after outcome",
  });
  return data;
};

export const runSettlementFn = async (payload?: {
  merchantId?: string;
  environment?: string;
  currency?: string;
  channel?: string;
  asOf?: string;
}) => {
  const { data } = await v1AdminAuthenticatedApi().post("/admin/settlement-runs", payload ?? {});
  return data;
};

export const approveSettlementFn = async ({ id }: { id: string }) => {
  const { data } = await v1AdminAuthenticatedApi().post(`/admin/settlements/${id}/approve`);
  return data;
};

export const markSettlementPaidFn = async ({
  id,
  provider,
  paidAt,
  evidence,
}: {
  id: string;
  provider: string;
  paidAt: string;
  evidence: { bank: string; nibss_reference: string; destination_account?: string };
}) => {
  const { data } = await v1AdminAuthenticatedApi().post(`/admin/settlements/${id}/mark-paid`, {
    provider,
    paidAt,
    evidence,
  });
  return data;
};

export const runSplitSettlementFn = async (payload?: {
  environment?: string;
  currency?: string;
  cutoffDate?: string;
}) => {
  const { data } = await v1AdminAuthenticatedApi().post("/admin/split-settlements", payload ?? {});
  return data;
};

export const importProviderStatementsFn = async (payload: {
  sourceType: string;
  provider: string;
  environment: string;
  items: Array<{ providerReference: string; amountMinor: number; currency: string; occurredAt: string }>;
  metadata?: Record<string, string>;
}) => {
  const { data } = await v1AdminAuthenticatedApi().post("/admin/provider-statements/import", payload);
  return data;
};

export const runReconciliationFn = async (payload: {
  importId: string;
  jobType: string;
  environment: string;
  provider: string;
  detectMissingProvider: boolean;
  metadata?: Record<string, string>;
}) => {
  const { data } = await v1AdminAuthenticatedApi().post("/admin/reconciliation-runs", payload);
  return data;
};

export const getReconciliationExceptionsFn = async ({
  status,
  type,
  ownerId,
}: {
  status?: string;
  type?: string;
  ownerId?: string;
} = {}) => {
  const params: Record<string, string> = {};
  if (status) params.status = status;
  if (type) params.type = type;
  if (ownerId) params.ownerId = ownerId;
  const { data } = await v1AdminAuthenticatedApi().get("/admin/reconciliation-exceptions", { params });
  return data;
};

export const assignReconciliationExceptionFn = async ({
  id,
  ownerId,
  ownerName,
}: {
  id: string;
  ownerId: string;
  ownerName: string;
}) => {
  const { data } = await v1AdminAuthenticatedApi().post(`/admin/reconciliation-exceptions/${id}/assign`, { ownerId, ownerName });
  return data;
};

export const resolveReconciliationExceptionFn = async ({
  id,
  reason,
  evidence,
}: {
  id: string;
  reason: string;
  evidence?: Record<string, string>;
}) => {
  const { data } = await v1AdminAuthenticatedApi().post(`/admin/reconciliation-exceptions/${id}/resolve`, {
    resolutionReason: reason,
    resolutionEvidence: evidence ?? {},
  });
  return data;
};

export const createManualAdjustmentFn = async (payload: {
  merchantId: string;
  reason: string;
  evidence?: Record<string, string>;
  lines: Array<{
    ownerType: string;
    ownerId?: string;
    accountType: string;
    accountName: string;
    direction: string;
    amountMinor: number;
    currency: string;
  }>;
}) => {
  const { data } = await v1AdminAuthenticatedApi().post("/admin/manual-adjustments", payload);
  return data;
};

export const getAccountCreditsFn = async ({
  status,
  customerId,
}: {
  status?: string;
  customerId?: string;
} = {}) => {
  const params: Record<string, string> = {};
  if (status) params.status = status;
  if (customerId) params.customerId = customerId;
  const { data } = await v1AdminAuthenticatedApi().get("/admin/account-credits", { params });
  return data;
};

export const applyAccountCreditFn = async ({ id, paymentIntentId }: { id: string; paymentIntentId: string }) => {
  const { data } = await v1AdminAuthenticatedApi().post(`/admin/account-credits/${id}/apply`, { paymentIntentId });
  return data;
};

export const holdAccountCreditFn = async ({ id, reason }: { id: string; reason: string }) => {
  const { data } = await v1AdminAuthenticatedApi().post(`/admin/account-credits/${id}/hold`, { reason });
  return data;
};

export const refundAccountCreditFn = async ({
  id,
  destinationAccountNumber,
  destinationBankCode,
  reason,
}: {
  id: string;
  destinationAccountNumber: string;
  destinationBankCode: string;
  reason: string;
}) => {
  const { data } = await v1AdminAuthenticatedApi().post(`/admin/account-credits/${id}/refund`, {
    destinationAccountNumber,
    destinationBankCode,
    reason,
  });
  return data;
};
