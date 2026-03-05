import "./styles/global.css";
import { useAnalyzer } from "./hooks/useAnalyzer";
import AppHeader     from "./components/AppHeader";
import DropZone      from "./components/DropZone";
import FileList      from "./components/FileList";
import OptionsBar    from "./components/OptionsBar";
import AnalyseButton from "./components/AnalyseButton";
import ProgressPanel from "./components/ProgressPanel";
import ResultPanel   from "./components/ResultPanel";

export default function App(): JSX.Element {
  const { files, model, phase, progress, logs, downloadUrl, downloadName,
    setModel, onFolderInputChange, onFileInputChange, onDrop, runAnalysis, reset } = useAnalyzer();

  const isLoading = phase === "loading";
  const isDone    = phase === "done";
  const hasFiles  = files.length > 0;
  const showProgress = isLoading || phase === "error" || (isDone && logs.length > 0);

  return (
    /* Page shell — narrow centered column like Claude's compose area */
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 680, padding: "56px 24px 100px",
        display: "flex", flexDirection: "column", gap: 24 }}>

        <AppHeader/>

        {/* Thin rule under header */}
        <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }}/>

        <DropZone
          onFolderInputChange={onFolderInputChange}
          onFileInputChange={onFileInputChange}
          onDrop={onDrop}
          disabled={isLoading}
        />

        {hasFiles && !isDone && <FileList files={files}/>}
        {hasFiles && !isDone && <OptionsBar model={model} onModelChange={setModel}/>}
        {!isDone  && <AnalyseButton disabled={!hasFiles || isLoading} onClick={runAnalysis}/>}
        {showProgress && <ProgressPanel progress={progress} logs={logs}/>}
        {isDone && downloadUrl !== null && (
          <ResultPanel fileCount={files.length} downloadUrl={downloadUrl} downloadName={downloadName} onReset={reset}/>
        )}

        {/* Footer */}
        <footer style={{ marginTop: "auto", paddingTop: 24, display: "flex", alignItems: "center",
          justifyContent: "center", gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 30 30" fill="none">
            <rect width="30" height="30" rx="7" fill="#d97757" fillOpacity=".5"/>
            <path d="M15 5.5 L20.5 11 L15 16.5 L9.5 11 Z" fill="#d97757"/>
            <path d="M15 13.5 L20.5 19 L15 24.5 L9.5 19 Z" fill="#d97757" fillOpacity=".55"/>
          </svg>
          <span style={{ fontSize: 12.5, color: "var(--text-dim)" }}>
            Crash Analyser · powered by Ollama
          </span>
        </footer>
      </div>
    </div>
  );
}
