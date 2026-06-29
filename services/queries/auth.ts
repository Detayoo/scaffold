import { BareResponse, LoginResponse, RegistrationDTO } from "@/types";
import { v1Api, v1AuthenticatedApi } from "../api";

export const registerFn = async (payload: RegistrationDTO) => {
  const { data } = await v1Api.post<BareResponse>("/auth/register", payload);
  return data;
};

export const loginFn = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const { data } = await v1Api.post<LoginResponse>("/auth/login", { email, password });
  return data;
};

export const verifyOtpFn = async ({
  otp,
  email,
}: {
  otp: string;
  email: string;
}) => {
  const { data } = await v1Api.post<BareResponse>("/auth/verify", { otp, email });
  return data;
};

export const resendOtpFn = async ({ email }: { email: string }) => {
  const { data } = await v1Api.post<BareResponse>("/auth/resend-verify-otp", { email });
  return data;
};

export const forgotPasswordFn = async (email: string) => {
  const { data } = await v1Api.post<BareResponse>("/auth/forgot-password", { email });
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
  const { data } = await v1Api.post<BareResponse>("/auth/reset-password", { otp, password, email });
  return data;
};

export const adminLoginFn = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const { data } = await v1Api.post<LoginResponse>("/admin/auth/login", { email, password });
  return data;
};

export const logoutFn = async () => {
  const { data } = await v1AuthenticatedApi().post<BareResponse>("/auth/logout");
  return data;
};
