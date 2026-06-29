import { BareResponse, LoginResponse, RegistrationDTO } from "@/types";
import { authenticatedApi, baseApi } from "../api";

export const registerFn = async (payload: RegistrationDTO) => {
  const { data } = await baseApi.post<BareResponse>("/v1/auth/register", payload);
  return data;
};

export const loginFn = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const { data } = await baseApi.post<LoginResponse>("/v1/auth/login", { email, password });
  return data;
};

export const verifyOtpFn = async ({
  otp,
  email,
}: {
  otp: string;
  email: string;
}) => {
  const { data } = await baseApi.post<BareResponse>("/v1/auth/verify", { otp, email });
  return data;
};

export const resendOtpFn = async ({ email }: { email: string }) => {
  const { data } = await baseApi.post<BareResponse>("/v1/auth/resend-verify-otp", { email });
  return data;
};

export const forgotPasswordFn = async (email: string) => {
  const { data } = await baseApi.post<BareResponse>("/v1/auth/forgot-password", { email });
  return data;
};

export const resetPasswordFn = async ({
  otp,
  password,
  email,
}: {
  otp: string;
  password: string;
  email: string;
}) => {
  const { data } = await baseApi.post<BareResponse>("/v1/auth/reset-password", { otp, password, email });
  return data;
};

export const logoutFn = async () => {
  const { data } = await authenticatedApi().post<BareResponse>("/v1/auth/logout");
  return data;
};
