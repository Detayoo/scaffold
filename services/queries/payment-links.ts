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

export const getPaylinkPaymentsFn = async ({
  id,
  reference,
  status,
}: {
  id: string;
  reference?: string;
  status?: string;
}) => {
  const params: Record<string, string> = {};
  if (reference) params.reference = reference;
  if (status) params.status = status;
  const { data } = await v1AuthenticatedApi().get(`/paylinks/${id}/payments`, { params });
  return data;
};

export const createPaylinkFn = async ({
  reference,
  amount,
  currency,
  channels,
  status,
  metadata,
}: {
  reference: string;
  amount: number;
  currency: string;
  channels?: string[];
  status?: string;
  metadata?: Record<string, string>;
}) => {
  const { data } = await v1AuthenticatedApi().post("/paylinks", {
    reference,
    amount,
    currency,
    channels,
    status,
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
