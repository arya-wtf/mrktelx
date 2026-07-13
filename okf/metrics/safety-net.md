---
type: Metric
title: Safety-Net Alert
description: Monthly performance banner classifying each month as Very Urgent, Urgent, or Safe.
tags: [alerts, performance]
timestamp: 2026-07-13T00:00:00Z
---

# Definition

For the currently selected month on the dashboard, sum approved net revenue and classify:

| Zone | Monthly net revenue | Meaning |
|---|---|---|
| Very Urgent (red) | `< $1,500` | Below Tier 2 threshold — no commission earned. |
| Urgent (yellow) | `$1,500 – $3,000` | In Tier 2 but not yet at Tier 3. |
| Safe (green) | `> $3,000` | Tier 3 territory. |

# Scope

The alert is **per selected month**, not per quarter. It uses the same month navigation as the rest of the dashboard.

# Citations

* `src/components/SafetyNetAlert.tsx`.
