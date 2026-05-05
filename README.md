# NoteDrifter

> AI music with style and visualization

A landing site for **NoteDrifter**, an AI-powered piano visualization tool. Built as a small static site with vanilla HTML, CSS, and JavaScript — no frameworks, no build step. The home page rebuilds the original design (typography, crystalline shards, editor examples, piano demo) and includes a live, canvas-rendered piano visualizer.

## Pages

| Page          | Path             | Status         | Highlights                                                                            |
| ------------- | ---------------- | -------------- | ------------------------------------------------------------------------------------- |
| Home          | `index.html`     | Live           | Hero with crystalline shards, intro, feature grid, editor examples, live piano demo   |
| Docs          | `docs.html`      | Coming Soon    | Same dark / shards aesthetic, eyebrow, italic title, teaser content, "Back to Home"   |
| Demo Reel     | `demo-reel.html` | Coming Soon    | Same dark / shards aesthetic, eyebrow, italic title, teaser content, "Back to Home"   |

## Project structure

```
notedrifter/
├── index.html           # Home page
├── docs.html            # Coming-soon page (Documentation)
├── demo-reel.html       # Coming-soon page (Demo Reel)
├── styles.css           # All page styles
├── script.js            # Sticky header, scroll progress, hero parallax,
│                        # cursor glow, scroll-reveal
├── README.md
└── assets/
    ├── piano-viz.js         # Canvas-based 88-key piano visualizer
    ├── images/              # Site visuals (cropped from the design source
    │   │                    # for an exact visual match to the original)
    │   ├── hero-shards.png
    │   ├── piano-magenta.png
    │   ├── piano-blue.png
    │   ├── piano-purple.png
    │   ├── shards-small.png
    │   ├── editor-row.png
    │   ├── editor-ui-1.png
    │   ├── editor-ui-2.png
    │   └── piano-demo.png
    └── source/              # Raw design source + intermediate crops
        └── design.png
```

## Visual design

The visuals on the home page are taken directly from the uploaded design mock-up, cropped section-by-section so what is shown on the page matches the source pixel-for-pixel.

| Section                | Source                                                                   |
| ---------------------- | ------------------------------------------------------------------------ |
| Hero shards background | AI-generated companion to the source — clean centre for the title       |
| 4 feature tiles        | Cropped from the 2×2 thumbnail grid in the design                        |
| Editor row             | Cropped from the angled stacked-keyboard render in the design            |
| Editor UI screenshots  | Cropped from the two editor windows in the design                        |
| Piano demo             | Cropped from the bottom rising-bar piano in the design                   |

## Live piano visualizer

`assets/piano-viz.js` renders an 88-key piano with rising note bars onto a `<canvas>`. Pre-warming makes the visualization look full the moment it appears, and an `IntersectionObserver` pauses it when off-screen.

Each instance is configured by data attributes:

```html
<figure data-piano-viz data-palette="aurora">
  <canvas class="piano-canvas"></canvas>
  <div class="piano-keys"></div>
</figure>
```

Available palettes: `drift` (default), `aurora`, `ember`, `mono`, `candy`, `neon`.

## Running locally

Serve the directory with anything that speaks HTTP — there is no build step.

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Tech notes

- **Fonts**: [Cormorant Garamond](https://fonts.google.com/specimen/Cormorant+Garamond) (display, italic) for headings to match the design's elegant title; [Inter](https://fonts.google.com/specimen/Inter) for body / UI.
- **Theme**: Pure black background with the design's crystalline-shards photography on the sides; soft white-on-black typography.
- **Interactions**:
  - Sticky header with blur on scroll
  - Top scroll-progress bar
  - Hero parallax + cursor-following soft glow
  - Scroll-reveal of major sections via `IntersectionObserver`
  - Live piano visualizer (88 keys, color palettes, pre-warm, off-screen pause, melody cycling)
- **Accessibility**:
  - Respects `prefers-reduced-motion`
  - Semantic landmarks, descriptive `alt` text
  - `noscript` fallback to a static piano image
  - Keyboard-focusable controls
- **Resilience**: A `js-ready` body class gates scroll-reveal hiding so content remains visible if scripts fail to load or run.
