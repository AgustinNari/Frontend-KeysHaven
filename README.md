# KeysHaven — Frontend

Frontend application for KeysHaven, a digital-key marketplace developed as a team project.

It includes authentication, product browsing, shopping cart management, discounts and coupons, orders, user profiles, seller tools, and administration views.

The backend is available in [keyshaven-backend](https://github.com/AgustinNari/keyshaven-backend).

## Tech Stack

- React 19
- Vite 7
- Redux Toolkit
- React Router
- Bootstrap
- JavaScript

## Features

- User authentication
- Product catalog and product details
- Shopping cart
- Discounts and coupons
- Orders
- User profiles
- Seller panel
- Administration panel
- Per-user cart persistence

The payment flow is simulated and does not process real transactions.

## Local Setup

Requirements:

- Node.js 20.19+ or 22.12+
- npm
- KeysHaven backend running locally

Install and start the application:

```bash
cd keysHaven
npm ci
npm run dev
```

The development server is available by default at:

```text
http://localhost:5173
```

The backend defaults to:

```text
http://localhost:4002
```

To configure another backend, copy:

```text
.env.example
```

to:

```text
.env.local
```

and update:

```text
VITE_API_BASE_URL
```

Vite environment variables are exposed to the browser and must never contain secrets.

## Validation

```bash
npm test
npm run lint
npm run build
```

## State Management

Redux manages authentication and global application state.

`useCart()` provides the cart-facing application logic on top of Redux.

Authentication tokens and cart items are persisted locally. The user profile is validated against the backend when the session is restored, and the cart is associated with the authenticated user.
