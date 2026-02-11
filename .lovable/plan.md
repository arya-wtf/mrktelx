

# Deal Approval Workflow

## Overview
Currently, only admins can add deals. This plan introduces a workflow where marketers can submit their own deals, and admins can approve, reject, or revise them before they count toward commissions.

## How It Will Work

1. **Marketers** will see an "Add Deal" button on their dashboard to submit deals
2. New deals start with a **"pending"** status
3. **Admins** see a list of pending deals and can:
   - **Approve** -- the deal becomes active and counts toward commissions
   - **Reject** -- the deal is marked as rejected with an optional reason
   - **Revise** -- the admin can edit the deal details (amounts, dates, etc.) and then approve it
4. Only **approved** deals are included in revenue/commission calculations
5. Marketers can see the status of their submitted deals (pending, approved, rejected)

## What Changes

### Database
- Add a `status` column to the `deals` table with values: `pending`, `approved`, `rejected` (default: `pending`)
- Add an `admin_notes` column for rejection reasons or revision notes
- Add a `reviewed_at` timestamp and `reviewed_by` UUID to track who reviewed the deal
- Update existing deals to `approved` status so nothing breaks

### RLS Policy Updates
- Marketers can INSERT deals (currently only admins can via the restrictive policy -- need to allow marketers to insert their own)
- Marketers can view their own deals (already works)
- Only admins can UPDATE the `status` field (approve/reject/revise)

### Dashboard Changes
- **Marketer view**: Show "Add Deal" button, display deal status badges (pending/approved/rejected)
- **Admin view**: Add a "Pending Approvals" section/tab showing deals awaiting review, with approve/reject/revise actions
- **Commission calculations**: Filter to only include `approved` deals

### Files to Create/Modify
- **Migration**: Add `status`, `admin_notes`, `reviewed_at`, `reviewed_by` columns; update RLS policies
- `src/hooks/useDeals.ts` -- Add hooks for approving/rejecting deals; update queries to handle status
- `src/components/DealForm.tsx` -- Allow marketers to use it (remove admin-only restrictions for submission)
- `src/components/DealsTable.tsx` -- Show status badges; add approve/reject/revise actions for admin
- `src/components/Dashboard.tsx` -- Show "Add Deal" for marketers; add pending approvals section for admin
- `src/components/PendingApprovals.tsx` -- New component for admin to review pending deals
- `src/lib/commission.ts` -- No changes needed (filtering happens at the data level)

## Technical Details

### New Database Migration
```sql
-- Create enum for deal status
CREATE TYPE public.deal_status AS ENUM ('pending', 'approved', 'rejected');

-- Add columns to deals table
ALTER TABLE public.deals 
  ADD COLUMN status public.deal_status NOT NULL DEFAULT 'pending',
  ADD COLUMN admin_notes text,
  ADD COLUMN reviewed_at timestamptz,
  ADD COLUMN reviewed_by uuid;

-- Set all existing deals as approved
UPDATE public.deals SET status = 'approved';

-- Update RLS: allow marketers to insert their own deals
-- (The existing "Users can create their own deals" policy already allows this,
-- but we need to verify it works with the new status defaulting to 'pending')
```

### Status Flow
```
Marketer submits deal --> status = "pending"
         |
    Admin reviews
    /      |       \
Approve  Reject   Revise (edit + approve)
   |       |         |
"approved" "rejected" "approved" (with updated values)
```

### Commission Filtering
All commission/revenue calculations will filter deals by `status = 'approved'` so pending and rejected deals do not affect numbers.

