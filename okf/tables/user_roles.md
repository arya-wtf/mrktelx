---
type: Table
title: user_roles
description: Role assignment per user; the sole source of truth for authorization.
resource: supabase://public.user_roles
tags: [auth, roles, security]
timestamp: 2026-07-13T00:00:00Z
---

# Schema

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key. |
| `user_id` | uuid | FK → `auth.users.id`. Unique together with `role`. |
| `role` | enum `app_role` | `admin` or `marketer`. |
| `created_at` | timestamptz | Row insert time. |

# Enums

* `app_role` = `'admin' | 'marketer'`.
* `deal_status` = `'pending' | 'approved' | 'rejected'` (lives on [deals](/tables/deals.md)).

# Security-definer functions

* `has_role(_user_id uuid, _role app_role) → boolean` — used by every table's RLS to check admin access without recursion.
* `has_any_admin() → boolean` — true if at least one admin exists; drives the [first-admin setup](/roles/first-admin-setup.md).
* `promote_to_first_admin(_user_id uuid) → boolean` — atomically promotes a user to admin **only when** no admins exist yet.
* `get_user_role(_user_id uuid) → app_role`.

# Do not

Never store roles on `profiles` or on any user-facing table — it opens a privilege-escalation path.

# Citations

* `src/integrations/supabase/types.ts`.
* `src/hooks/useUserRole.ts`.
