export default function PricingSlide() {
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
          <div>PRICING</div>
          <div>2026</div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ textAlign: "center", marginBottom: "3.5vh" }}>
          <div
            style={{
              fontSize: "1.1vw",
              fontWeight: 600,
              color: "#0D9488",
              marginBottom: "1vh",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Simple, transparent pricing
          </div>
          <h2
            style={{
              fontSize: "3.8vw",
              fontWeight: 800,
              margin: "0 0 1vh 0",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            Start free. Scale when ready.
          </h2>
          <p style={{ fontSize: "1.2vw", color: "#64748B", margin: 0 }}>
            Monthly or yearly billing — save 17% on annual plans.
          </p>
        </div>

        {/* Three tier cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2vw" }}>
          {/* Free */}
          <div
            style={{
              background: "#FFFFFF",
              padding: "3.5vh 2.5vw",
              borderRadius: "1.2vw",
              border: "1px solid #E2E8F0",
              boxShadow: "0 2px 12px rgba(30,58,95,0.06)",
              display: "flex",
              flexDirection: "column",
              gap: "2vh",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.85vw",
                  fontWeight: 700,
                  color: "#64748B",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "1vh",
                }}
              >
                Free
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.5vw" }}>
                <span style={{ fontSize: "3.5vw", fontWeight: 800, color: "#1E3A5F" }}>€0</span>
                <span style={{ fontSize: "1vw", color: "#64748B" }}>/ month</span>
              </div>
            </div>
            <div
              style={{
                borderTop: "1px solid #E2E8F0",
                paddingTop: "2vh",
                display: "flex",
                flexDirection: "column",
                gap: "1.2vh",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
                <div
                  style={{
                    width: "0.5vw",
                    height: "0.5vw",
                    borderRadius: "50%",
                    backgroundColor: "#0D9488",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: "1vw", color: "#475569" }}>1 report creation/mo</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
                <div
                  style={{
                    width: "0.5vw",
                    height: "0.5vw",
                    borderRadius: "50%",
                    backgroundColor: "#0D9488",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: "1vw", color: "#475569" }}>1 PDF upload/mo</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
                <div
                  style={{
                    width: "0.5vw",
                    height: "0.5vw",
                    borderRadius: "50%",
                    backgroundColor: "#0D9488",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: "1vw", color: "#475569" }}>No credit card required</span>
              </div>
            </div>
          </div>

          {/* Basic — highlighted */}
          <div
            style={{
              background: "#FFFFFF",
              padding: "3.5vh 2.5vw",
              borderRadius: "1.2vw",
              border: "2px solid #0D9488",
              boxShadow: "0 4px 24px rgba(13,148,136,0.15)",
              display: "flex",
              flexDirection: "column",
              gap: "2vh",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-1.5vh",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "#0D9488",
                color: "#FFFFFF",
                fontSize: "0.75vw",
                fontWeight: 700,
                padding: "0.4vh 1.2vw",
                borderRadius: "2vw",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                whiteSpace: "nowrap",
              }}
            >
              Most popular
            </div>
            <div>
              <div
                style={{
                  fontSize: "0.85vw",
                  fontWeight: 700,
                  color: "#0D9488",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "1vh",
                }}
              >
                Basic
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.5vw" }}>
                <span style={{ fontSize: "3.5vw", fontWeight: 800, color: "#1E3A5F" }}>€10</span>
                <span style={{ fontSize: "1vw", color: "#64748B" }}>/ month</span>
              </div>
              <div style={{ fontSize: "0.9vw", color: "#64748B", marginTop: "0.5vh" }}>
                or €100/yr — save 17%
              </div>
            </div>
            <div
              style={{
                borderTop: "1px solid #E2E8F0",
                paddingTop: "2vh",
                display: "flex",
                flexDirection: "column",
                gap: "1.2vh",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
                <div
                  style={{
                    width: "0.5vw",
                    height: "0.5vw",
                    borderRadius: "50%",
                    backgroundColor: "#0D9488",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: "1vw", color: "#475569" }}>15 report creations/mo</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
                <div
                  style={{
                    width: "0.5vw",
                    height: "0.5vw",
                    borderRadius: "50%",
                    backgroundColor: "#0D9488",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: "1vw", color: "#475569" }}>15 PDF uploads/mo</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
                <div
                  style={{
                    width: "0.5vw",
                    height: "0.5vw",
                    borderRadius: "50%",
                    backgroundColor: "#0D9488",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: "1vw", color: "#475569" }}>Shared report links</span>
              </div>
            </div>
          </div>

          {/* Pro */}
          <div
            style={{
              background: "#FFFFFF",
              padding: "3.5vh 2.5vw",
              borderRadius: "1.2vw",
              border: "1px solid #E2E8F0",
              boxShadow: "0 2px 12px rgba(30,58,95,0.06)",
              display: "flex",
              flexDirection: "column",
              gap: "2vh",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.85vw",
                  fontWeight: 700,
                  color: "#64748B",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "1vh",
                }}
              >
                Pro
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.5vw" }}>
                <span style={{ fontSize: "3.5vw", fontWeight: 800, color: "#1E3A5F" }}>€20</span>
                <span style={{ fontSize: "1vw", color: "#64748B" }}>/ month</span>
              </div>
              <div style={{ fontSize: "0.9vw", color: "#64748B", marginTop: "0.5vh" }}>
                or €200/yr — save 17%
              </div>
            </div>
            <div
              style={{
                borderTop: "1px solid #E2E8F0",
                paddingTop: "2vh",
                display: "flex",
                flexDirection: "column",
                gap: "1.2vh",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
                <div
                  style={{
                    width: "0.5vw",
                    height: "0.5vw",
                    borderRadius: "50%",
                    backgroundColor: "#0D9488",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: "1vw", color: "#475569" }}>50 report creations/mo</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
                <div
                  style={{
                    width: "0.5vw",
                    height: "0.5vw",
                    borderRadius: "50%",
                    backgroundColor: "#0D9488",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: "1vw", color: "#475569" }}>50 PDF uploads/mo</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
                <div
                  style={{
                    width: "0.5vw",
                    height: "0.5vw",
                    borderRadius: "50%",
                    backgroundColor: "#0D9488",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: "1vw", color: "#475569" }}>Priority support</span>
              </div>
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
          <span>Slide 5 of 6</span>
        </div>
      </div>
    </div>
  );
}
