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
          backgroundColor: "#0b0a08",
          border: "24px solid #14120e",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 110,
            height: 110,
            borderRadius: 999,
            border: "3px solid #c9a227",
            alignItems: "center",
            justifyContent: "center",
            color: "#c9a227",
            fontSize: 64,
            fontWeight: 700,
            marginBottom: 42,
          }}
        >
          V
        </div>
        <div
          style={{
            color: "#efe9db",
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
            color: "#c9a227",
            fontSize: 30,
            letterSpacing: 8,
          }}
        >
          PREMIUM SOUTH AFRICAN BRANDY
        </div>
        <div
          style={{
            marginTop: 44,
            color: "#8a6d1f",
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
