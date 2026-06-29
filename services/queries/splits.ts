import { v1AuthenticatedApi } from "../api";
import type { CreateSubaccountPayload, CreateSplitRulePayload } from "@/types";

export const getSubaccountsFn = async (opts?: {
  status?: string;
}) => {
  const { status } = opts ?? {};
  const params: Record<string, string> = {};
  if (status) params.status = status;
  const { data } = await v1AuthenticatedApi().get("/subaccounts", { params });
  return data;
};

export const createSubaccountFn = async (payload: CreateSubaccountPayload) => {
  const { data } = await v1AuthenticatedApi().post("/subaccounts", payload);
  return data;
};

export const createSplitRuleFn = async (payload: CreateSplitRulePayload) => {
  const { data } = await v1AuthenticatedApi().post("/split-rules", payload);
  return data;
};

export const getSplitRuleFn = async ({ id }: { id: string }) => {
  const { data } = await v1AuthenticatedApi().get(`/split-rules/${id}`);
  return data;
};
