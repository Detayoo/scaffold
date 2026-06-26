import { deleteData, getData, patchData, postData } from "..";
import {
  AcceptInvite,
  BareResponse,
  CreateInviteType,
  Invites,
  Members,
  SingleInvite,
} from "@/types";

export const getInvitesFn = ({
  page,
  size,
}: {
  page: number;
  size: number;
}) => {
  return getData<Invites>("/invite", { page, size });
};

export const getMembersFn = ({
  page,
  size,
}: {
  page: number;
  size: number;
}) => {
  return getData<Members>("/merchant/team", { page, size });
};

export const acceptInviteFn = (payload: AcceptInvite) => {
  return postData<BareResponse>("/invite/create-account", payload);
};

export const createInviteFn = (payload: CreateInviteType) => {
  return postData<BareResponse>("/invite", payload);
};

export const deleteInviteFn = (reference: string) => {
  return deleteData<BareResponse>("/invite", { reference });
};

export const getSingleInviteFn = (reference: string) => {
  return getData<SingleInvite>("/invite/single", { reference }, false);
};

export const suspendMemberFn = ({
  id,
  status,
}: {
  id: string;
  status: "SUSPENDED" | "ENABLED";
}) => {
  return patchData<BareResponse>("/merchant/team", { userId: id, status });
};
