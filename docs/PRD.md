## Mobile Shop – Product Requirements (PRD)

### Vision

Build an **Amazon‑like mobile e‑commerce platform** focused on smartphones and accessories, optimized for India first (INR, GST, pincode shipping) but designed for international expansion (multi‑currency, multi‑language, multi‑region taxes and logistics).

Primary objectives:

- Fast, trustworthy shopping experience on web and mobile.
- Enterprise‑grade observability, security, and extensibility.
- Clear separation of **customer storefront**, **admin tools**, and **API layer**.

---

### Core Modules

- **Accounts**
  - Registration, login (JWT), password change.
  - Profile, addresses, order history.
  - Roles: customer, admin, staff (RBAC on admin APIs).

- **Catalog**
  - Hierarchical categories (e.g. Smartphones, Earbuds, Chargers, Wearables).
  - Brands (Apple, Samsung, OnePlus, etc.).
  - Products with rich content (title, description, specs, images).
  - Variants (RAM, storage, color, region) as first‑class ProductVariant rows.
  - Pricing (MRP vs sale price), stock status.

- **Search & Browse**
  - Category landing pages and /shop listing with filters and sorting.
  - Search box (header) powered by Meilisearch (later).
  - Facets: brand, price range, RAM, storage, color, 5G, rating, availability.

- **Cart & Checkout**
  - Guest + authenticated carts (session cookie or user‑linked).
  - Line items tied to ProductVariant with price snapshot.
  - Checkout flow: address + payment + confirmation.

- **Orders**
  - Order creation from cart with snapshot of items and prices.
  - Status: PENDING_PAYMENT → PAID → CANCELLED (initial), ready for extended lifecycle.
  - Order detail page, invoices later.

- **Payments**
  - Razorpay INR sandbox implemented end‑to‑end.
  - Stripe USD/EUR/GBP planned with parallel Payment rows.

- **Shipping**
  - Shipment + TrackingEvent models.
  - Mock ETA by pincode and simple tracking timeline.
  - Future Shiprocket/other carrier adapters.

- **Admin**
  - Django admin for now (products, variants, stock, orders, payments).
  - Future dedicated admin React/Next UI under `/admin`.

---

### User Stories (MVP)

#### Customer – discovery & purchase

- **Browse catalog**
  - As a visitor, I can view featured devices, categories and brands on the home page.
  - As a visitor, I can open `/shop` and filter by category, brand and sort by newest/price.

- **Product detail**
  - As a visitor, I can see a product’s images, variants, and description.
  - As a visitor, I can check **delivery ETA** by entering my pincode.

- **Cart & checkout**
  - As a visitor, I can add a specific variant (e.g. 256GB, Blue) to my cart.
  - As a visitor, I can see my cart, quantities and totals.
  - As a visitor, I can enter my shipping address and place an order.

- **Payments**
  - As a visitor, I can pay via Razorpay sandbox and see my order marked as paid.

- **Post‑purchase**
  - As a customer, I can view a confirmation page with items and address.
  - As a customer, I can see a simple shipment timeline (Order placed, Payment confirmed, etc.).

#### Admin / Staff

- As an admin, I can manage brands, categories, products and variants via Django admin.
- As an admin, I can inspect orders, basic payment and shipment details.

---

### Priorities

- **MVP (current status)**
  - Core catalog (brands, categories, products, variants, images).
  - Live product listing + detail pages.
  - Cart + checkout + orders.
  - Razorpay INR sandbox.
  - Mock shipping ETA + timeline.
  - Basic auth (JWT) + account orders page.

- **V1**
  - Meilisearch search index and facet filters.
  - Admin UX for pricing, stock, coupons and banners.
  - Better order lifecycle: packed, shipped, delivered, cancel/return hooks.
  - Improved performance & SEO (Core Web Vitals, structured data, sitemap).

- **V2**
  - Stripe multi‑currency payments.
  - Shiprocket and international carrier integration.
  - Notifications (email/SMS/push), offers and promotions.
  - Full RBAC admin panel and auditing.

