export default function ProblemSlide() {
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
          <div>THE PROBLEM</div>
          <div>2026</div>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "4vh",
        }}
      >
        <div>
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
            The Challenge
          </div>
          <h2
            style={{
              fontSize: "4vw",
              fontWeight: 800,
              margin: 0,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              textWrap: "balance",
            }}
          >
            Hospital finance teams work in silos
          </h2>
          <p
            style={{
              fontSize: "1.3vw",
              color: "#475569",
              marginTop: "1.5vh",
              lineHeight: 1.5,
              maxWidth: "60vw",
              textWrap: "pretty",
            }}
          >
            Reconciling data across departments is slow, error-prone, and opaque —
            dozens of monthly PDF reports managed entirely by hand.
          </p>
        </div>

        {/* Three problem cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2vw" }}>
          <div
            style={{
              background: "#FFFFFF",
              padding: "3vh 2vw",
              borderRadius: "1vw",
              border: "1px solid #E2E8F0",
              boxShadow: "0 2px 12px rgba(30,58,95,0.06)",
            }}
          >
            <div
              style={{
                width: "3.5vw",
                height: "3.5vw",
                backgroundColor: "rgba(13,148,136,0.08)",
                borderRadius: "0.8vw",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "2vh",
              }}
            >
              <div
                style={{
                  width: "1.4vw",
                  height: "1.4vw",
                  borderRadius: "50%",
                  backgroundColor: "#0D9488",
                }}
              />
            </div>
            <div style={{ fontSize: "1.3vw", fontWeight: 700, color: "#1E3A5F", marginBottom: "1vh" }}>
              No unified view
            </div>
            <div style={{ fontSize: "1.05vw", color: "#64748B", lineHeight: 1.5 }}>
              Spending trends are buried across separate reports with no single dashboard to surface them.
            </div>
          </div>

          <div
            style={{
              background: "#FFFFFF",
              padding: "3vh 2vw",
              borderRadius: "1vw",
              border: "1px solid #E2E8F0",
              boxShadow: "0 2px 12px rgba(30,58,95,0.06)",
            }}
          >
            <div
              style={{
                width: "3.5vw",
                height: "3.5vw",
                backgroundColor: "rgba(13,148,136,0.08)",
                borderRadius: "0.8vw",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "2vh",
              }}
            >
              <div
                style={{
                  width: "1.4vw",
                  height: "1.4vw",
                  borderRadius: "2px",
                  backgroundColor: "#0D9488",
                }}
              />
            </div>
            <div style={{ fontSize: "1.3vw", fontWeight: 700, color: "#1E3A5F", marginBottom: "1vh" }}>
              Reports siloed
            </div>
            <div style={{ fontSize: "1.05vw", color: "#64748B", lineHeight: 1.5 }}>
              Each department holds its own data with no structured way to compare figures across teams.
            </div>
          </div>

          <div
            style={{
              background: "#FFFFFF",
              padding: "3vh 2vw",
              borderRadius: "1vw",
              border: "1px solid #E2E8F0",
              boxShadow: "0 2px 12px rgba(30,58,95,0.06)",
            }}
          >
            <div
              style={{
                width: "3.5vw",
                height: "3.5vw",
                backgroundColor: "rgba(13,148,136,0.08)",
                borderRadius: "0.8vw",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "2vh",
              }}
            >
              <div
                style={{
                  width: "0",
                  height: "0",
                  borderLeft: "0.7vw solid transparent",
                  borderRight: "0.7vw solid transparent",
                  borderBottom: "1.2vw solid #0D9488",
                }}
              />
            </div>
            <div style={{ fontSize: "1.3vw", fontWeight: 700, color: "#1E3A5F", marginBottom: "1vh" }}>
              Manual sharing
            </div>
            <div style={{ fontSize: "1.05vw", color: "#64748B", lineHeight: 1.5 }}>
              Sharing insights requires exporting files and emailing attachments — slow and error-prone.
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
          <span>Slide 2 of 6</span>
        </div>
      </div>
    </div>
  );
}
