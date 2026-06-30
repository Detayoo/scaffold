import { v1AuthenticatedApi } from "../api";
import type { APIKeyResponse, ApiKeysListResponse, BareResponse } from "@/types";

export const getKeysFn = async ({
  environment,
  type,
}: {
  environment?: string;
  type?: string;
} = {}) => {
  const params: Record<string, string> = {};
  if (environment) params.environment = environment;
  if (type) params.type = type;
  const { data } = await v1AuthenticatedApi().get<ApiKeysListResponse>("/keys", { params });
  return data;
};

export const createKeyFn = async () => {
  const { data } = await v1AuthenticatedApi().post<APIKeyResponse>("/keys");
  return data;
};

export const rotateKeyFn = async ({ id }: { id: string }) => {
  const { data } = await v1AuthenticatedApi().post<BareResponse>(`/keys/${id}/rotate`);
  return data;
};

export const revokeKeyFn = async ({ id }: { id: string }) => {
  const { data } = await v1AuthenticatedApi().post<BareResponse>(`/keys/${id}/revoke`);
  return data;
};
