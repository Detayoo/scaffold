import { v1Api, v1AuthenticatedApi } from "../api";
import type {
  AcceptInvite,
  BareResponse,
  CreateInviteType,
  Invites,
  Members,
  SingleInvite,
} from "@/types";

export const getInvitesFn = async ({
  page,
  size,
}: {
  page: number;
  size: number;
}) => {
  const { data } = await v1AuthenticatedApi().get<Invites>("/invite", { params: { page, size } });
  return data;
};

export const getMembersFn = async ({
  page,
  size,
}: {
  page: number;
  size: number;
}) => {
  const { data } = await v1AuthenticatedApi().get<Members>("/merchant/team", { params: { page, size } });
  return data;
};

export const acceptInviteFn = async (payload: AcceptInvite) => {
  const { data } = await v1AuthenticatedApi().post<BareResponse>("/invite/create-account", payload);
  return data;
};

export const createInviteFn = async (payload: CreateInviteType) => {
  const { data } = await v1AuthenticatedApi().post<BareResponse>("/invite", payload);
  return data;
};

export const deleteInviteFn = async (reference: string) => {
  const { data } = await v1AuthenticatedApi().delete<BareResponse>("/invite", { data: { reference } });
  return data;
};

export const getSingleInviteFn = async (reference: string) => {
  const { data } = await v1Api.get<SingleInvite>("/invite/single", { params: { reference } });
  return data;
};

export const suspendMemberFn = async ({
  id,
  status,
}: {
  id: string;
  status: "SUSPENDED" | "ENABLED";
}) => {
  const { data } = await v1AuthenticatedApi().patch<BareResponse>("/merchant/team", { userId: id, status });
  return data;
};
