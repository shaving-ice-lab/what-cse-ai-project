import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { positionApi } from '@/services/api/position'
import type { PositionListParams } from '@/types'

export function usePositionList(params: PositionListParams) {
  return useQuery({
    queryKey: ['positions', params],
    queryFn: () => positionApi.getList(params),
  })
}

export function usePositionDetail(id: number) {
  return useQuery({
    queryKey: ['position', id],
    queryFn: () => positionApi.getDetail(id),
    enabled: !!id,
  })
}

export function useFavorites(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: ['favorites', page, pageSize],
    queryFn: () => positionApi.getFavorites(page, pageSize),
  })
}

export function useAddFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (positionId: number) => positionApi.addFavorite(positionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (positionId: number) => positionApi.removeFavorite(positionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })
}

export function useComparePositions(ids: number[]) {
  return useQuery({
    queryKey: ['compare', ids],
    queryFn: () => positionApi.compare(ids),
    enabled: ids.length >= 2,
  })
}
