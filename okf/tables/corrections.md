---
type: Table
title: corrections
description: Clawback and adjustment log; entries reduce gross commission for the marketer.
resource: supabase://public.corrections
tags: [commission, clawback, corrections]
timestamp: 2026-07-13T00:00:00Z
---

# Schema

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key. |
| `user_id` | uuid | Marketer the correction applies to. |
| `deal_id` | uuid \| null | Optional FK → [deals.id](/tables/deals.md) if the correction is tied to a specific deal. |
| `deal_name` | text | Denormalized deal label for display even if the deal is deleted. |
| `amount` | numeric | Positive dollar amount to subtract from commission. |
| `reason` | text | Free-form justification. |
| `date` | date | Effective date of the correction. |
| `created_at` | timestamptz | Row insert time. |

# Usage

Total clawback for a period = `SUM(corrections.amount)` in that period. Net commission = gross tiered commission − total clawback. See [tiered commission](/metrics/tiered-commission.md).

# RLS

Admin-only writes; marketers can read their own rows.

# Citations

* Schema: `src/integrations/supabase/types.ts`.
* UI: `src/components/CorrectionLog.tsx`.
