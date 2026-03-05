import { formatSize } from "../utils/fileSystem";

function FileItem({ file, isLast }: { file: File; isLast: boolean }): JSX.Element {
  const path = file.webkitRelativePath || file.name;
  return (
    <div
      title={path}
      style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 16px",
        borderBottom: isLast ? "none" : "1px solid var(--border)",
        transition: "background .12s", cursor: "default" }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "var(--surface-alt)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
    >
      {/* File dot */}
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", opacity: .65, flexShrink: 0 }}/>
      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-mid)" }}>
        {path}
      </span>
      <span style={{ fontSize: 11, color: "var(--text-dim)", flexShrink: 0 }}>{formatSize(file.size)}</span>
    </div>
  );
}

export default function FileList({ files }: { files: File[] }): JSX.Element | null {
  if (!files.length) return null;
  return (
    <div className="anim-slide" style={{ borderRadius: 12, border: "1px solid var(--border)",
      background: "var(--surface)", overflow: "hidden", boxShadow: "var(--shadow-xs)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 16px", borderBottom: "1px solid var(--border)", background: "var(--surface-alt)" }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-mid)", letterSpacing: ".02em" }}>
          Selected files
        </span>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)",
          background: "var(--accent-soft)", border: "1px solid rgba(217,119,87,.2)",
          padding: "1px 9px", borderRadius: 20 }}>
          {files.length} {files.length === 1 ? "file" : "files"}
        </span>
      </div>
      <div style={{ maxHeight: 200, overflowY: "auto" }}>
        {files.map((f, i) => (
          <FileItem key={`${f.webkitRelativePath || f.name}-${i}`} file={f} isLast={i === files.length - 1}/>
        ))}
      </div>
    </div>
  );
}
