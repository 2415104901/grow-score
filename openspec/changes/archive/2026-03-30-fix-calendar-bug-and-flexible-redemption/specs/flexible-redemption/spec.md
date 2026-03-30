# Flexible Redemption System

Dynamic score-to-money redemption allowing any amount at 5:1 ratio.

## ADDED Requirements

### Requirement: Custom redemption amount input
The system SHALL allow users to input any redemption amount that adheres to the 5:1 ratio (5 points = ¥1).

#### Scenario: Valid redemption amount
- **WHEN** a user enters 10 points for redemption
- **THEN** the system calculates ¥2 and shows the redemption preview
- **AND** the redemption can be confirmed

#### Scenario: Invalid redemption amount
- **WHEN** a user enters 12 points for redemption
- **THEN** the system shows an error that amount must be a multiple of 5

#### Scenario: Minimum redemption threshold
- **WHEN** a user enters less than 5 points for redemption
- **THEN** the system shows an error that minimum redemption is 5 points

### Requirement: Redemption balance validation
The system SHALL validate that the child has sufficient points before allowing redemption.

#### Scenario: Sufficient balance
- **WHEN** a child with 50 points requests to redeem 25 points
- **THEN** the redemption proceeds successfully

#### Scenario: Insufficient balance
- **WHEN** a child with 20 points requests to redeem 25 points
- **THEN** the system shows an error that balance is insufficient

### Requirement: Redemption record creation
The system SHALL create a negative score record when redemption is confirmed.

#### Scenario: Successful redemption creates record
- **WHEN** a child redeems 25 points for ¥5
- **THEN** the system creates a record with score: -25
- **AND** the record includes rule_name_snapshot: "兑换 ¥5"
- **AND** the child's balance is reduced by 25 points

### Requirement: Quick redemption presets
The system SHALL provide common redemption preset buttons for convenience.

#### Scenario: Preset redemption options
- **WHEN** a user views the redemption interface
- **THEN** the system shows preset buttons for 5→¥1, 10→¥2, 25→¥5, 50→¥10, 100→¥20
- **AND** clicking a preset auto-fills the amount

## REMOVED Requirements

### Requirement: Fixed redemption rule
**Reason**: Replaced by flexible redemption system allowing custom amounts
**Migration**: Existing fixed redemption rules (50→¥10) will be replaced by the new redemption interface
