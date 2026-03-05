export default function AppHeader(): JSX.Element {
  return (
    <header style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Wordmark row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Claude-style logo mark — two overlapping diamonds */}
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <rect width="30" height="30" rx="7" fill="#d97757"/>
          <path d="M15 5.5 L20.5 11 L15 16.5 L9.5 11 Z" fill="white" fillOpacity=".92"/>
          <path d="M15 13.5 L20.5 19 L15 24.5 L9.5 19 Z" fill="white" fillOpacity=".55"/>
        </svg>
        <span style={{
          fontFamily: "var(--sans)", fontWeight: 600, fontSize: 14.5,
          color: "var(--text-mid)", letterSpacing: "-.01em",
        }}>
          Crash Analyser
        </span>
      </div>

      {/* Large serif headline — Claude's signature style */}
      <div>
        <h1 style={{
          fontFamily: "var(--serif)",
          fontSize: "clamp(26px, 3.8vw, 42px)",
          fontWeight: 600,
          lineHeight: 1.18,
          color: "var(--text)",
          letterSpacing: "-.025em",
          marginBottom: 10,
        }}>
          Analyse IDE crash logs with AI
        </h1>
        <p style={{
          fontSize: 15,
          color: "var(--text-mid)",
          maxWidth: 500,
          lineHeight: 1.65,
        }}>
          Upload log files or a folder. The tool groups crashes by directory,
          identifies root causes, and exports a structured Excel report.
        </p>
      </div>
    </header>
  );
}
