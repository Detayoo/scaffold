import { v1AuthenticatedApi } from "../api";
import type { SubmitEvidencePayload } from "@/types";

export const getDisputesFn = async ({
  reference,
  status,
}: {
  reference?: string;
  status?: string;
} = {}) => {
  const params: Record<string, string> = {};
  if (reference) params.reference = reference;
  if (status) params.status = status;
  const { data } = await v1AuthenticatedApi().get("/disputes", { params });
  return data;
};

export const getDisputeDetailsFn = async ({ id }: { id: string }) => {
  const { data } = await v1AuthenticatedApi().get(`/disputes/${id}`);
  return data;
};

export const submitDisputeEvidenceFn = async ({
  id,
  payload,
}: {
  id: string;
  payload: SubmitEvidencePayload;
}) => {
  const { data } = await v1AuthenticatedApi().post(`/disputes/${id}/evidence`, payload);
  return data;
};
