import { deleteData, getData, patchData, postData } from "..";
import {
  BareResponse,
  InitiateRefundResponse,
  RefundDetails,
  Refunds,
} from "@/types";

export const initiateRefundFn = (payload: InitiateRefundResponse) => {
  return postData<BareResponse>("/transaction/refund", payload);
};

export const getRefundsFn = ({
  page,
  size,
  merchantId,
  reference,
}: {
  page: number;
  size: number;
  merchantId?: string;
  reference?: string;
}) => {
  const params: Record<string, any> = { page, size };
  if (reference) params.reference = reference;
  if (merchantId) params.merchantId = merchantId;
  return getData<Refunds>("/transaction/refund", params);
};

export const approveRefundFn = ({ id }: { id: string }) => {
  return patchData<BareResponse>("/transaction/refund", { id });
};

export const deleteRefundRequestFn = ({ id }: { id: string }) => {
  return deleteData<BareResponse>("/transaction/refund", { id });
};

export const getRefundDetailsFn = ({ id }: { id: string }) => {
  return getData<RefundDetails>("/transaction/refund/detail", { id });
};

export const getRefundStatusFn = ({ reference }: { reference: string }) => {
  return getData<BareResponse>("/transaction/refund/status", { reference });
};
