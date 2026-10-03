# Pitrubhakt-Lab-Report

Offline-first Electron desktop application for entering, reviewing, printing, and managing laboratory reports and bills.

## Requirements

- Node.js 22.12 or newer
- npm

## Development

```sh
npm install
npm start
```

The application loads `index.html` directly in Electron; Vite and TypeScript are not part of the runtime.

## Reports

The editor supports six report types:

- Serology
- Haemogram
- Blood Sugar
- Bio-Chemistry
- CRP / RA
- Bill

Each report has a live preview, a History view, and print actions. History records can be loaded, previewed, and deleted. Editing a loaded record does not change History immediately: the first Print saves a new record, and subsequent edits are saved to that copy when Print is clicked. The original record remains unchanged.

## Printing

Printing uses the browser-native print dialog from the active report view. Live Preview, History Preview, and printed output share the same report markup and styles. Paper size and margins are configured per report in Settings. Bill No. and Date appear in the Bill body.

The operating system's printer settings can still affect scaling and printable margins.

## Data and preferences

- Reports and bills are stored locally in the renderer's IndexedDB database (`pitrubhakta_lab`).
- Report templates, paper sizes, and margins are stored in `localStorage`.
- Backup and restore are available from History.
- The application does not use SQLite or a remote service.

## Project layout

- `main.js`: Electron window creation.
- `index.html`: report forms, previews, History, and Settings markup.
- `renderer.js`: form synchronization, validation, IndexedDB, History, and print flow.
- `styles.css`: application, report, preview, and print styles.

## Commands

```sh
npm start          # launch the desktop app
npm run check      # syntax-check Electron and renderer scripts
npm run format     # format HTML, code, and documentation
npm run format:html
npm run format:code
npm run format:check
npm run dist       # create the configured Windows installer
```

`index.html` uses the compact HTML formatting rules in `.jsbeautifyrc`. JavaScript, CSS, JSON, and Markdown use the repository's `.prettierrc.json` configuration. `npm run dist` is configured for Windows NSIS packaging.
