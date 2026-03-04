/**
 * AppHeader — purely presentational.
 * Renders the page badge, headline, and subtitle.  No props, no state.
 */
export default function AppHeader(): JSX.Element {
  return (
    <header style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {/* Badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: ".12em",
          textTransform: "uppercase",
          color: "var(--amber)",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            width: 20,
            height: 1,
            background: "var(--amber)",
            display: "inline-block",
          }}
        />
        Ollama · IDE Diagnostics
      </div>

      {/* Headline */}
      <h1
        style={{
          fontFamily: "var(--sans)",
          fontSize: "clamp(32px, 5vw, 52px)",
          fontWeight: 800,
          lineHeight: 1.1,
          color: "#eaf0ff",
          letterSpacing: "-.02em",
        }}
      >
        Crash Log
        <br />
        <span style={{ color: "var(--amber)" }}>Analyser</span>
      </h1>

      {/* Subtitle */}
      <p style={{ color: "var(--text-dim)", fontSize: 13, maxWidth: 480 }}>
        Upload individual log files or an entire folder. The tool groups them,
        runs AI analysis, and returns a formatted Excel report.
      </p>
    </header>
  );
}
