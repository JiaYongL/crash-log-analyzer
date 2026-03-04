import "./styles/global.css";

import { useAnalyzer } from "./hooks/useAnalyzer";

import AppHeader     from "./components/AppHeader";
import DropZone      from "./components/DropZone";
import FileList      from "./components/FileList";
import OptionsBar    from "./components/OptionsBar";
import AnalyseButton from "./components/AnalyseButton";
import ProgressPanel from "./components/ProgressPanel";
import ResultPanel   from "./components/ResultPanel";

/**
 * App — root composition component.
 *
 * Holds no local state.  All data flows from `useAnalyzer`; visibility of each
 * panel is derived from `phase` so the logic reads like a state machine:
 *
 *   idle  → show DropZone + FileList + OptionsBar + AnalyseButton
 *   loading → show ProgressPanel (button disabled)
 *   error   → show ProgressPanel with error logs + re-enabled button
 *   done    → show ProgressPanel + ResultPanel
 */
export default function App(): JSX.Element {
  const {
    files,
    model,
    phase,
    progress,
    logs,
    downloadUrl,
    downloadName,
    setModel,
    onFolderInputChange,
    onFileInputChange,
    onDrop,
    runAnalysis,
    reset,
  } = useAnalyzer();

  const isLoading = phase === "loading";
  const isDone    = phase === "done";
  const hasFiles  = files.length > 0;

  const showProgress =
    isLoading || phase === "error" || (isDone && logs.length > 0);

  return (
    <div
      style={{
        position: "relative",
        zIndex: 1,
        maxWidth: 860,
        margin: "0 auto",
        padding: "60px 24px 100px",
        display: "flex",
        flexDirection: "column",
        gap: 40,
      }}
    >
      <AppHeader />

      <DropZone
        onFolderInputChange={onFolderInputChange}
        onFileInputChange={onFileInputChange}
        onDrop={onDrop}
        disabled={isLoading}
      />

      {hasFiles && !isDone && <FileList files={files} />}

      {hasFiles && !isDone && (
        <OptionsBar model={model} onModelChange={setModel} />
      )}

      {!isDone && (
        <AnalyseButton
          disabled={!hasFiles || isLoading}
          onClick={runAnalysis}
        />
      )}

      {showProgress && <ProgressPanel progress={progress} logs={logs} />}

      {isDone && downloadUrl !== null && (
        <ResultPanel
          fileCount={files.length}
          downloadUrl={downloadUrl}
          downloadName={downloadName}
          onReset={reset}
        />
      )}

      <footer
        style={{
          textAlign: "center",
          fontSize: 11,
          color: "var(--text-dim)",
          letterSpacing: ".06em",
        }}
      >
        Built with{" "}
        <span style={{ color: "var(--amber)" }}>Ollama</span>
        {" "}· Crash Analyser v3
      </footer>
    </div>
  );
}
