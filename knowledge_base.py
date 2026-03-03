"""
knowledge_base.py

Crash-diagnosis rules and the system prompt derived from them.

``KNOWLEDGE_RULES`` is the canonical source of truth — a structured list of
rule dicts that can be used programmatically (e.g. for testing or rule-based
pre-filtering).

``SYSTEM_PROMPT`` is what the language model sees; it is written by hand to
give the model precise, unambiguous instructions and is kept in sync with
``KNOWLEDGE_RULES`` manually.
"""

from __future__ import annotations

# ---------------------------------------------------------------------------
# Structured rule definitions
# ---------------------------------------------------------------------------

KNOWLEDGE_RULES: list[dict] = [
    {
        "id": "JBR_METAL_MAC",
        "category": "JBR Issue",
        "name": "Mac external display causes JBR crash",
        "keywords": [
            "unable to initialize Metal",
            "No MTLDevice",
            "Cannot load metal library",
            "CGraphicsDevice",
        ],
        "exception_types": ["IllegalStateException"],
        "platforms": ["mac", "darwin"],
        "description": (
            "JBR fails to rebuild the Metal graphics device after connecting or "
            "disconnecting an external monitor on macOS — no MTLDevice is found, "
            "crashing the JVM. This is a known JBR bug."
        ),
        "solution": (
            "1. Disconnect the external display and restart the IDE.\n"
            "2. Upgrade JBR to the latest version.\n"
            "3. Workaround: add -Dsun.java2d.metal=false to IDE startup options."
        ),
    },
    {
        "id": "JBR_NULL_BACK_BUFFER",
        "category": "JBR Issue",
        "name": "JBR graphics back-buffer null pointer",
        "keywords": [
            'backBuffers[i]" is null',
            "VolatileImage.getGraphics()",
            "backBuffers",
        ],
        "exception_types": ["NullPointerException"],
        "platforms": [],
        "description": (
            "The backBuffers array in JBR's rendering layer was never initialised "
            "or has been cleared — a JBR internal defect."
        ),
        "solution": (
            "1. Upgrade JBR to the latest version.\n"
            "2. File a bug report with JetBrains."
        ),
    },
    {
        "id": "WIN_VIRTUAL_OOM",
        "category": "Out of Memory",
        "name": "Windows virtual memory exhausted",
        "keywords": [
            "Native memory allocation",
            "failed to map",
            "failed to allocate",
            "G1 virtual space",
            "os_windows.cpp",
            "arena.cpp",
            "Out of Memory Error",
            "Chunk::new",
            "ChunkPool::allocate",
        ],
        "exception_types": [],
        # Exclude logs that already indicate physical-RAM exhaustion
        "negative_keywords": ["Possible reasons", "physical RAM"],
        "platforms": ["windows"],
        "description": (
            "Windows virtual address space is exhausted; the JVM cannot fulfil "
            "an mmap/malloc request. Typically occurs when virtual memory drops "
            "to single-digit MB."
        ),
        "solution": (
            "1. Increase the Windows page-file size (1.5–3× physical RAM).\n"
            "2. Close other memory-intensive programs.\n"
            "3. Lower the IDE heap setting (-Xmx).\n"
            "4. Add more physical RAM."
        ),
    },
    {
        "id": "PHYSICAL_OOM",
        "category": "Out of Memory",
        "name": "Physical RAM exhausted",
        "keywords": [
            "Native memory allocation",
            "failed to allocate",
            "failed to map",
            "Possible reasons",
            "physical RAM or swap space",
            "CompressedOops",
        ],
        "exception_types": [],
        "platforms": [],
        "description": (
            "Both physical RAM and swap are exhausted.  Newer JBR/JVM versions "
            "include a 'Possible reasons' section in this case."
        ),
        "solution": (
            "1. Close other processes to free RAM.\n"
            "2. Enlarge the swap/page file.\n"
            "3. Add more physical RAM.\n"
            "4. Check for IDE memory leaks (watch heap growth over time)."
        ),
    },
    {
        "id": "CHROME_ELF_VIOLATION",
        "category": "Unknown",
        "name": "chrome_elf.dll compatibility access violation",
        "keywords": [
            "EXCEPTION_ACCESS_VIOLATION",
            "chrome_elf.dll",
            "0x1b549",
            "ProcessHandleImpl.getProcessPids0",
        ],
        "exception_types": [],
        "platforms": ["windows"],
        "description": (
            "Root cause unclear. chrome_elf.dll (CEF/Chromium component) conflicts "
            "with the JVM's getProcessPids0 function, causing an access violation."
        ),
        "solution": (
            "1. Disable the embedded browser (JCEF) in IDE settings.\n"
            "2. Upgrade IDE and JBR.\n"
            "3. File a full crash log with JetBrains."
        ),
    },
    {
        "id": "JBR_HARDWARE_CPU",
        "category": "JBR Issue",
        "name": "JBR crash — suspected CPU/hardware instability",
        "keywords": [
            "EXCEPTION_ACCESS_VIOLATION",
            "GCTaskThread",
            "GC Thread",
            "C2 CompilerThread",
            "ConcurrentGCThread",
            "data execution prevention violation",
        ],
        "exception_types": [],
        "negative_keywords": ["chrome_elf.dll", "Possible reasons"],
        "platforms": [],
        "description": (
            "JBR crashes in GC or JIT threads; community analysis points to "
            "overclocked or faulty CPU/RAM as the likely cause."
        ),
        "solution": (
            "1. Reset CPU/RAM overclock settings to stock frequencies in BIOS.\n"
            "2. Run MemTest86 to check for memory errors.\n"
            "3. Update motherboard BIOS and hardware drivers.\n"
            "4. Verify that antivirus software is not interfering with the JVM."
        ),
    },
    {
        "id": "JBR_A27_CRASH",
        "category": "JBR Issue",
        "name": "JBR-A-27 sporadic crash (known bug)",
        "keywords": [
            "EXCEPTION_ACCESS_VIOLATION",
            "JBR-17.0.12+1-1087.25-jcef",
        ],
        "exception_types": [],
        "platforms": [],
        "description": (
            "Known sporadic crash in JBR 17.0.12+1-1087.25-jcef, tracked as "
            "JBR-A-27 on JetBrains YouTrack."
        ),
        "solution": (
            "1. Upgrade JBR to a later version to avoid this bug.\n"
            "2. Reference: https://youtrack.jetbrains.com/articles/JBR-A-27"
        ),
    },
    {
        "id": "JDK_BUG",
        "category": "JDK Bug",
        "name": "Known JDK bug (font rendering / class loader)",
        "keywords": [
            "DrawGlyphListLCD",
            "EXCEPTION_IN_PAGE_ERROR",
            "0xc0000006",
            "defineClass2",
            "zip.dll",
        ],
        "exception_types": [],
        "platforms": [],
        "description": (
            "A known JDK defect in the font-rendering (DrawGlyphListLCD) or "
            "class-loader (defineClass2) subsystem."
        ),
        "solution": (
            "1. Upgrade JDK/JBR to a version that contains the fix.\n"
            "2. Report to JetBrains or the OpenJDK community."
        ),
    },
]


