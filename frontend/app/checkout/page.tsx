import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCart, checkout, type Cart } from "@/lib/api";
import { getCartSession, getOrCreateCartSession } from "@/lib/cartClient";

function formatPrice(value: number | string) {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(n)) return "₹0";
  return "₹" + n.toLocaleString("en-IN");
}

export default async function CheckoutPage() {
  const cartSession = await getCartSession();

  let cart: Cart = { id: "", item_count: 0, subtotal: "0.00", items: [] };
  try {
    if (cartSession) {
      cart = await getCart(cartSession);
    }
  } catch {
    // Backend API unavailable — treat as empty cart
  }

  // Redirect to cart if empty
  if (cart.items.length === 0) {
    redirect("/cart");
  }

  async function handleCheckout(formData: FormData) {
    "use server";

    const session = await getOrCreateCartSession();

    const address = {
      full_name: formData.get("full_name") as string,
      line1: formData.get("line1") as string,
      line2: (formData.get("line2") as string) || "",
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      postal_code: formData.get("postal_code") as string,
      country: (formData.get("country") as string) || "IN",
      phone: (formData.get("phone") as string) || "",
    };

    const order = await checkout({ address, cartSession: session });

    revalidatePath("/cart");
    revalidatePath("/checkout");
    redirect(`/order/${order.id}`);
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/cart" className="hover:text-blue-600">
            Cart
          </Link>
          <span className="mx-1">/</span>
          <span>Checkout</span>
        </div>

        <h1 className="mb-8 text-2xl font-semibold text-gray-900 dark:text-white">
          Checkout
        </h1>

        <form
          action={handleCheckout}
          className="grid gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]"
        >
          {/* ─── Shipping Address Form ─── */}
          <section className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Shipping Address
            </h2>

            <div>
              <label
                htmlFor="full_name"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Full Name *
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholder="9876543210"
              />
            </div>

            <div>
              <label
                htmlFor="line1"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Address Line 1 *
              </label>
              <input
                id="line1"
                name="line1"
                type="text"
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholder="123 MG Road, Apt 4B"
              />
            </div>

            <div>
              <label
                htmlFor="line2"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Address Line 2
              </label>
              <input
                id="line2"
                name="line2"
                type="text"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholder="Landmark, Floor"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="city"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  City *
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="Chennai"
                />
              </div>
              <div>
                <label
                  htmlFor="state"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  State *
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="Tamil Nadu"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="postal_code"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  PIN Code *
                </label>
                <input
                  id="postal_code"
                  name="postal_code"
                  type="text"
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="600001"
                />
              </div>
              <div>
                <label
                  htmlFor="country"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Country
                </label>
                <input
                  id="country"
                  name="country"
                  type="text"
                  defaultValue="IN"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          </section>

          {/* ─── Order Summary Sidebar ─── */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-900">
              <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-100">
                Order Summary
              </h2>

              <div className="space-y-3">
                {cart.items.map((item) => {
                  const v = item.product_variant;
                  const attrs =
                    typeof v.attributes === "object" && v.attributes
                      ? Object.entries(v.attributes)
                          .map(([k, val]) => `${k}: ${String(val)}`)
                          .join(" • ")
                      : v.sku;
                  return (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div className="flex-1">
                        <p className="text-gray-700 dark:text-gray-200">
                          {attrs}
                        </p>
                        <p className="text-xs text-gray-400">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatPrice(item.price_snapshot)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <hr className="my-4 border-gray-200 dark:border-gray-700" />

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Subtotal ({cart.item_count} items)
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatPrice(cart.subtotal)}
                </span>
              </div>

              <button
                type="submit"
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
              >
                Place Order
              </button>

              <p className="mt-3 text-center text-xs text-gray-400">
                Payment integration coming soon. Orders are placed as &quot;Pending
                Payment&quot;.
              </p>
            </div>
          </aside>
        </form>
      </main>

      <Footer />
    </div>
  );
}
