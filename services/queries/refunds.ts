import { v1AuthenticatedApi } from "../api";
import type { CreateRefundPayload } from "@/types";

export const getRefundsFn = async ({
  reference,
  status,
}: {
  reference?: string;
  status?: string;
} = {}) => {
  const params: Record<string, string> = {};
  if (reference) params.reference = reference;
  if (status) params.status = status;
  const { data } = await v1AuthenticatedApi().get("/refunds", { params });
  return data;
};

export const createRefundFn = async (payload: CreateRefundPayload) => {
  const { data } = await v1AuthenticatedApi().post("/refunds", payload);
  return data;
};

export const getRefundDetailsFn = async ({ id }: { id: string }) => {
  const { data } = await v1AuthenticatedApi().get(`/refunds/${id}`);
  return data;
};
