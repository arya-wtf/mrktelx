---
type: Overview
title: Elux Space Marketing Tracker
description: A commission tracker where marketers submit deals and admins approve them, with tiered monthly payout logic.
tags: [overview, elux, commission]
timestamp: 2026-07-13T00:00:00Z
---

# What it is

Elux Space is a marketing performance & commission tracker. Marketers submit deals they closed; admins (CEO) review each submission and approve, reject, or revise it. Only approved deals count toward monthly revenue, tier calculation, and commission.

# How the pieces fit

* Deals live in the [deals table](/tables/deals.md) with a status of `pending`, `approved`, or `rejected`.
* Net revenue is computed per deal (see [net revenue](/metrics/net-revenue.md)) and accumulated per month per marketer.
* Monthly accumulated revenue drives the [tiered commission](/metrics/tiered-commission.md); retainer deals additionally apply the [retainer multiplier](/metrics/retainer-multiplier.md).
* Admins are alerted when a marketer's monthly revenue drops into the [safety-net zones](/metrics/safety-net.md).
* Clawbacks are recorded in the [corrections table](/tables/corrections.md) and subtracted from gross commission.

# Roles

* [Admin](/roles/admin.md) — full CRUD, approves deals, manages users.
* [Marketer](/roles/marketer.md) — submits deals, views own performance.
* The very first user promotes themselves via the [first-admin setup](/roles/first-admin-setup.md).
