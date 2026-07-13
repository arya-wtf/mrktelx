---
type: Playbook
title: Revert an approved deal to pending
description: Undo an accidental approval so the deal reappears in the Approvals tab.
tags: [playbook, admin, deals]
timestamp: 2026-07-13T00:00:00Z
---

# Trigger

Admin approved a deal that should not have been approved (wrong marketer, wrong amount, needs correction before it counts).

# Steps

1. Identify the deal(s): marketer name, deal name, `date_payment`.
2. Ask the Lovable agent (or run in the database) an update that clears the review fields:

   ```sql
   UPDATE public.deals
   SET status = 'pending',
       reviewed_at = NULL,
       reviewed_by = NULL
   WHERE id IN ('<uuid-1>', '<uuid-2>');
   ```

3. Confirm the deals now show in the [Approvals](/workflows/deal-approval.md) tab.
4. Approve, reject, or revise them as normal.

# Notes

* `admin_notes` is intentionally left as-is so the reviewer's earlier comment is preserved.
* Reverting has no effect on already-paid-out commission — reconcile any payout separately in [corrections](/tables/corrections.md) if needed.

# Precedent

On 2026-04-11 four February 2026 deals (Cart-Sync Project Final, its 1/2 and 2/2 halves, and Cichon Med – Habil Final; $1,025 net revenue combined) were reverted this way.
