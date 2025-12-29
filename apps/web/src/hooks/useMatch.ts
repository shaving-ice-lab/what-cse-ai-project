import { useQuery } from '@tanstack/react-query'
import { matchApi } from '@/services/api/match'

export function useMatchResults(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: ['match-results', page, pageSize],
    queryFn: () => matchApi.getMatchResults(page, pageSize),
  })
}

export function useMatchReport() {
  return useQuery({
    queryKey: ['match-report'],
    queryFn: () => matchApi.getMatchReport(),
  })
}

export function usePositionMatch(positionId: number) {
  return useQuery({
    queryKey: ['position-match', positionId],
    queryFn: () => matchApi.getPositionMatch(positionId),
    enabled: !!positionId,
  })
}
