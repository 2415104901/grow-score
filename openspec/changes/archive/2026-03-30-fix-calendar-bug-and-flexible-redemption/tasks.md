## 1. Calendar Bug Fix

- [x] 1.1 Add `format` import from `date-fns` to `MonthCalendar.tsx`
- [x] 1.2 Replace `toISOString().slice(0, 10)` with `format(day, 'yyyy-MM-dd')` in `MonthCalendar.tsx:47`
- [x] 1.3 Replace `toISOString().slice(0, 10)` with `format(day, 'yyyy-MM-dd')` in `DayCell.tsx:13`
- [x] 1.4 Add `format` import from `date-fns` to `DayCell.tsx`
- [x] 1.5 Test calendar navigation in different timezones (UTC+8, UTC-5)
- [x] 1.6 Verify clicking any date (including Feb 29 in leap years) opens correct day

## 2. Redemption Data Layer

- [x] 2.1 Create `useRedemption` hook in `hooks/useRedemption.ts`
- [x] 2.2 Implement `validateRedemptionAmount()` function (multiple of 5, min 5)
- [x] 2.3 Implement `validateSufficientBalance()` function
- [x] 2.4 Add `redeemPoints()` mutation using existing `insertRecords` service

## 3. Redemption UI Components

- [x] 3.1 Create `RedemptionPanel` component in `components/records/RedemptionPanel.tsx`
- [x] 3.2 Add preset buttons (5→¥1, 10→¥2, 25→¥5, 50→¥10, 100→¥20)
- [x] 3.3 Add custom amount input field with validation
- [x] 3.4 Display calculated money amount (points ÷ 5)
- [x] 3.5 Add error messages for invalid amounts and insufficient balance
- [x] 3.6 Add confirm/cancel buttons with loading state
- [x] 3.7 Style panel consistently with `QuickScorePanel`

## 4. Redemption Integration

- [x] 4.1 Add "兑换积分" (Redeem Points) button to `DayDetailPage.tsx`
- [x] 4.2 Add state management for panel open/close in `DayDetailPage`
- [x] 4.3 Fetch child's current balance for validation
- [x] 4.4 Wire up redemption submission with record refresh
- [x] 4.5 Test redemption creates negative score record with "兑换 ¥X" name

## 5. Testing & Edge Cases

- [x] 5.1 Test redemption with amounts: 5, 10, 25, 50, 100 points
- [x] 5.2 Test validation: 0, 3, 12 points (should fail)
- [x] 5.3 Test insufficient balance scenario
- [x] 5.4 Test leap year calendar (Feb 29 displays correctly)
- [x] 5.5 Test month boundaries (31-day months, Feb)
- [x] 5.6 Test redemption in both parent and child views (if applicable)

## 6. Cleanup

- [ ] 6.1 Remove or archive old fixed redemption rules (50→¥10) from database (manual DB operation)
- [x] 6.2 Update documentation or help text about new redemption system (inline comments added)
- [x] 6.3 Increment version in `version.ts` and commit with `[AI Generated]` prefix
