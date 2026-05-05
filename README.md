# NoteDrifter

> AI music with style and visualization

A landing site for **NoteDrifter**, an AI-powered piano visualization tool.
Built as a small static site with vanilla HTML, CSS, and JavaScript — no
frameworks, no build step. The home page mirrors the original design
(typography, crystalline shards, editor screenshots, piano demo), and the
docs page documents every feature using the actual app screenshots and
in-app terminology.

## Pages

| Page      | Path             | Status      | Highlights                                                                                              |
| --------- | ---------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| Home      | `index.html`     | Live        | Crystalline-shards hero, 4 actual app covers, editor screenshots, live canvas piano demo                |
| Docs      | `docs.html`      | Live        | Long-form docs with sticky scroll-spy sidebar, callouts, kbd table, swatches, orientation cards         |
| Demo Reel | `demo-reel.html` | Coming Soon | Same dark / shards aesthetic, eyebrow, "Coming Soon" title, teaser list, "Back to Home"                 |

## Project structure

```
notedrifter/
├── index.html           # Home page
├── docs.html            # Full documentation page
├── demo-reel.html       # Coming-soon page (Demo Reel)
├── styles.css           # All page styles
├── script.js            # Sticky header, scroll progress, hero parallax,
│                        # per-tile cursor glow, scroll-reveal, scroll-spy
├── README.md
└── assets/
    ├── piano-viz.js                # Canvas-based 88-key piano visualizer
    ├── images/                     # Site visuals — sourced from the
    │   │                           # uploaded high-resolution app screenshots
    │   ├── hero-shards.png         #   AI-generated clean shards background
    │   ├── cover-getstarted.png    #   "Get Started — Render a video in minutes"
    │   ├── cover-newproject.png    #   "New Project — from scratch / import"
    │   ├── cover-noprojects.png    #   "No Projects Yet" Dashboard
    │   ├── cover-signup.png        #   "Sign up for free"
    │   ├── editor-row.png          #   Tiled diagonal editor screenshots
    │   ├── editor-config.png       #   Editor with Configurations dialog open
    │   └── editor-fullscreen.png   #   Editor fullscreen with Embers track
    └── source/                     # Original raw uploads & design mock-up
        ├── design.png
        ├── cover-grid.png
        ├── editor-screenshots.png
        ├── editor-config.png
        └── editor-fullscreen.png
```

## Visual design

Every visual on the home page is sourced from the uploaded app screenshots
or the design mock-up — no synthetic placeholders.

| Section                | Source                                                                   |
| ---------------------- | ------------------------------------------------------------------------ |
| Hero shards background | AI-generated companion to the source design — clean centre for the title |
| 4 feature tiles        | Each quadrant cropped from the uploaded 2×2 cover grid                   |
| Editor row             | Uploaded "Editor Screenshots" diagonal-tile composition                  |
| 2 editor UI tiles      | Uploaded "Editor Config" & "Editor Fullscreen 3" screenshots             |
| Piano demo             | Live canvas visualization (or `editor-fullscreen.png` as `<noscript>`)   |

## Typography

- **Display** — [Poiret One](https://fonts.google.com/specimen/Poiret+One)
  for the elegant geometric title and section headings.
- **Body / UI** — [Josefin Sans](https://fonts.google.com/specimen/Josefin+Sans)
  Light (`200`/`300`) for body copy, navigation, and UI labels.

## Live piano visualizer

`assets/piano-viz.js` renders an 88-key piano with rising note bars onto a
`<canvas>`. Pre-warming makes the visualization look full the moment it
appears, and an `IntersectionObserver` pauses it when off-screen.

Each instance is configured by data attributes:

```html
<figure data-piano-viz data-palette="aurora">
  <canvas class="piano-canvas"></canvas>
  <div class="piano-keys"></div>
</figure>
```

Available palettes: `drift` (default), `aurora`, `ember`, `mono`, `candy`, `neon`.

## Interactions

- Sticky header with blur on scroll
- Top scroll-progress bar
- Hero parallax + cursor-following soft glow
- **Per-tile cursor glow** on every cover image and editor screenshot
- Scroll-reveal of major sections via `IntersectionObserver`
- Sticky docs sidebar with scroll-spy current-section highlighting
- Live piano visualizer (88 keys, color palettes, pre-warm, off-screen
  pause, melody cycling)

## Accessibility

- Respects `prefers-reduced-motion` (disables the cursor glow & parallax)
- Semantic landmarks, descriptive `alt` text
- `noscript` fallback to a static piano image
- Keyboard-focusable transport controls

## Running locally

There is no build step — serve the directory with anything that speaks HTTP:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.
