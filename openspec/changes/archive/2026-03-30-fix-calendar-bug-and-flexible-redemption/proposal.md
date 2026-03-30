## Why

Two issues need addressing:
1. **Calendar navigation bug**: Clicking on a date (e.g., 29th) opens the wrong day (e.g., 3/28), causing confusion when viewing daily records
2. **Limited redemption options**: Children can only redeem 50 points for ¥10, preventing flexible exchanges like 10→¥2 or 25→¥5 based on the standard 5:1 ratio

## What Changes

### Bug Fix
- Fix calendar date routing to open the correct day when clicking a calendar cell
- Ensure date params match the clicked date exactly

### Feature: Flexible Redemption System
- Replace single fixed redemption rule (50→¥10) with flexible 5:1 ratio redemption
- Allow children to redeem any valid amount that meets the 5:1 ratio
- Add validation for minimum redemption amounts
- Support multiple redemption amounts (e.g., 5→¥1, 10→¥2, 25→¥5, 50→¥10, 100→¥20)

## Capabilities

### New Capabilities
- `flexible-redemption`: Dynamic score-to-money redemption system allowing any amount at 5:1 ratio, replacing fixed redemption rules

### Modified Capabilities
- `calendar-navigation`: Fix date offset bug in calendar cell click handlers

## Impact

**Affected Components**:
- `src/components/calendar/` - Calendar day cells and date routing
- `src/pages/` - Child calendar and day detail pages
- `src/components/rules/` - Rules management (may need redemption-specific handling)
- `src/services/` - Potential new redemption service or records update
- Database: May need schema changes for redemption transactions if tracked separately

**User Experience**:
- Parents: Can configure redemption options (optional)
- Children: More flexibility to redeem points at various amounts
- Both: Calendar navigation works correctly
