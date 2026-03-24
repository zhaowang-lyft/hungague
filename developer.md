# HungerHub Ratings

Browser extension (Chrome, Edge, Firefox, and other Chromium browsers) that lets you rate and comment on dishes from your HungerHub orders. Ratings are stored locally via `chrome.storage.sync` and displayed as badges on the restaurant ordering page.

## Install & Build

```bash
npm install
npm run build
```

## Load in Chrome / Edge / Brave

1. Open `chrome://extensions` (or `edge://extensions`)
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `dist/` folder

## Load in Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select any file inside the `dist/` folder (e.g. `dist/manifest.json`)

> Note: temporary add-ons are removed when Firefox restarts. For a persistent install, the extension would need to be signed via [Mozilla Add-on Hub](https://addons.mozilla.org/developers/).

## Usage

### Rating orders
- Go to [uncatering.hungerhub.com/orders](https://uncatering.hungerhub.com/orders)
- Click any order to open the detail modal
- A **Rate Your Order** panel appears at the bottom with per-dish star ratings (half-star precision) and comment fields
- Click **Save** to persist, **Clear** to remove

### Viewing ratings
- On the restaurant ordering page, rated restaurants show a badge next to their name (e.g. ★ 4.2 (3 orders))
- Menu items you've rated before show their average rating and most recent comment

## Package for Store Upload

```bash
cd dist && zip -r ../hungague-extension.zip . -x ".DS_Store" "**/.DS_Store" ".vite/*"
```

This creates a `hungague-extension.zip` in the project root containing only the built extension (manifest, icons, bundled JS) — ready to upload to the Chrome Web Store or Firefox Add-on Hub.

## Development

```bash
npm run dev
```

Starts Vite in watch mode with HMR. The extension auto-reloads in Chrome when files change.

## Tech Stack

- TypeScript, Preact, Vite, @crxjs/vite-plugin
- Chrome Manifest V3
- `chrome.storage.sync` for cross-device persistence
