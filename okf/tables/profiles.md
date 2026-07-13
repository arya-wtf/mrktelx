---
type: Table
title: profiles
description: Public profile row for each authenticated user, mirroring email from auth.users.
resource: supabase://public.profiles
tags: [users, profiles]
timestamp: 2026-07-13T00:00:00Z
---

# Schema

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key. |
| `user_id` | uuid | FK → `auth.users.id`; unique per user. |
| `email` | text | User's email, populated on sign-up by a database trigger. |
| `created_at` | timestamptz | Row insert time. |

# Notes

* A `handle_new_user` trigger on `auth.users` inserts one row here on sign-up.
* [deals.user_id](/tables/deals.md) has a foreign key to `profiles.user_id` with `ON DELETE CASCADE`.
* Do not store roles here; roles live in [user_roles](/tables/user_roles.md).

# Citations

* `src/integrations/supabase/types.ts`.
