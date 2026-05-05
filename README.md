# NoteDrifter

> AI music with style and visualization

A landing site for **NoteDrifter**, an AI-powered piano visualization tool. Built as a small static site with vanilla HTML, CSS, and JavaScript — no frameworks, no build step. Includes a live, canvas-rendered piano visualizer that powers the demo on the home page and all six panels on the demo reel.

## Pages

| Page          | Path             | Highlights                                                                          |
| ------------- | ---------------- | ----------------------------------------------------------------------------------- |
| Home          | `index.html`     | Hero with crystalline shards, intro, feature grid, editor examples, live piano demo |
| Docs          | `docs.html`      | Sticky sidebar, install guide, concepts, color palette, shortcuts, exports, library |
| Demo Reel     | `demo-reel.html` | Six live piano visualizers, each with its own palette + embed snippet               |

## Project structure

```
notedrifter/
├── index.html           # Home page
├── docs.html            # Documentation
├── demo-reel.html       # Multi-visualizer showcase
├── styles.css           # All page styles
├── script.js            # Sticky header, scroll progress, hero parallax,
│                        # cursor glow, scroll-reveal, docs sidebar scroll-spy
└── assets/
    ├── piano-viz.js     # Canvas-based piano visualizer (88 keys + rising bars)
    └── images/          # Generated visuals
        ├── hero-shards.png      (hero background)
        ├── piano-magenta.png    (feature tile)
        ├── piano-blue.png       (feature tile)
        ├── piano-purple.png     (feature tile)
        ├── shards-small.png     (feature tile)
        ├── editor-row.png       (multi-keyboard render)
        ├── editor-ui-1.png      (editor screenshot)
        └── editor-ui-2.png      (editor screenshot)
```

## Live piano visualizer

`assets/piano-viz.js` renders an 88-key piano with rising note bars onto a `<canvas>`. Pre-warming makes the visualization look full the moment it appears, and an `IntersectionObserver` pauses it when off-screen.

Each instance is configured by data attributes:

```html
<figure data-piano-viz data-palette="aurora">
  <canvas class="piano-canvas"></canvas>
  <div class="piano-keys"></div>
  <!-- optional: prev / play / next buttons with data-action -->
</figure>
```

Available palettes: `drift` (default), `aurora`, `ember`, `mono`, `candy`, `neon`.

## Running locally

Serve the directory with anything that speaks HTTP — there is no build step.

```bash
# Python (built in on macOS)
python3 -m http.server 8000

# or via npx
npx serve .
```

Then open <http://localhost:8000>.

## Tech notes

- **Fonts**: Space Grotesk (display), Inter (body), JetBrains Mono (code), all from Google Fonts.
- **Theme**: Pure black background with subtle purple accents.
- **Interactions**:
  - Sticky header with blur on scroll
  - Top scroll-progress bar
  - Hero parallax + cursor-following soft glow
  - Scroll-reveal of all major sections via `IntersectionObserver`
  - Docs sidebar scroll-spy that highlights the current section
  - Live piano visualizer (88 keys, color palettes, pre-warm, off-screen pause, melody cycling)
- **Accessibility**:
  - Respects `prefers-reduced-motion`
  - Semantic landmarks, descriptive `alt` text
  - `noscript` fallback to a static piano image
  - Keyboard-focusable controls
- **Resilience**: A `js-ready` body class gates scroll-reveal hiding so content remains visible if scripts fail to load or run.
