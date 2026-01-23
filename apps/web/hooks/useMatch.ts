import { useQuery } from "@tanstack/react-query";
import { matchApi, MatchParams } from "@/services/api/match";

export function useMatchResults(page = 1, pageSize = 10) {
  const params: MatchParams = { page, page_size: pageSize };

  return useQuery({
    queryKey: ["match-results", page, pageSize],
    queryFn: () => matchApi.getMatches(params),
  });
}

export function useMatchReport() {
  return useQuery({
    queryKey: ["match-report"],
    queryFn: () => matchApi.getReport(),
  });
}
