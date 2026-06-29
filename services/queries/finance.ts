import { v1AuthenticatedApi } from "../api";
import type {
  DashboardHomeResponse,
  BalancesResponse,
  SettlementsResponse,
  SettlementDetailResponse,
} from "@/types/finance";

export const getDashboardHomeFn = async () => {
  const { data } = await v1AuthenticatedApi().get<DashboardHomeResponse>("/dashboard/home");
  return data;
};

export const getBalancesFn = async ({
  currency,
}: {
  currency?: string;
} = {}) => {
  const params: Record<string, string> = {};
  if (currency) params.currency = currency;
  const { data } = await v1AuthenticatedApi().get<BalancesResponse>("/balances", { params });
  return data;
};

export const getSettlementsFn = async ({
  status,
  currency,
}: {
  status?: string;
  currency?: string;
} = {}) => {
  const params: Record<string, string> = {};
  if (status) params.status = status;
  if (currency) params.currency = currency;
  const { data } = await v1AuthenticatedApi().get<SettlementsResponse>("/settlements", { params });
  return data;
};

export const getSettlementDetailFn = async ({ id }: { id: string }) => {
  const { data } = await v1AuthenticatedApi().get<SettlementDetailResponse>(`/settlements/${id}`);
  return data;
};
