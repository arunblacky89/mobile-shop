## Data Model – Mobile Shop

### Core Entities

- **User**
  - Standard Django `auth_user` extended via profiles later.
  - Key fields: `username`, `email`, `password`, `is_staff`, `is_superuser`.

- **Address**
  - `id (UUID PK)`
  - `user` (nullable FK to User)
  - `full_name`, `line1`, `line2`, `city`, `state`, `postal_code`, `country`, `phone`

---

### Catalog

- **Brand**
  - `id (UUID PK)`
  - `name` (unique), `slug` (unique)
  - `logo_url`, `is_active`
  - Index: `(is_active, name)`

- **Category**
  - `id (UUID PK)`
  - `name`, `slug` (unique)
  - `parent` (self‑FK, nullable) – enables trees.
  - `image_url`, `is_active`
  - Index: `(parent, is_active)`

- **Product**
  - `id (UUID PK)`
  - `title` / `name`, `slug` (unique)
  - `brand` (FK Brand), `category` (FK Category)
  - `description`
  - `is_active`
  - Timestamps: `created_at`, `updated_at`
  - Indexes:
    - `slug`
    - `(brand, category)`
    - `created_at DESC`

- **ProductVariant**
  - `id (PK)`
  - `product` (FK Product)
  - `sku` (unique)
  - `price` (DECIMAL 10,2), `mrp` (nullable)
  - `attributes` (JSON) – e.g. `{ "ram": "8GB", "storage": "256GB", "color": "Black", "5g": true }`
  - `stock_qty` (int)
  - Indexes:
    - `sku`
    - `(product, stock_qty)`

- **ProductImage**
  - `id`
  - `product` (FK Product)
  - `image_url` (URL, can be S3/R2)
  - `sort_order` (int)
  - Index: `(product, sort_order)`

---

### Cart & Orders

- **Cart**
  - `id (UUID PK)`
  - `user` (nullable FK User)
  - `cart_session_id` (string, indexed) – guest carts.
  - `created_at`, `updated_at`

- **CartItem**
  - `id`
  - `cart` (FK Cart, related name `items`)
  - `product_variant` (FK ProductVariant)
  - `quantity` (int)
  - `price_snapshot` (DECIMAL 10,2)
  - `mrp_snapshot` (nullable DECIMAL 10,2)
  - Unique constraint: `(cart, product_variant)`

- **Order**
  - `id (UUID PK)`
  - `user` (nullable FK User)
  - `cart` (nullable FK Cart)
  - `status` (`PENDING_PAYMENT`, `PAID`, `CANCELLED`, extended later)
  - `subtotal` (DECIMAL 10,2)
  - `currency` (e.g. `INR`)
  - `shipping_address` (FK Address, nullable)
  - `created_at`, `updated_at`
  - Index: `(user, created_at DESC)`

- **OrderItem**
  - `id`
  - `order` (FK Order, related name `items`)
  - `product_variant` (FK ProductVariant)
  - `quantity`
  - `price_snapshot`, `mrp_snapshot`

---

### Payments

- **Payment**
  - `id (UUID PK)`
  - `order` (FK Order, `related_name="payments"`)
  - `gateway` (`"razorpay"`, later `"stripe"`)
  - `amount` (DECIMAL 10,2)
  - `currency`
  - `status` (`CREATED`, `PENDING`, `PAID`, `FAILED`)
  - `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature` (gateway‑specific)
  - Timestamps

Stripe integration will re‑use `Payment` with additional fields (`stripe_payment_intent_id`, etc.) or a separate JSON `metadata` column.

---

### Shipping

- **Shipment**
  - `id (UUID PK)`
  - `order` (OneToOne FK Order)
  - `carrier` (e.g. `"mock"`, `"shiprocket"`)
  - `tracking_number` (string)
  - `status` (`CREATED`, `PAID`, `PACKED`, `SHIPPED`, `DELIVERED`, `CANCELLED`)
  - `estimated_delivery_date` (Date)
  - `created_at`, `updated_at`

- **TrackingEvent**
  - `id`
  - `shipment` (FK Shipment, `related_name="events"`)
  - `status` (string code)
  - `description` (human text)
  - `location` (optional)
  - `occurred_at` (DateTime)
  - `created_at`

---

### Search Index (Meilisearch – Conceptual)

Single index: **`products`**

- Document fields:
  - `id` (ProductVariant id)
  - `product_id`
  - `title`
  - `brand`
  - `category_path` (e.g. `"Mobiles > Smartphones"`)
  - `price`
  - `mrp`
  - `ram`, `storage`, `color`, `battery`, `camera`, `is_5g`
  - `rating`, `review_count`
  - `available` (stock > 0)

- Facets:
  - `brand`, `price`, `ram`, `storage`, `color`, `is_5g`, `available`, `rating`.

Sync strategy:

- On Product/Variant save, enqueue background job (Celery / RQ later) to upsert document in Meilisearch.

