---
type: Table
title: deals
description: One row per deal submitted by a marketer; the core revenue record driving all commission math.
resource: supabase://public.deals
tags: [deals, revenue, approval]
timestamp: 2026-07-13T00:00:00Z
---

# Schema

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key. |
| `user_id` | uuid | Marketer the deal is assigned to. FK → [profiles.user_id](/tables/profiles.md). |
| `name` | text | Human-readable deal name. |
| `date_deal` | date | When the deal was closed. |
| `date_payment` | date | Payment date; drives which month a deal belongs to. |
| `estimate_date_done` | date | Estimated completion date for the work. |
| `amount_paid` | numeric | Gross amount paid by the client. |
| `platform_fee` | numeric | Fee taken by the platform / payment processor. |
| `net_revenue` | numeric | Generated column: `amount_paid - platform_fee`. See [net revenue](/metrics/net-revenue.md). |
| `is_retainer` | boolean | `true` = retainer deal (multiplier applies); `false` = one-off project. |
| `retainer_month` | int | 1..N — used only when `is_retainer = true`. See [retainer multiplier](/metrics/retainer-multiplier.md). |
| `status` | enum `deal_status` | `pending` \| `approved` \| `rejected`. Only `approved` deals count toward revenue and commission. |
| `admin_notes` | text | Optional notes left by the admin during review. |
| `reviewed_at` | timestamptz | When the admin reviewed the deal. |
| `reviewed_by` | uuid | Admin who reviewed the deal. |
| `created_at` | timestamptz | Row insert time. |
| `updated_at` | timestamptz | Last update time. |

# Status transitions

```text
                submit
   (none) ─────────────────▶ pending
                                │
                    approve     │     reject
             ┌──────────────────┼──────────────────┐
             ▼                                     ▼
         approved  ◀── revert (playbook) ──▶  rejected
```

Only admins can transition `pending → approved` or `pending → rejected`. Admin-created deals are inserted directly as `approved`.

# RLS

* Marketers can `SELECT` / `INSERT` / `UPDATE` / `DELETE` their own rows (`user_id = auth.uid()`).
* Admins have full access via `has_role(auth.uid(), 'admin')`.
* All policies are `PERMISSIVE` — the two policies are OR-ed together.

# Related

* [Deal submission workflow](/workflows/deal-submission.md)
* [Deal approval workflow](/workflows/deal-approval.md)
* [Bulk import](/workflows/bulk-import.md)

# Citations

* Schema: `src/integrations/supabase/types.ts` (`Database.public.Tables.deals`).
* Hooks: `src/hooks/useDeals.ts`.
