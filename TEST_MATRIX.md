# CampusTrade Test Matrix

## Scope

Focus: inventory copies, reservation handling, sold-out behavior, and auth shell flows.

## A) Product and Listing Tests

| ID | Area | Scenario | Expected Result |
|---|---|---|---|
| P-01 | Create listing | Seller sets `availableCopies = 5` | Product saved with copies = 5 |
| P-02 | Edit listing | Seller updates copies from 5 to 2 | Product reflects copies = 2 |
| P-03 | Edit listing | Seller sets copies to 0 | Listing appears `Sold Out` |
| P-04 | Mark sold | Seller marks item as sold | `isSold=true`, copies = 0 |

## B) Reservation Logic Tests

| ID | Area | Scenario | Expected Result |
|---|---|---|---|
| R-01 | Online reserve | Pending online order for quantity 1 | `reservedCopies` increments by 1 |
| R-02 | Offline reserve | Offline status `placed` | Reservation counted |
| R-03 | Offline reserve | Offline status `accepted/scheduled` | Reservation counted |
| R-04 | Offline finalized | Offline status `completed` | Copies decremented |
| R-05 | Reserved UI | `purchasableCopies = 0`, not sold | UI shows `Reserved/Taken` |
| R-06 | Sold-out UI | `availableCopies = 0` or `isSold=true` | UI shows `Sold Out` |

## C) Cart and Checkout Guard Tests

| ID | Area | Scenario | Expected Result |
|---|---|---|---|
| C-01 | Add to cart | Request qty > purchasable | API blocks with 400 |
| C-02 | Add to cart | Own product | API blocks with 400 |
| C-03 | Online checkout | One item becomes reserved before payment | API blocks oversell |
| C-04 | Offline checkout | One item becomes reserved before order creation | API blocks oversell |

## D) End-to-End UI Automation

| ID | File | Scenario | Expected Result |
|---|---|---|---|
| E2E-01 | `client/tests/stock-status.spec.js` | Marketplace statuses | Available / Reserved / Sold Out shown correctly |
| E2E-02 | `client/tests/stock-status.spec.js` | Product details reserved item | Reserved state + copy counts shown; action disabled |
| E2E-03 | `client/tests/auth-flow.spec.js` | Register success shell | Verification message rendered |
| E2E-04 | `client/tests/auth-flow.spec.js` | Login shell | Login request issued and navigation intent validated |

## E) Regression Checklist (Quick)

- [ ] Marketplace loads and filtering works.
- [ ] Product details opens and status chip is correct.
- [ ] Seller listings show stock labels correctly.
- [ ] Cart add/remove still works for available products.
- [ ] Payment + offline order flow unaffected for valid purchases.
