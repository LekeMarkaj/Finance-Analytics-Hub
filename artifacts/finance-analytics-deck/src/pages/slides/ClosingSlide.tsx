export default function ClosingSlide() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{
        backgroundColor: "#FAFBFC",
        fontFamily: "'Inter', sans-serif",
        padding: "4vh 4vw",
        boxSizing: "border-box",
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        gap: "3vh",
        color: "#1E3A5F",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #E2E8F0",
          paddingBottom: "2vh",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
          <div
            style={{ width: "2vw", height: "2vw", backgroundColor: "#0D9488", borderRadius: "0.4vw" }}
          />
          <div style={{ fontSize: "1.2vw", fontWeight: 700, letterSpacing: "0.02em" }}>
            Finance Analytics
          </div>
        </div>
        <div style={{ display: "flex", gap: "2vw", fontSize: "1vw", fontWeight: 500, color: "#64748B" }}>
          <div>GET STARTED</div>
          <div>2026</div>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          gap: "4vh",
        }}
      >
        <div
          style={{
            width: "7vw",
            height: "7vw",
            backgroundColor: "rgba(13,148,136,0.08)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "3.5vw",
              height: "3.5vw",
              backgroundColor: "#0D9488",
              borderRadius: "0.7vw",
            }}
          />
        </div>

        <div>
          <h1
            style={{
              fontSize: "5.5vw",
              fontWeight: 800,
              margin: "0 0 2vh 0",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              textWrap: "balance",
            }}
          >
            Finance Analytics is live
          </h1>
          <p
            style={{
              fontSize: "1.5vw",
              color: "#475569",
              margin: 0,
              lineHeight: 1.5,
              maxWidth: "44vw",
              textWrap: "pretty",
            }}
          >
            Free plan — no credit card required. Upgrade whenever you need more reports.
          </p>
        </div>

        {/* Contact card */}
        <div
          style={{
            background: "#FFFFFF",
            padding: "3.5vh 5vw",
            borderRadius: "1.2vw",
            border: "1px solid #E2E8F0",
            boxShadow: "0 2px 12px rgba(30,58,95,0.06)",
            display: "flex",
            gap: "5vw",
            alignItems: "center",
          }}
        >
          <div style={{ textAlign: "left" }}>
            <div
              style={{
                fontSize: "0.85vw",
                fontWeight: 700,
                color: "#64748B",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "0.8vh",
              }}
            >
              Product
            </div>
            <div style={{ fontSize: "1.3vw", fontWeight: 700, color: "#1E3A5F" }}>
              financeanalytics.replit.app
            </div>
          </div>

          <div style={{ width: "1px", height: "6vh", backgroundColor: "#E2E8F0" }} />

          <div style={{ textAlign: "left" }}>
            <div
              style={{
                fontSize: "0.85vw",
                fontWeight: 700,
                color: "#64748B",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "0.8vh",
              }}
            >
              Contact
            </div>
            <div style={{ fontSize: "1.3vw", fontWeight: 700, color: "#1E3A5F" }}>
              markaj.leka@gmail.com
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid #E2E8F0",
          paddingTop: "1.5vh",
          fontSize: "0.85vw",
          color: "#94A3B8",
          fontWeight: 500,
        }}
      >
        <div>Finance Analytics</div>
        <div style={{ display: "flex", gap: "1vw" }}>
          <span>Confidential</span>
          <span>•</span>
          <span>Slide 6 of 6</span>
        </div>
      </div>
    </div>
  );
}
