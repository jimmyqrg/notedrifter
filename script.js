/**
 * NoteDrifter — Landing Page Interactions
 * - Sticky header shadow on scroll
 * - Scroll reveal animations
 * - Year stamping in footer
 * - Smooth anchor scrolling
 */

(() => {
    "use strict";

    /* -------------------------------------------------------------- *
     * Mark JS as ready — enables CSS scroll-reveal hiding.
     * If this script never runs, content stays visible.
     * -------------------------------------------------------------- */
    document.body.classList.add("js-ready");

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    /* -------------------------------------------------------------- *
     * Footer year
     * -------------------------------------------------------------- */
    const yearEl = document.getElementById("year");
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    /* -------------------------------------------------------------- *
     * Sticky header + hero parallax (home)
     * -------------------------------------------------------------- */
    const header = document.querySelector(".site-header");

    let ticking = false;
    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const y = window.scrollY;
            if (header) {
                if (y > 12) header.classList.add("is-scrolled");
                else header.classList.remove("is-scrolled");
            }

            // Hero parallax — only on the home page
            if (heroBg && !prefersReducedMotion) {
                const intensity = Math.min(y / window.innerHeight, 1);
                heroBg.style.transform = `translate3d(0, ${y * 0.18}px, 0) scale(${1 + intensity * 0.04})`;
            }
            if (heroContent && !prefersReducedMotion) {
                const intensity = Math.min(y / window.innerHeight, 1);
                heroContent.style.transform = `translate3d(0, ${y * 0.06}px, 0)`;
                heroContent.style.opacity = String(1 - intensity * 0.5);
            }

            ticking = false;
        });
    };

    const heroBg = document.querySelector(".hero-bg");
    const heroContent = document.querySelector(".hero-content");

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* -------------------------------------------------------------- *
     * Cursor-follow glow on the hero (home only)
     * -------------------------------------------------------------- */
    const hero = document.querySelector(".hero");
    if (hero && !prefersReducedMotion) {
        hero.addEventListener("pointermove", (e) => {
            const rect = hero.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            hero.style.setProperty("--cursor-x", `${x}%`);
            hero.style.setProperty("--cursor-y", `${y}%`);
        });
    }

    /* -------------------------------------------------------------- *
     * Cursor-follow soft light on every [data-cover-light] tile —
     * each cover image picks up a moving highlight under the pointer.
     * -------------------------------------------------------------- */
    if (!prefersReducedMotion) {
        document.querySelectorAll("[data-cover-light]").forEach((el) => {
            el.addEventListener("pointermove", (e) => {
                const rect = el.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                el.style.setProperty("--cursor-x", `${x}%`);
                el.style.setProperty("--cursor-y", `${y}%`);
            });
            el.addEventListener("pointerleave", () => {
                el.style.setProperty("--cursor-x", `50%`);
                el.style.setProperty("--cursor-y", `50%`);
            });
        });
    }

    /* -------------------------------------------------------------- *
     * Scroll reveal — applied to common sections
     * -------------------------------------------------------------- */
    const revealTargets = document.querySelectorAll(
        ".intro-text, .feature-tile, .features-lead, .feature-list > li, " +
            ".section-title, .editor-row, .editor-caption, .editor-ui-tile, .editor-demo, " +
            ".coming-soon-eyebrow, .coming-soon-list li, " +
            ".docs-body section"
    );

    revealTargets.forEach((el, idx) => {
        el.classList.add("reveal");
        // Slight stagger when items appear together (e.g. grids, lists)
        el.style.transitionDelay = `${Math.min(idx * 35, 280)}ms`;
    });

    if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        io.unobserve(entry.target);
                    }
                });
            },
            { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
        );
        revealTargets.forEach((el) => io.observe(el));
    } else {
        revealTargets.forEach((el) => el.classList.add("is-visible"));
    }

    /* -------------------------------------------------------------- *
     * Smooth anchor scrolling (for nav anchors only)
     * -------------------------------------------------------------- */
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", (e) => {
            const targetId = anchor.getAttribute("href");
            if (!targetId || targetId === "#") return;
            const target = document.querySelector(targetId);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });

    /* -------------------------------------------------------------- *
     * Docs sidebar — scroll-spy current section
     * -------------------------------------------------------------- */
    const sideLinks = document.querySelectorAll(".docs-side-link");
    const docSections = document.querySelectorAll(".docs-body section[id]");
    if (sideLinks.length && docSections.length && "IntersectionObserver" in window) {
        const linkByHash = new Map();
        sideLinks.forEach((l) => {
            const href = l.getAttribute("href") || "";
            if (href.startsWith("#")) linkByHash.set(href.slice(1), l);
        });

        const ioSpy = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const id = entry.target.id;
                    const link = linkByHash.get(id);
                    if (!link) return;
                    if (entry.isIntersecting) {
                        sideLinks.forEach((l) => l.classList.remove("is-current"));
                        link.classList.add("is-current");
                    }
                });
            },
            { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
        );
        docSections.forEach((s) => ioSpy.observe(s));
    }

})();
