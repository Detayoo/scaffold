import { v1AuthenticatedApi } from "../api";

export const getPaylinksFn = async ({
  reference,
  status,
}: {
  reference?: string;
  status?: string;
} = {}) => {
  const params: Record<string, string> = {};
  if (reference) params.reference = reference;
  if (status) params.status = status;
  const { data } = await v1AuthenticatedApi().get("/paylinks", { params });
  return data;
};

export const createPaylinkFn = async ({
  reference,
  amountMinor,
  currency,
  channels,
  metadata,
}: {
  reference: string;
  amountMinor: number;
  currency: string;
  channels?: string[];
  metadata?: Record<string, string>;
}) => {
  const { data } = await v1AuthenticatedApi().post("/paylinks", {
    reference,
    amountMinor,
    currency,
    channels,
    metadata,
  });
  return data;
};

export const updatePaylinkStatusFn = async ({
  id,
  status,
}: {
  id: string;
  status: string;
}) => {
  const { data } = await v1AuthenticatedApi().post(`/paylinks/${id}/status`, { status });
  return data;
};
