# CampusTrade Production Readiness Checklist

## 1) Core Inventory and Order Safety

- [ ] Product schema includes `availableCopies` with non-negative validation.
- [ ] Product APIs return `availableCopies`, `reservedCopies`, `purchasableCopies`, and `stockStatus`.
- [ ] `stockStatus` is computed as:
	- `sold_out` when `isSold === true` or `availableCopies <= 0`
	- `reserved` when `purchasableCopies <= 0` but item is not sold out
	- `available` otherwise
- [ ] Cart add/update blocks quantity above real-time `purchasableCopies`.
- [ ] Online/offline order creation blocks overselling against active reservations.
- [ ] Order completion decrements `availableCopies` correctly.
- [ ] Manual mark-sold action sets `availableCopies = 0`.

## 2) Frontend UX Consistency

- [ ] Marketplace cards display exact status states: `Available`, `Reserved/Taken`, `Sold Out`.
- [ ] Product details page shows available/reserved counts and status chip.
- [ ] Seller listings display availability clearly and hide `Mark as Sold` when reserved.
- [ ] Buttons are disabled for reserved/sold-out items.
- [ ] Search/category filtering still works with new stock fields.

## 3) Payment + Offline Flow Correctness

- [ ] Online `pending` orders reserve copies.
- [ ] Offline `placed/accepted/scheduled` reserve copies.
- [ ] Offline `completed` decrements stock.
- [ ] Cancelled flows release reservations (by no longer matching active-reservation filter).
- [ ] Duplicate payment verification cannot decrement stock multiple times.

## 4) Security and Operational Controls

- [ ] Rate limiting enabled on API routes.
- [ ] Input sanitization and request validation enabled.
- [ ] CORS restricted to allowed frontend origin(s).
- [ ] Secrets are not committed and are rotated if exposed.
- [ ] Upload size/type restrictions are enforced.

## 5) Manual Go-Live Validation

- [ ] Create listing with `availableCopies = 1`.
- [ ] Buyer A places order; listing becomes `Reserved/Taken`.
- [ ] Buyer B cannot add/order same listing while reserved.
- [ ] Completing order transitions listing to `Sold Out`.
- [ ] Multi-copy listing decrements step-by-step until sold out.

## 6) E2E Automation Baseline

- [ ] `client/tests/stock-status.spec.js` passes.
- [ ] `client/tests/auth-flow.spec.js` passes.
- [ ] CI or release checklist requires E2E pass before deploy.

## 7) Post-Launch Monitoring

- [ ] Track API errors for cart/order/payment endpoints.
- [ ] Alert on spikes in `400` oversell-block responses.
- [ ] Monitor checkout conversion and reservation drop-off.
- [ ] Add daily report of products stuck in `reserved` for long durations.
