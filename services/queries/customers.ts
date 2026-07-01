import { v1AuthenticatedApi } from "../api";
import type { CreateCustomerPayload, VirtualAccount } from "@/types";

export const getCustomerListFn = async (opts: {
  reference?: string;
  email?: string;
  status?: string;
}) => {
  const { reference, email, status } = opts ?? {};
  const queryParams: Record<string, string> = {};
  if (reference) queryParams.reference = reference;
  if (email) queryParams.email = email;
  if (status) queryParams.status = status;
  const { data } = await v1AuthenticatedApi().get("/customers", { params: queryParams });
  return data;
};

export const createCustomerFn = async (payload: CreateCustomerPayload) => {
  const { data } = await v1AuthenticatedApi().post("/customers", payload);
  return data;
};

export const getCustomerDvasFn = async ({
  id,
}: {
  id: string;
}) => {
  const { data } = await v1AuthenticatedApi().get(`/customers/${id}/dedicated-accounts`);
  return data as { status: boolean; data: VirtualAccount[] };
};

export const assignCustomerDvaFn = async ({
  id,
  payload,
}: {
  id: string;
  payload: Record<string, string>;
}) => {
  const { data } = await v1AuthenticatedApi().post(`/customers/${id}/dedicated-accounts`, payload);
  return data;
};
