const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/* ─── Types ─── */

export interface Brand {
  id: number;
  name: string;
  slug: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent: number | null;
}

export interface ProductListItem {
  id: number;
  title: string;
  slug: string;
  brand: Brand;
  category: Category;
  is_active: boolean;
  price: number | null;
  mrp: number | null;
  image_url: string | null;
}

export interface ProductVariant {
  id: number;
  sku: string;
  price: number;
  mrp: number | null;
  attributes: Record<string, unknown>;
  stock_qty: number;
}

export interface ProductImage {
  id: number;
  image_url: string;
  sort_order: number;
}

export interface ProductDetail {
  id: number;
  title: string;
  slug: string;
  description: string;
  brand: Brand;
  category: Category;
  is_active: boolean;
  variants: ProductVariant[];
  images: ProductImage[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/* ─── Fetch helpers ─── */

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

/* ─── Catalog API ─── */

export async function getProducts(params?: {
  category?: string;
  brand?: string;
  search?: string;
  ordering?: string;
  page?: number;
}): Promise<PaginatedResponse<ProductListItem>> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set("category", params.category);
  if (params?.brand) searchParams.set("brand", params.brand);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.ordering) searchParams.set("ordering", params.ordering);
  if (params?.page) searchParams.set("page", String(params.page));

  const qs = searchParams.toString();
  return apiFetch(`/api/catalog/products/${qs ? `?${qs}` : ""}`);
}

export async function getProduct(slug: string): Promise<ProductDetail> {
  return apiFetch(`/api/catalog/products/${slug}/`);
}

export async function getCategories(): Promise<Category[]> {
  return apiFetch("/api/catalog/categories/");
}

export async function getBrands(): Promise<Brand[]> {
  // Using the api app brands endpoint (has more data)
  return apiFetch("/api/brands/");
}
