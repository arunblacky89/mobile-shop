"use client";

import { useState } from "react";
import { getShippingEstimate } from "@/lib/api";

export default function PincodeEta() {
  const [pincode, setPincode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function check() {
    if (!pincode || pincode.length < 5) return;
    setLoading(true);
    try {
      const res = await getShippingEstimate(pincode);
      setMessage(
        `Delivery in ${res.min_days}–${res.max_days} days (by ${new Date(
          res.estimated_date,
        ).toLocaleDateString("en-IN", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })})`,
      );
    } catch {
      setMessage("Delivery estimate currently unavailable.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2 rounded-2xl border border-gray-200 p-4 text-sm dark:border-gray-700">
      <p className="font-semibold text-gray-800 dark:text-gray-100">
        🚚 Check delivery date
      </p>
      <div className="flex gap-2">
        <input
          value={pincode}
          onChange={(e) => {
            setPincode(e.target.value.replace(/\D/g, "").slice(0, 6));
            setMessage(null);
          }}
          placeholder="Enter pincode"
          maxLength={6}
          inputMode="numeric"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
        <button
          type="button"
          onClick={check}
          disabled={loading || pincode.length < 5}
          className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "…" : "Check"}
        </button>
      </div>
      {message && (
        <p className="text-xs text-green-700 dark:text-green-400">{message}</p>
      )}
    </div>
  );
}
