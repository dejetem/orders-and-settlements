# Orders and Settlements System

A robust, full-stack application for managing B2B orders and tracking payments.

This repository is split into a cleanly separated **Frontend** (Next.js) and **Backend** (Node.js/Express).

## Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS, TypeScript, Axios, Playwright (E2E Testing).
- **Backend:** Node.js, Express, TypeScript, Zod (Validation), Jest (Testing). Built using **Clean Architecture** (Domain, Application, Infrastructure, Interface layers).
- **Database:** MongoDB (with Mongoose).
- **CI/CD:** GitHub Actions (for automated linting and testing).

## Prerequisites

- Node.js (v18+)
- MongoDB (Local instance or MongoDB Atlas cluster)
- npm or yarn

## Step-by-Step Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd orders-and-settlements
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   
   # Create a .env file based on defaults or use your own MongoDB URI
   echo "PORT=5000\nMONGODB_URI=mongodb://127.0.0.1:27017/orders-app\nJWT_SECRET=super_secret_key_change_me_in_prod\nNODE_ENV=development\nFRONTEND_URL=http://localhost:3000" > .env
   
   # Start the backend server
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   # Open a new terminal tab
   cd frontend
   npm install
   
   # Create a .env.local file with the API URL
   echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
   
   # Start the frontend dev server
   npm run dev
   ```

4. **Access the Application:**
   Open your browser and navigate to `http://localhost:3000`. You can create an account and start managing orders!

---

## API Overview (REST)

The backend exposes a clean REST API running on `http://localhost:5000/api`.

### Auth
- `POST /auth/register` - Register a new user (email, password)
- `POST /auth/login` - Authenticate and receive an HTTP-Only cookie.
- `POST /auth/logout` - Clear authentication cookies.
- `GET /auth/me` - Get current user profile.

### Orders
- `GET /orders` - Fetch all orders for the authenticated user.
  - *Query Params:* `?status=pending|partially_paid|paid|overdue`
- `GET /orders/export` - Export orders to a CSV file.
  - *Query Params:* `?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- `POST /orders` - Create a new order with line items.
- `GET /orders/:id` - Get details of a specific order, including its payment history.
- `PUT /orders/:id` - Update an existing order.
- `DELETE /orders/:id` - Delete a specific order.
- `GET /orders/:id/audit-logs` - Get audit logs for a specific order.
- `POST /orders/:id/payments` - Record a new payment against an order.

---

## Status Derivation & Business Rules

Order status is dynamically derived based on the `dueDate` and `amountPaid` relative to the `total`.

| Condition | Status |
| :--- | :--- |
| `amountPaid == 0` && `dueDate >= today` | `pending` |
| `amountPaid == 0` && `dueDate < today` | `overdue` |
| `0 < amountPaid < total` && `dueDate >= today` | `partially_paid` |
| `0 < amountPaid < total` && `dueDate < today` | `overdue` |
| `amountPaid >= total` | `paid` |

**Edge Case Handling:**
- **Overdue but fully paid later:** If an order becomes `overdue` and a user subsequently makes a payment that brings `amountPaid` equal to `total`, the status is immediately updated to `paid`. 
- **Floating Point Math:** JavaScript floats are notoriously inaccurate for currency. To avoid rounding errors (e.g., `$10.01 + $20.02 != $30.03`), the frontend accepts dollars/cents as decimals, but **the API and Database strictly store all monetary values in cents (integers).**

---

## Concurrency & Over-Payment Prevention

Handling concurrent payments is a critical requirement in financial systems. 

**Scenario:** Two users (or one impatient user clicking twice) attempt to pay $600 simultaneously on an order that only has $1000 due. 

**Solution: Optimistic Concurrency Control (OCC)**
- I implemented OCC using Mongoose's built-in `__v` (version key) on the Order schema.
- When `POST /orders/:id/payments` is called, the order is fetched. 
- If both requests fetch version `1` and validate the amount against the balance, the first request will save the updated balance and increment the version to `2`.
- When the second request attempts to save, Mongoose will throw a `VersionError` because it's trying to save over version `1`, but the database is already at version `2`.
- The API catches this error and cleanly returns a `409 Conflict`, completely preventing the overpayment race condition without requiring heavy distributed locks.

## Production Readiness Enhancements

1. **Tenant Data Isolation:** Orders and users are securely scoped to an `Organization`. Queries inherently filter by `organizationId`, providing true B2B SaaS multi-tenancy.
2. **Full Audit Logging:** An `AuditLog` collection automatically tracks `ORDER_CREATED` and `PAYMENT_ADDED` events (event sourcing pattern), recording exactly *who* made a change and *what* the previous/new status was.
3. **Idempotency Keys:** The frontend sends an `Idempotency-Key` header with payment requests. The backend enforces uniqueness to guarantee that network retries never result in duplicate charges.
4. **End-to-End Testing:** The project includes a Playwright test suite (`frontend/tests/order-flow.spec.ts`) that asserts the entire order and payment lifecycle.

---

## Assumptions & Tradeoffs

1. **Authentication:** I used a standard Email/Password JWT setup with HTTP-only cookies. While OAuth (Google/Microsoft) is common in B2B, email/password was explicitly marked as "sufficient" for the assignment.
2. **Immutability:** I chose to allow payments to simply append to the order's `amountPaid` and automatically recalculate status, leaving the original order's line items editable in theory. In a strict financial system, once a payment is made, the order invoice should become completely immutable (read-only) for auditability.

---
