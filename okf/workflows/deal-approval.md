---
type: Workflow
title: Deal Approval
description: How an admin approves, rejects, or revises a pending deal.
tags: [deals, admin, approval, workflow]
timestamp: 2026-07-13T00:00:00Z
---

# Actor

[Admin](/roles/admin.md).

# Where

Dashboard → **Approvals** tab. The Approvals tab is the **only** place status transitions happen — the Edit ✏️ button in the Monthly tab only edits deal fields.

# Steps

1. Open the **Approvals** tab. Every deal with `status = 'pending'` is listed.
2. Choose one action per deal:
   * **Approve** — sets `status = 'approved'`, stamps `reviewed_at` and `reviewed_by`.
   * **Reject** — requires `admin_notes`; sets `status = 'rejected'` with the same review stamps.
   * **Revise & Approve** — edit any deal fields inline, then approve; both updates and the status change happen in one call.
3. Approved deals immediately start counting toward monthly revenue, [tiered commission](/metrics/tiered-commission.md), charts, and the [safety-net](/metrics/safety-net.md) banner.

# Status transitions

```text
pending ── approve ──▶ approved
pending ── reject  ──▶ rejected
approved ── revert (playbook) ──▶ pending   (see playbooks/revert-approved-deal.md)
```

# Admin-created deals

When an admin submits a deal via **Add Deal**, it is inserted directly as `approved` — no review needed.

# Citations

* `src/components/PendingApprovals.tsx`.
* `src/hooks/useDeals.ts` → `useApproveDeal`, `useRejectDeal`, `usePendingDeals`.
