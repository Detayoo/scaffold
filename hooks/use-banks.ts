import { useQuery } from "@tanstack/react-query";
import { v1AuthenticatedApi } from "@/services/api";

export function useBanks() {
  return useQuery({
    queryKey: ["banks"],
    queryFn: async () => {
      const { data } = await v1AuthenticatedApi().get("/banks");
      return data?.data as Array<{ code: string; name: string; country: string; currency: string; type: string }>;
    },
    staleTime: 5 * 60 * 1000,
  });
}
