/* =====================================================
   PROPOSAL SITE — SCRIPT
   Everything that makes content APPEAR (scroll reveals,
   the letter, the typewriter line) uses plain native
   IntersectionObserver + CSS transitions, so the page
   works even with no internet connection at all.

   Lenis (smooth scroll) is the ONLY external library, and
   it is entirely optional — wrapped in try/catch — so a
   slow or blocked CDN can never break scrolling or hide
   content. It just means you get native scroll instead of
   the extra-buttery version.
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* -----------------------------------------------
     1. SMOOTH SCROLL (Lenis) — optional enhancement
     ----------------------------------------------- */
  let lenis = null;
  try {
    if (window.Lenis) {
      lenis = new window.Lenis({
        duration: 1.1,
        easing: (t) => 1 - Math.pow(1 - t, 3), // gentle ease-out
        smoothWheel: true,
      });

      const raf = (time) => {
        lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    }
  } catch (err) {
    // If Lenis fails for any reason, we simply fall back to native
    // browser scrolling — nothing else on the page depends on it.
    console.info("Smooth scroll unavailable, using native scroll instead.");
    lenis = null;
  }

  /* -----------------------------------------------
     2. LOADING SCREEN
     Hides on a short timer rather than waiting for
     window "load", so it never gets stuck if a CDN
     resource (fonts, Lenis, the audio placeholder) is
     slow to respond.
     ----------------------------------------------- */
  const loader = document.getElementById("loader");
  setTimeout(() => {
    loader.classList.add("hidden");
    playHomeIntro();
  }, 1500);

  /* -----------------------------------------------
     3. HOME SECTION INTRO REVEAL
     Simple staggered class toggle — pure CSS transition.
     ----------------------------------------------- */
  function playHomeIntro() {
    const lines = document.querySelectorAll("#section-home .reveal-line");
    const arrow = document.querySelector("#section-home .scroll-arrow");

    lines.forEach((line, i) => {
      setTimeout(() => line.classList.add("in-view"), i * 400);
    });

    if (arrow) {
      setTimeout(() => (arrow.style.opacity = 1), lines.length * 400 + 400);
      arrow.style.transition = "opacity 1s ease";
      arrow.style.opacity = 0;
    }
  }

  /* -----------------------------------------------
     4. SCROLL-TRIGGERED REVEALS
     One shared IntersectionObserver handles every
     ".reveal-up" / ".future-line" element on the page.
     ----------------------------------------------- */
  const revealTargets = document.querySelectorAll(".reveal-up, .future-line");

  // Give card grids and stacked lines a gentle stagger by setting a
  // transition-delay based on their position among siblings.
  document.querySelectorAll(".cards-grid").forEach((grid) => {
    [...grid.children].forEach((card, i) => {
      card.style.transitionDelay = `${i * 0.09}s`;
    });
  });
  document.querySelectorAll(".future-line").forEach((line, i, all) => {
    // Stagger relative to siblings within the same section only.
    const siblings = [...line.parentElement.querySelectorAll(".future-line")];
    const idx = siblings.indexOf(line);
    line.style.transitionDelay = `${idx * 0.5}s`;
  });

  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25, rootMargin: "0px 0px -10% 0px" }
  );

  revealTargets.forEach((el) => revealObserver.observe(el));

  /* -----------------------------------------------
     5. LETTER UNFOLD (section 6)
     ----------------------------------------------- */
  const letterPaper = document.querySelector(".letter-paper");
  if (letterPaper) {
    const letterObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );
    letterObserver.observe(letterPaper);
  }

  /* -----------------------------------------------
     6. TYPEWRITER EFFECT (section 7)
     ----------------------------------------------- */
  const typewriterEl = document.getElementById("typewriter");
  if (typewriterEl) {
    const typewriterObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runTypewriter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    typewriterObserver.observe(typewriterEl);
  }

  function runTypewriter(el) {
    const fullText = el.dataset.full;
    let i = 0;
    el.textContent = "";
    const speed = 42;

    function typeNext() {
      if (i <= fullText.length) {
        el.textContent = fullText.slice(0, i);
        i++;
        setTimeout(typeNext, speed);
      }
    }
    typeNext();
  }

  /* -----------------------------------------------
     7. FINAL CARD REVEAL
     ----------------------------------------------- */
  const finalCard = document.querySelector("#section-final .final-card");
  if (finalCard) {
    const finalObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    finalObserver.observe(finalCard);
  }

  /* -----------------------------------------------
     8. WORD CLOUDS (section 4)
     ----------------------------------------------- */
  const words = [
    "Cute", "Kind", "Beautiful", "Comfortable",
    "Adorable", "Smart", "Elegant", "Warm", "Positive",
  ];
  const field = document.getElementById("word-cloud-field");

  if (field) {
    words.forEach((word, i) => {
      const cloud = document.createElement("button");
      cloud.type = "button";
      cloud.className = "word-cloud";
      cloud.textContent = word;

      // Scatter clouds loosely across the field, avoiding hard overlap
      const col = i % 3;
      const row = Math.floor(i / 3);
      const left = 8 + col * 30 + Math.random() * 8;
      const top = 8 + row * 28 + Math.random() * 8;

      cloud.style.left = `${left}%`;
      cloud.style.top = `${top}%`;
      cloud.style.animationDelay = `${Math.random() * 3}s`;

      // Grow slightly on touch/hover, matching the brief's cloud interaction
      const grow = () => cloud.classList.add("touched");
      const shrink = () => cloud.classList.remove("touched");
      cloud.addEventListener("mouseenter", grow);
      cloud.addEventListener("mouseleave", shrink);
      cloud.addEventListener("touchstart", grow, { passive: true });
      cloud.addEventListener("touchend", shrink);

      field.appendChild(cloud);
    });
  }

  /* -----------------------------------------------
     9. CURSOR HEART TRAIL (throttled)
     ----------------------------------------------- */
  const cursorLayer = document.getElementById("cursor-heart-layer");
  let lastHeartTime = 0;

  function spawnCursorHeart(x, y) {
    const now = Date.now();
    if (now - lastHeartTime < 140) return; // throttle so it stays subtle
    lastHeartTime = now;

    const heart = document.createElement("div");
    heart.className = "cursor-heart";
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    cursorLayer.appendChild(heart);
    setTimeout(() => heart.remove(), 950);
  }

  window.addEventListener("mousemove", (e) => spawnCursorHeart(e.clientX, e.clientY));
  window.addEventListener(
    "touchmove",
    (e) => {
      const t = e.touches[0];
      if (t) spawnCursorHeart(t.clientX, t.clientY);
    },
    { passive: true }
  );

  /* -----------------------------------------------
     10. AMBIENT FLOATING HEARTS (whole page)
     ----------------------------------------------- */
  const ambientLayer = document.getElementById("ambient-hearts");

  function spawnAmbientHeart() {
    const heart = document.createElement("div");
    heart.className = "floaty-heart";
    const startX = Math.random() * 100;
    const size = 10 + Math.random() * 14;
    const duration = 9 + Math.random() * 8;

    heart.style.left = `${startX}vw`;
    heart.style.bottom = "-5vh";
    heart.style.width = `${size}px`;
    heart.style.height = `${size}px`;
    heart.style.animation = `floatUp ${duration}s linear forwards`;

    ambientLayer.appendChild(heart);
    setTimeout(() => heart.remove(), duration * 1000);
  }

  setInterval(spawnAmbientHeart, 1400);
  // A few on load so the page doesn't feel empty at first
  for (let i = 0; i < 4; i++) setTimeout(spawnAmbientHeart, i * 500);

  /* -----------------------------------------------
     11. SCROLL PROGRESS DOTS
     ----------------------------------------------- */
  const dots = document.querySelectorAll("#progress-dots span");
  const sections = document.querySelectorAll(".panel");

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const target = sections[Number(dot.dataset.target)];
      if (!target) return;
      if (lenis) {
        lenis.scrollTo(target);
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  const dotObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = Number(entry.target.dataset.index);
          dots.forEach((d) => d.classList.remove("active"));
          if (dots[idx]) dots[idx].classList.add("active");
        }
      });
    },
    { threshold: 0.5 }
  );
  sections.forEach((section) => dotObserver.observe(section));

  /* -----------------------------------------------
     12. MAGNETIC BUTTON HOVER EFFECT
     ----------------------------------------------- */
  document.querySelectorAll(".btn-magnetic").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px) scale(1.06)`;
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "translate(0, 0) scale(1)";
    });
  });

  /* -----------------------------------------------
     13. MUSIC TOGGLE
     ----------------------------------------------- */
  const musicBtn = document.getElementById("music-toggle");
  const music = document.getElementById("bg-music");
  let musicPlaying = false;

  musicBtn.addEventListener("click", () => {
    if (!musicPlaying) {
      // The placeholder file may be empty until real audio is added —
      // fail quietly rather than breaking the experience.
      music.play().catch(() => {
        console.info("Add a real track at assets/music.mp3 to enable music.");
      });
      musicBtn.classList.add("playing");
      musicBtn.classList.remove("muted");
      musicPlaying = true;
    } else {
      music.pause();
      musicBtn.classList.remove("playing");
      musicBtn.classList.add("muted");
      musicPlaying = false;
    }
  });

  /* -----------------------------------------------
     14. FINAL SECTION — YES / FRIENDS
     ----------------------------------------------- */
  const btnYes = document.getElementById("btn-yes");
  const btnFriends = document.getElementById("btn-friends");
  const finalButtons = document.getElementById("final-buttons");
  const finalResponse = document.getElementById("final-response");
  const finalPanel = document.querySelector(".final-panel");

  btnYes.addEventListener("click", () => {
    finalButtons.classList.add("answered");
    finalResponse.textContent = "Yayyyy! We just made a day memorable together, many more to go. 💙";
    finalResponse.classList.add("show");
    finalPanel.classList.add("turned-pink");
    celebrate();
  });

  btnFriends.addEventListener("click", () => {
    finalButtons.classList.add("answered");
    finalResponse.textContent =
      "Thank you for reading this and allowing me to express myself I'm really glad I told you. Be comfortable take your time.";
    finalResponse.classList.add("show");
  });

  function celebrate() {
    // Confetti hearts burst
    const layer = document.getElementById("confetti-layer");
    const emojis = ["💖", "💙", "✨", "🌸", "💕"];
    for (let i = 0; i < 40; i++) {
      setTimeout(() => {
        const piece = document.createElement("div");
        piece.className = "confetti-piece";
        piece.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        piece.style.left = `${Math.random() * 100}%`;
        const duration = 3 + Math.random() * 2.5;
        piece.style.animationDuration = `${duration}s`;
        layer.appendChild(piece);
        setTimeout(() => piece.remove(), duration * 1000);
      }, i * 60);
    }

    // A little burst of extra ambient hearts
    for (let i = 0; i < 12; i++) setTimeout(spawnAmbientHeart, i * 120);
  }

});
