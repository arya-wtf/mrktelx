---
type: Workflow
title: Deal Submission
description: How a marketer submits a new deal for admin review.
tags: [deals, marketer, workflow]
timestamp: 2026-07-13T00:00:00Z
---

# Actor

[Marketer](/roles/marketer.md).

# Steps

1. Open the dashboard and click **Submit Deal**.
2. Fill out the deal form: name, date deal, date payment, estimated done date, amount paid, platform fee.
3. Toggle **Retainer** on/off; if on, pick the retainer month.
4. Submit. The deal is inserted into [deals](/tables/deals.md) with `status = 'pending'` and `user_id = auth.uid()`.
5. Deal shows up in the marketer's "Deals This Month" table with a **Pending** badge but is **not** counted in revenue or commission until an admin approves it.
6. Admin picks it up in the [approval workflow](/workflows/deal-approval.md).

# Status transitions

```text
(none) ── submit ──▶ pending
```

# Citations

* `src/components/DealForm.tsx`.
* `src/hooks/useDeals.ts` → `useAddDeal`.
