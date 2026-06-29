import {
  BareResponse,
  CreatePaymentLinkPayload,
  CreatePaymentLinkResponse,
  PaymentLinks,
  PaymentLinksTransaction,
} from "@/types";
import { getData, patchData, postData } from "..";

export const createPaymentLinkFn = (payload: CreatePaymentLinkPayload) => {
  return postData<CreatePaymentLinkResponse>("/paylink", {
    ...payload,
    amount: Number(payload.amount),
  });
};

export const getPaymentLinksFn = ({
  page,
  size,
  status,
  reference,
  isActive,
}: {
  page: number;
  size: number;
  status?: string;
  reference?: string;
  isActive?: any;
}) => {
  const params: Record<string, any> = {};
  if (page) params.page = page;
  if (size) params.size = size;
  if (status) params.status = status;
  if (reference) params.reference = reference;
  if (isActive !== undefined && isActive !== "") params.isActive = isActive;
  return getData<PaymentLinks>("/paylink", params);
};

export const managePaymentLinkFn = (payload: {
  id: string;
  state: string;
}) => {
  return patchData<BareResponse>("/paylink", payload);
};

export const getSinglePaymentLinkFn = ({
  reference,
  forPayment,
  page,
  size,
}: {
  reference?: string;
  forPayment?: boolean;
  page?: number;
  size?: number;
}) => {
  const params: Record<string, any> = {};
  if (reference) params.reference = reference;
  if (forPayment) params.forPayment = forPayment;
  if (page) params.page = page;
  if (size) params.size = size;
  return getData<PaymentLinksTransaction>("/paylink/details", params);
};
