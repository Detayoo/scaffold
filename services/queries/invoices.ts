import { v1AuthenticatedApi } from "../api";
import type {
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

export const createCustomerFn = async (payload: CreateCustomer) => {
  const { data } = await v1AuthenticatedApi().post("/customer", payload);
  return data;
};

export const getCustomersFn = async () => {
  const { data } = await v1AuthenticatedApi().get<Customers>("/customer");
  return data;
};

export const updateCustomerFn = async (payload: UpdateCustomer) => {
  const { data } = await v1AuthenticatedApi().patch<BareResponse>("/customer", payload);
  return data;
};

export const getCustomerDetailsFn = async (id: string) => {
  const { data } = await v1AuthenticatedApi().get<CustomerDetails>("/customer", { params: { id } });
  return data;
};

export const deleteCustomerFn = async (id: string) => {
  const { data } = await v1AuthenticatedApi().delete<BareResponse>("/customer", { data: { id } });
  return data;
};

export const createInvoiceFn = async (payload: CreateInvoiceDTO) => {
  const { data } = await v1AuthenticatedApi().post("/invoice", payload);
  return data;
};

export const updateInvoiceFn = async (payload: UpdateInvoice) => {
  const { data } = await v1AuthenticatedApi().patch<BareResponse>("/invoice", payload);
  return data;
};

export const getInvoicesFn = async ({
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
  const { data } = await v1AuthenticatedApi().get<Invoices>("/invoice", { params });
  return data;
};

export const getSingleInvoiceFn = async (id: string) => {
  const { data } = await v1AuthenticatedApi().get<InvoiceDetails>("/invoice/single", { params: { id } });
  return data;
};

export const deleteInvoiceFn = async (id: string) => {
  const { data } = await v1AuthenticatedApi().delete<BareResponse>("/invoice", { data: { id } });
  return data;
};

export const downloadInvoiceFn = async (id: string) => {
  const { data } = await v1AuthenticatedApi().get<DownloadInvoiceResponse>("/invoice/download", { params: { id } });
  return data;
};

export const downloadInvoiceTemplateFn = async () => {
  const { data } = await v1AuthenticatedApi().get<DownloadInvoiceTemplateResponse>("/invoice/template");
  return data;
};

export const uploadInvoiceFn = async (payload: FormData) => {
  const { data } = await v1AuthenticatedApi().post<BareResponse>("/invoice/upload", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};
