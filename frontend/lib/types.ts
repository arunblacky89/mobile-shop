/* ─── Shared frontend types ─── */

export type Category = {
  id: number;
  name: string;
  slug: string;
  parent?: number | null;
  children?: Category[];
};

export type Brand = {
  id: number;
  name: string;
  slug: string;
};

/** Catalog product list item (matches /api/catalog/products/) */
export type Product = {
  id: number;
  title: string;
  slug: string;
  brand: Brand;
  category: Category;
  is_active: boolean;
  price: number | null;
  mrp: number | null;
  image_url: string | null;
};

export type ProductVariant = {
  id: number;
  sku: string;
  price: number | string;
  mrp: number | string | null;
  attributes: Record<string, unknown>;
  stock_qty: number;
};

export type ProductImage = {
  id: number;
  image_url: string;
  sort_order: number;
};

export type ProductDetail = {
  id: number;
  title: string;
  slug: string;
  description: string;
  brand: Brand;
  category: Category;
  is_active: boolean;
  variants: ProductVariant[];
  images: ProductImage[];
};

export type CartItem = {
  id: number;
  product_variant: ProductVariant;
  quantity: number;
  price_snapshot: number | string;
  mrp_snapshot: number | string | null;
};

export type Cart = {
  id: string;
  item_count: number;
  subtotal: number | string;
  items: CartItem[];
};

/* ─── Order types ─── */

export type Address = {
  id: string;
  full_name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
};

export type OrderItem = {
  product_variant: ProductVariant;
  quantity: number;
  price_snapshot: number | string;
  mrp_snapshot: number | string | null;
};

export type TrackingEvent = {
  status: string;
  description: string;
  location: string;
  occurred_at: string;
};

export type Shipment = {
  carrier: string;
  tracking_number: string;
  status: string;
  estimated_delivery_date: string | null;
  events: TrackingEvent[];
};

export type Order = {
  id: string;
  status: string;
  subtotal: number | string;
  currency: string;
  items: OrderItem[];
  shipping_address: Address;
  payment_status: string | null;
  shipment?: Shipment | null;
  created_at: string;
};

export type CheckoutPayload = {
  full_name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
  phone?: string;
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};
