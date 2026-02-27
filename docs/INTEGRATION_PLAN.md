## Integration Plan – Search, Payments, Shipping, Security, Performance, CI/CD

This document links the current implementation to the remaining enterprise features and shows where to plug in future systems.

---

### Search – Meilisearch

**Current state**

- Product listing (`/shop`) already supports filters and sorting from the relational DB.
- Types and serializers are compatible with a richer search payload.

**Planned integration**

- Standalone Meilisearch service (managed or self‑hosted).
- One `products` index with documents per **ProductVariant** (see `SCHEMA.md`).
- Fields:
  - `id`, `product_id`, `title`, `brand`, `category_path`
  - `price`, `mrp`
  - `ram`, `storage`, `color`, `battery`, `camera`, `is_5g`
  - `rating`, `review_count`, `available`

**Sync strategy**

- On `Product` / `ProductVariant` save:
  - enqueue background task (Celery / RQ / Django‑Q) to upsert into Meilisearch.
- Nightly full re‑index job.

**API changes**

- New endpoint: `GET /api/search/` that proxies to Meilisearch:
  - Query params: `q`, `page`, `filters` (brand, price range, facets).
  - Converts Meilisearch hits back to `ProductListSerializer`‑compatible shape.
- Frontend:
  - `/search` page re‑uses `ProductCard` grid.
  - `/shop` can be switched to Meilisearch gradually by feature flag.

---

### Payments – Stripe International

**Current state**

- `Payment` model and Razorpay INR flow are live.
- CI and Railway deployments run safely without payment keys.

**Planned Stripe integration**

- Add env vars:
  - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
- Extend `Payment`:
  - `stripe_payment_intent_id`, `stripe_client_secret` or generic `metadata` JSON.
- New endpoints:
  - `POST /api/payments/stripe/create/`
    - Given `order_id` and target currency.
    - Creates Stripe PaymentIntent and returns `client_secret`.
  - `POST /api/payments/stripe/webhook/`
    - On `payment_intent.succeeded`, marks Payment + Order as `PAID`.

**Frontend**

- If user selects Stripe at checkout:
  - Call `/api/payments/stripe/create/` to get `client_secret`.
  - Use Stripe Elements on a `/payment/stripe/[orderId]` page.
  - On success, redirect to `/order/[id]` (same as Razorpay).

---

### Shipping – Real Carrier Integration (Shiprocket)

**Current state**

- `Shipment` + `TrackingEvent` models and mock ETA + tracking.

**Planned Shiprocket integration**

- Add `shipping/providers.py`:
  - Base class `ShippingProvider` with methods:
    - `create_shipment(order) -> Shipment`
    - `estimate(order, pincode) -> (min_days, max_days, eta_date)`
    - `track(shipment) -> list[TrackingEvent]`
  - Implementation `ShiprocketProvider(ShippingProvider)` using Shiprocket APIs.
- Configure via env:
  - `SHIPROCKET_API_KEY`, `SHIPROCKET_API_SECRET`.

**API behaviour**

- If Shiprocket keys present:
  - `shipping_estimate` and tracking endpoints call Shiprocket.
- If not:
  - Fall back to current mock logic (no production downtime).

---

### Security – Hardening Plan

**Already in place**

- JWT auth (SimpleJWT) with access + refresh tokens.
- Env‑driven `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`.
- CSRF enabled on Django forms; checkout endpoints are JSON API with JWT.

**Planned improvements**

- **RBAC**
  - Use Django groups/permissions for admin vs staff vs customer.
  - Wrap admin endpoints with DRF permission classes (e.g. `IsAdminUser`).

- **Audit logging**
  - `AuditLog` model recording:
    - `actor` (user or system), `action` (e.g. price_change), `object_type`, `object_id`, `old_values`, `new_values`.
  - Decorators on admin views and management commands to emit audit entries.

- **Rate limiting**
  - Use `django-ratelimit` or a gateway (e.g. Nginx / Cloudflare) to limit:
    - `/api/auth/token/`, `/api/auth/register/`, `/api/search/`.

- **Security headers**
  - Configure via middleware / reverse proxy:
    - `Strict-Transport-Security`, `X-Frame-Options`, `Content-Security-Policy`, `Referrer-Policy`.

- **Password & auth**
  - Enforce strong password policy, optional OTP login (via SMS/email adapter later).

---

### Performance & SEO

**Next.js improvements**

- Use Next.js metadata API in layout:
  - Titles, descriptions per page; OG tags for product pages.
- Generate:
  - `sitemap.xml` from catalog (categories + products).
  - `robots.txt` with basic rules.
- Add Schema.org:
  - `Product` JSON‑LD on product detail.
  - `BreadcrumbList` for category/product paths.

**Caching**

- Edge/CDN caching for:
  - `/` home, `/shop` without personalized data, brand/category pages.
- Backend:
  - Use Redis to cache category trees and home page sections.

**Core Web Vitals**

- Lazy‑load below‑the‑fold images.
- Use responsive image sizes and Next.js image optimization where possible.
- Minimize layout shift:
  - Fixed dimensions on cards, banners, hero sections.

---

### CI/CD – GitHub Actions + Railway

**Goals**

- Automatic checks on every PR.
- Auto‑deploy `main` to Railway (frontend + backend).

**Workflow outline**

- `.github/workflows/ci.yml`:
  - Triggers: `pull_request`, `push` to `main`.
  - Jobs:
    - **backend-tests**
      - `pip install -r backend/requirements.txt`
      - `python backend/manage.py check`
      - `python backend/manage.py test` (once tests are added).
    - **frontend-build**
      - `npm ci` in `frontend/`
      - `npm run lint`
      - `npm run build`

**Deployment**

- Use Railway GitHub integration:
  - Root dir set to `frontend` for the web service.
  - Separate backend service if needed (Docker or Nixpacks).
- Optional GitHub Action step:
  - Call `railway up` with `RAILWAY_TOKEN` secret to trigger deploy on `main` if not using built‑in integration.

