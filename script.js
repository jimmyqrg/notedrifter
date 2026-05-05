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

    /* -------------------------------------------------------------- *
     * Footer year
     * -------------------------------------------------------------- */
    const yearEl = document.getElementById("year");
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    /* -------------------------------------------------------------- *
     * Sticky header on scroll
     * -------------------------------------------------------------- */
    const header = document.querySelector(".site-header");
    const onScroll = () => {
        if (!header) return;
        if (window.scrollY > 12) {
            header.classList.add("is-scrolled");
        } else {
            header.classList.remove("is-scrolled");
        }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* -------------------------------------------------------------- *
     * Scroll reveal — applied to common sections
     * -------------------------------------------------------------- */
    const revealTargets = document.querySelectorAll(
        ".intro-text, .feature-tile, .features-lead, .feature-list > li, " +
            ".section-title, .editor-row, .editor-caption, .editor-ui-tile, .editor-demo"
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
     * Demo player play / pause toggle (visual only)
     * -------------------------------------------------------------- */
    const playBtn = document.querySelector(".ctrl-btn--play");
    if (playBtn) {
        let playing = false;
        const playIcon =
            '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>';
        const pauseIcon =
            '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M6 5h4v14H6V5zm8 0h4v14h-4V5z"/></svg>';

        playBtn.addEventListener("click", () => {
            playing = !playing;
            playBtn.innerHTML = playing ? pauseIcon : playIcon;
            playBtn.setAttribute("aria-label", playing ? "Pause" : "Play");
        });
    }
})();
