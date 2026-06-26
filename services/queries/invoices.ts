import {
  BareResponse,
  CreateCustomer,
  CreateInvoiceDTO,
  CustomerDetails,
  Customers,
  DownloadInvoiceResponse,
  DownloadInvoiceTemplateResponse,
  InvoiceDetails,
  Invoices,
  UpdateCustomer,
  UpdateInvoice,
} from "@/types";
import { deleteData, getData, patchData, postData } from "..";

export const createCustomerFn = (payload: CreateCustomer) => {
  return postData("/customer", payload);
};

export const getCustomersFn = () => {
  return getData<Customers>("/customer");
};

export const updateCustomerFn = (payload: UpdateCustomer) => {
  return patchData<BareResponse>("/customer", payload);
};

export const getCustomerDetailsFn = (id: string) => {
  return getData<CustomerDetails>("/customer", { id });
};

export const deleteCustomerFn = (id: string) => {
  return deleteData<BareResponse>("/customer", { id });
};

export const createInvoiceFn = (payload: CreateInvoiceDTO) => {
  return postData("/invoice", payload);
};

export const updateInvoiceFn = (payload: UpdateInvoice) => {
  return patchData<BareResponse>("/invoice", payload);
};

export const getInvoicesFn = ({
  page,
  size,
  invoiceNumber,
  startDate,
  endDate,
  status,
}: {
  page: number;
  size: number;
  invoiceNumber?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}) => {
  const params: Record<string, any> = { page, size };
  if (invoiceNumber) params.invoiceNumber = invoiceNumber;
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (status) params.status = status;
  return getData<Invoices>("/invoice", params);
};

export const getSingleInvoiceFn = (id: string) => {
  return getData<InvoiceDetails>("/invoice/single", { id });
};

export const deleteInvoiceFn = (id: string) => {
  return deleteData<BareResponse>("/invoice", { id });
};

export const downloadInvoiceFn = (id: string) => {
  return getData<DownloadInvoiceResponse>("/invoice/download", { id });
};

export const downloadInvoiceTemplateFn = () => {
  return getData<DownloadInvoiceTemplateResponse>("/invoice/template");
};

export const uploadInvoiceFn = (payload: FormData) => {
  return postData<BareResponse>("/invoice/upload", payload as any, true, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
