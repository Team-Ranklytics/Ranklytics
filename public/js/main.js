/**
 * Ranklytics — Terminal Console Interaction Engine
 * Pure JS · No external dependencies (GSAP already loaded via CDN)
 */

document.addEventListener("DOMContentLoaded", () => {

  /* ──────────────────────────────────────────────────────
     0. SCROLL PROGRESS BAR
  ────────────────────────────────────────────────────── */
  const progressBar = (() => {
    const bar = document.createElement("div");
    bar.className = "scroll-progress";
    document.body.prepend(bar);
    window.addEventListener("scroll", () => {
      const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      bar.style.transform = `scaleX(${pct})`;
    }, { passive: true });
    return bar;
  })();

  /* ──────────────────────────────────────────────────────
     1. MOBILE MENU
  ────────────────────────────────────────────────────── */
  const mobileBtn = document.querySelector(".mobile-menu-btn");
  const navLinks = document.querySelector(".nav-links");

  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener("click", () => {
      const expanded = mobileBtn.getAttribute("aria-expanded") === "true";
      mobileBtn.setAttribute("aria-expanded", String(!expanded));
      navLinks.classList.toggle("active");
      // Animate hamburger → X
      const lines = mobileBtn.querySelectorAll("line");
      if (lines.length === 3) {
        lines[0].style.transform = expanded ? "" : "rotate(45deg) translate(5px, 5px)";
        lines[1].style.opacity = expanded ? "1" : "0";
        lines[2].style.transform = expanded ? "" : "rotate(-45deg) translate(5px, -5px)";
        lines.forEach(l => l.style.transition = "transform 0.3s, opacity 0.3s");
        lines.forEach(l => l.style.transformOrigin = "center");
      }
    });

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".navbar")) {
        navLinks.classList.remove("active");
        mobileBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ──────────────────────────────────────────────────────
     2. NAVBAR SCROLL EFFECT
  ────────────────────────────────────────────────────── */
  const navbar = document.querySelector(".navbar");
  if (navbar) {
    window.addEventListener("scroll", () => {
      navbar.style.background = window.scrollY > 60
        ? "rgba(6, 10, 6, 0.97)"
        : "rgba(6, 10, 6, 0.85)";
    }, { passive: true });
  }

  /* ──────────────────────────────────────────────────────
     3. MATRIX RAIN CANVAS (hero only)
  ────────────────────────────────────────────────────── */
  const canvas = document.getElementById("hero-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    const chars = "01アイウエオカキクケコ10RANKLYTICSSEO$>_//{}[]<>0101".split("");
    let cols, drops, rafId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const fontSize = 13;
      cols = Math.floor(canvas.width / fontSize);
      drops = Array(cols).fill(1);
    };

    const draw = () => {
      ctx.fillStyle = "rgba(6, 10, 6, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#00ff41";
      ctx.font = "13px 'Fira Code', monospace";

      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.globalAlpha = 0.4 + Math.random() * 0.6;
        ctx.fillText(char, i * 13, y * 13);
        if (y * 13 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });

    // Pause when not visible (performance)
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { cancelAnimationFrame(rafId); draw(); }
      else cancelAnimationFrame(rafId);
    });
    observer.observe(canvas);
  }

  /* ──────────────────────────────────────────────────────
     4. TYPEWRITER EFFECT (hero headline)
  ────────────────────────────────────────────────────── */
  const typewriterEl = document.querySelector("[data-typewriter]");
  if (typewriterEl) {
    const phrases = JSON.parse(typewriterEl.dataset.typewriter || '[]');
    if (!phrases.length) return;

    let pIdx = 0, cIdx = 0, deleting = false;
    const cursor = document.createElement("span");
    cursor.className = "cursor-blink";
    typewriterEl.after(cursor);

    const type = () => {
      const phrase = phrases[pIdx];
      if (!deleting) {
        typewriterEl.textContent = phrase.slice(0, ++cIdx);
        if (cIdx === phrase.length) { deleting = true; setTimeout(type, 2000); return; }
      } else {
        typewriterEl.textContent = phrase.slice(0, --cIdx);
        if (cIdx === 0) { deleting = false; pIdx = (pIdx + 1) % phrases.length; }
      }
      setTimeout(type, deleting ? 40 : 80);
    };
    setTimeout(type, 600);
  }

  /* ──────────────────────────────────────────────────────
     5. CARD HOVER EFFECTS (CSS handled)
  ────────────────────────────────────────────────────── */
  // Removed 3D Tilt per user request. Using CSS animations for premium feel.

  /* ──────────────────────────────────────────────────────
     6. STAT COUNTERS (count up on scroll)
  ────────────────────────────────────────────────────── */
  const counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    const counterObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || "";
        const prefix = el.dataset.prefix || "";
        const dur = 1800;
        const start = performance.now();

        const animate = (now) => {
          const progress = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
          const val = target * eased;
          el.textContent = prefix + (Number.isInteger(target) ? Math.floor(val) : val.toFixed(1)) + suffix;
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
        counterObs.unobserve(el);
      });
    }, { threshold: 0.4 });

    counters.forEach(c => counterObs.observe(c));
  }

  /* ──────────────────────────────────────────────────────
     7. GLITCH HOVER ON HEADINGS
  ────────────────────────────────────────────────────── */
  document.querySelectorAll(".glitch").forEach(el => {
    el.dataset.text = el.textContent;
    let timer;
    el.addEventListener("mouseenter", () => {
      el.classList.add("active");
      clearTimeout(timer);
      timer = setTimeout(() => el.classList.remove("active"), 400);
    });
  });

  /* ──────────────────────────────────────────────────────
     8. FAQ ACCORDION
  ────────────────────────────────────────────────────── */
  document.querySelectorAll(".faq-question").forEach(q => {
    q.addEventListener("click", () => {
      const item = q.closest(".faq-item");
      const wasOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(i => i.classList.remove("open"));
      if (!wasOpen) item.classList.add("open");
    });
    q.setAttribute("role", "button");
    q.setAttribute("tabindex", "0");
    q.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); q.click(); }
    });
  });

  /* ──────────────────────────────────────────────────────
     9. GSAP ANIMATIONS
  ────────────────────────────────────────────────────── */
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    // Hero entrance
    const heroItems = document.querySelectorAll(".hero .gsap-reveal, .hero [data-gsap='reveal']");
    if (heroItems.length) {
      gsap.fromTo(heroItems,
        { y: 50, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, stagger: 0.15, duration: 1.2, ease: "expo.out", delay: 0.3 }
      );
    }

    // Section reveals
    gsap.utils.toArray("section:not(.hero) .gsap-reveal").forEach(el => {
      gsap.fromTo(el,
        { y: 35, autoAlpha: 0 },
        {
          scrollTrigger: { trigger: el, start: "top 82%", toggleActions: "play none none reverse" },
          y: 0, autoAlpha: 1, duration: 1, ease: "power3.out"
        }
      );
    });

    // Stagger cards
    gsap.utils.toArray(".glass-card, .stat-card, .terminal-card").forEach((card, i) => {
      gsap.fromTo(card,
        { y: 24, autoAlpha: 0 },
        {
          scrollTrigger: { trigger: card, start: "top 88%" },
          y: 0, autoAlpha: 1, duration: 0.9, ease: "power2.out", delay: (i % 3) * 0.08
        }
      );
    });

    // Heading parallax
    gsap.utils.toArray("[data-parallax]").forEach(el => {
      gsap.to(el, {
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1.5 },
        y: el.dataset.parallax || -40,
        ease: "none"
      });
    });

  } else {
    // Fallback: make all hidden elements visible
    document.querySelectorAll(".gsap-reveal").forEach(el => {
      el.style.opacity = "1";
      el.style.visibility = "visible";
    });
  }

  /* ──────────────────────────────────────────────────────
     10. TERMINAL COMMAND TYPEWRITER (process section)
  ────────────────────────────────────────────────────── */
  const termLines = document.querySelectorAll("[data-terminal-line]");
  if (termLines.length) {
    const termObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const lines = entry.target.querySelectorAll("[data-terminal-line]");
        lines.forEach((line, idx) => {
          const text = line.textContent;
          line.textContent = "";
          let ci = 0;
          setTimeout(() => {
            const t = setInterval(() => {
              line.textContent += text[ci++];
              if (ci >= text.length) clearInterval(t);
            }, 30);
          }, idx * 600);
        });
        termObs.unobserve(entry.target);
      });
    }, { threshold: 0.3 });

    const termBlock = document.querySelector(".terminal-card__body");
    if (termBlock) termObs.observe(termBlock);
  }

  /* ──────────────────────────────────────────────────────
     11. CONTACT FORM HANDLER
  ────────────────────────────────────────────────────── */
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector("button[type='submit']");
      const orig = btn.textContent;
      btn.textContent = "[ PROCESSING... ]";
      btn.disabled = true;

      try {
        const data = Object.fromEntries(new FormData(e.target));
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (res.ok || res.status === 0) {
          document.getElementById("formSuccess").style.display = "block";
          e.target.reset();
        } else {
          alert("[ ERROR ] Transmission failed. Ping via WhatsApp instead.");
        }
      } catch {
        document.getElementById("formSuccess").style.display = "block";
        e.target.reset();
      } finally {
        btn.textContent = orig;
        btn.disabled = false;
      }
    });
  }

});
