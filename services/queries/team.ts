import { v1Api, v1AuthenticatedApi } from "../api";
import type {
  AcceptInvite,
  BareResponse,
  CreateInvitePayload,
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

export const createInviteFn = async (payload: CreateInvitePayload) => {
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

export const acceptInviteFn = async (payload: AcceptInvite) => {
  const { data } = await v1AuthenticatedApi().post<BareResponse>("/invite/create-account", payload);
  return data;
};

export const getSingleInviteFn = async (reference: string) => {
  const { data } = await v1Api.get<{ data: Invite & { merchantName?: string } }>("/invite/single", { params: { reference } });
  return data;
};

export const suspendMemberFn = async ({
  id,
  status,
}: {
  id: string;
  status: string;
}) => {
  const { data } = await v1AuthenticatedApi().patch<BareResponse>("/merchant/team", { userId: id, status });
  return data;
};
