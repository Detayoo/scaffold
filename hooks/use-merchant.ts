import { useQuery } from "@tanstack/react-query";
import { getMerchantProfileFn } from "@/services/queries/settings";

export function useMerchant() {
  return useQuery({
    queryKey: ["merchant"],
    queryFn: getMerchantProfileFn,
  });
}
