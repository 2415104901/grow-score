import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchChildrenWithScores, createChild, hideChild } from '../services/children'

export function useChildren() {
  return useQuery({
    queryKey: ['children'],
    queryFn: fetchChildrenWithScores,
  })
}

export function useCreateChild() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => createChild(name),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['children'] })
    },
  })
}

export function useHideChild() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => hideChild(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['children'] })
    },
  })
}
