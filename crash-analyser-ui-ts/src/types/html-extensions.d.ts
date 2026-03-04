// src/types/html-extensions.d.ts
//
// Augments React's built-in HTML attribute types with non-standard but
// well-supported browser attributes that TypeScript doesn't know about.

import "react";

declare module "react" {
  interface InputHTMLAttributes<T> {
    /** Allows an <input type="file"> to select an entire directory tree. */
    webkitdirectory?: string | boolean;
  }
}
