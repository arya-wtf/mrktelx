---
type: Role
title: First-Admin Bootstrap
description: How the very first admin is promoted on a fresh workspace.
tags: [role, admin, bootstrap]
timestamp: 2026-07-13T00:00:00Z
---

# Trigger

`has_any_admin()` returns `false` (no rows in [user_roles](/tables/user_roles.md) with `role = 'admin'`).

# Steps

1. First user signs up. A trigger inserts a `profiles` row and a `user_roles` row with `role = 'marketer'`.
2. On login, `FirstAdminSetup` modal appears because `has_any_admin()` is false.
3. User clicks **Become Admin**.
4. Client calls the `promote_to_first_admin(_user_id)` RPC.
5. The RPC atomically re-checks `has_any_admin()` and, only if still false, updates the caller's `user_roles.role` to `admin`. Returns `true` on success, `false` if someone beat them to it.

# Safety

The RPC is `SECURITY DEFINER` and validates "no admins yet" inside the function so a race condition cannot produce two accidental admins.

# Citations

* `src/components/FirstAdminSetup.tsx`.
* `src/hooks/useUserRole.ts` → `useHasAnyAdmin`, `usePromoteToFirstAdmin`.
