import { useQuery } from "@tanstack/react-query";
import { getCustomersFn } from "@/services/queries/invoices";

export function useCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: getCustomersFn,
  });
}
