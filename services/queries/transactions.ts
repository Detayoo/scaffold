import { BareResponse, TransactionDetails, Transactions } from "@/types";
import { getData } from "..";

export const getTransactionDetailsFn = (id: string) => {
  return getData<TransactionDetails>(`/transaction/details?id=${id}`);
};

export const getTransactionsFn = ({
  page,
  size,
  reference,
  status,
}: {
  page: number;
  size: number;
  reference?: string;
  status?: string;
}) => {
  const params: Record<string, any> = { page, size };
  if (reference) params.reference = reference;
  if (status) params.status = status;
  return getData<Transactions>("/transaction", params);
};

export const exportTransactionsFn = ({
  startDate,
  endDate,
  status,
}: {
  startDate?: string;
  endDate?: string;
  status?: string;
}) => {
  const params: Record<string, any> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (status) params.status = status;
  return getData<BareResponse>("/transaction/export", params);
};
