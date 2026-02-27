import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCart, type Cart } from "@/lib/api";
import { getCartSession } from "@/lib/cartClient";

function formatPrice(value: number | string) {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(n)) return "₹0";
  return "₹" + n.toLocaleString("en-IN");
}

export default async function CartPage() {
  const cartSession = await getCartSession();

  let cart: Cart = { id: "", item_count: 0, subtotal: "0.00", items: [] };
  try {
    if (cartSession) {
      cart = await getCart(cartSession);
    }
  } catch {
    // Backend API unavailable — show empty cart
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
          Shopping Cart
        </h1>

        {cart.items.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 text-center dark:border-gray-800">
            <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
              Your cart is empty
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Browse the latest mobiles and accessories.
            </p>
            <Link
              href="/shop"
              className="mt-4 inline-flex rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <section className="space-y-4">
              {cart.items.map((item) => {
                const v = item.product_variant;
                const attrs =
                  typeof v.attributes === "object" && v.attributes
                    ? Object.entries(v.attributes)
                        .map(([k, val]) => `${k}: ${String(val)}`)
                        .join(" • ")
                    : v.sku;
                return (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
                  >
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500">
                        {v.sku}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                        {attrs}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatPrice(item.price_snapshot)}
                      </p>
                      {item.mrp_snapshot &&
                        parseFloat(String(item.mrp_snapshot)) >
                          parseFloat(String(item.price_snapshot)) && (
                          <p className="text-xs text-gray-400 line-through">
                            {formatPrice(item.mrp_snapshot)}
                          </p>
                        )}
                    </div>
                  </div>
                );
              })}
            </section>

            <aside className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                Order summary
              </h2>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Items ({cart.item_count})
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatPrice(cart.subtotal)}
                </span>
              </div>
              <Link
                href="/checkout"
                className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
              >
                Proceed to Checkout
              </Link>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Shipping address required at checkout.
              </p>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

