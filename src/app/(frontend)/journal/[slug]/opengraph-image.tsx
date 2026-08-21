import { ImageResponse } from "next/og";

import { getJournalPostBySlug } from "@/lib/data";

export const alt = "Verboten Spirits journal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getJournalPostBySlug(slug);

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
        <div style={{ color: "#cdb88d", fontSize: 26, letterSpacing: 8 }}>
          THE VERBOTEN JOURNAL
        </div>
        <div
          style={{
            color: "#f5f1e6",
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.15,
            maxWidth: 1000,
          }}
        >
          {post?.title ?? "Notes from the house"}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              width: 52,
              height: 52,
              borderRadius: 999,
              border: "2px solid #cdb88d",
              alignItems: "center",
              justifyContent: "center",
              color: "#cdb88d",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            V
          </div>
          <div style={{ color: "#f5f1e6", fontSize: 28, letterSpacing: 6, fontWeight: 700 }}>
            VERBOTEN
          </div>
        </div>
      </div>
    ),
    size,
  );
}
