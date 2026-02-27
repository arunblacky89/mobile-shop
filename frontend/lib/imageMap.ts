import type { Product } from "@/lib/types";

// Map known category slugs to premium SVG placeholders.
export function getCategoryImage(slug: string): string {
  const map: Record<string, string> = {
    smartphones: "/placeholders/categories/smartphones.svg",
    flagship: "/placeholders/categories/flagship.svg",
    "budget-phones": "/placeholders/categories/budget-phones.svg",
    "earbuds-headphones": "/placeholders/categories/earbuds.svg",
    earbuds: "/placeholders/categories/earbuds.svg",
    smartwatches: "/placeholders/categories/smartwatch.svg",
    wearables: "/placeholders/categories/wearables.svg",
    "chargers-cables": "/placeholders/categories/charging.svg",
    chargers: "/placeholders/categories/charging.svg",
    "cases-covers": "/placeholders/categories/cases.svg",
    accessories: "/placeholders/categories/accessories.svg",
  };

  return map[slug] ?? "/placeholders/categories/default.svg";
}

// Choose a product placeholder based on its category.
export function getProductImage(product: Product): string {
  const slug = product.category.slug;

  if (slug === "earbuds" || slug === "earbuds-headphones" || slug.includes("audio")) {
    return "/placeholders/products/earbuds.svg";
  }
  if (slug === "smartwatches" || slug === "wearables") {
    return "/placeholders/products/watch.svg";
  }
  if (slug === "chargers-cables" || slug.includes("charger") || slug.includes("power")) {
    return "/placeholders/products/charger.svg";
  }
  if (slug === "cases-covers" || slug.includes("case")) {
    return "/placeholders/products/case.svg";
  }

  // Default: smartphone silhouette
  return "/placeholders/products/phone.svg";
}

