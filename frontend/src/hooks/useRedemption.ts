import { useMutation, useQueryClient } from '@tanstack/react-query'
import { insertRecords } from '../services/records'
import type { InsertRecordInput } from '../types'

/**
 * Validation result for redemption amount
 */
export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validate that the redemption amount is valid (multiple of 5, minimum 5)
 */
export function validateRedemptionAmount(points: number): ValidationResult {
  if (points < 5) {
    return { valid: false, error: '最少兑换5积分' }
  }
  if (points % 5 !== 0) {
    return { valid: false, error: '兑换金额必须是5的倍数' }
  }
  return { valid: true }
}

/**
 * Validate that the child has sufficient balance
 */
export function validateSufficientBalance(points: number, currentBalance: number): ValidationResult {
  if (points > currentBalance) {
    return { valid: false, error: `积分不足，当前余额：${currentBalance}` }
  }
  return { valid: true }
}

/**
 * Calculate the money amount from points (5:1 ratio)
 */
export function calculateMoneyAmount(points: number): number {
  return points / 5
}

/**
 * Hook for redeeming points
 */
export function useRedemption(childId: string, userId: string, date: string) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (points: number) => {
      const money = calculateMoneyAmount(points)
      const record: InsertRecordInput = {
        child_id: childId,
        rule_id: null, // Redemption doesn't use a rule
        rule_name_snapshot: `兑换 ¥${money}`,
        score_snapshot: -points,
        date, // Use the date from current page context
        created_by: userId, // Current user's auth ID
      }
      console.log('[Redemption] Creating record:', record)
      try {
        const result = await insertRecords([record])
        console.log('[Redemption] Success:', result)
        return result
      } catch (error) {
        console.error('[Redemption] Error:', error)
        console.error('[Redemption] Error details:', {
          name: error instanceof Error ? error.name : 'unknown',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        })
        throw error
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['records', childId] })
      queryClient.invalidateQueries({ queryKey: ['children'] })
    },
  })

  return mutation
}
