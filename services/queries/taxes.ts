import { BareResponse, Taxes } from "@/types";
import { v1AuthenticatedApi } from "../api";

export const getTaxesFn = async ({
  page,
  size,
}: {
  page: number;
  size: number;
}) => {
  const { data } = await v1AuthenticatedApi().get<Taxes>("/tax", { params: { page, size } });
  return data;
};

export const createTaxFn = async ({
  rate,
  name,
}: {
  rate: number | string;
  name: string;
}) => {
  const { data } = await v1AuthenticatedApi().post<BareResponse>("/tax", { rate: Number(rate), name });
  return data;
};

export const deleteTaxFn = async (id: string) => {
  const { data } = await v1AuthenticatedApi().delete<BareResponse>("/tax", { data: { id } });
  return data;
};
