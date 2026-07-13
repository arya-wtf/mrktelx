
# Create an OKF Knowledge Bundle for Elux Space

## What OKF is
Open Knowledge Format (OKF, Google Cloud spec v0.1) is a vendor-neutral format for representing knowledge as a directory of plain markdown files with YAML frontmatter. Each file = one "concept" (a table, a metric, a workflow, a playbook, etc.). No SDK, no server, no schema registry — just markdown checked into the repo.

This plan produces an OKF bundle that documents this app's data model, business rules, workflows, and roles so humans, agents, and LLMs can consume it uniformly.

## Scope
- Read-only documentation task. **No app code, database, or runtime behavior changes.**
- All output lives in a new top-level `okf/` directory.
- Content is hand-authored from what already exists in the codebase (tables in `src/integrations/supabase/types.ts`, commission rules in `src/lib/commission.ts`, workflow in `PendingApprovals` / `useDeals`, roles in `useUserRole`, etc.).

## Bundle layout

```text
okf/
├── index.md                       # Top-level directory listing
├── log.md                         # Chronological change history
├── overview.md                    # Concept: what Elux Space tracker is
├── tables/
│   ├── index.md
│   ├── deals.md                   # Deal schema, statuses, is_retainer
│   ├── corrections.md             # Clawback log
│   ├── profiles.md                # Marketer profiles
│   └── user_roles.md              # admin / marketer enum + has_role()
├── metrics/
│   ├── index.md
│   ├── net-revenue.md             # gross - platform_fee
│   ├── tiered-commission.md       # Tier 1/2/3 thresholds and rates
│   ├── retainer-multiplier.md     # 100% / 50% / 0% by retainer_month
│   └── safety-net.md              # <$1,500 / <$3,000 / ≥$3,000 zones
├── workflows/
│   ├── index.md
│   ├── deal-submission.md         # Marketer submits → pending
│   ├── deal-approval.md           # Approve / Reject / Revise & Approve
│   └── bulk-import.md             # CSV format, EU date/number parsing
├── roles/
│   ├── index.md
│   ├── admin.md
│   ├── marketer.md
│   └── first-admin-setup.md
└── playbooks/
    ├── index.md
    ├── revert-approved-deal.md    # e.g. the Feb 2026 revert we did
    └── monthly-review.md          # How to close a month
```

## Concept file conventions
Every `.md` (except `index.md` / `log.md`) has YAML frontmatter per OKF §4.1:

```yaml
---
type: <Table | Metric | Workflow | Role | Playbook | Overview>
title: <human name>
description: <one-sentence summary>
resource: <optional URI, e.g. supabase table URL or code path>
tags: [commission, deals, ...]
timestamp: 2026-07-13T00:00:00Z
---
```

Bodies use conventional headings from the spec where relevant:
- Tables → `# Schema` (column | type | description), `# Relationships`, `# RLS`, `# Citations` (links to `src/integrations/supabase/types.ts` lines).
- Metrics → `# Definition`, `# Formula`, `# Examples`, `# Citations` (link to `src/lib/commission.ts`).
- Workflows → numbered `# Steps`, `# Status transitions` diagram in fenced text block, `# Citations` (link to `src/hooks/useDeals.ts`, `PendingApprovals.tsx`).
- Playbooks → `# Trigger`, `# Steps`.

Cross-linking uses absolute bundle-relative links per spec §5.1, e.g.
`See the [deals table](/tables/deals.md) and its [approval workflow](/workflows/deal-approval.md).`

## Deliverables checklist
1. `okf/index.md` — grouped listing of every subdirectory with descriptions.
2. `okf/log.md` — single initial entry: "v0.1 bundle authored from codebase snapshot".
3. `okf/overview.md` — one-paragraph description of the app + links into each section.
4. 4 table concepts (`deals`, `corrections`, `profiles`, `user_roles`) with full schemas pulled from `src/integrations/supabase/types.ts`.
5. 4 metric concepts covering net revenue, tiered commission (T1 ≤ $2k @ 20%, T2 ≤ $5k @ 25%, T3 > $5k @ 30% — copied verbatim from `commission.ts`), retainer multiplier, and safety-net zones.
6. 3 workflow concepts (submission, approval, bulk import).
7. 3 role concepts (admin, marketer, first-admin bootstrap via `promote_to_first_admin` RPC).
8. 2 playbook concepts.
9. Every subdirectory has its own `index.md` listing its concepts.

## Out of scope (explicit non-goals)
- No visualizer / viz.html (the spec's viewer is optional; can be added later).
- No agent that regenerates the bundle automatically — this is a hand-authored v0.1.
- No changes to Lovable Cloud, RLS, or any `.ts`/`.tsx` file.
- No exposure of secrets, service role keys, or Supabase dashboard URLs in the bundle.

## Open questions before I build
1. Directory name: `okf/` at repo root — OK, or would you prefer `docs/okf/` or `knowledge/`?
2. Should the bundle include the actual current tier thresholds and dollar values (they're already in client code, so not sensitive), or keep it abstract?
3. Any concepts I should add or drop from the list above (e.g. do you want a concept per marketer, or per major UI screen)?
