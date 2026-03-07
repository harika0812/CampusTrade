# Playwright E2E (Stock Status)

## Install

```bash
npm install
npx playwright install chromium
```

## Run

```bash
npm run e2e
```

```bash
npm run e2e:stock
npm run e2e:auth
```

## What this covers

- Marketplace card status rendering for:
  - `Available`
  - `Reserved/Taken`
  - `Sold Out`
- Product details rendering of:
  - status chip
  - `Available copies`
  - `Reserved copies`

- Auth shell behavior:
  - Register success state message
  - Login request + marketplace navigation

The tests mock API responses, so they validate UI behavior deterministically.
