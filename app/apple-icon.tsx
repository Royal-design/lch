import { ImageResponse } from "next/og"

export const size = {
  width: 180,
  height: 180,
}

export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(135deg, #075f3f 0%, #0f8f63 100%)",
          color: "#ffffff",
          display: "flex",
          fontSize: 58,
          fontWeight: 900,
          height: "100%",
          justifyContent: "center",
          letterSpacing: "-0.04em",
          width: "100%",
        }}
      >
        LCH
      </div>
    ),
    size
  )
}
