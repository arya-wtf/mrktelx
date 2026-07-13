---
type: Playbook
title: Monthly review / close-out
description: End-of-month checklist for the admin before commission is considered final.
tags: [playbook, admin, monthly]
timestamp: 2026-07-13T00:00:00Z
---

# Trigger

End of a calendar month, before communicating final commission numbers to marketers.

# Steps

1. Navigate the dashboard to the target month using the month arrows.
2. **Approvals tab** — clear the queue: every `pending` deal for the month must be approved, rejected, or revised.
3. **Monthly tab** — spot-check the deals table for the month. For any deal with wrong marketer / amount / retainer flag, fix via inline edit (or revert + re-approve if status is wrong; see [revert playbook](/playbooks/revert-approved-deal.md)).
4. Confirm the **Monthly Commission Summary** per marketer:
   * Net revenue matches expectation.
   * Tier is what you expected (see [tiered commission](/metrics/tiered-commission.md)).
   * Retainer deals have the correct `retainer_month` (see [retainer multiplier](/metrics/retainer-multiplier.md)).
5. Add any [corrections](/tables/corrections.md) needed (clawbacks, adjustments).
6. Check the [safety-net](/metrics/safety-net.md) banner per marketer.
7. Communicate final numbers.

# Do not

* Do not use the Edit ✏️ button in the Monthly tab to change a deal's status — status changes only happen in the Approvals tab or via a database revert.
