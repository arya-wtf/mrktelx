---
type: Role
title: Marketer
description: Default role for every new sign-up; submits own deals and views own performance.
tags: [role, marketer]
timestamp: 2026-07-13T00:00:00Z
---

# Capabilities

* [Submit deals](/workflows/deal-submission.md) — created with `status = 'pending'`.
* View own deals (all statuses) with badges showing pending / approved / rejected.
* See own monthly revenue, tier, commission, and safety-net banner.
* Read own `corrections` entries.

# Cannot

* Cannot approve or reject deals (any status).
* Cannot see or edit other marketers' deals or profiles.
* Cannot change any user's role.

# Storage

Assigned automatically on sign-up by a database trigger inserting a row into [user_roles](/tables/user_roles.md) with `role = 'marketer'`.

# Citations

* `src/hooks/useDeals.ts`.
* RLS policies on [deals](/tables/deals.md).
