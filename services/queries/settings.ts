import { BareResponse } from "@/types";
import { getData, postData } from "..";
import type { GetMerchantProfileResponse } from "@/types";

export const getMerchantProfileFn = () => {
  return getData<GetMerchantProfileResponse>("/merchant");
};

export const setupWebhookFn = (url: string) => {
  return postData<BareResponse>("/merchant/webhook", { url });
};

export const changePasswordFn = (payload: {
  oldPassword: string;
  password: string;
}) => {
  return postData<BareResponse>("/user/change-password", payload);
};
