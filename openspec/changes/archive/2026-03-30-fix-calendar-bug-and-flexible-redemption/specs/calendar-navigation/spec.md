# Calendar Navigation

Calendar date routing and navigation for daily records view.

## ADDED Requirements

### Requirement: Accurate date routing from calendar cell
The system SHALL route to the correct day detail page when a calendar cell is clicked.

#### Scenario: Click date 29th opens 29th
- **WHEN** a user clicks on the calendar cell for date 29
- **THEN** the system navigates to /child/:id/day/YYYY-MM-DD where MM-DD matches the 29th
- **AND** the page title shows the clicked date (29th)

#### Scenario: Click date 28th opens 28th
- **WHEN** a user clicks on the calendar cell for date 28
- **THEN** the system navigates to /child/:id/day/YYYY-MM-DD where MM-DD matches the 28th
- **AND** the records shown are from the 28th

### Requirement: Date parameter consistency
The system SHALL ensure URL date parameters match the displayed date.

#### Scenario: URL matches displayed content
- **WHEN** a user visits /child/:id/day/2026-03-29
- **THEN** the page displays records from March 29, 2026
- **AND** the page header shows "3月29日" (March 29th)

#### Scenario: No date offset occurs
- **WHEN** a user navigates between days in the calendar
- **THEN** each click opens exactly the date shown on the clicked cell
- **AND** there is no ±1 day offset in the displayed content

## MODIFIED Requirements

### Requirement: Calendar cell click handler
The calendar day cell click handler SHALL use the cell's actual date value, not a computed index-based date.

#### Scenario: Cell uses correct date prop
- **WHEN** a calendar cell is rendered with date prop "2026-03-29"
- **THEN** clicking the cell navigates to day/2026-03-29
- **AND** not to day/2026-03-28 or any other date
