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
