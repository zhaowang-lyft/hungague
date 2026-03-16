# HungerHub Ratings

Chrome extension that lets you rate and comment on dishes from your HungerHub orders. Ratings are stored locally via `chrome.storage.sync` and displayed as badges on the restaurant ordering page.

## Install & Build

```bash
npm install
npm run build
```

## Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `dist/` folder

## Usage

### Rating orders
- Go to [uncatering.hungerhub.com/orders](https://uncatering.hungerhub.com/orders)
- Click any order to open the detail modal
- A **Rate Your Order** panel appears at the bottom with per-dish star ratings (half-star precision) and comment fields
- Click **Save** to persist, **Clear** to remove

### Viewing ratings
- On the restaurant ordering page, rated restaurants show a badge next to their name (e.g. ★ 4.2 (3 orders))
- Menu items you've rated before show their average rating and most recent comment

## Development

```bash
npm run dev
```

Starts Vite in watch mode with HMR. The extension auto-reloads in Chrome when files change.

## Tech Stack

- TypeScript, Preact, Vite, @crxjs/vite-plugin
- Chrome Manifest V3
- `chrome.storage.sync` for cross-device persistence
