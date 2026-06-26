import { BareResponse } from "@/types";
import { getData, postData } from "..";
import type { APIKeysResponse, GetMerchantProfileResponse } from "@/types";

export const setupWebhookFn = (url: string) => {
  return postData<BareResponse>("/merchant/webhook", { url });
};

export const getMerchantProfileFn = () => {
  return getData<GetMerchantProfileResponse>("/merchant");
};

export const getKeysFn = () => {
  return getData<APIKeysResponse>("/merchant/keys");
};

export const generateMerchantKeyFn = () => {
  return postData<BareResponse>("/merchant/keys");
};

export const changePasswordFn = (payload: {
  oldPassword: string;
  password: string;
}) => {
  return postData<BareResponse>("/user/change-password", payload);
};
