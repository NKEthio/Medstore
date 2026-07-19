# Field & Form — minimal React + Firebase store

A small, fast e-commerce front end built with React 19 and Vite, backed by
Firebase (Auth + Firestore). No admin panel, no framework bloat — just what
a store needs: a catalog, a cart, sign-in, and checkout.

## Stack

- **React 19** + **Vite** — fast dev server, small production bundle
- **react-router-dom** — client-side routing
- **Firebase Auth** — email/password sign-in
- **Firestore** — product catalog and orders
- Cart state lives in `localStorage` via React Context (no server round-trip
  needed just to add something to the cart)

## Project structure

```
src/
  lib/firebase.js       Firebase app init — put your config here
  context/
    AuthContext.jsx      current user, login/signup/logout
    CartContext.jsx       cart items, persisted to localStorage
  components/
    Navbar.jsx, ProductCard.jsx, ProtectedRoute.jsx
  pages/
    Home.jsx              product grid, reads /products
    ProductDetail.jsx     single product, reads /products/{id}
    Cart.jsx
    Checkout.jsx           writes a document to /orders
    Login.jsx / Signup.jsx
    Orders.jsx             a user's own orders, protected route
firestore.rules          security rules to deploy alongside the app
sample-products.json      a few sample documents for the products collection
```

## 1. Set up Firebase

1. Create a project at https://console.firebase.google.com
2. Add a **Web app** (the `</>` icon) and copy the config object it gives you.
3. Paste those values into `src/lib/firebase.js`, replacing the placeholders.
4. In the console, enable:
   - **Authentication -> Sign-in method -> Email/Password**
   - **Firestore Database** (start in production mode)
5. Deploy `firestore.rules` (or paste its contents into the Rules tab in the
   console). It lets anyone read products, but only a signed-in user can
   create — and only ever read — their own orders. Products are read-only
   from the client on purpose; add/edit them from the console or a separate
   admin script, not the storefront.
6. Add a few documents to a `products` collection so the home page has
   something to show — `sample-products.json` has the shape to copy from
   (`name`, `price` as a number, `description`, `category`, `image` URL).

## 2. Run it

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## 3. Build for production

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
- **No admin UI.** Products are managed directly in the Firestore console
  or via a script using the Firebase Admin SDK. Adding one is a matter of
  another protected route plus `addDoc`/`updateDoc` calls once you've
  decided how to gate who counts as an admin (a custom claim on the user's
  auth token is the standard approach).
