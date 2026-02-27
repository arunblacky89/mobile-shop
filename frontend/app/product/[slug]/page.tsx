import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PincodeEta from "@/components/PincodeEta";
import { getProduct, type ProductDetail, type ProductVariant, addCartItem } from "@/lib/api";
import { getOrCreateCartSession } from "@/lib/cartClient";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function formatPrice(value: number | string) {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return "₹" + n.toLocaleString("en-IN");
}

function bestVariant(variants: ProductVariant[] | undefined): ProductVariant | null {
  if (!variants || variants.length === 0) return null;
  return variants[0];
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  let product: ProductDetail;
  try {
    product = await getProduct(slug);
  } catch {
    notFound();
  }

  const primaryVariant = bestVariant(product.variants);
  const primaryImage =
    product.images.sort((a, b) => a.sort_order - b.sort_order)[0] ?? null;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/shop" className="hover:text-blue-600">
            Shop
          </Link>
          <span className="mx-1">/</span>
          <span>{product.title}</span>
        </div>

        <div className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          {/* Gallery */}
          <section>
            <div className="relative h-80 overflow-hidden rounded-2xl bg-gray-100 shadow-sm dark:bg-gray-800 md:h-96">
              {primaryImage ? (
                <Image
                  src={primaryImage.image_url}
                  alt={product.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center text-8xl">
                  📱
                </div>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img) => (
                  <div
                    key={img.id}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                  >
                    <Image
                      src={img.image_url}
                      alt={product.title}
                      fill
                      className="object-contain"
                      sizes="80px"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Details */}
          <section className="space-y-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
                {product.brand.name}
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {product.title}
              </h1>
              <p className="mt-1 text-xs text-gray-500">
                {product.category.name}
              </p>
            </div>

            {/* Pricing */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
              {primaryVariant ? (() => {
                const price = typeof primaryVariant.price === "string" ? parseFloat(primaryVariant.price) : primaryVariant.price;
                const mrp = primaryVariant.mrp != null ? (typeof primaryVariant.mrp === "string" ? parseFloat(primaryVariant.mrp) : primaryVariant.mrp) : null;
                const discount = mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

                return (
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(price)}
                    </span>
                    {discount > 0 && mrp != null && (
                      <>
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(mrp)}
                        </span>
                        <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                          {discount}% OFF
                        </span>
                      </>
                    )}
                  </div>
                );
              })() : (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Price will be available soon
                </span>
              )}

              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Inclusive of all taxes. Free delivery on eligible orders.
              </p>
            </div>

            {/* Delivery estimate */}
            <PincodeEta />

            {/* Variant picker (simple for now) */}
            {product.variants.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Available variants
                </h2>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const label =
                      typeof v.attributes === "object" && v.attributes
                        ? Object.entries(v.attributes)
                            .map(([k, val]) => `${k}: ${String(val)}`)
                            .join(" • ")
                        : v.sku;
                    const isPrimary = primaryVariant?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        className={`rounded-full border px-3 py-1 text-xs transition ${
                          isPrimary
                            ? "border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/40 dark:text-blue-50"
                            : "border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 dark:border-gray-700 dark:text-gray-300"
                        }`}
                        disabled
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400">
                  Variant selection UI is read-only for now; cart integration is
                  coming next.
                </p>
              </div>
            )}

            {/* Actions */}
            <form
              className="flex flex-col gap-3 sm:flex-row"
              action={async () => {
                "use server";
                if (!primaryVariant) return;
                const session = await getOrCreateCartSession();
                await addCartItem({
                  product_variant_id: primaryVariant.id,
                  quantity: 1,
                  cartSession: session,
                });
                revalidatePath("/cart");
                redirect("/cart");
              }}
            >
              <button
                type="submit"
                className="inline-flex flex-1 items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-700"
                disabled={!primaryVariant || primaryVariant.stock_qty <= 0}
              >
                {primaryVariant && primaryVariant.stock_qty > 0
                  ? "Add to Cart"
                  : "Out of Stock"}
              </button>
              <button
                type="button"
                className="inline-flex flex-1 items-center justify-center rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-800 transition hover:border-blue-500 hover:text-blue-600 dark:border-gray-700 dark:text-gray-200"
              >
                Buy Now (coming soon)
              </button>
            </form>

            {/* Description */}
            {product.description && (
              <div className="prose prose-sm max-w-none text-gray-700 dark:prose-invert dark:text-gray-200">
                <h2>Product description</h2>
                <p>{product.description}</p>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

