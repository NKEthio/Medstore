# DEX — Peer-to-Peer Medical Device Exchange

**DEX** (Device Exchange) is the global peer-to-peer medical equipment marketplace — like Amazon for medical devices. Where sellers get buyers and buyers get the best devices at hospital surplus pricing with BioMed calibration verification and DEX SafeTrade Escrow protection.

## Core Features

- **P2P Medical Device Marketplace:** Hospitals, surgery centers, private practices, and certified biomedical refurbishers buy and sell diagnostic imaging, patient monitors, surgical towers, anesthesia machines, and laboratory analyzers directly.
- **DEX SafeTrade Escrow:** 100% buyer protection. Funds are held in escrow until equipment arrives and completes a 48-hour clinical calibration and acceptance testing window.
- **P2P Offers & Direct Negotiations:** Buyers can submit counter-offers with customized inspection terms and contingencies directly to sellers.
- **P2P Device Listing Hub (`/sell`):** Healthcare facilities and liquidators can list surplus or pre-owned medical devices in under 2 minutes.
- **Facility Activity Hub (`/orders`):** Comprehensive tracking of purchase orders, escrow releases, active P2P counter-offers, and seller listing management.
- **BioMed Calibration & Inspection Requests:** Prospective buyers can request NIST calibration certificates, electrical safety pass reports, and maintenance logs directly from sellers.
- **Compliance & Admin Console (`/admin`):** Review pending device submissions, manage clinical freight logistics, and update escrow transaction milestones.

## Stack

- **React 19** + **Vite** — fast dev server and optimized production bundle
- **react-router-dom** — client-side routing
- **Firebase Auth & Firestore** — user authentication, device catalog, and escrow orders
- **P2P Context & LocalStorage** — immediate local persistence of P2P listings, offers, and seller inquiries

## Project Structure

```
src/
  lib/
    firebase.js         Firebase configuration & fallback preview mode
    productCache.js     client-side caching for fast catalog loading
  context/
    AuthContext.jsx     authentication & clinical admin role verification
    P2PContext.jsx      P2P medical device listings, offers, and inquiry management
    CartContext.jsx     purchase order and escrow cart state
    ThemeContext.jsx    dark / light theme provider
  components/
    Navbar.jsx          DEX branding, medical specialty dropdown, '+ List Device' CTA
    ProductCard.jsx     medical device cards with condition, seller badge & escrow tag
    ProtectedRoute.jsx  authenticated facility route guard
    AdminRoute.jsx      compliance admin console guard
  pages/
    Home.jsx            DEX hero banner, trust metrics, medical specialty filters
    ProductDetail.jsx   clinical specs, verified seller profile, 'Make an Offer', escrow
    SellDevice.jsx      P2P listing creation form for hospitals & clinics
    Cart.jsx            DEX Escrow cart with inspection window terms
    Checkout.jsx        clinical procurement checkout & SafeTrade Escrow agreement
    Orders.jsx          facility hub (Escrow Orders, P2P Offers, My Listed Devices)
    Login.jsx / Signup  clinical facility sign in & registration
    AdminDashboard.jsx  compliance and device verification console
    AdminProductForm.jsx add/edit medical equipment
    AdminOrders.jsx     manage escrow transaction status & freight milestones
sample-products.json    comprehensive medical equipment catalog across 7 specialties
```

## Running the Application

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## Production Build

```bash
npm run build
```
Outputs static files to `dist/`.
