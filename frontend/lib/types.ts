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

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};
