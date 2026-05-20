import { ImageResponse } from "next/og"

export const alt = "Leenah Contribution Home secure fintech dashboard"
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#f8fafc",
          color: "#0f172a",
          display: "flex",
          height: "100%",
          padding: "72px",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ alignItems: "center", display: "flex", gap: "20px" }}>
            <div
              style={{
                alignItems: "center",
                background: "#075f3f",
                borderRadius: "24px",
                color: "#ffffff",
                display: "flex",
                fontSize: 36,
                fontWeight: 900,
                height: "96px",
                justifyContent: "center",
                width: "96px",
              }}
            >
              LCH
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ color: "#075f3f", fontSize: 28, fontWeight: 800 }}>
                Leenah Contribution Home
              </div>
              <div style={{ color: "#475569", fontSize: 22 }}>
                Secure ajo and group savings
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div
              style={{
                fontSize: 72,
                fontWeight: 900,
                letterSpacing: "-0.04em",
                lineHeight: 1,
                maxWidth: "880px",
              }}
            >
              Save, contribute, and track your money with confidence.
            </div>
            <div
              style={{
                color: "#475569",
                fontSize: 30,
                lineHeight: 1.35,
                maxWidth: "860px",
              }}
            >
              Manage contribution plans, locked savings, wallets, and transparent
              transaction records in one fintech workspace.
            </div>
          </div>

          <div style={{ display: "flex", gap: "18px" }}>
            {["Ajo groups", "Locked savings", "Wallet tracking"].map((item) => (
              <div
                key={item}
                style={{
                  background: "#ffffff",
                  border: "1px solid #dbe5df",
                  borderRadius: "16px",
                  color: "#075f3f",
                  fontSize: 24,
                  fontWeight: 800,
                  padding: "18px 24px",
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size
  )
}
