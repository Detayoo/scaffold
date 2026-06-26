import { BareResponse, Collections, ConfigureCollectionOptions } from "@/types";
import { getData, postData } from "..";

export const getCollectionsFn = () => {
  return getData<Collections>("/collection-options");
};

export const configureCollectionOptionsFn = (
  payload: ConfigureCollectionOptions
) => {
  return postData<BareResponse>("/collection-options", payload);
};
