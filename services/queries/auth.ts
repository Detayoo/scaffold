import { BareResponse, LoginResponse, RegistrationDTO } from "@/types";
import { postData } from "..";

export const registerFn = (payload: RegistrationDTO) => {
  return postData<BareResponse>("/auth/register", payload, false);
};

export const loginFn = ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  return postData<LoginResponse>("/auth/login", { email, password }, false);
};

export const verifyOtpFn = ({
  otp,
  email,
}: {
  otp: string;
  email: string;
}) => {
  return postData<BareResponse>("/auth/verify", { otp, email }, false);
};

export const resendOtpFn = ({ email }: { email: string }) => {
  return postData<BareResponse>("/auth/resend-verify-otp", { email }, false);
};

export const forgotPasswordFn = (email: string) => {
  return postData<BareResponse>("/auth/forgot-password", { email }, false);
};

export const resetPasswordFn = ({
  otp,
  password,
  email,
}: {
  otp: string;
  password: string;
  email: string;
}) => {
  return postData<BareResponse>(
    "/auth/reset-password",
    { otp, password, email },
    false
  );
};

export const logoutFn = () => {
  return postData<BareResponse>("/auth/logout");
};

