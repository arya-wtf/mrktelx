---
type: Metric
title: Tiered Commission
description: Monthly-accumulated net revenue is taxed into three tiers, 0% / 8% / 12%.
tags: [commission, tiers]
timestamp: 2026-07-13T00:00:00Z
---

# Definition

Commission is calculated on the marketer's **monthly accumulated net revenue** (not per deal). The tiers act like tax brackets — each portion of revenue is paid at its own rate.

# Tiers

| Tier | Range (monthly net revenue) | Rate |
|---|---|---|
| Tier 1 | $0 – $1,500 | 0% |
| Tier 2 | $1,501 – $3,000 | 8% on the excess above $1,500 |
| Tier 3 | Above $3,000 | 12% on the excess above $3,000 |

# Formula

```text
if net ≤ 1500:  commission = 0
elif net ≤ 3000: commission = (net − 1500) * 0.08
else:            commission = 1500 * 0.08 + (net − 3000) * 0.12
```

# Examples

| Monthly net | Tier reached | Gross commission |
|---|---|---|
| $1,200 | 1 | $0 |
| $2,500 | 2 | $80 |
| $3,000 | 2 | $120 |
| $5,000 | 3 | $120 + $240 = $360 |

# Net commission

```text
net_commission = gross_tiered_commission − sum(corrections.amount)
```

See [corrections table](/tables/corrections.md).

# Retainer interaction

For retainer deals, the per-deal commission is additionally scaled by the [retainer multiplier](/metrics/retainer-multiplier.md).

# Citations

* `src/lib/commission.ts` → `COMMISSION_TIERS`, `calculateTieredCommission`.
