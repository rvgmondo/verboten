import { ImageResponse } from "next/og";

import { getProductBySlug } from "@/lib/data";
import { formatZAR } from "@/lib/money";

export const alt = "Verboten Spirits product";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Per-product branded OG card with live name and price. */
export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#141414",
          border: "24px solid #1b1b19",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              display: "flex",
              width: 64,
              height: 64,
              borderRadius: 999,
              border: "2px solid #cdb88d",
              alignItems: "center",
              justifyContent: "center",
              color: "#cdb88d",
              fontSize: 36,
              fontWeight: 700,
            }}
          >
            V
          </div>
          <div style={{ color: "#f5f1e6", fontSize: 34, letterSpacing: 8, fontWeight: 700 }}>
            VERBOTEN
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "#f5f1e6",
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.1,
              maxWidth: 980,
            }}
          >
            {product?.name ?? "Verboten Spirits"}
          </div>
          {product && (
            <div style={{ marginTop: 28, color: "#cdb88d", fontSize: 44, fontWeight: 700 }}>
              {formatZAR(product.priceCents)}
            </div>
          )}
        </div>
        <div style={{ color: "#8a784f", fontSize: 22, letterSpacing: 4 }}>
          Drink responsibly. Not for sale to persons under 18.
        </div>
      </div>
    ),
    size,
  );
}
