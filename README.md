# Field & Form — minimal React + Firebase store with Admin Panel

A small, fast e-commerce front end built with React 19 and Vite, backed by
Firebase (Auth + Firestore). It features a full Admin Console to manage catalog products and track orders alongside standard shop views (catalog, cart, sign-in, order history, and checkout).

## Stack

- **React 19** + **Vite** — fast dev server, small production bundle
- **react-router-dom** — client-side routing
- **Firebase Auth** — email/password sign-in
- **Firestore** — product catalog, user profiles, and orders
- Cart state lives in `localStorage` via React Context (no server round-trip
  needed just to add something to the cart)

## Project structure

```
src/
  lib/firebase.js       Firebase app init — reads config from env vars
  context/
    AuthContext.jsx      current user, login/signup/logout, admin privilege detection
    CartContext.jsx       cart items, persisted to localStorage
  components/
    Navbar.jsx, ProductCard.jsx, ProtectedRoute.jsx
    AdminRoute.jsx       restricts dashboard routes to authenticated admin users
  pages/
    Home.jsx              product grid, reads /products
    ProductDetail.jsx     single product, reads /products/{id}
    Cart.jsx
    Checkout.jsx           writes a document to /orders
    Login.jsx / Signup.jsx
    Orders.jsx             a user's own orders, protected route
    AdminDashboard.jsx     administrative product catalog overview and actions
    AdminProductForm.jsx   add or edit catalog products
    AdminOrders.jsx        administrative view of all store orders and order status updater
firestore.rules          security rules to deploy alongside the app
sample-products.json      a few sample documents for the products collection
```

## 1. Set up Firebase

1. Create a project at https://console.firebase.google.com
2. Add a **Web app** (the `</>` icon) and copy the config values it gives you.
3. Copy `.env.example` to `.env`, then fill in each `VITE_FIREBASE_*` value from
   your Firebase config.
4. In the console, enable:
   - **Authentication -> Sign-in method -> Email/Password**
   - **Firestore Database** (start in production mode)
5. Deploy `firestore.rules` (or paste its contents into the Rules tab in the
   console). It lets anyone read products, but restricts writing products, managing user profiles, or modifying order documents to authorized admin users.
6. Add a few documents to a `products` collection so the home page has
   something to show — `sample-products.json` has the shape to copy from
   (`name`, `price` as a number, `description`, `category`, `image` URL).

## 2. Set up Admin Privileges

The application handles admin privileges securely through three fallback mechanisms. An admin can access `/admin`, manage the catalog, and update order statuses:

1. **Bootstrap / Fallback Email:** Any registered user signing up or logging in with the emails `admin@medstore.com` or `admin@example.com` is automatically granted full admin rights on both the client side and inside Firestore security rules.
2. **Firestore Users Collection:** When a user signs up, a profile document is created in the `users` collection in Firestore. Setting the `role` field to `"admin"` in a user's Firestore document (e.g. `/users/{uid}`) immediately grants admin privileges.
3. **Custom Claims:** The application is also fully compatible with standard custom claims. Setting `{ admin: true }` or `{ role: "admin" }` on the user token result using the Firebase Admin SDK will securely activate admin features.

## 3. Run it

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## 4. Build for production

```bash
npm run build
```

Outputs static files to `dist/`. Deploy that folder anywhere that serves
static files — Firebase Hosting is a natural fit since you're already on
Firebase:

```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # point it at the dist/ folder, configure as a SPA
npm run build
firebase deploy
```

## Notes on what's deliberately left out

- **No payment processing.** `Checkout.jsx` writes an order to Firestore and
  clears the cart — that's it. Wire in Stripe Checkout, Paddle, or your
  processor of choice where the comment in that file marks the spot.
  Payment logic belongs in a Cloud Function or your own backend, not in
  client-side code.
