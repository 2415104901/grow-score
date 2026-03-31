## Context

### Current State

**Calendar Bug**: Date navigation is broken due to timezone conversion issue in `MonthCalendar.tsx` and `DayCell.tsx`. The code uses `toISOString().slice(0, 10)` which returns UTC date instead of local date.

**Redemption System**: Fixed redemption rule (50 points = ¥10) stored in `rules` table. Children cannot redeem other amounts like 10→¥2 or 25→¥5.

### Root Cause Analysis

**File**: `frontend/src/components/calendar/MonthCalendar.tsx:47`
**File**: `frontend/src/components/calendar/DayCell.tsx:13`

```javascript
const dateStr = day.toISOString().slice(0, 10)  // ❌ Returns UTC date!
```

**Why this fails in UTC+8 (China)**:
1. `new Date(2026, 2, 29)` creates March 29, 2026 **00:00 local time**
2. `toISOString()` converts to UTC: `"2026-03-28T16:00:00.000Z"`
3. `.slice(0, 10)` extracts: `"2026-03-28"` → **Wrong date!**

**Impact**: Every calendar click opens the previous day for users in UTC+X timezones (X > 0).

### Constraints

- Must maintain existing `records` table immutability
- Must work with existing RLS policies (parent/child roles)
- Redemption is implemented as negative score records
- Database uses `date` column (yyyy-MM-dd format, local dates)

---

## Goals / Non-Goals

**Goals:**
- Fix calendar date navigation to use local dates consistently
- Implement flexible 5:1 ratio redemption allowing any valid amount
- Maintain data integrity (no duplicate redemption records)
- Keep redemption as negative score records (no new table)

**Non-Goals:**
- Configurable redemption rates (5:1 is fixed for now)
- Separate redemption transactions table
- Parent approval workflow for redemptions
- Redemption history/undo functionality

---

## Decisions

### 1. Calendar Fix: Use `format()` from date-fns

**Choice**: Replace `toISOString().slice(0, 10)` with `format(day, 'yyyy-MM-dd')`

**Rationale**:
- `format()` respects local timezone
- Already a dependency (date-fns is used in the project)
- Consistent with how dates are displayed elsewhere
- Simpler than manual string construction

**Code change**:
```diff
- const dateStr = day.toISOString().slice(0, 10)
+ const dateStr = format(day, 'yyyy-MM-dd')
```

**Files affected**:
- `MonthCalendar.tsx:47`
- `DayCell.tsx:13`

---

### 2. Redemption UI: Custom Input + Presets

**Choice**: Hybrid approach with custom amount input AND quick preset buttons

**Rationale**:
- Presets (5→¥1, 10→¥2, 25→¥5, 50→¥10, 100→¥20) cover common cases
- Custom input allows flexibility for any 5:1 amount
- Better UX than presets alone or input alone

**Validation rules**:
- Minimum: 5 points (¥1)
- Must be multiple of 5
- Cannot exceed child's current balance

---

### 3. Redemption Implementation: New QuickScorePanel variant

**Choice**: Create `RedemptionPanel` component similar to `QuickScorePanel` but for redemptions

**Rationale**:
- Separates concerns (adding records vs. redeeming)
- Reuses existing patterns from `QuickScorePanel`
- Can be accessed from day detail page or child profile

**API flow**:
```
User confirms redemption
→ Validate amount (multiple of 5, sufficient balance)
→ Create record with score: -amount
→ Rule name: "兑换 ¥{amount/5}"
→ Refresh queries (invalidateQueries)
```

---

### 4. No Database Schema Changes

**Choice**: Implement redemption through existing `records` table with negative scores

**Rationale**:
- `records` is immutable by design (no UPDATE/DELETE)
- Negative scores naturally represent redemption
- No migration needed
- Simple aggregation works for total score

**Record format**:
```javascript
{
  child_id: "xxx",
  rule_id: null,  // or special redemption rule ID
  rule_name_snapshot: "兑换 ¥5",
  score_snapshot: -25,
  date: "2026-03-30",
  created_by: "child_user_id"
}
```

---

## Risks / Trade-offs

### Risk 1: Timezone edge cases
**Risk**: Users near timezone boundaries could still see inconsistencies
**Mitigation**: Use `format()` consistently everywhere for local dates

### Risk 2: Double redemption
**Risk**: User could submit redemption multiple times before state updates
**Mitigation**: Disable button during mutation, use `isPending` state

### Risk 3: Negative balance
**Risk**: Child could redeem more than they have if balance changes concurrently
**Mitigation**: Re-validate balance on server-side before creating record

### Trade-off: No separate redemption tracking
**Trade-off**: Cannot easily distinguish between penalties and redemptions in records
**Acceptance**: Both are negative scores; UI can filter by `rule_name_snapshot` starts with "兑换"

---

## Migration Plan

### Phase 1: Calendar Fix (Low Risk)
1. Update `MonthCalendar.tsx` and `DayCell.tsx` to use `format()`
2. Test in different timezones (UTC+8, UTC-5, etc.)
3. Deploy to production

### Phase 2: Redemption Feature (Medium Risk)
1. Add `RedemptionPanel` component
2. Add redemption button to day detail page
3. Implement validation and submission logic
4. Test with various amounts and edge cases
5. Deploy to production

### Rollback Strategy
- Calendar fix: Revert code changes (no data changes)
- Redemption: Remove redemption button (records remain valid if created)

---

## Open Questions

1. **Should redemption have a separate `rule_id` or use `null`?**
   - **Decision**: Use `null` for now, distinguishes from rule-based records

2. **Should there be a daily redemption limit?**
   - **Decision**: No limit for MVP, monitor usage and add if needed

3. **Should parents be able to disable redemption for a child?**
   - **Decision**: Not in MVP, consider for future iteration
