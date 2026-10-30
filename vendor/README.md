# Vendored Mermaid

`mermaid.min.js` is the browser bundle of **Mermaid 12.2.0**, the diagram and
charting tool used to render fenced `mermaid` code blocks in the DocDesk
reader.

- Source: https://www.npmjs.com/package/mermaid/v/12.2.0
- Bundle: https://cdn.jsdelivr.net/npm/mermaid@12.2.0/dist/mermaid.min.js
- License: MIT; see `LICENSE.mermaid`.

The bundle is loaded lazily by the client only when a document contains a
Mermaid block, and is served by the plugin host from a same-origin route. It is
not executed during workspace scans or the desktop view.
