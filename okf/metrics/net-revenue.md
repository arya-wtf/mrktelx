---
type: Metric
title: Net Revenue
description: Per-deal revenue after subtracting the platform fee.
tags: [revenue, deals]
timestamp: 2026-07-13T00:00:00Z
---

# Definition

Net revenue is the money Elux Space actually keeps from a deal, after the platform / payment processor takes its cut.

# Formula

```text
net_revenue = amount_paid − platform_fee
```

Stored as a generated column on [deals.net_revenue](/tables/deals.md).

# Aggregation

* **Monthly net revenue** per marketer = sum of `net_revenue` over all `approved` deals whose `date_payment` falls in that calendar month.
* This monthly number is the input to [tiered commission](/metrics/tiered-commission.md).

# Citations

* `src/lib/commission.ts` → `getMonthlyNetRevenue`.
* `src/hooks/useDeals.ts`.
