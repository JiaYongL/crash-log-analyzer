import { useState, useRef } from "react";
import { IconFolder, IconFile, IconUpload } from "../icons";

interface DropZoneProps {
  onFolderInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileInputChange:   (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop:              (e: React.DragEvent<HTMLDivElement>) => Promise<void>;
  disabled: boolean;
}

function BrowseButton({ icon, label, disabled, onClick }: {
  icon: JSX.Element; label: string; disabled: boolean; onClick: () => void;
}): JSX.Element {
  return (
    <button
      type="button" className="browse-btn" disabled={disabled}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      {icon}{label}
    </button>
  );
}

export default function DropZone({ onFolderInputChange, onFileInputChange, onDrop, disabled }: DropZoneProps): JSX.Element {
  const [dragging, setDragging] = useState(false);
  const folderRef = useRef<HTMLInputElement>(null);
  const fileRef   = useRef<HTMLInputElement>(null);

  const onOver  = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragging(true); };
  const onLeave = () => setDragging(false);
  const onDropEv = async (e: React.DragEvent<HTMLDivElement>) => { setDragging(false); await onDrop(e); };
  const drag = dragging && !disabled;

  return (
    <div
      onDragOver={onOver} onDragLeave={onLeave} onDragEnd={onLeave} onDrop={onDropEv}
      style={{
        position: "relative",
        borderRadius: 14,
        border: `1.5px dashed ${drag ? "var(--accent)" : "var(--border)"}`,
        background: drag ? "var(--accent-soft)" : "var(--surface)",
        padding: "40px 28px 36px",
        textAlign: "center",
        transition: "border-color .18s, background .18s, box-shadow .18s",
        boxShadow: drag ? `0 0 0 4px var(--accent-ring), var(--shadow-sm)` : "var(--shadow-sm)",
      }}
    >
      {/* Inputs */}
      <input ref={folderRef} type="file" webkitdirectory="true" multiple
        style={{ display: "none" }} onChange={onFolderInputChange} disabled={disabled}/>
      <input ref={fileRef} type="file" multiple accept=".log,.txt"
        style={{ display: "none" }} onChange={onFileInputChange} disabled={disabled}/>

      {/* Upload cloud icon */}
      <div style={{
        width: 56, height: 56, borderRadius: 14, margin: "0 auto 18px",
        background: drag ? "rgba(217,119,87,.14)" : "var(--surface-alt)",
        border: `1px solid ${drag ? "var(--accent)" : "var(--border)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: drag ? "var(--accent)" : "var(--text-dim)",
        transition: "all .18s",
      }}>
        <IconUpload/>
      </div>

      <p style={{ fontWeight: 600, fontSize: 16, color: "var(--text)", marginBottom: 4 }}>
        {drag ? "Release to upload" : "Drop files or a folder"}
      </p>
      <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 24 }}>
        jbr_err · java_error · hs_err_pid · .log · .txt
      </p>

      {/* "or" divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, padding: "0 8px" }}>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }}/>
        <span style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 500 }}>or</span>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }}/>
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <BrowseButton icon={<IconFolder/>} label="Browse Folder" disabled={disabled} onClick={() => folderRef.current?.click()}/>
        <BrowseButton icon={<IconFile/>}   label="Browse Files"  disabled={disabled} onClick={() => fileRef.current?.click()}/>
      </div>
    </div>
  );
}
