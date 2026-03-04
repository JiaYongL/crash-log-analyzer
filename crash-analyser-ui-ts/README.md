# Crash Analyser UI — TypeScript

React + TypeScript frontend for the Ollama-backed IDE crash log analyser.

## Project structure

```
src/
├── types/
│   └── index.ts              # All shared types & interfaces
├── constants/
│   └── config.ts             # API_URL, DEFAULT_MODEL, log-file patterns
├── styles/
│   └── global.css            # Design tokens, reset, animations, mode tabs
├── utils/
│   └── fileSystem.ts         # readDroppedItems(), formatSize()
├── hooks/
│   └── useAnalyzer.ts        # All async state & business logic
├── icons/
│   └── index.tsx             # IconFolder, IconFile, IconUpload, IconDownload, IconCheck
├── components/
│   ├── AppHeader.tsx          # Badge, headline, subtitle
│   ├── DropZone.tsx           # Folder / Files tab toggle + drag-and-drop
│   ├── FileList.tsx           # Scrollable list of detected log files
│   ├── OptionsBar.tsx         # Ollama model name input
│   ├── ProgressPanel.tsx      # Progress bar + terminal log output
│   ├── ResultPanel.tsx        # Success state with Excel download link
│   └── AnalyseButton.tsx      # Full-width primary CTA
├── App.tsx                    # Root composition (phase-driven rendering)
└── main.tsx                   # ReactDOM entry point
```

## Upload modes

| Mode        | How to trigger                                   | Use-case                               |
|-------------|--------------------------------------------------|----------------------------------------|
| **Folder**  | Tab → "Folder" then click, or drag a directory   | Analyse an entire crash-log directory  |
| **Files**   | Tab → "Files" then click, or drag individual files | Cherry-pick specific `.log` / `.txt` files |

Drag-and-drop resolves directories recursively regardless of which tab is active.

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Start the Flask backend (in a separate terminal)
python ../server.py

# 3. Start the dev server
npm run dev   # → http://localhost:3000
```

## Type-checking

```bash
npm run typecheck
```

## Production build

```bash
npm run build   # runs tsc --noEmit then vite build
# Output → dist/
```
