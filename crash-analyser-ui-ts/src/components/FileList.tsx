import { formatSize } from "../utils/fileSystem";

// ─── FileItem ─────────────────────────────────────────────────────────────────

interface FileItemProps {
  file: File;
  isLast: boolean;
}

function FileItem({ file, isLast }: FileItemProps): JSX.Element {
  const path = file.webkitRelativePath || file.name;

  return (
    <div
      title={path}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "9px 18px",
        fontSize: 12,
        borderBottom: isLast ? "none" : "1px solid var(--border)",
        transition: "background .15s",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLDivElement).style.background = "var(--surface2)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLDivElement).style.background = "transparent")
      }
    >
      {/* Accent dot */}
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "var(--amber)",
          flexShrink: 0,
        }}
      />

      {/* Relative path */}
      <span
        style={{
          color: "var(--text)",
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {path}
      </span>

      {/* File size */}
      <span style={{ color: "var(--text-dim)", fontSize: 11, flexShrink: 0 }}>
        {formatSize(file.size)}
      </span>
    </div>
  );
}

// ─── FileList ─────────────────────────────────────────────────────────────────

interface FileListProps {
  files: File[];
}

/**
 * Renders the scrollable panel of detected log files.
 * Returns `null` when `files` is empty so the caller doesn't need to guard it.
 */
export default function FileList({ files }: FileListProps): JSX.Element | null {
  if (files.length === 0) return null;

  return (
    <div
      className="anim-slide"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface2)",
        }}
      >
        <span
          style={{
            fontSize: 11,
            letterSpacing: ".1em",
            textTransform: "uppercase",
            color: "var(--text-dim)",
          }}
        >
          Detected log files
        </span>
        <span style={{ fontSize: 12, color: "var(--amber)", fontWeight: 700 }}>
          {files.length} file{files.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Scrollable rows */}
      <div style={{ maxHeight: 220, overflowY: "auto" }}>
        {files.map((f, i) => (
          <FileItem
            key={`${f.webkitRelativePath || f.name}-${i}`}
            file={f}
            isLast={i === files.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
