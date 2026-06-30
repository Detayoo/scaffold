import { v1AuthenticatedApi } from "../api";
import type {
  BareResponse,
  Invite,
  TeamMember,
} from "@/types";

export const getMembersFn = async () => {
  const { data } = await v1AuthenticatedApi().get<{ status: boolean; data: TeamMember[] }>("/merchant/users");
  return data;
};

export const getInvitesFn = async () => {
  const { data } = await v1AuthenticatedApi().get<{ status: boolean; data: Invite[] }>("/merchant/invitations");
  return data;
};

export const createInviteFn = async (payload: { email: string; role: string }) => {
  const { data } = await v1AuthenticatedApi().post<BareResponse>("/merchant/invitations", payload);
  return data;
};

export const deleteInviteFn = async (id: string) => {
  const { data } = await v1AuthenticatedApi().delete<BareResponse>(`/merchant/invitations/${id}`);
  return data;
};

export const resendInviteFn = async (id: string) => {
  const { data } = await v1AuthenticatedApi().post<BareResponse>(`/merchant/invitations/${id}/resend`);
  return data;
};

export const previewInviteFn = async (token: string) => {
  const { data } = await v1AuthenticatedApi().post("/auth/invitations/preview", { token });
  return data;
};

export const acceptInviteFn = async (payload: { token: string; name: string; password: string }) => {
  const { data } = await v1AuthenticatedApi().post("/auth/invitations/accept", payload);
  return data;
};
