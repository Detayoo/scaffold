import { v1AuthenticatedApi } from "../api";
import type { BareResponse, GetMerchantProfileResponse } from "@/types";

export const getMerchantProfileFn = async () => {
  const { data } = await v1AuthenticatedApi().get<GetMerchantProfileResponse>("/merchant");
  return data;
};

export const setupWebhookFn = async (url: string) => {
  const { data } = await v1AuthenticatedApi().post<BareResponse>("/merchant/webhook", { url });
  return data;
};

export const changePasswordFn = async (payload: {
  oldPassword: string;
  password: string;
}) => {
  const { data } = await v1AuthenticatedApi().post<BareResponse>("/user/change-password", payload);
  return data;
};
