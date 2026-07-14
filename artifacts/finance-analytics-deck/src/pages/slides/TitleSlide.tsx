export default function TitleSlide() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{
        backgroundColor: "#FAFBFC",
        fontFamily: "'Inter', sans-serif",
        padding: "4vh 4vw",
        boxSizing: "border-box",
        display: "grid",
        gridTemplateColumns: "3fr 2fr",
        gridTemplateRows: "auto 1fr auto",
        gap: "3vh 4vw",
        color: "#1E3A5F",
      }}
    >
      {/* Header */}
      <div
        style={{
          gridColumn: "1 / -1",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #E2E8F0",
          paddingBottom: "2vh",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
          <div
            style={{
              width: "2vw",
              height: "2vw",
              backgroundColor: "#0D9488",
              borderRadius: "0.4vw",
            }}
          />
          <div style={{ fontSize: "1.2vw", fontWeight: 700, letterSpacing: "0.02em" }}>
            Finance Analytics
          </div>
        </div>
        <div style={{ display: "flex", gap: "2vw", fontSize: "1vw", fontWeight: 500, color: "#64748B" }}>
          <div>PRODUCT OVERVIEW</div>
          <div>2026</div>
        </div>
      </div>

      {/* Main Content Left */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div
          style={{
            fontSize: "1.1vw",
            fontWeight: 600,
            color: "#0D9488",
            marginBottom: "1.5vh",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Financial SaaS for Healthcare
        </div>
        <h1
          style={{
            fontSize: "4.8vw",
            fontWeight: 800,
            margin: "0 0 2vh 0",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            textWrap: "balance",
          }}
        >
          Finance Analytics Dashboard
        </h1>
        <p
          style={{
            fontSize: "1.4vw",
            fontWeight: 400,
            color: "#475569",
            margin: "0 0 4vh 0",
            lineHeight: 1.5,
            maxWidth: "36vw",
            textWrap: "pretty",
          }}
        >
          Secure, personalised financial insights for hospital departments and finance teams.
        </p>

        {/* KPI Cards */}
        <div style={{ display: "flex", gap: "2vw" }}>
          <div
            style={{
              background: "#FFFFFF",
              padding: "2.5vh 2vw",
              borderRadius: "1vw",
              border: "1px solid #E2E8F0",
              flex: 1,
              boxShadow: "0 2px 12px rgba(30,58,95,0.06)",
            }}
          >
            <div
              style={{
                fontSize: "0.85vw",
                fontWeight: 600,
                color: "#64748B",
                marginBottom: "1vh",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Available Plans
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "1vw" }}>
              <div style={{ fontSize: "3.2vw", fontWeight: 700, color: "#1E3A5F" }}>3</div>
              <div
                style={{
                  fontSize: "0.9vw",
                  fontWeight: 600,
                  color: "#0D9488",
                  backgroundColor: "rgba(13,148,136,0.1)",
                  padding: "0.4vh 0.8vw",
                  borderRadius: "2vw",
                }}
              >
                Free to Pro
              </div>
            </div>
          </div>

          <div
            style={{
              background: "#FFFFFF",
              padding: "2.5vh 2vw",
              borderRadius: "1vw",
              border: "1px solid #E2E8F0",
              flex: 1,
              boxShadow: "0 2px 12px rgba(30,58,95,0.06)",
            }}
          >
            <div
              style={{
                fontSize: "0.85vw",
                fontWeight: 600,
                color: "#64748B",
                marginBottom: "1vh",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Reports / Month
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "1vw" }}>
              <div style={{ fontSize: "3.2vw", fontWeight: 700, color: "#1E3A5F" }}>50</div>
              <div
                style={{
                  fontSize: "0.9vw",
                  fontWeight: 600,
                  color: "#0D9488",
                  backgroundColor: "rgba(13,148,136,0.1)",
                  padding: "0.4vh 0.8vw",
                  borderRadius: "2vw",
                }}
              >
                Pro plan
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Right */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div
          style={{
            background: "#FFFFFF",
            padding: "3vh 2.5vw",
            borderRadius: "1vw",
            border: "1px solid #E2E8F0",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxSizing: "border-box",
            boxShadow: "0 2px 12px rgba(30,58,95,0.06)",
          }}
        >
          <div style={{ fontSize: "1.1vw", fontWeight: 600, color: "#1E3A5F" }}>
            Core Capabilities
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "2.5vh", marginTop: "2vh" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1.2vw" }}>
              <div
                style={{
                  width: "0.5vw",
                  height: "0.5vw",
                  borderRadius: "50%",
                  backgroundColor: "#0D9488",
                  flexShrink: 0,
                }}
              />
              <div style={{ fontSize: "1.1vw", color: "#1E3A5F", fontWeight: 500 }}>
                PDF upload and AI-powered extraction
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1.2vw" }}>
              <div
                style={{
                  width: "0.5vw",
                  height: "0.5vw",
                  borderRadius: "50%",
                  backgroundColor: "#0D9488",
                  flexShrink: 0,
                }}
              />
              <div style={{ fontSize: "1.1vw", color: "#1E3A5F", fontWeight: 500 }}>
                Charts, trends and period comparisons
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1.2vw" }}>
              <div
                style={{
                  width: "0.5vw",
                  height: "0.5vw",
                  borderRadius: "50%",
                  backgroundColor: "#0D9488",
                  flexShrink: 0,
                }}
              />
              <div style={{ fontSize: "1.1vw", color: "#1E3A5F", fontWeight: 500 }}>
                Shared report links — read-only, public
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1.2vw" }}>
              <div
                style={{
                  width: "0.5vw",
                  height: "0.5vw",
                  borderRadius: "50%",
                  backgroundColor: "#0D9488",
                  flexShrink: 0,
                }}
              />
              <div style={{ fontSize: "1.1vw", color: "#1E3A5F", fontWeight: 500 }}>
                Role-based access and team management
              </div>
            </div>
          </div>

          {/* Bar chart decoration */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "1vw",
              height: "14vh",
              marginTop: "3vh",
              borderBottom: "2px solid #E2E8F0",
              paddingBottom: "1vh",
            }}
          >
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.8vh" }}>
              <div
                style={{
                  width: "100%",
                  height: "6vh",
                  backgroundColor: "rgba(13,148,136,0.2)",
                  borderRadius: "0.4vw 0.4vw 0 0",
                }}
              />
              <div style={{ fontSize: "0.8vw", color: "#64748B", fontWeight: 500 }}>Q1</div>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.8vh" }}>
              <div
                style={{
                  width: "100%",
                  height: "9vh",
                  backgroundColor: "rgba(13,148,136,0.4)",
                  borderRadius: "0.4vw 0.4vw 0 0",
                }}
              />
              <div style={{ fontSize: "0.8vw", color: "#64748B", fontWeight: 500 }}>Q2</div>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.8vh" }}>
              <div
                style={{
                  width: "100%",
                  height: "11vh",
                  backgroundColor: "rgba(13,148,136,0.65)",
                  borderRadius: "0.4vw 0.4vw 0 0",
                }}
              />
              <div style={{ fontSize: "0.8vw", color: "#64748B", fontWeight: 500 }}>Q3</div>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.8vh" }}>
              <div
                style={{
                  width: "100%",
                  height: "13vh",
                  backgroundColor: "#0D9488",
                  borderRadius: "0.4vw 0.4vw 0 0",
                }}
              />
              <div style={{ fontSize: "0.8vw", color: "#64748B", fontWeight: 500 }}>Q4</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          gridColumn: "1 / -1",
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
          <span>Slide 1 of 6</span>
        </div>
      </div>
    </div>
  );
}
