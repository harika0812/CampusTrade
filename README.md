# CampusTrade

CampusTrade is a campus-exclusive peer-to-peer marketplace built as a full-stack academic mini project. This README is the single source of truth for the project summary, functional requirements, security requirements, test expectations, and production readiness checks.

## Project Summary

The application follows a layered architecture with a React frontend, Node.js and Express backend, and MongoDB database. REST APIs handle core operations, while Socket.io supports real-time chat and notifications.

## Core Scope

- Authentication and user management
- Product listing creation, editing, browsing, and search
- Cart and order processing
- Real-time chat and notifications
- Profile management
- COD-based order flow

## Technology Stack

- Frontend: React, Axios, React Router, Socket.io client
- Backend: Node.js, Express, Socket.io
- Database: MongoDB with Mongoose
- Security: JWT, bcrypt, validation, sanitization, CORS, rate limiting
- Testing: Playwright

## Architecture Requirements

The implementation is organized as a layered system:

1. Frontend UI layer for pages, reusable components, forms, and state updates.
2. API client layer for feature-specific network calls.
3. Backend controller and route layer for business logic and endpoint handling.
4. Middleware layer for authentication, validation, security, and error handling.
5. Database layer for users, products, orders, cart data, chat, and notifications.

## Functional Requirements

### Authentication and User Management

- Users can register, log in, verify email, recover passwords, and reset passwords.
- Passwords must be hashed before storage.
- Sensitive auth routes must be rate limited.
- Auth screens should show inline messages rather than browser alert popups.

### Product and Marketplace

- Sellers can create, edit, and manage listings.
- Buyers can browse, filter, search, and open product details.
- Listings must expose stock state clearly, including available, reserved, and sold out conditions.
- Seller actions must respect stock availability and reservation state.

### Cart and Order Processing

- Cart operations must block quantities above real-time purchasable stock.
- Checkout must prevent overselling against active reservations.
- Order state changes must update stock correctly.
- Current checkout policy is COD-only in the app flow.

### Chat and Notifications

- Users can exchange real-time messages.
- Users can receive live notifications for relevant events.
- Chat and notification delivery must be handled through Socket.io where appropriate.

### Profile and Account Features

- Users can view and update profile data.
- Account actions must stay within the authenticated user scope.

## Inventory and Order Rules

These are the current product and order requirements used by the test matrix and production checklist:

- Product listings must track available copies with non-negative validation.
- Product APIs should return available copies, reserved copies, purchasable copies, and stock status.
- Stock status should resolve to sold out, reserved, or available based on the product state.
- Online pending orders reserve copies.
- Offline placed, accepted, and scheduled orders reserve copies.
- Offline completed orders decrement stock.
- Cancelled flows release reservations by no longer matching the active-reservation logic.
- Manual mark-sold should set stock to zero and mark the product as sold.

## Security Requirements

- JWT-based authentication must protect private routes.
- Passwords must use bcrypt hashing.
- Input validation and sanitization must be applied to auth, product, and chat inputs.
- CORS must be restricted to the approved frontend origin.
- Rate limiting must be enabled for general API, auth, chat, and product creation endpoints.
- Uploads must enforce file size and file type restrictions.
- Secrets must live in environment files and must not be committed.

## Testing Requirements

The baseline test scope covers:

- Auth shell flows for register and login
- Stock status rendering for available, reserved, and sold out products
- Product detail state, including copy counts and disabled actions
- Cart and checkout oversell protection
- Notification delivery paths

Recommended E2E coverage includes:

- `client/tests/auth-flow.spec.js`
- `client/tests/stock-status.spec.js`
- `client/tests/notifications.spec.js`

## Production Readiness Checklist

- Product schema includes available copies with validation.
- Product APIs return stock fields needed by the frontend.
- Cart and checkout flows block overselling.
- Order completion updates inventory correctly.
- Marketplace cards show the exact status states.
- Product details show stock counts and status chips.
- Seller listings clearly show availability.
- Security middleware is enabled and configured.
- Environment variables are set correctly for each deployment target.
- Playwright tests pass before release.

## Setup

1. Clone the repository.
2. Install dependencies in `server/` and `client/`.
3. Copy `.env.example` to `.env` in both folders and update the values.
4. Start the server with `npm run dev` in `server/`.
5. Start the client with `npm start` in `client/`.

## Production Deployment

Recommended production layout:

- Frontend: Vercel
- Backend: Render or Railway
- Database: MongoDB Atlas
- Images: Cloudinary

Production requirements:

- Host the frontend and backend on HTTPS domains.
- Set `CLIENT_URL` on the backend to the deployed frontend origin.
- Set `REACT_APP_SERVER_URL` on the client to the deployed backend origin.
- Configure Cloudinary only in the backend production environment.
- Do not rely on local file-path images in production.

Before production launch, migrate existing local product images to Cloudinary:

```bash
cd server
npm run migrate:product-images
```

This keeps listing images server-hosted, avoids broken local paths, and makes the UI behave consistently across tabs and reloads.

## Repository Layout

- `client/` contains the React application, pages, components, styles, and Playwright tests.
- `server/` contains the Express API, controllers, routes, middleware, services, and sockets.
- Top-level docs are now consolidated into this README so the project can be reviewed from one file.

## Conclusion

CampusTrade demonstrates a structured full-stack application with modular design, secure backend practices, inventory-safe order handling, and real-time user interaction.
