

# Revert 4 February 2026 Deals to Pending

## What will happen
Update these 4 deals from `approved` back to `pending`, clearing their review metadata:

| Deal | Payment Date |
|------|-------------|
| Cart-Sync Project Final | Feb 3, 2026 |
| Cart-Sync Project Final (1/2) | Feb 26, 2026 |
| Cart-Sync Project Final (2/2) | Feb 3, 2026 |
| Cichon Med - Habil Final | Feb 10, 2026 |

## Technical detail
A single SQL UPDATE setting `status = 'pending'`, `reviewed_at = NULL`, `reviewed_by = NULL` for the 4 deal IDs. This uses the data insert tool (not a migration, since it's a data change).

