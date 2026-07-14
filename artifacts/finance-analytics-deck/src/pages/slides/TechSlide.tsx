export default function TechSlide() {
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
          <div>TECHNICAL ARCHITECTURE</div>
          <div>2026</div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ marginBottom: "3vh" }}>
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
            Tech Stack
          </div>
          <h2
            style={{
              fontSize: "3.8vw",
              fontWeight: 800,
              margin: 0,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            Modern, production-ready stack
          </h2>
        </div>

        {/* Stack cards in 2-col + 1 centered row */}
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
                fontSize: "0.8vw",
                fontWeight: 700,
                color: "#0D9488",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "1.5vh",
              }}
            >
              Frontend
            </div>
            <div style={{ fontSize: "1.3vw", fontWeight: 700, color: "#1E3A5F", marginBottom: "0.8vh" }}>
              React + Vite
            </div>
            <div style={{ fontSize: "1vw", color: "#64748B", lineHeight: 1.4 }}>
              Tailwind CSS, shadcn/ui component library
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
                fontSize: "0.8vw",
                fontWeight: 700,
                color: "#0D9488",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "1.5vh",
              }}
            >
              Backend
            </div>
            <div style={{ fontSize: "1.3vw", fontWeight: 700, color: "#1E3A5F", marginBottom: "0.8vh" }}>
              Node.js / Express
            </div>
            <div style={{ fontSize: "1vw", color: "#64748B", lineHeight: 1.4 }}>
              REST API, PostgreSQL, Drizzle ORM
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
                fontSize: "0.8vw",
                fontWeight: 700,
                color: "#0D9488",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "1.5vh",
              }}
            >
              Auth
            </div>
            <div style={{ fontSize: "1.3vw", fontWeight: 700, color: "#1E3A5F", marginBottom: "0.8vh" }}>
              Clerk
            </div>
            <div style={{ fontSize: "1vw", color: "#64748B", lineHeight: 1.4 }}>
              SSO, role management, session security
            </div>
          </div>

          <div
            style={{
              background: "#0D9488",
              padding: "3vh 2vw",
              borderRadius: "1vw",
              border: "1px solid #0D9488",
              boxShadow: "0 2px 12px rgba(13,148,136,0.15)",
            }}
          >
            <div
              style={{
                fontSize: "0.8vw",
                fontWeight: 700,
                color: "rgba(255,255,255,0.7)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "1.5vh",
              }}
            >
              Billing
            </div>
            <div style={{ fontSize: "1.3vw", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.8vh" }}>
              Paddle
            </div>
            <div style={{ fontSize: "1vw", color: "rgba(255,255,255,0.75)", lineHeight: 1.4 }}>
              Subscriptions, webhooks, customer portal
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
                fontSize: "0.8vw",
                fontWeight: 700,
                color: "#0D9488",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "1.5vh",
              }}
            >
              Database
            </div>
            <div style={{ fontSize: "1.3vw", fontWeight: 700, color: "#1E3A5F", marginBottom: "0.8vh" }}>
              PostgreSQL
            </div>
            <div style={{ fontSize: "1vw", color: "#64748B", lineHeight: 1.4 }}>
              Drizzle ORM, type-safe schema migrations
            </div>
          </div>

          <div
            style={{
              background: "#1E3A5F",
              padding: "3vh 2vw",
              borderRadius: "1vw",
              border: "1px solid #1E3A5F",
              boxShadow: "0 2px 12px rgba(30,58,95,0.15)",
            }}
          >
            <div
              style={{
                fontSize: "0.8vw",
                fontWeight: 700,
                color: "rgba(255,255,255,0.6)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "1.5vh",
              }}
            >
              Infrastructure
            </div>
            <div style={{ fontSize: "1.3vw", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.8vh" }}>
              Replit
            </div>
            <div style={{ fontSize: "1vw", color: "rgba(255,255,255,0.65)", lineHeight: 1.4 }}>
              Hosted, deployed, with managed secrets
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
          <span>Slide 4 of 6</span>
        </div>
      </div>
    </div>
  );
}
