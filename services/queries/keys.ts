import { authenticatedApi, baseApi } from "../api";
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
  const { data } = await authenticatedApi().get<ApiKeysListResponse>("/v1/keys", { params });
  return data;
};

export const createKeyFn = async ({
  environment,
}: {
  environment: string;
}) => {
  const { data } = await authenticatedApi().post<APIKeyResponse>("/v1/keys", { environment });
  return data;
};

export const rotateKeyFn = async ({ id }: { id: string }) => {
  const { data } = await authenticatedApi().post<BareResponse>(`/v1/keys/${id}/rotate`);
  return data;
};

export const revokeKeyFn = async ({ id }: { id: string }) => {
  const { data } = await authenticatedApi().post<BareResponse>(`/v1/keys/${id}/revoke`);
  return data;
};
