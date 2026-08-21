import { ImageResponse } from "next/og";

export const alt = "Verboten Spirits, premium South African brandy";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default branded OG card (replaces the old site's SVG-icon og:image). */
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#141414",
          border: "24px solid #1b1b19",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 110,
            height: 110,
            borderRadius: 999,
            border: "3px solid #cdb88d",
            alignItems: "center",
            justifyContent: "center",
            color: "#cdb88d",
            fontSize: 64,
            fontWeight: 700,
            marginBottom: 42,
          }}
        >
          V
        </div>
        <div
          style={{
            color: "#f5f1e6",
            fontSize: 92,
            fontWeight: 700,
            letterSpacing: 10,
          }}
        >
          VERBOTEN
        </div>
        <div
          style={{
            marginTop: 22,
            color: "#cdb88d",
            fontSize: 30,
            letterSpacing: 8,
          }}
        >
          PREMIUM SOUTH AFRICAN BRANDY
        </div>
        <div
          style={{
            marginTop: 44,
            color: "#8a784f",
            fontSize: 22,
            letterSpacing: 6,
          }}
        >
          VIR DIÉ WAT WEET
        </div>
      </div>
    ),
    size,
  );
}
