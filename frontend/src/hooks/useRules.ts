import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchActiveRules,
  fetchAllRules,
  createRule,
  updateRule,
  toggleRuleActive,
  deleteRule,
} from '../services/rules'

export function useRules() {
  return useQuery({
    queryKey: ['rules'],
    queryFn: fetchActiveRules,
  })
}

export function useAllRules() {
  return useQuery({
    queryKey: ['rules', 'all'],
    queryFn: fetchAllRules,
  })
}

export function useCreateRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ name, score }: { name: string; score: number }) => createRule(name, score),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['rules'] })
    },
  })
}

export function useUpdateRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name, score }: { id: string; name: string; score: number }) =>
      updateRule(id, name, score),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['rules'] })
    },
  })
}

export function useToggleRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleRuleActive(id, isActive),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['rules'] })
    },
  })
}

export function useDeleteRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteRule(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['rules'] })
    },
  })
}
