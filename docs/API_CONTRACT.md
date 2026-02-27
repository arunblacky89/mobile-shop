## API Contract – Mobile Shop

Base URL (local): `http://localhost:8000`

All responses are JSON. Pagination uses Django DRF `PageNumberPagination` style:

```json
{
  "count": 123,
  "next": "http://.../?page=3",
  "previous": null,
  "results": [ ... ]
}
```

---

### Public – Catalog

#### `GET /api/brands/`

List active brands.

Response (`200`):

```json
{
  "count": 2,
  "results": [
    { "id": "uuid", "name": "Apple", "slug": "apple", "logo_url": "", "is_active": true }
  ]
}
```

#### `GET /api/categories/`

Top‑level active categories (with nested children).

Response (`200` – truncated):

```json
{
  "count": 3,
  "results": [
    {
      "id": "uuid",
      "name": "Smartphones",
      "slug": "smartphones",
      "parent": null,
      "image_url": "",
      "is_active": true,
      "children": [ { "id": "uuid", "name": "Flagship", "slug": "flagship", "parent": "uuid" } ]
    }
  ]
}
```

#### `GET /api/catalog/products/`

List active products with filters.

Query params:

- `category`: category slug
- `brand`: brand slug
- `search`: search term (title)
- `ordering`: `-created_at`, `price`, `-price`, `title`, `-title`
- `page`: page number

Response:

```json
{
  "count": 20,
  "results": [
    {
      "id": 1,
      "title": "iPhone 16 Pro Max 256GB",
      "slug": "iphone-16-pro-max-256gb",
      "brand": { "id": 1, "name": "Apple", "slug": "apple" },
      "category": { "id": 10, "name": "Flagship", "slug": "flagship", "parent": 3 },
      "is_active": true,
      "price": 144900,
      "mrp": 154900,
      "image_url": "https://...",
      "created_at": "2026-02-27T12:00:00Z"
    }
  ]
}
```

#### `GET /api/catalog/products/<slug>/`

Product detail with variants and images.

Response:

```json
{
  "id": 1,
  "title": "iPhone 16 Pro Max 256GB",
  "slug": "iphone-16-pro-max-256gb",
  "description": "Latest flagship...",
  "brand": { "id": 1, "name": "Apple", "slug": "apple" },
  "category": { "id": 10, "name": "Flagship", "slug": "flagship", "parent": 3 },
  "is_active": true,
  "variants": [
    {
      "id": 11,
      "sku": "IP16PM-256-NAT",
      "price": "144900.00",
      "mrp": "154900.00",
      "attributes": { "color": "Natural Titanium", "storage": "256GB", "ram": "8GB" },
      "stock_qty": 5
    }
  ],
  "images": [
    { "id": 101, "image_url": "https://...", "sort_order": 0 }
  ]
}
```

---

### Cart

Identification:

- Authenticated user → linked by `user_id`.
- Guest → `cart_session` cookie or `X-Cart-Session` header.

#### `GET /api/cart/`

Returns current cart.

```json
{
  "id": "0e5d...",
  "item_count": 2,
  "subtotal": "169800.00",
  "items": [
    {
      "id": 1,
      "product_variant": {
        "id": 11,
        "sku": "IP16PM-256-NAT",
        "price": "144900.00",
        "mrp": "154900.00",
        "attributes": { "color": "Natural Titanium", "storage": "256GB" },
        "stock_qty": 5
      },
      "quantity": 1,
      "price_snapshot": "144900.00",
      "mrp_snapshot": "154900.00"
    }
  ]
}
```

#### `POST /api/cart/items/`

Add or increment an item.

Request:

```json
{ "product_variant_id": 11, "quantity": 1 }
```

Response (`201` if new, `200` if incremented):

```json
{
  "id": 1,
  "product_variant": { ... },
  "quantity": 2,
  "price_snapshot": "144900.00",
  "mrp_snapshot": "154900.00"
}
```

#### `PATCH /api/cart/items/<int:id>/`

Update quantity.

Request:

```json
{ "quantity": 1 }
```

#### `DELETE /api/cart/items/<int:id>/`

Delete line item. Response: `204 No Content`.

---

### Checkout & Orders

#### `POST /api/orders/checkout/`

Creates an order from current cart.

Request:

```json
{
  "full_name": "Arun",
  "line1": "123 MG Road",
  "line2": "",
  "city": "Chennai",
  "state": "TN",
  "postal_code": "600001",
  "country": "IN",
  "phone": "9999999999"
}
```

Response (`201`):

```json
{
  "id": "c4e1c5a0-...",
  "status": "PENDING_PAYMENT",
  "subtotal": "144900.00",
  "currency": "INR",
  "items": [ { "product_variant": 11, "quantity": 1, "price_snapshot": "144900.00" } ],
  "shipping_address": { "id": "addr-uuid", "full_name": "Arun", "city": "Chennai", ... },
  "shipment": null,
  "created_at": "2026-02-27T12:10:00Z"
}
```

#### `GET /api/orders/`

List authenticated user orders.

#### `GET /api/orders/<uuid:id>/`

Order detail (same shape as checkout response, with `shipment` when available).

#### `GET /api/orders/<uuid:id>/tracking/`

Returns shipment + events:

```json
{
  "id": "c4e1...",
  "status": "PAID",
  "shipment": {
    "carrier": "mock",
    "tracking_number": "",
    "status": "PAID",
    "estimated_delivery_date": "2026-03-05",
    "events": [
      {
        "status": "ORDER_PLACED",
        "description": "Order placed",
        "location": "",
        "occurred_at": "2026-02-27T12:10:00Z"
      }
    ]
  }
}
```

---

### Payments – Razorpay

#### `POST /api/orders/razorpay/create/`

Creates a Razorpay order and a Payment record.

Request:

```json
{ "order_id": "c4e1c5a0-..." }
```

Response (`200`):

```json
{
  "order_id": "c4e1c5a0-...",
  "payment_id": "5b9f...",
  "razorpay_order_id": "order_Nv1c.....",
  "amount": 14490000,
  "currency": "INR",
  "razorpay_key_id": "rzp_test_xxx"
}
```

#### `POST /api/orders/razorpay/webhook/`

Razorpay webhook (server‑to‑server).

- Validates `X-Razorpay-Signature` using `RAZORPAY_WEBHOOK_SECRET`.
- On `payment.captured`, marks Payment + Order as `PAID` and creates/upgrades Shipment.

Response: `200` with `{ "status": "ok" }`.

---

### Shipping – ETA (mock)

#### `GET /api/orders/shipping/estimate/?pincode=600001`

Response:

```json
{
  "pincode": "600001",
  "min_days": 2,
  "max_days": 3,
  "estimated_date": "2026-03-05"
}
```

---

### Auth

#### `POST /api/auth/register/`

Request:

```json
{ "username": "arun", "email": "arun@example.com", "password": "secret123" }
```

Response (`201`):

```json
{ "id": 1, "username": "arun", "email": "arun@example.com", "first_name": "", "last_name": "" }
```

#### `POST /api/auth/token/`

Standard SimpleJWT endpoint.

Request:

```json
{ "username": "arun", "password": "secret123" }
```

Response:

```json
{ "access": "jwt...", "refresh": "jwt..." }
```

#### `POST /api/auth/refresh/`

Refresh access token using refresh token.

