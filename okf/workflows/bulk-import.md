---
type: Workflow
title: Bulk Deal Import
description: Admin uploads a CSV to create many approved deals at once for a chosen marketer.
tags: [deals, admin, csv, import]
timestamp: 2026-07-13T00:00:00Z
---

# Actor

[Admin](/roles/admin.md) only.

# Steps

1. Dashboard → **Bulk Import**.
2. Choose the target marketer from the dropdown.
3. Upload a CSV. The template is available at `public/sample-deals.csv`.
4. Preview parsed rows. Fix source data and re-upload if numbers or dates look wrong.
5. Confirm import. All rows are inserted as `approved` deals owned by the selected marketer.

# CSV format

* Delimiter: comma **or** semicolon (auto-detected).
* Date format: `DD/MM/YY` (European).
* Number format: dot as thousands separator, comma as decimal (European) — e.g. `1.250,50` = 1250.50.
* Columns: `name`, `date_deal`, `date_payment`, `estimate_date_done`, `amount_paid`, `platform_fee`, `is_retainer`, `retainer_month`.

# Citations

* `src/components/BulkDealImport.tsx`.
* `public/sample-deals.csv`.
