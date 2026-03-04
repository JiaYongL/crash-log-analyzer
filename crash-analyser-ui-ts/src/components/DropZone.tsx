import { useState, useRef } from "react";
import { IconFolder, IconFile, IconUpload } from "../icons";

// ─── Props ────────────────────────────────────────────────────────────────────

interface DropZoneProps {
  onFolderInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileInputChange:   (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop:              (e: React.DragEvent<HTMLDivElement>) => Promise<void>;
  disabled: boolean;
}

// ─── BrowseButton ─────────────────────────────────────────────────────────────

interface BrowseButtonProps {
  icon: JSX.Element;
  label: string;
  disabled: boolean;
  onClick: () => void;
}

function BrowseButton({ icon, label, disabled, onClick }: BrowseButtonProps): JSX.Element {
  return (
    <button
      type="button"
      className="browse-btn"
      disabled={disabled}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      {icon}
      {label}
    </button>
  );
}

// ─── DropZone ─────────────────────────────────────────────────────────────────

/**
 * DropZone
 *
 * Single unified drop target that supports both upload modes simultaneously:
 *  - **Browse Folder** — opens a directory picker (`webkitdirectory`).
 *  - **Browse Files**  — opens a standard multi-file picker.
 *  - **Drag & drop**   — accepts dragged files and directories; directories
 *                        are resolved recursively via the FileSystem API.
 *
 * No mode toggle — both options are always visible side by side.
 */
export default function DropZone({
  onFolderInputChange,
  onFileInputChange,
  onDrop,
  disabled,
}: DropZoneProps): JSX.Element {
  const [dragging, setDragging] = useState(false);

  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef   = useRef<HTMLInputElement>(null);

  // ── Drag handlers ───────────────────────────────────────────────────────

  const handleDragOver  = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);
  const handleDrop      = async (e: React.DragEvent<HTMLDivElement>) => { setDragging(false); await onDrop(e); };

  const isDragActive = dragging && !disabled;

  return (
    <div
      aria-label="Drop log files or folder here"
      style={{
        position: "relative",
        border: `1.5px dashed ${isDragActive ? "var(--amber)" : "var(--border)"}`,
        borderRadius: 16,
        background: isDragActive ? "var(--surface2)" : "var(--surface)",
        padding: "52px 32px 44px",
        textAlign: "center",
        cursor: "default",
        transform: isDragActive ? "translateY(-2px)" : "none",
        transition: "border-color .2s, background .2s, transform .15s",
        overflow: "hidden",
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDragEnd={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Radial glow on drag */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 0%, rgba(245,166,35,.08) 0%, transparent 70%)",
          opacity: isDragActive ? 1 : 0,
          transition: "opacity .3s",
          pointerEvents: "none",
        }}
      />

      {/* Hidden inputs */}
      <input
        ref={folderInputRef}
        type="file"
        webkitdirectory="true"
        multiple
        style={{ display: "none" }}
        onChange={onFolderInputChange}
        disabled={disabled}
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".log,.txt"
        style={{ display: "none" }}
        onChange={onFileInputChange}
        disabled={disabled}
      />

      {/* Icon */}
      <div style={{
        width: 56, height: 56,
        margin: "0 auto 20px",
        border: `1.5px solid ${isDragActive ? "var(--amber)" : "var(--border)"}`,
        borderRadius: 14,
        background: "var(--surface2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "border-color .2s",
      }}>
        <IconUpload />
      </div>

      {/* Headline */}
      <div style={{ fontFamily: "var(--sans)", fontSize: 18, fontWeight: 700, color: "#eaf0ff", marginBottom: 6 }}>
        Drop files or a folder here
      </div>
      <div style={{ color: "var(--text-dim)", fontSize: 12, marginBottom: 24 }}>
        Supports jbr_err, java_error, hs_err_pid · .log · .txt
      </div>

      {/* OR divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        <span style={{ fontSize: 11, color: "var(--text-dim)", letterSpacing: ".08em" }}>OR BROWSE</span>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      </div>

      {/* Two browse buttons, always visible */}
      <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
        <BrowseButton
          icon={<IconFolder />}
          label="Browse Folder"
          disabled={disabled}
          onClick={() => folderInputRef.current?.click()}
        />
        <BrowseButton
          icon={<IconFile />}
          label="Browse Files"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
        />
      </div>
    </div>
  );
}
