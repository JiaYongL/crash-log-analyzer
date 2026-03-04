/**
 * utils/fileSystem.ts
 *
 * Browser FileSystem API helpers for traversing dropped directories and
 * formatting file sizes.  No React dependency — fully unit-testable.
 */

// ─── Directory traversal ──────────────────────────────────────────────────────

/**
 * Recursively resolves all {@link File} objects from a drag-and-drop
 * `DataTransferItemList`, stamping each file with its relative path via
 * `webkitRelativePath` so the backend can reconstruct the directory structure.
 */
export async function readDroppedItems(
  items: DataTransferItem[]
): Promise<File[]> {
  const files: File[] = [];
  const queue: FileSystemEntry[] = items
    .filter((item) => item.kind === "file")
    .map((item) => item.webkitGetAsEntry())
    .filter((entry): entry is FileSystemEntry => entry !== null);

  while (queue.length > 0) {
    const entry = queue.shift()!;

    if (entry.isFile) {
      const fileEntry = entry as FileSystemFileEntry;
      await new Promise<void>((resolve) =>
        fileEntry.file((file) => {
          Object.defineProperty(file, "webkitRelativePath", {
            value: entry.fullPath.replace(/^\//, ""),
            writable: false,
          });
          files.push(file);
          resolve();
        })
      );
    } else if (entry.isDirectory) {
      const dirEntry = entry as FileSystemDirectoryEntry;
      const reader  = dirEntry.createReader();
      await new Promise<void>((resolve) =>
        reader.readEntries((entries) => {
          queue.push(...entries);
          resolve();
        })
      );
    }
  }

  return files;
}

// ─── Formatting ───────────────────────────────────────────────────────────────

/**
 * Returns a human-readable file-size string.
 *
 * @example
 * formatSize(512)           // "512 B"
 * formatSize(4_200)         // "4.1 KB"
 * formatSize(3_145_728)     // "3.0 MB"
 */
export function formatSize(bytes: number): string {
  if (bytes < 1_024) return `${bytes} B`;
  if (bytes < 1_024 * 1_024) return `${(bytes / 1_024).toFixed(1)} KB`;
  return `${(bytes / 1_024 / 1_024).toFixed(1)} MB`;
}