# ---------------------------------------------------------------------------
# System prompt (used directly by the language model)
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """\
You are an IntelliJ-based IDE crash/error log parser. Given any IDE fatal error log,
identify its log type, then extract a crash fingerprint as a JSON object.

## Step 1 — Identify the log type

| Type        | How to recognise                                                                  |
|-------------|-----------------------------------------------------------------------------------|
| `hs_err`    | Starts with `# A fatal error has been detected by the Java Runtime Environment`   |
| `oom`       | Contains `There is insufficient memory for the Java Runtime Environment`           |
| `exception` | Starts with `Exception in <ThreadName>:` followed by a Java exception + stack     |
| `unknown`   | None of the above match, or the input is empty                                    |

## Step 2 — Extract the following fields

### `exception_type`
The error signal, exception, or condition name.

| Log type    | Source                           | Example                              |
|-------------|----------------------------------|--------------------------------------|
| `hs_err`    | `#  <signal> (0x...)` line       | `SIGSEGV`, `EXCEPTION_ACCESS_VIOLATION` |
| `oom`       | Fixed value                      | `OutOfMemoryError`                   |
| `exception` | Java exception class, 2nd line   | `java.lang.IllegalArgumentException` |
| `unknown`   | —                                | `null`                               |

### `frame_type`
Applies to `hs_err` only. Single character from the "Problematic frame" line:
`C` (native), `J` (JIT Java), `V` (JVM internal), `j` (interpreted Java).
Set to `null` for all other log types.

### `frame_fingerprint`
A stable, de-noised identifier. Strip all hex addresses, numeric offsets (`+0x…`),
byte counts, argument signatures, and return types.

| Log type         | Source              | Example                                       |
|------------------|---------------------|-----------------------------------------------|
| `hs_err` C frame | Problematic frame   | `libsystem_kernel.dylib::__kill`              |
| `hs_err` J frame | Problematic frame   | `com.example.Foo.parseLogLine`                |
| `hs_err` V frame | Problematic frame   | `libjvm.dylib::G1CMTask::process_grey_task_entry` |
| `oom`            | `Out of Memory Error (<file>:<line>)` | `arena.cpp`               |
| `exception`      | First app Java frame (skip native)    | `sun.lwawt.macosx.CInputMethod.insertText` |
| `unknown`        | —                   | `null`                                        |

### `current_thread`
Thread where the crash occurred.

| Log type    | Source                                           | Example              |
|-------------|--------------------------------------------------|----------------------|
| `hs_err`    | `# Current thread: …` — extract name in quotes  | `main`               |
| `oom`       | No name available                                | `null`               |
| `exception` | Thread name from `Exception in <ThreadName>:`   | `NSApplicationAWT`   |
| `unknown`   | —                                                | `null`               |

### `top_frame_method`
The topmost method in the stack trace, as a stable readable identifier.
Strip addresses, offsets, and argument signatures.

| Log type    | Source             | Example                                                   |
|-------------|--------------------|-----------------------------------------------------------|
| `hs_err`    | Problematic frame  | same value as `frame_fingerprint`                         |
| `oom`       | No frame available | `null`                                                    |
| `exception` | First stack line   | `java.awt.event.InputMethodEvent.getMostRecentEventTimeForSource` |
| `unknown`   | —                  | `null`                                                    |

> **Note:** For `exception` logs, `top_frame_method` is the literal top of the stack
> (where execution was), while `frame_fingerprint` is the first *application-owned*
> Java frame (where the bug is actionable).

### `evidence`
1–5 verbatim log lines that directly support the values above.
Use the minimum set that justifies log type, exception type, frame, and thread.
Do not paraphrase or truncate lines. Omit purely informational lines.

## Output
Return **only** valid JSON with no surrounding text or markdown fences:

{
  "log_type": "...",
  "exception_type": "...",
  "frame_type": "...",
  "frame_fingerprint": "...",
  "current_thread": "...",
  "top_frame_method": "...",
  "evidence": [
    "verbatim log line 1",
    "verbatim log line 2"
  ]
}
"""
