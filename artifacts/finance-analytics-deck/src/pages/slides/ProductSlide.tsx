export default function ProductSlide() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{
        backgroundColor: "#FAFBFC",
        fontFamily: "'Inter', sans-serif",
        padding: "4vh 4vw",
        boxSizing: "border-box",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
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
            style={{ width: "2vw", height: "2vw", backgroundColor: "#0D9488", borderRadius: "0.4vw" }}
          />
          <div style={{ fontSize: "1.2vw", fontWeight: 700, letterSpacing: "0.02em" }}>
            Finance Analytics
          </div>
        </div>
        <div style={{ display: "flex", gap: "2vw", fontSize: "1vw", fontWeight: 500, color: "#64748B" }}>
          <div>THE PRODUCT</div>
          <div>2026</div>
        </div>
      </div>

      {/* Left — numbered capabilities */}
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
          Four Core Capabilities
        </div>
        <h2
          style={{
            fontSize: "3.6vw",
            fontWeight: 800,
            margin: "0 0 3vh 0",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          Built for finance teams
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "2vh" }}>
          <div
            style={{
              display: "flex",
              gap: "1.5vw",
              alignItems: "flex-start",
              background: "#FFFFFF",
              padding: "2vh 1.8vw",
              borderRadius: "0.8vw",
              border: "1px solid #E2E8F0",
              boxShadow: "0 2px 8px rgba(30,58,95,0.05)",
            }}
          >
            <div
              style={{
                fontSize: "1.1vw",
                fontWeight: 700,
                color: "#0D9488",
                backgroundColor: "rgba(13,148,136,0.1)",
                width: "2.8vw",
                height: "2.8vw",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                flexShrink: 0,
              }}
            >
              1
            </div>
            <div>
              <div style={{ fontSize: "1.1vw", fontWeight: 700, color: "#1E3A5F", marginBottom: "0.4vh" }}>
                PDF Upload
              </div>
              <div style={{ fontSize: "0.95vw", color: "#64748B", lineHeight: 1.4 }}>
                Drag-and-drop ingestion with AI-powered data extraction
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "1.5vw",
              alignItems: "flex-start",
              background: "#FFFFFF",
              padding: "2vh 1.8vw",
              borderRadius: "0.8vw",
              border: "1px solid #E2E8F0",
              boxShadow: "0 2px 8px rgba(30,58,95,0.05)",
            }}
          >
            <div
              style={{
                fontSize: "1.1vw",
                fontWeight: 700,
                color: "#0D9488",
                backgroundColor: "rgba(13,148,136,0.1)",
                width: "2.8vw",
                height: "2.8vw",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                flexShrink: 0,
              }}
            >
              2
            </div>
            <div>
              <div style={{ fontSize: "1.1vw", fontWeight: 700, color: "#1E3A5F", marginBottom: "0.4vh" }}>
                Report Analysis
              </div>
              <div style={{ fontSize: "0.95vw", color: "#64748B", lineHeight: 1.4 }}>
                Charts, trends and period-over-period comparisons
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "1.5vw",
              alignItems: "flex-start",
              background: "#FFFFFF",
              padding: "2vh 1.8vw",
              borderRadius: "0.8vw",
              border: "1px solid #E2E8F0",
              boxShadow: "0 2px 8px rgba(30,58,95,0.05)",
            }}
          >
            <div
              style={{
                fontSize: "1.1vw",
                fontWeight: 700,
                color: "#0D9488",
                backgroundColor: "rgba(13,148,136,0.1)",
                width: "2.8vw",
                height: "2.8vw",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                flexShrink: 0,
              }}
            >
              3
            </div>
            <div>
              <div style={{ fontSize: "1.1vw", fontWeight: 700, color: "#1E3A5F", marginBottom: "0.4vh" }}>
                Shared Reports
              </div>
              <div style={{ fontSize: "0.95vw", color: "#64748B", lineHeight: 1.4 }}>
                Public read-only links per report — no login required
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "1.5vw",
              alignItems: "flex-start",
              background: "#FFFFFF",
              padding: "2vh 1.8vw",
              borderRadius: "0.8vw",
              border: "1px solid #E2E8F0",
              boxShadow: "0 2px 8px rgba(30,58,95,0.05)",
            }}
          >
            <div
              style={{
                fontSize: "1.1vw",
                fontWeight: 700,
                color: "#0D9488",
                backgroundColor: "rgba(13,148,136,0.1)",
                width: "2.8vw",
                height: "2.8vw",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                flexShrink: 0,
              }}
            >
              4
            </div>
            <div>
              <div style={{ fontSize: "1.1vw", fontWeight: 700, color: "#1E3A5F", marginBottom: "0.4vh" }}>
                Multi-User
              </div>
              <div style={{ fontSize: "0.95vw", color: "#64748B", lineHeight: 1.4 }}>
                Admin invites team members with role-based access limits
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right — summary panel */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div
          style={{
            background: "#1E3A5F",
            padding: "4vh 3vw",
            borderRadius: "1.2vw",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            boxSizing: "border-box",
            gap: "3.5vh",
          }}
        >
          <div style={{ fontSize: "1.1vw", fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Who it's for
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "2.5vh" }}>
            <div
              style={{
                borderLeft: "3px solid #0D9488",
                paddingLeft: "1.5vw",
              }}
            >
              <div style={{ fontSize: "1.2vw", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.5vh" }}>
                Hospital Finance Teams
              </div>
              <div style={{ fontSize: "1vw", color: "rgba(255,255,255,0.65)", lineHeight: 1.4 }}>
                Centralise multi-department reporting in one secure dashboard
              </div>
            </div>

            <div
              style={{
                borderLeft: "3px solid #0D9488",
                paddingLeft: "1.5vw",
              }}
            >
              <div style={{ fontSize: "1.2vw", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.5vh" }}>
                Finance Directors
              </div>
              <div style={{ fontSize: "1vw", color: "rgba(255,255,255,0.65)", lineHeight: 1.4 }}>
                Share read-only views with stakeholders without exporting files
              </div>
            </div>

            <div
              style={{
                borderLeft: "3px solid #0D9488",
                paddingLeft: "1.5vw",
              }}
            >
              <div style={{ fontSize: "1.2vw", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.5vh" }}>
                Department Heads
              </div>
              <div style={{ fontSize: "1vw", color: "rgba(255,255,255,0.65)", lineHeight: 1.4 }}>
                Upload monthly PDFs and see trends surfaced automatically
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: "auto",
              paddingTop: "2.5vh",
              borderTop: "1px solid rgba(255,255,255,0.12)",
              fontSize: "1vw",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            Deployed at financeanalytics.replit.app
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
          <span>Slide 3 of 6</span>
        </div>
      </div>
    </div>
  );
}
