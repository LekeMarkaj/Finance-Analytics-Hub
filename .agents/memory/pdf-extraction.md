---
name: PDF extraction library choice
description: Which Node.js PDF text extraction library works in this monorepo's ESM + esbuild environment
---

# PDF Extraction in ESM/esbuild Environment

## The rule
Use `unpdf` for server-side PDF text extraction. Do NOT use `pdf-parse` v2.

## Why
`pdf-parse` v2 bundles `pdfjs-dist` which references `DOMMatrix` (a browser DOM API) at module evaluation time. In Node.js 24 (ESM), this crashes the process on startup with `ReferenceError: DOMMatrix is not defined`.

## How to apply
When any route or script needs to extract text from a PDF buffer, import from `unpdf`:
```typescript
import { extractText } from "unpdf";
const { text: pages } = await extractText(new Uint8Array(buffer), { mergePages: true });
const text = (Array.isArray(pages) ? pages.join("\n") : pages);
```
