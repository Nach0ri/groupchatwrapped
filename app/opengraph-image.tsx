import { ImageResponse } from "next/og";

export const alt = "Group Chat Wrapped";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "80px",
          color: "white",
          fontFamily: "system-ui, -apple-system, sans-serif",
          background:
            "linear-gradient(135deg, #6366F1 0%, #8B5CF6 35%, #EC4899 70%, #F97316 100%)",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            opacity: 0.7,
            display: "flex",
          }}
        >
          Group Chat
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            fontSize: 280,
            fontWeight: 900,
            letterSpacing: "-0.05em",
            lineHeight: 0.85,
          }}
        >
          Wrapped.
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 36, fontWeight: 700, display: "flex" }}>
            see who's the yapper.
          </div>
          <div style={{ fontSize: 24, opacity: 0.8, display: "flex" }}>
            drop your WhatsApp chat → instant wrapped story.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
