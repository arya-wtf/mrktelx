---
type: Role
title: Admin
description: Full-access role (typically the CEO) that manages users, deals, and corrections.
tags: [role, admin, security]
timestamp: 2026-07-13T00:00:00Z
---

# Capabilities

* View, create, update, delete **any** deal (RLS via `has_role(auth.uid(), 'admin')`).
* Approve, reject, or revise pending deals in the [approval workflow](/workflows/deal-approval.md).
* Assign deals to any marketer at creation time.
* Run [bulk imports](/workflows/bulk-import.md).
* Add [corrections](/tables/corrections.md) (clawbacks).
* Manage users and change other users' roles via the Users tab.
* See every marketer's revenue, tier, and commission in the dashboard, charts, and monthly summary.

# Cannot

* No admin can demote themselves to marketer if they are the last admin (must be enforced at policy level).
* Roles are never edited from the `profiles` table — only via [user_roles](/tables/user_roles.md).

# Storage

Role assignment lives in [user_roles](/tables/user_roles.md) with `role = 'admin'`.

# Citations

* `src/hooks/useUserRole.ts`.
* `src/components/UserManagement.tsx`.
