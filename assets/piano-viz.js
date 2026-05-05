/**
 * NoteDrifter — Live Piano Visualizer
 *
 * Renders an 88-key piano with continuously rising / falling note bars on a
 * <canvas>. The HTML for the keys is generated as DOM nodes so they can be
 * styled with CSS (white / black, gradients, key-down state).
 *
 * Usage:
 *   <figure data-piano-viz>
 *     <canvas class="piano-canvas"></canvas>
 *     <div class="piano-keys"></div>
 *   </figure>
 *
 *   new PianoViz(document.querySelector("[data-piano-viz]"));
 */

(() => {
    "use strict";

    /* ----- Constants ----- */
    const WHITE_KEYS = 52; // standard piano range A0..C8

    /* ----- Palettes ----- */
    const PALETTES = {
        drift: [
            { hue: 320, sat: 100, light: 60 }, // pink
            { hue: 295, sat: 100, light: 62 }, // magenta
            { hue: 270, sat: 95, light: 65 }, // purple
            { hue: 200, sat: 100, light: 60 }, // cyan
            { hue: 220, sat: 95, light: 65 }, // electric blue
        ],
        aurora: [
            { hue: 160, sat: 80, light: 60 },
            { hue: 180, sat: 90, light: 65 },
            { hue: 200, sat: 95, light: 65 },
            { hue: 235, sat: 80, light: 70 },
            { hue: 270, sat: 60, light: 72 },
        ],
        ember: [
            { hue: 0, sat: 90, light: 60 },
            { hue: 18, sat: 100, light: 60 },
            { hue: 32, sat: 100, light: 62 },
            { hue: 350, sat: 95, light: 60 },
        ],
        mono: [
            { hue: 0, sat: 0, light: 92 },
            { hue: 0, sat: 0, light: 78 },
            { hue: 0, sat: 0, light: 64 },
            { hue: 0, sat: 0, light: 50 },
        ],
        candy: [
            { hue: 330, sat: 90, light: 75 },
            { hue: 50, sat: 100, light: 70 },
            { hue: 290, sat: 80, light: 78 },
            { hue: 195, sat: 85, light: 75 },
        ],
        neon: [
            { hue: 130, sat: 100, light: 55 },
            { hue: 300, sat: 100, light: 60 },
            { hue: 50, sat: 100, light: 60 },
            { hue: 200, sat: 100, light: 60 },
        ],
    };

    /* ----- Sample melody patterns (each is array of relative key indices) ----- */
    const MELODIES = [
        // Drifting arpeggios
        [
            18, 22, 25, 29, 32, 29, 25, 22, 26, 30, 33, 37, 33, 30, 26, 22,
            18, 21, 25, 28, 32, 28, 25, 21,
        ],
        // Ascending waves
        [
            14, 17, 21, 24, 28, 31, 35, 38, 35, 31, 28, 24, 21, 17, 14, 10,
            14, 17, 21, 25, 28, 32, 35, 39,
        ],
        // Mixed chord splashes
        [
            17, 24, 31, 38, 17, 21, 24, 28, 31, 35, 38, 21, 28, 35, 38, 31,
            24, 17, 14, 21, 28, 35, 28, 21,
        ],
    ];

    class PianoViz {
        constructor(root) {
            this.root = root;
            this.canvas = root.querySelector(".piano-canvas");
            this.ctx = this.canvas.getContext("2d");
            this.keysContainer = root.querySelector(".piano-keys");

            const paletteName = root.dataset.palette || "drift";
            this.palette = PALETTES[paletteName] || PALETTES.drift;
            // Each palette can tune timing too
            const paceFactor =
                paletteName === "ember"
                    ? 0.7
                    : paletteName === "aurora"
                    ? 1.5
                    : paletteName === "mono"
                    ? 1.1
                    : 1;

            this.notes = []; // active rising bars
            this.keyEls = []; // DOM <div> for each white key
            this.blackKeyEls = []; // DOM <div> for each black key (sparse)
            this.totalKeys = 88;
            this.isPlaying = true;
            this.lastSpawn = 0;
            this.spawnInterval = 110 * paceFactor; // ms
            this.melodyIdx = Math.floor(Math.random() * 3);
            this.melodyStep = 0;

            this.dpr = Math.min(window.devicePixelRatio || 1, 2);

            this.handleResize = this.handleResize.bind(this);
            this.tick = this.tick.bind(this);

            this.buildKeys();
            this.handleResize();
            window.addEventListener("resize", this.handleResize, { passive: true });

            // Pause when tab is hidden to save CPU
            document.addEventListener("visibilitychange", () => {
                if (document.hidden) this.pause();
                else if (this.isPlaying) this.start();
            });

            // Start once so pre-warm notes get drawn at least once.
            this.start();
            // Manually draw a first frame so the visualization shows a full
            // composition immediately, even if IntersectionObserver stops
            // it before the next animation frame fires.
            this.draw(16);

            // Pause when not in viewport (with generous margin so off-screen
            // demos still feel "alive" when they enter the viewport).
            if ("IntersectionObserver" in window) {
                const io = new IntersectionObserver(
                    (entries) => {
                        entries.forEach((entry) => {
                            if (entry.isIntersecting && this.isPlaying) {
                                this.start();
                            } else if (!entry.isIntersecting) {
                                this.stop();
                            }
                        });
                    },
                    { rootMargin: "300px 0px 300px 0px" }
                );
                io.observe(this.root);
            }
        }

        /* ---------------------------------------------------------------- */
        /* Setup                                                             */
        /* ---------------------------------------------------------------- */
        buildKeys() {
            // Inner wrapper holds white keys flexed equally; black keys are
            // absolutely positioned over white keys.
            const inner = document.createElement("div");
            inner.className = "piano-keys-inner";
            this.keysContainer.appendChild(inner);

            for (let i = 0; i < WHITE_KEYS; i++) {
                const k = document.createElement("div");
                k.className = "piano-key piano-key--white";
                k.dataset.idx = String(i);
                inner.appendChild(k);
                this.keyEls.push(k);
            }

            // Place black keys: piano range starts at A0. Pattern of white keys is:
            // A B C D E F G — the black keys above are between (A-B is no, A#=between A&B yes)
            // We will use a per-position lookup based on the diatonic scale starting on A.
            // To keep this simple and visually balanced, we drop a black key over the GAP
            // between white-key i and i+1 using a known pattern. We'll generate from A0.

            // White-key to scale-degree mapping (mod 7) starting at A:
            // 0=A, 1=B, 2=C, 3=D, 4=E, 5=F, 6=G
            // Black key exists in the gap AFTER white key:
            //   A→A# yes(0), B→C no(1), C→C# yes(2), D→D# yes(3), E→F no(4),
            //   F→F# yes(5), G→G# yes(6)
            const blackAfter = [true, false, true, true, false, true, true];
            const innerRect = () => inner.getBoundingClientRect();

            for (let i = 0; i < WHITE_KEYS - 1; i++) {
                const degree = i % 7;
                if (!blackAfter[degree]) continue;
                const bk = document.createElement("div");
                bk.className = "piano-key piano-key--black";
                bk.dataset.idx = String(i + 0.5);
                inner.appendChild(bk);
                // Position: centered on the gap between key i and i+1
                bk.style.left = `calc(${((i + 1) / WHITE_KEYS) * 100}% - 0.7%)`;
                this.blackKeyEls.push(bk);
            }
        }

        handleResize() {
            const rect = this.canvas.getBoundingClientRect();
            // Setting width/height clears the canvas bitmap, so we capture
            // the dimensions and redraw the current frame afterwards.
            this.canvas.width = Math.floor(rect.width * this.dpr);
            this.canvas.height = Math.floor(rect.height * this.dpr);
            this.ctx.scale(this.dpr, this.dpr);
            this.cssW = rect.width;
            this.cssH = rect.height;
            // Pixel position of the keyboard top within the canvas
            const keyRect = this.keysContainer.getBoundingClientRect();
            this.keyboardTop = keyRect.top - rect.top;
            // White key width in CSS pixels
            this.whiteKeyW = rect.width / WHITE_KEYS;

            // Re-render current state so resizing doesn't blank the canvas
            // when the animation is paused (e.g. element off-screen).
            if (this.notes && this.notes.length) {
                this.draw(0);
            }
        }

        /* ---------------------------------------------------------------- */
        /* Animation loop                                                    */
        /* ---------------------------------------------------------------- */
        start() {
            if (this._raf) return;
            this.isPlaying = true;
            this.lastFrame = performance.now();

            // Pre-warm — spawn notes positioned across the canvas height so
            // the visualization always feels full when first seen. Ages are
            // computed from the canvas size so bars never end up off-screen
            // on smaller (mobile) layouts.
            if (!this._warmed && this.cssH > 0) {
                const maxRise = this.cssH * 0.7;
                for (let i = 0; i < 8; i++) {
                    this.spawn();
                    const last = this.notes[this.notes.length - 1];
                    if (last) {
                        const heightFraction = (8 - i) / 8; // 1 down to 0.125
                        const targetRise = heightFraction * maxRise;
                        last.age = targetRise / last.velocity;
                    }
                }
                this._warmed = true;
            }

            this._raf = requestAnimationFrame(this.tick);
        }

        stop() {
            if (this._raf) {
                cancelAnimationFrame(this._raf);
                this._raf = null;
            }
        }

        pause() {
            this.stop();
        }

        toggle() {
            if (this._raf) this.pause();
            else this.start();
            return Boolean(this._raf);
        }

        nextMelody(dir = 1) {
            this.melodyIdx = (this.melodyIdx + dir + MELODIES.length) % MELODIES.length;
            this.melodyStep = 0;
        }

        tick(now) {
            const dt = Math.min(now - this.lastFrame, 64);
            this.lastFrame = now;

            // Spawn new notes at fixed interval
            if (now - this.lastSpawn > this.spawnInterval) {
                this.spawn();
                this.lastSpawn = now;
            }

            this.draw(dt);
            this._raf = requestAnimationFrame(this.tick);
        }

        spawn() {
            const melody = MELODIES[this.melodyIdx];
            const baseKey = melody[this.melodyStep % melody.length];
            this.melodyStep++;

            // Sometimes spawn a "harmony" note an octave or third above
            const noteIndices = [baseKey];
            if (Math.random() < 0.35) {
                noteIndices.push(baseKey + 7); // a fifth-ish in white-key world
            }
            if (Math.random() < 0.18) {
                noteIndices.push(baseKey + 12);
            }

            const colorBase = this.palette[Math.floor(Math.random() * this.palette.length)];

            noteIndices.forEach((keyIdx) => {
                if (keyIdx >= WHITE_KEYS) return;
                const hueJitter = (Math.random() - 0.5) * 24;
                this.notes.push({
                    key: keyIdx,
                    h: colorBase.hue + hueJitter,
                    s: colorBase.sat,
                    l: colorBase.light,
                    age: 0,
                    height: 60 + Math.random() * 240,
                    width: this.whiteKeyW * 0.55,
                    velocity: 0.18 + Math.random() * 0.18, // pixels per ms upwards
                    flashed: false,
                });
                this.flashKey(keyIdx);
            });
        }

        flashKey(idx) {
            const el = this.keyEls[idx];
            if (!el) return;
            el.classList.add("is-active");
            clearTimeout(el._flashT);
            el._flashT = setTimeout(() => el.classList.remove("is-active"), 140);
        }

        /* ---------------------------------------------------------------- */
        /* Render                                                            */
        /* ---------------------------------------------------------------- */
        draw(dt) {
            const ctx = this.ctx;
            const W = this.cssW;
            const H = this.cssH;
            const baseY = this.keyboardTop;

            // Trail — draw a translucent black rect for motion blur
            ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
            ctx.fillRect(0, 0, W, H);

            // Update + draw each note bar
            for (let i = this.notes.length - 1; i >= 0; i--) {
                const n = this.notes[i];
                n.age += dt;

                // Bar position rises from the keyboard top
                const riseDist = n.velocity * n.age;
                const top = baseY - riseDist;
                const bottom = baseY;
                const visibleTop = Math.max(top, bottom - n.height);
                const x = n.key * this.whiteKeyW + (this.whiteKeyW - n.width) / 2;

                if (visibleTop > -50) {
                    // Bar fill — gradient bottom (bright) to top (transparent)
                    const grad = ctx.createLinearGradient(0, bottom, 0, visibleTop);
                    const baseCol = `hsl(${n.h}, ${n.s}%, ${n.l}%)`;
                    const dimCol = `hsla(${n.h}, ${n.s}%, ${n.l}%, 0)`;
                    grad.addColorStop(0, baseCol);
                    grad.addColorStop(0.4, `hsla(${n.h}, ${n.s}%, ${n.l}%, 0.85)`);
                    grad.addColorStop(1, dimCol);

                    ctx.fillStyle = grad;
                    ctx.shadowColor = baseCol;
                    ctx.shadowBlur = 14;
                    ctx.fillRect(x, visibleTop, n.width, bottom - visibleTop);
                    ctx.shadowBlur = 0;

                    // Bright bottom cap
                    ctx.fillStyle = `hsla(${n.h}, ${n.s}%, ${Math.min(n.l + 25, 90)}%, 0.9)`;
                    ctx.fillRect(x, bottom - 4, n.width, 4);
                }

                // Particles at impact (bottom of bar) on first frames
                if (n.age < 280) {
                    const particles = 3;
                    for (let p = 0; p < particles; p++) {
                        const px = x + Math.random() * n.width;
                        const py = bottom - Math.random() * 18;
                        const a = 1 - n.age / 280;
                        ctx.fillStyle = `hsla(${n.h}, ${n.s}%, 90%, ${a * 0.7})`;
                        ctx.beginPath();
                        ctx.arc(px, py, 1 + Math.random() * 1.5, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }

                // Remove if fully off screen / faded out
                if (top + n.height < -20) {
                    this.notes.splice(i, 1);
                }
            }
        }
    }

    /* ----- Bootstrap ----- */
    function init() {
        const roots = document.querySelectorAll("[data-piano-viz]");
        const instances = [];
        roots.forEach((r) => {
            try {
                instances.push(new PianoViz(r));
            } catch (err) {
                console.warn("PianoViz failed:", err);
            }
        });

        // Wire up demo controls (assumed sibling buttons inside the same root)
        roots.forEach((r) => {
            const inst = instances.find((i) => i.root === r);
            if (!inst) return;
            const btnPlay = r.querySelector('[data-action="play"]');
            const btnPrev = r.querySelector('[data-action="prev"]');
            const btnNext = r.querySelector('[data-action="next"]');

            const playIcon =
                '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>';
            const pauseIcon =
                '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M6 5h4v14H6V5zm8 0h4v14h-4V5z"/></svg>';

            btnPlay?.addEventListener("click", () => {
                const playing = inst.toggle();
                btnPlay.innerHTML = playing ? pauseIcon : playIcon;
                btnPlay.setAttribute("aria-label", playing ? "Pause" : "Play");
            });
            btnPrev?.addEventListener("click", () => inst.nextMelody(-1));
            btnNext?.addEventListener("click", () => inst.nextMelody(1));
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    window.PianoViz = PianoViz;
})();
