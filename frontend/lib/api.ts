import type {
  Brand,
  Category,
  Product,
  ProductDetail,
  ProductVariant,
  ProductImage,
  Paginated,
  Cart,
  CartItem,
  Order,
  CheckoutPayload,
} from "./types";

/* ─── Re-export types for convenience ─── */
export type {
  Brand,
  Category,
  Product,
  ProductDetail,
  ProductVariant,
  ProductImage,
  Paginated,
  Cart,
  CartItem,
  Order,
  CheckoutPayload,
};

// Also export old aliases so existing imports (shop page) keep working
export type ProductListItem = Product;
export type PaginatedResponse<T> = Paginated<T>;

/* ─── Config ─── */

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

/* ─── Generic fetch helper with query params ─── */

type FetchOptions = RequestInit & { query?: Record<string, unknown> };

function withQuery(url: string, query?: Record<string, unknown>) {
  if (!query) return url;
  const u = new URL(url);
  Object.entries(query).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    u.searchParams.set(k, String(v));
  });
  return u.toString();
}

export async function apiGet<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const url = withQuery(`${API_BASE}${path}`, options.query);
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> | undefined),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/* ─── Catalog API helpers ─── */

export async function getProducts(params?: {
  category?: string;
  brand?: string;
  search?: string;
  ordering?: string;
  page?: number;
}): Promise<Paginated<Product>> {
  return apiGet<Paginated<Product>>("/api/catalog/products/", {
    query: params as Record<string, unknown>,
  });
}

export async function getProduct(slug: string): Promise<ProductDetail> {
  return apiGet<ProductDetail>(`/api/catalog/products/${slug}/`);
}

export async function getCategories(): Promise<Category[]> {
  const res = await apiGet<Paginated<Category>>("/api/catalog/categories/");
  return res.results;
}

export async function getBrands(): Promise<Brand[]> {
  const res = await apiGet<Paginated<Brand>>("/api/brands/");
  return res.results;
}

/* ─── Cart API helpers ─── */

export async function getCart(cartSession?: string): Promise<Cart> {
  return apiGet<Cart>("/api/cart/", {
    headers: cartSession ? { "X-Cart-Session": cartSession } : undefined,
  });
}

export async function addCartItem(payload: {
  product_variant_id: number;
  quantity?: number;
  cartSession?: string;
}): Promise<CartItem> {
  const { cartSession, ...body } = payload;
  return apiGet<CartItem>("/api/cart/items/", {
    method: "POST",
    body: JSON.stringify(body),
    headers: cartSession ? { "X-Cart-Session": cartSession } : undefined,
  } as FetchOptions);
}

export async function updateCartItem(payload: {
  id: number;
  quantity: number;
  cartSession?: string;
}): Promise<CartItem> {
  const { id, cartSession, ...body } = payload;
  return apiGet<CartItem>(`/api/cart/items/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: cartSession ? { "X-Cart-Session": cartSession } : undefined,
  } as FetchOptions);
}

export async function deleteCartItem(payload: {
  id: number;
  cartSession?: string;
}): Promise<void> {
  const { id, cartSession } = payload;
  const url = `${(process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "")}/api/cart/items/${id}/`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(cartSession ? { "X-Cart-Session": cartSession } : {}),
    },
    cache: "no-store",
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(`API ${res.status}`);
  }
}

/* ─── Orders API helpers ─── */

export async function checkout(payload: {
  address: CheckoutPayload;
  cartSession?: string;
}): Promise<Order> {
  const { address, cartSession } = payload;
  return apiGet<Order>("/api/orders/checkout/", {
    method: "POST",
    body: JSON.stringify(address),
    headers: cartSession ? { "X-Cart-Session": cartSession } : undefined,
  } as FetchOptions);
}

/* ─── Shipping / Tracking API helpers ─── */

export async function getShippingEstimate(pincode: string) {
  return apiGet<{
    pincode: string;
    min_days: number;
    max_days: number;
    estimated_date: string;
  }>("/api/orders/shipping/estimate/", { query: { pincode } });
}

export async function getOrderTracking(id: string) {
  return apiGet<{
    id: string;
    status: string;
    shipment?: {
      carrier: string;
      tracking_number: string;
      status: string;
      estimated_delivery_date: string | null;
      events: {
        status: string;
        description: string;
        location: string;
        occurred_at: string;
      }[];
    };
  }>(`/api/orders/${id}/tracking/`);
}
