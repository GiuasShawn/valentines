
# Anu — Compact Valentine site

This folder contains a compact multi-page Valentine's site with small interactive moments.

Pages:
- `index.html` — Landing and navigation
- `bouquet.html` — Interactive bouquet with copyable messages
- `letters.html` — Short love letters in a modal, copyable
- `gallery.html` — Animated CSS hearts

Open `index.html` in a browser to explore.

## Promises page API

`promise.html` calls a backend API. Set it in `config.js`:

```js
window.PROMISES_API_BASE = "https://your-backend-domain.com";
```

For GitHub Pages, this must be a public backend URL (not localhost).
