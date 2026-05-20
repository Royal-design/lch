import { ImageResponse } from "next/og"

export const size = {
  width: 32,
  height: 32,
}

export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#075f3f",
          borderRadius: "8px",
          color: "#ffffff",
          display: "flex",
          fontSize: 12,
          fontWeight: 900,
          height: "100%",
          justifyContent: "center",
          letterSpacing: "-0.02em",
          width: "100%",
        }}
      >
        LCH
      </div>
    ),
    size
  )
}
