import { BareResponse, Taxes } from "@/types";
import { deleteData, getData, postData } from "..";

export const getTaxesFn = ({
  page,
  size,
}: {
  page: number;
  size: number;
}) => {
  return getData<Taxes>("/tax", { page, size });
};

export const createTaxFn = ({
  rate,
  name,
}: {
  rate: number;
  name: string;
}) => {
  return postData<BareResponse>("/tax", { rate, name });
};

export const deleteTaxFn = (id: string) => {
  return deleteData<BareResponse>("/tax", { id });
};
