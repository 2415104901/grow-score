import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import { fetchDayRecords, fetchMonthlyScores, insertRecords } from '../services/records'
import type { InsertRecordInput } from '../types'

export function useDayRecords(childId: string, date: string) {
  return useQuery({
    queryKey: ['day-records', childId, date],
    queryFn: () => fetchDayRecords(childId, date),
    enabled: Boolean(childId) && Boolean(date),
  })
}

export function useMonthlyScores(childId: string, year: number, month: number) {
  const monthStart = format(startOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd')

  return useQuery({
    queryKey: ['monthly-scores', childId, year, month],
    queryFn: () => fetchMonthlyScores(childId, monthStart, monthEnd),
    enabled: Boolean(childId),
  })
}

export function useInsertRecords(childId: string, date: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (records: InsertRecordInput[]) => insertRecords(records),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['day-records', childId, date] })
      void queryClient.invalidateQueries({ queryKey: ['children'] })
      // 同时刷新当月月度分数缓存
      void queryClient.invalidateQueries({ queryKey: ['monthly-scores', childId] })
    },
  })
}
