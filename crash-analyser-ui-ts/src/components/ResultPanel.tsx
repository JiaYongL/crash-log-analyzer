import { IconCheck, IconDownload } from "../icons";

interface Props { fileCount: number; downloadUrl: string; downloadName: string; onReset: () => void; }

export default function ResultPanel({ fileCount, downloadUrl, downloadName, onReset }: Props): JSX.Element {
  return (
    <div className="anim-slide" style={{ borderRadius: 14, border: "1px solid var(--border)",
      background: "var(--surface)", boxShadow: "var(--shadow-md)", overflow: "hidden" }}>

      {/* Top accent stripe */}
      <div style={{ height: 3, background: "linear-gradient(90deg, var(--accent-dark), var(--accent))" }}/>

      <div style={{ padding: "32px 28px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}>
        {/* Check badge */}
        <div style={{ width: 58, height: 58, borderRadius: "50%",
          background: "var(--green-soft)", border: "1.5px solid rgba(42,122,86,.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--green)" }}>
          <IconCheck/>
        </div>

        <div>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 600,
            color: "var(--text)", letterSpacing: "-.02em", marginBottom: 6 }}>
            Analysis complete
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-mid)", maxWidth: 340 }}>
            {fileCount} log {fileCount === 1 ? "file" : "files"} analysed successfully.
            Your Excel report is ready to download.
          </p>
        </div>

        {/* Download */}
        <a href={downloadUrl} download={downloadName} style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "11px 28px", borderRadius: 9,
          background: "var(--accent)", color: "#fff",
          fontFamily: "var(--sans)", fontSize: 14, fontWeight: 600,
          textDecoration: "none",
          boxShadow: "0 3px 12px rgba(217,119,87,.3)",
          transition: "background .15s, box-shadow .15s, transform .15s",
        }}
          onMouseEnter={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "var(--accent-dark)"; el.style.transform = "translateY(-1px)"; el.style.boxShadow = "0 6px 18px rgba(217,119,87,.35)"; }}
          onMouseLeave={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "var(--accent)"; el.style.transform = "none"; el.style.boxShadow = "0 3px 12px rgba(217,119,87,.3)"; }}
        >
          <IconDownload/> Download .xlsx
        </a>

        {/* Reset */}
        <button type="button" onClick={onReset} style={{
          background: "none", border: "none", padding: "4px 8px",
          fontSize: 13, color: "var(--text-dim)", cursor: "pointer",
          fontFamily: "var(--sans)", transition: "color .12s",
        }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--text)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--text-dim)")}
        >
          Start a new analysis →
        </button>
      </div>
    </div>
  );
}
