---
type: Metric
title: Retainer Multiplier
description: Commission on retainer deals decays over the retainer's lifetime.
tags: [commission, retainer]
timestamp: 2026-07-13T00:00:00Z
---

# Definition

Retainer deals ([deals.is_retainer](/tables/deals.md) = `true`) apply a multiplier to their tiered commission, based on how long the retainer has been running.

# Table

| `retainer_month` | Multiplier |
|---|---|
| 1 | 100% |
| 2 | 50% |
| 3 | 50% |
| 4+ | 0% |

Project deals (`is_retainer = false`) always use multiplier = 100%.

# Formula

```text
deal_commission = tiered_commission_for_this_deal * retainer_multiplier
```

# Citations

* `src/lib/commission.ts` → `calculateRetainerMultiplier`, `calculateDealCommission`.
