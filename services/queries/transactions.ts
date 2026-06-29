import { v1AuthenticatedApi } from "../api";

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
  const { data } = await v1AuthenticatedApi().get("/admin/audit-logs", { params });
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
