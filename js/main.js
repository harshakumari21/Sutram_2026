document.addEventListener("DOMContentLoaded", () => {
  // ---- Light / dark theme toggle -------------------------------------
  // The stored choice is applied by a tiny inline script in each page's
  // <head> (so there is no flash of the wrong theme); this only builds
  // the control and keeps it in sync.
  const THEME_KEY = "sutram-theme";

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* private mode */ }
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(theme === "dark"));
      btn.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
      btn.setAttribute("title", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
      const knob = btn.querySelector(".theme-toggle-knob");
      if (knob) knob.textContent = theme === "dark" ? "\u{1F319}" : "\u2600\uFE0F";
    });
  }

  function buildToggle(extraClass) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "theme-toggle" + (extraClass ? " " + extraClass : "");
    btn.setAttribute("data-theme-toggle", "");
    btn.innerHTML =
      '<span class="theme-toggle-track" aria-hidden="true"><span>\u2600\uFE0F</span><span>\u{1F319}</span></span>' +
      '<span class="theme-toggle-knob" aria-hidden="true"></span>';
    btn.addEventListener("click", () => {
      applyTheme(currentTheme() === "dark" ? "light" : "dark");
    });
    return btn;
  }

  // Theme toggle button disabled/hidden as requested
  /*
  const topbarRight = document.querySelector(".topbar-right");
  if (topbarRight) {
    topbarRight.insertBefore(buildToggle(), topbarRight.querySelector(".login-btn"));
  } else {
    document.body.appendChild(buildToggle("floating"));
  }
  */


  applyTheme(currentTheme());

  // 3-Line Hamburger Menu Toggle Logic
  const menuToggle = document.getElementById("menuToggle");
  const closeDrawer = document.getElementById("closeDrawer");
  const navDrawer = document.getElementById("navDrawer");
  const navBackdrop = document.getElementById("navBackdrop");

  if (menuToggle && closeDrawer && navDrawer && navBackdrop) {
    let lastFocused = null;

    function setDrawer(open) {
      menuToggle.classList.toggle("active", open);
      navDrawer.classList.toggle("open", open);
      navBackdrop.classList.toggle("open", open);
      menuToggle.setAttribute("aria-expanded", String(open));
      navDrawer.setAttribute("aria-hidden", String(!open));
      document.body.classList.toggle("nav-locked", open);
      if (open) {
        lastFocused = document.activeElement;
        if (closeDrawer.focus) closeDrawer.focus();
      } else if (lastFocused && lastFocused.focus) {
        lastFocused.focus();
      }
    }

    function toggleNav() {
      setDrawer(!navDrawer.classList.contains("open"));
    }

    // Ensure semantics even if older HTML lacks them.
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-controls", "navDrawer");
    navDrawer.setAttribute("aria-hidden", "true");
    if (!navDrawer.getAttribute("role")) navDrawer.setAttribute("role", "dialog");
    if (!navDrawer.getAttribute("aria-label")) navDrawer.setAttribute("aria-label", "Site navigation");

    menuToggle.addEventListener("click", toggleNav);
    closeDrawer.addEventListener("click", () => setDrawer(false));
    navBackdrop.addEventListener("click", () => setDrawer(false));

    // Escape closes the drawer (and returns focus); light focus trap.
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navDrawer.classList.contains("open")) {
        setDrawer(false);
        return;
      }
      if (e.key === "Tab" && navDrawer.classList.contains("open")) {
        const focusables = navDrawer.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  // Desktop navbar dropdowns (About / Compete / Submit / Timeline)
  const navItems = document.querySelectorAll(".primary-nav .nav-item");

  function closeAllNavItems(except) {
    navItems.forEach((item) => {
      if (item !== except) {
        item.classList.remove("open");
        delete item.dataset.sticky;
        const toggle = item.querySelector(".nav-dropdown-toggle");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  navItems.forEach((item) => {
    const toggle = item.querySelector(".nav-dropdown-toggle");
    if (!toggle) return;
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      if (canHoverOpen()) {
        // Desktop: hover already opens the panel, so clicking the toggle
        // pins it open (sticky) instead of instantly closing it again;
        // a second click unpins and closes.
        if (item.dataset.sticky === "true") {
          delete item.dataset.sticky;
          item.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
        } else {
          closeAllNavItems(item);
          item.dataset.sticky = "true";
          item.classList.add("open");
          toggle.setAttribute("aria-expanded", "true");
        }
        return;
      }
      const isOpen = item.classList.contains("open");
      closeAllNavItems(item);
      item.classList.toggle("open", !isOpen);
      toggle.setAttribute("aria-expanded", String(!isOpen));
    });

    toggle.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        delete item.dataset.sticky;
        item.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
      if (e.key === "ArrowDown" && !item.classList.contains("open")) {
        e.preventDefault();
        closeAllNavItems(item);
        item.classList.add("open");
        toggle.setAttribute("aria-expanded", "true");
        const firstLink = item.querySelector(".nav-dropdown-menu a");
        if (firstLink) firstLink.focus();
      }
    });

    // Wire aria-controls for screen readers.
    const menu = item.querySelector(".nav-dropdown-menu");
    if (menu) {
      if (!menu.id) menu.id = "nav-menu-" + Math.random().toString(36).slice(2, 8);
      toggle.setAttribute("aria-controls", menu.id);
    }

    // Closing when focus leaves the whole nav-item keeps keyboard
    // users from getting stranded with an open menu.
    item.addEventListener("focusout", (e) => {
      if (!item.contains(e.relatedTarget)) {
        delete item.dataset.sticky;
        item.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    // Desktop hover intent: open About / Event Information / Hackathon
    // Journey sub-panels on mouse hover (click still works for touch /
    // keyboard). Gated to hover-capable wide screens so the mobile
    // drawer (<=900px) is unaffected. A short close delay lets the
    // pointer travel from the button down into the menu.
    let hoverCloseTimer = null;
    function canHoverOpen() {
      try {
        return window.matchMedia("(hover: hover) and (min-width: 901px)").matches;
      } catch (e) { return false; }
    }
    function openOnHover() {
      if (!canHoverOpen()) return;
      if (hoverCloseTimer) clearTimeout(hoverCloseTimer);
      // Single-popup rule: the pointer claims exclusive ownership — drop
      // keyboard focus from any sibling item so a previously clicked or
      // tabbed toggle can't keep its panel open underneath this one.
      // (Runs only on real pointer movement, so keyboard-only use is
      // unaffected.)
      const nav = item.closest(".primary-nav");
      const ae = document.activeElement;
      if (nav && ae && nav.contains(ae) && !item.contains(ae)) ae.blur();
      closeAllNavItems(item);
      item.classList.add("open");
      toggle.setAttribute("aria-expanded", "true");
    }
    function scheduleHoverClose() {
      if (!canHoverOpen()) return;
      if (item.dataset.sticky === "true") return;
      if (hoverCloseTimer) clearTimeout(hoverCloseTimer);
      hoverCloseTimer = setTimeout(() => {
        // Don't yank it shut while keyboard focus is inside.
        if (item.contains(document.activeElement)) return;
        item.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }, 120);
    }
    item.addEventListener("mouseenter", openOnHover);
    item.addEventListener("mouseleave", scheduleHoverClose);
  });

  document.addEventListener("click", () => closeAllNavItems(null));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAllNavItems(null);
  });

  // Mobile drawer accordions (grouped sub-links + timeline dates)
  const drawerGroups = document.querySelectorAll(".drawer-group");

  drawerGroups.forEach((group) => {
    const toggle = group.querySelector(".drawer-group-toggle");
    if (!toggle) return;

    toggle.addEventListener("click", () => {
      const isOpen = group.classList.contains("open");
      group.classList.toggle("open", !isOpen);
      toggle.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  // All timeline rendering (navbar dropdown + vertical Timeline page +
  // countdown) is driven off today's real date.
  const referenceToday = new Date().toISOString().slice(0, 10);

  function renderTimelineDropdowns() {
    // Milestones are tagged with data-timeline-group (rows in the same
    // group roll off together, e.g. Registration Opens + Closes) and
    // data-roll-date (the date after which that whole group is hidden).
    // Only the earliest group that hasn't fully passed yet is shown.
    document.querySelectorAll("[data-timeline-panel]").forEach((panel) => {
      const rows = Array.from(panel.querySelectorAll("[data-timeline-group]"));
      if (!rows.length) return;

      const groupOrder = [];
      rows.forEach((row) => {
        const g = row.getAttribute("data-timeline-group");
        if (!groupOrder.includes(g)) groupOrder.push(g);
      });

      let activeGroup = null;
      for (const g of groupOrder) {
        const groupRows = rows.filter((r) => r.getAttribute("data-timeline-group") === g);
        const rollDate = groupRows[0].getAttribute("data-roll-date");
        if (rollDate >= referenceToday) {
          activeGroup = g;
          break;
        }
      }

      rows.forEach((row) => {
        const isActive = row.getAttribute("data-timeline-group") === activeGroup;
        row.hidden = !isActive;
      });

      const emptyState = panel.querySelector("[data-timeline-empty]");
      if (emptyState) emptyState.hidden = activeGroup !== null;
    });
  }

  // Interactive vertical Timeline page (full 9-milestone view).
  // Each node is marked done / current / upcoming relative to
  // referenceToday, the spine + progress bar fill to match, and cards
  // expand on click/keyboard to reveal extra detail text.
  function renderVerticalTimeline() {
    document.querySelectorAll("[data-vtl-timeline]").forEach((root) => {
      const nodes = Array.from(root.querySelectorAll("[data-vtl-node]"));
      if (!nodes.length) return;

      const trackFill = root.querySelector("[data-vtl-track-fill]");
      const progressFill = root.querySelector("[data-vtl-progress-fill]");
      const doneCountEl = root.querySelector("[data-vtl-done-count]");

      let currentIndex = -1;
      let doneCount = 0;

      nodes.forEach((node, i) => {
        const nodeDate = node.getAttribute("data-date");
        const statusEl = node.querySelector("[data-vtl-status]");
        let status = "upcoming";

        node.classList.remove("done", "current", "upcoming");

        if (nodeDate <= referenceToday) {
          status = "done";
          doneCount++;
        } else if (currentIndex === -1) {
          status = "current";
          currentIndex = i;
        }

        node.classList.add(status);
        if (statusEl) {
          statusEl.textContent = status === "done" ? "Completed" : status === "current" ? "Up Next" : "Upcoming";
        }
      });

      // All milestones passed — treat the last one as the reference point.
      if (currentIndex === -1) currentIndex = nodes.length - 1;

      const progressRatio = nodes.length > 1 ? currentIndex / (nodes.length - 1) : 1;
      const fillPercent = Math.round(progressRatio * 100);
      if (trackFill) trackFill.style.height = `${fillPercent}%`;
      if (progressFill) progressFill.style.width = `${Math.round((doneCount / nodes.length) * 100)}%`;
      if (doneCountEl) doneCountEl.textContent = String(doneCount);

      // Click / keyboard expand-collapse for each card (wired once).
      if (!root.dataset.vtlWired) {
        root.dataset.vtlWired = "true";
        nodes.forEach((node) => {
          const card = node.querySelector("[data-vtl-card]");
          if (!card) return;

          function toggleExpand() {
            const isOpen = node.classList.contains("expanded");
            nodes.forEach((n) => {
              n.classList.remove("expanded");
              const c = n.querySelector("[data-vtl-card]");
              if (c) c.setAttribute("aria-expanded", "false");
            });
            if (!isOpen) {
              node.classList.add("expanded");
              card.setAttribute("aria-expanded", "true");
            }
          }

          card.addEventListener("click", toggleExpand);
          card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleExpand();
            }
          });
        });
      }

      // Scroll the current milestone into view (without yanking the
      // page on load: nearest block + no smooth motion when reduced).
      const targetNode = nodes[currentIndex];
      if (targetNode) {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        try {
          targetNode.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
        } catch (e) { /* older browsers */ }
      }
    });
  }

  // Live countdown. Each box either targets a fixed milestone via
  // data-vtl-fixed-target/data-vtl-fixed-label (e.g. the homepage's
  // Grand Finale countdown), or falls back to whichever milestone node
  // is marked "current" by renderVerticalTimeline (the Timeline page).
  // Ticks every second against the local-midnight target date.
  function renderCountdown() {
    const countdownEls = document.querySelectorAll("[data-vtl-countdown]");
    if (!countdownEls.length) return;

    const currentNode = document.querySelector('[data-vtl-node].current');

    countdownEls.forEach((box) => {
      const labelEl = box.querySelector("[data-vtl-countdown-label]");
      const dateEl = box.querySelector("[data-vtl-countdown-date]");
      const daysEl = box.querySelector("[data-vtl-countdown-days]");
      const hoursEl = box.querySelector("[data-vtl-countdown-hours]");
      const minsEl = box.querySelector("[data-vtl-countdown-minutes]");
      const secsEl = box.querySelector("[data-vtl-countdown-seconds]");

      box.classList.remove("finished", "reached");

      const fixedTarget = box.getAttribute("data-vtl-fixed-target");
      const fixedLabel = box.getAttribute("data-vtl-fixed-label");

      let targetDateStr = fixedTarget;
      let milestoneLabel = fixedLabel;

      if (!targetDateStr) {
        if (!currentNode) {
          box.classList.add("finished");
          if (labelEl) labelEl.textContent = "All milestones completed";
          return;
        }
        const milestoneName = currentNode.querySelector(".vtl-card-milestone");
        targetDateStr = currentNode.getAttribute("data-date");
        milestoneLabel = milestoneName ? milestoneName.textContent : "Next milestone";
      }

      const targetMs = new Date(`${targetDateStr}T00:00:00`).getTime();

      if (labelEl) labelEl.textContent = `${milestoneLabel || "Milestone"} in`;
      if (dateEl) {
        dateEl.textContent = new Date(targetMs).toLocaleDateString("en-IN", {
          weekday: "long", day: "numeric", month: "long", year: "numeric",
        });
      }

      function tick() {
        const remaining = targetMs - Date.now();

        if (remaining <= 0) {
          box.classList.add("reached");
          if (labelEl) labelEl.textContent = `${milestoneLabel || "Milestone"} has arrived!`;
          if (daysEl) daysEl.textContent = "00";
          if (hoursEl) hoursEl.textContent = "00";
          if (minsEl) minsEl.textContent = "00";
          if (secsEl) secsEl.textContent = "00";
          clearInterval(box._vtlCountdownTimer);
          return;
        }

        const days = Math.floor(remaining / 86400000);
        const hours = Math.floor((remaining % 86400000) / 3600000);
        const mins = Math.floor((remaining % 3600000) / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);

        if (daysEl) daysEl.textContent = String(days).padStart(2, "0");
        if (hoursEl) hoursEl.textContent = String(hours).padStart(2, "0");
        if (minsEl) minsEl.textContent = String(mins).padStart(2, "0");
        if (secsEl) secsEl.textContent = String(secs).padStart(2, "0");
      }

      if (box._vtlCountdownTimer) clearInterval(box._vtlCountdownTimer);
      tick();
      // Pause ticking while the tab is hidden (battery/CPU saver).
      function armTimer() {
        if (box._vtlCountdownTimer) clearInterval(box._vtlCountdownTimer);
        if (!document.hidden) box._vtlCountdownTimer = setInterval(tick, 1000);
      }
      armTimer();
      document.addEventListener("visibilitychange", armTimer);
    });
  }

  renderTimelineDropdowns();
  renderVerticalTimeline();
  renderCountdown();

  // Prize Pool reveal — clicking the badge opens a full-page grand
  // reveal overlay with a confetti burst, auto-closes after 3 seconds
  // (or sooner via the close button), and leaves the badge itself
  // permanently showing the revealed amount afterwards.
  const prizeBtn = document.querySelector("[data-prize-reveal]");
  const prizeOverlay = document.querySelector("[data-prize-overlay]");

  if (prizeBtn && prizeOverlay) {
    const overlayBackdrop = prizeOverlay.querySelector("[data-prize-overlay-backdrop]");
    const overlayClose = prizeOverlay.querySelector("[data-prize-overlay-close]");
    const overlayConfettiHost = prizeOverlay.querySelector("[data-prize-overlay-confetti]");
    const labelEl = prizeBtn.querySelector("[data-prize-label]");
    const valueEl = prizeBtn.querySelector("[data-prize-value]");
    const iconEl = prizeBtn.querySelector("[data-prize-icon]");

    const REVEALED = { label: "Grand Prize Pool", value: "₹2.5 Lakh", icon: "🎉" };
    const confettiColors = ["#0077b6", "#00b4d8", "#f5b400", "#fdb931", "#ff6b6b", "#2575fc"];
    const AUTO_CLOSE_MS = 7000;
    let autoCloseTimer = null;

    function spawnConfetti() {
      if (!overlayConfettiHost) return;
      overlayConfettiHost.innerHTML = "";
      const pieceCount = 36;

      for (let i = 0; i < pieceCount; i++) {
        const piece = document.createElement("span");
        const angle = (Math.PI * 2 * i) / pieceCount + (Math.random() * 0.4 - 0.2);
        const distance = 90 + Math.random() * 90;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance - 30;

        piece.style.setProperty("--confetti-color", confettiColors[i % confettiColors.length]);
        piece.style.setProperty("--confetti-x", `${x}px`);
        piece.style.setProperty("--confetti-y", `${y}px`);
        piece.style.setProperty("--confetti-rot", `${Math.round(Math.random() * 360)}deg`);
        piece.style.setProperty("--confetti-delay", `${Math.random() * 0.15}s`);
        overlayConfettiHost.appendChild(piece);
      }
    }

    function markBadgeRevealed() {
      if (labelEl) labelEl.textContent = REVEALED.label;
      if (valueEl) valueEl.textContent = REVEALED.value;
      if (iconEl) iconEl.textContent = REVEALED.icon;
      prizeBtn.classList.add("revealed");
      prizeBtn.setAttribute("aria-expanded", "true");
    }

    function openOverlay() {
      prizeOverlay.hidden = false;
      spawnConfetti();
      // Force reflow so the open-state transition/animations play.
      void prizeOverlay.offsetWidth;
      prizeOverlay.classList.add("open");

      clearTimeout(autoCloseTimer);
      autoCloseTimer = setTimeout(closeOverlay, AUTO_CLOSE_MS);
    }

    function closeOverlay() {
      clearTimeout(autoCloseTimer);
      prizeOverlay.classList.remove("open");
      markBadgeRevealed();
      setTimeout(() => {
        prizeOverlay.hidden = true;
      }, 300);
    }

    prizeBtn.addEventListener("click", openOverlay);
    if (overlayClose) overlayClose.addEventListener("click", closeOverlay);
    if (overlayBackdrop) overlayBackdrop.addEventListener("click", closeOverlay);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !prizeOverlay.hidden) closeOverlay();
    });
  }

  // ── 3D Cursor-Tracking Tilt on Track Cards ───────────────────────
  const trackCards = document.querySelectorAll(".track");
  trackCards.forEach((card) => {
    let rafId = null;

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position within element
      const y = e.clientY - rect.top;  // y position within element
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate tilt angles (max ~12 degrees)
      const rotateX = ((y - centerY) / centerY) * -11;
      const rotateY = ((x - centerX) / centerX) * 11;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        card.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(8px)`;
        // Dynamic directional 3D shadow cast away from the cursor
        const shadowX = ((x - centerX) / centerX) * -12;
        const shadowY = ((y - centerY) / centerY) * -12 + 18;
        card.style.boxShadow = `${shadowX.toFixed(1)}px ${shadowY.toFixed(1)}px 32px rgba(14, 34, 71, 0.12), 0 4px 10px rgba(44, 123, 229, 0.08)`;
      });
    });

    card.addEventListener("mouseleave", () => {
      if (rafId) cancelAnimationFrame(rafId);
      // Smoothly snap back flat
      card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
      card.style.boxShadow = "0 4px 16px rgba(14, 34, 71, 0.04)";
    });
  });

  // ── Live Cybersecurity Terminal Typewriter Scan ─────────────────
  const terminalEl = document.getElementById("terminalScanText");
  if (terminalEl) {
    const readouts = [
      "scanning network traffic for anomalies...",
      "chain of custody verified — evidence secured",
      "tracing attacker infrastructure across nodes...",
      "extracting volatile RAM artifacts in real time...",
      "correlating threat signatures against IOC database...",
      "authenticating forensic integrity hash [SHA-256]..."
    ];

    let phraseIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let typingSpeed = 45;

    function typeLoop() {
      const currentPhrase = readouts[phraseIdx];

      if (!isDeleting) {
        terminalEl.textContent = currentPhrase.substring(0, charIdx + 1);
        charIdx++;

        if (charIdx === currentPhrase.length) {
          // Pause at the end of the phrase
          isDeleting = true;
          setTimeout(typeLoop, 2200);
          return;
        }
      } else {
        terminalEl.textContent = currentPhrase.substring(0, charIdx - 1);
        charIdx--;

        if (charIdx === 0) {
          isDeleting = false;
          phraseIdx = (phraseIdx + 1) % readouts.length;
          setTimeout(typeLoop, 400);
          return;
        }
      }

      const delay = isDeleting ? 22 : typingSpeed + (Math.random() * 20 - 10);
      setTimeout(typeLoop, delay);
    }

    // Start typewriter loop
    setTimeout(typeLoop, 800);
  }

  // ── Multi-Line Cyber Investigation Terminal Window Session ──────
  const termBody = document.getElementById("cyberTerminalBody");
  if (termBody) {
    const sessionSteps = [
      { type: "cmd", text: "analyze --target disk_image_04.dd" },
      { type: "ok", text: "[ok] file system mounted, 4 partitions found" },
      { type: "cmd", text: "trace --hash-db iocs.db --deep" },
      { type: "match", text: "[+] 3 matches against known threat signatures" },
      { type: "cmd", text: "reconstruct --timeline --events-only" },
      { type: "ok", text: "[*] timeline reconstructed: 1,842 forensic events indexed" }
    ];

    let currentStepIdx = 0;
    let charIdx = 0;
    let activeLineEl = null;
    let cursorEl = null;

    function createCursor() {
      const c = document.createElement("span");
      c.className = "term-cursor";
      return c;
    }

    function runSession() {
      if (currentStepIdx >= sessionSteps.length) {
        // Hold full output for 4.5s before clearing and looping
        setTimeout(() => {
          termBody.innerHTML = "";
          currentStepIdx = 0;
          charIdx = 0;
          activeLineEl = null;
          runSession();
        }, 4500);
        return;
      }

      const step = sessionSteps[currentStepIdx];

      if (step.type === "cmd") {
        if (!activeLineEl) {
          activeLineEl = document.createElement("div");
          activeLineEl.className = "term-line";

          const prompt = document.createElement("span");
          prompt.className = "term-prompt";
          prompt.textContent = "root@sutram:~$";
          activeLineEl.appendChild(prompt);

          const cmdSpan = document.createElement("span");
          cmdSpan.className = "term-cmd";
          activeLineEl.appendChild(cmdSpan);

          cursorEl = createCursor();
          activeLineEl.appendChild(cursorEl);

          termBody.appendChild(activeLineEl);
        }

        const cmdSpan = activeLineEl.querySelector(".term-cmd");
        cmdSpan.textContent = step.text.substring(0, charIdx + 1);
        charIdx++;

        if (charIdx < step.text.length) {
          setTimeout(runSession, 38 + Math.random() * 25);
        } else {
          // Finished typing command
          if (cursorEl) cursorEl.remove();
          currentStepIdx++;
          charIdx = 0;
          activeLineEl = null;
          setTimeout(runSession, 450); // Pause before output response
        }
      } else {
        // Output response line (appears fast like real console)
        const outLine = document.createElement("div");
        outLine.className = "term-line";

        if (step.type === "ok") {
          outLine.className += " term-out-ok";
        } else if (step.type === "match") {
          outLine.className += " term-out-match";
        } else if (step.type === "warn") {
          outLine.className += " term-out-warn";
        }

        outLine.textContent = step.text;
        termBody.appendChild(outLine);

        currentStepIdx++;
        setTimeout(runSession, 650); // Pause before next command
      }
    }

    // Start investigation terminal session
    setTimeout(runSession, 1200);
  }

  // ── 3D Interactive Cyber Forensic Constellation & Radar Lattice ──
  const canvas = document.getElementById("cyber3dCanvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let animationFrameId = null;

    // Mouse tracking for 3D parallax & interactive forensic probe
    const mouse = {
      x: -9999,
      y: -9999,
      targetRotX: 0,
      targetRotY: 0,
      currentRotX: 0,
      currentRotY: 0,
      isActive: false
    };

    let nodes = [];
    const HUB_TAGS = ["HUB-01 · RECON", "PORT: 443", "EVID-09", "AI-TRACE", "NET-GEO", "SHA-256", "AUTH: VERIFIED", "PACKET_SYNC"];

    function initNodes() {
      // Use the real viewport width (never force a 1200px desktop field
      // on phones) and shrink the lattice on small screens.
      const smallScreen = window.innerWidth < 700;
      const fieldW = window.innerWidth;
      const docHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        window.innerHeight * 2.5
      );
      nodes = [];

      const cols = smallScreen ? 5 : 9;
      const rows = smallScreen ? 8 : 14;
      const xStep = (fieldW * 1.25) / cols;
      const yStep = (docHeight + 200) / rows;

      let idx = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const baseX = -fieldW * 0.62 + c * xStep + (Math.random() - 0.5) * xStep * 0.85;
          const baseY = -80 + r * yStep + (Math.random() - 0.5) * yStep * 0.85;
          const baseZ = (Math.random() - 0.5) * 440;

          // Node type: 0 = Core (Navy/Cyan), 1 = Forensic Hub (Target Ring + Tag), 2 = Evidence Anomaly (Gold)
          let type = 0;
          if (idx % 9 === 0) type = 1;
          else if (idx % 14 === 3) type = 2;

          nodes.push({
            baseX: baseX,
            baseY: baseY,
            baseZ: baseZ,
            type: type,
            tag: type === 1 ? HUB_TAGS[Math.floor(Math.random() * HUB_TAGS.length)] : "",
            size: type === 1 ? 3.2 : (type === 2 ? 2.8 : 2.0 + Math.random() * 0.8),
            phase: Math.random() * Math.PI * 2,
            pulseOffset: Math.random() * Math.PI * 2
          });
          idx++;
        }
      }
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initNodes();
    }
    resize();
    let resizeTimer = null;
    window.addEventListener("resize", () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    });

    // Fewer travelling packets on small/coarse-pointer devices.
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const PACKET_COUNT = window.innerWidth < 700 || coarsePointer ? 10 : 24;
    const packets = [];
    for (let i = 0; i < PACKET_COUNT; i++) {
      packets.push({
        from: Math.floor(Math.random() * 110),
        to: Math.floor(Math.random() * 110),
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.004,
        size: 2.2 + Math.random() * 1.4
      });
    }

    // Interactive mouse positioning (fine pointers only — touch
    // devices get the ambient animation without mousemove churn).
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (finePointer) {
      window.addEventListener("mousemove", (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.isActive = true;

        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        mouse.targetRotY = nx * 0.26;
        mouse.targetRotX = -ny * 0.20;
      }, { passive: true });
    }

    window.addEventListener("mouseleave", () => {
      mouse.x = -9999;
      mouse.y = -9999;
      mouse.isActive = false;
      mouse.targetRotX = 0;
      mouse.targetRotY = 0;
    });

    let time = 0;

    function render3D() {
      time += 0.0018;

      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.getAttribute("data-theme") === "dark";

      // Smooth camera interpolation for fluid parallax
      mouse.currentRotX += (mouse.targetRotX - mouse.currentRotX) * 0.05;
      mouse.currentRotY += (mouse.targetRotY - mouse.currentRotY) * 0.05;

      const rotY = mouse.currentRotY + time * 0.08;
      const rotX = mouse.currentRotX + Math.sin(time * 0.5) * 0.04;

      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

      const fov = 750;
      const centerX = width / 2;
      const centerY = height / 2;

      const currentScrollY = window.scrollY || window.pageYOffset || 0;

      function project(x, y, z) {
        const x1 = x * cosY + z * sinY;
        const z1 = -x * sinY + z * cosY;
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;
        const scale = fov / Math.max(fov + z2, 80);
        return {
          x: centerX + x1 * scale,
          y: centerY + y2 * scale,
          z: z2,
          scale: scale
        };
      }

      // ─────────────────────────────────────────────────────────────
      // 1. HERO 3D HOLOGRAPHIC FORENSIC RADAR LATTICE (Centerpiece)
      // ─────────────────────────────────────────────────────────────
      const heroEl = document.querySelector(".hero");
      let heroWorldY = 280;
      if (heroEl) {
        const hr = heroEl.getBoundingClientRect();
        heroWorldY = hr.top + currentScrollY + hr.height * 0.46;
      }
      const heroRelY = heroWorldY - currentScrollY - centerY;

      if (heroRelY > -height && heroRelY < height) {
        const radarCenter = project(0, heroRelY, -110);

        ctx.save();
        ctx.translate(radarCenter.x, radarCenter.y);

        const rScale = radarCenter.scale;
        const R_OUTER = 145 * rScale;
        const R_MID = 105 * rScale;
        const R_INNER = 65 * rScale;

        // Outer Rotating Compass Ring
        ctx.save();
        ctx.rotate(time * 0.4);
        ctx.strokeStyle = isDark ? "rgba(0, 229, 255, 0.25)" : "rgba(37, 117, 252, 0.20)";
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.arc(0, 0, R_OUTER, 0, Math.PI * 2);
        ctx.stroke();

        // Cardinal Navigation Ticks (32 divisions)
        const ticks = 32;
        for (let t = 0; t < ticks; t++) {
          const theta = (t / ticks) * Math.PI * 2;
          const isMajor = t % 8 === 0;
          const r1 = R_OUTER - (isMajor ? 10 : 5) * rScale;
          const r2 = R_OUTER;
          ctx.strokeStyle = isMajor
            ? (isDark ? "rgba(0, 229, 255, 0.45)" : "rgba(0, 180, 216, 0.38)")
            : (isDark ? "rgba(37, 117, 252, 0.20)" : "rgba(37, 117, 252, 0.14)");
          ctx.lineWidth = isMajor ? 1.1 : 0.7;
          ctx.beginPath();
          ctx.moveTo(Math.cos(theta) * r1, Math.sin(theta) * r1);
          ctx.lineTo(Math.cos(theta) * r2, Math.sin(theta) * r2);
          ctx.stroke();
        }
        ctx.restore();

        // Middle Counter-Rotating Gyroscope Ring (Dashed)
        ctx.save();
        ctx.rotate(-time * 0.7);
        ctx.strokeStyle = isDark ? "rgba(56, 189, 248, 0.28)" : "rgba(44, 123, 229, 0.22)";
        ctx.lineWidth = 0.9;
        ctx.setLineDash([10, 8, 16, 8]);
        ctx.beginPath();
        ctx.arc(0, 0, R_MID, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // Inner Tilted 3D Orbit Rings
        ctx.save();
        ctx.rotate(time * 0.3);
        ctx.strokeStyle = isDark ? "rgba(0, 229, 255, 0.18)" : "rgba(0, 180, 216, 0.16)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.ellipse(0, 0, R_MID * 0.9, R_INNER * 0.55, Math.PI / 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(0, 0, R_MID * 0.9, R_INNER * 0.55, -Math.PI / 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Radar Sweep Beam with Glowing Gradient Wedge (soft & translucent)
        ctx.save();
        ctx.rotate(time * 1.5);
        const sweepGrad = ctx.createLinearGradient(0, 0, R_OUTER, 0);
        sweepGrad.addColorStop(0, isDark ? "rgba(0, 229, 255, 0.18)" : "rgba(0, 180, 216, 0.16)");
        sweepGrad.addColorStop(1, "rgba(0, 180, 216, 0)");
        ctx.fillStyle = sweepGrad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, R_OUTER, 0, 0.6);
        ctx.closePath();
        ctx.fill();

        // Leading sweep laser line
        ctx.strokeStyle = isDark ? "rgba(0, 229, 255, 0.55)" : "rgba(0, 180, 216, 0.45)";
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(0.6) * R_OUTER, Math.sin(0.6) * R_OUTER);
        ctx.stroke();
        ctx.restore();

        // Core Center Target Reticle
        ctx.fillStyle = isDark ? "rgba(0, 229, 255, 0.7)" : "rgba(37, 117, 252, 0.6)";
        ctx.beginPath();
        ctx.arc(0, 0, 3.0 * rScale, 0, Math.PI * 2);
        ctx.fill();

        // Monospace technical radar coordinate tag
        ctx.font = `${Math.floor(7.5 * rScale)}px monospace`;
        ctx.fillStyle = isDark ? "rgba(0, 229, 255, 0.45)" : "rgba(37, 117, 252, 0.40)";
        ctx.fillText("SUTRAM // FORENSIC_RADAR [28.66°N · 77.23°E]", -90 * rScale, -R_OUTER - 8 * rScale);

        ctx.restore();
      }

      // ─────────────────────────────────────────────────────────────
      // 2. PROJECT 3D NODES & INTERACTIVE MOUSE REACTION
      // ─────────────────────────────────────────────────────────────
      const projected = [];
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const screenRelY = node.baseY - currentScrollY - centerY;

        if (screenRelY < -height * 0.95 || screenRelY > height * 0.95) {
          projected.push(null);
          continue;
        }

        const breath = Math.sin(time * 1.6 + node.phase) * 3;
        const x = node.baseX + breath;
        const y = screenRelY + breath;
        const z = node.baseZ;

        const pt = project(x, y, z);
        let projX = pt.x;
        let projY = pt.y;

        // Interactive mouse hover influence
        let isHovered = false;
        let distToMouse = 9999;
        if (mouse.isActive) {
          const mdx = projX - mouse.x;
          const mdy = projY - mouse.y;
          distToMouse = Math.sqrt(mdx * mdx + mdy * mdy);

          if (distToMouse < 140) {
            isHovered = true;
            const force = (1 - distToMouse / 140) * 18;
            const angle = Math.atan2(mdy, mdx);
            projX += Math.cos(angle) * force;
            projY += Math.sin(angle) * force;
          }
        }

        projected.push({
          idx: i,
          x: projX,
          y: projY,
          z: pt.z,
          scale: pt.scale,
          type: node.type,
          tag: node.tag,
          size: node.size * pt.scale,
          pulseOffset: node.pulseOffset,
          isHovered: isHovered,
          distToMouse: distToMouse
        });
      }

      // ─────────────────────────────────────────────────────────────
      // 3. DRAW CRISP 3D CONNECTING NETWORK EDGES
      // ─────────────────────────────────────────────────────────────
      const maxConnectDist = 140;
      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i];
        if (!p1) continue;

        let connections = 0;
        for (let j = i + 1; j < projected.length; j++) {
          if (connections >= 3) break;
          const p2 = projected[j];
          if (!p2) continue;

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxConnectDist) {
            connections++;
            const distFade = (1 - dist / maxConnectDist);
            const depthFade = Math.max(0.10, Math.min(0.32, (p1.scale + p2.scale) * 0.14));
            const alpha = distFade * depthFade * 0.75;

            // Soft translucent cyber-blue / cyan line gradient
            const lineGrad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            if (isDark) {
              lineGrad.addColorStop(0, `rgba(0, 229, 255, ${(alpha * 1.1).toFixed(3)})`);
              lineGrad.addColorStop(1, `rgba(37, 117, 252, ${(alpha * 0.8).toFixed(3)})`);
            } else {
              lineGrad.addColorStop(0, `rgba(37, 117, 252, ${(alpha * 1.1).toFixed(3)})`);
              lineGrad.addColorStop(1, `rgba(0, 180, 216, ${(alpha * 0.9).toFixed(3)})`);
            }

            ctx.strokeStyle = lineGrad;
            ctx.lineWidth = Math.max(0.6, 0.85 * ((p1.scale + p2.scale) / 2));
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // ─────────────────────────────────────────────────────────────
      // 4. INTERACTIVE MOUSE LASER LINKS & FORENSIC TARGET PROBE
      // ─────────────────────────────────────────────────────────────
      if (mouse.isActive) {
        let linkedCount = 0;

        projected.forEach((p) => {
          if (p && p.distToMouse < 140) {
            linkedCount++;
            const mAlpha = (1 - p.distToMouse / 140) * (isDark ? 0.50 : 0.40);

            // Glowing cyan laser connection to mouse pointer
            ctx.strokeStyle = isDark
              ? `rgba(0, 229, 255, ${mAlpha.toFixed(2)})`
              : `rgba(0, 180, 216, ${mAlpha.toFixed(2)})`;
            ctx.lineWidth = 1.0;
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();

            // Small reticle bracket on hover
            ctx.strokeStyle = isDark ? "rgba(0, 229, 255, 0.55)" : "rgba(37, 117, 252, 0.48)";
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
            ctx.stroke();
          }
        });

        // Mouse Forensic Crosshair Probe Reticle
        ctx.strokeStyle = isDark ? "rgba(0, 229, 255, 0.40)" : "rgba(0, 180, 216, 0.32)";
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 20, 0, Math.PI * 2);
        ctx.stroke();

        // Cardinal tick marks on mouse reticle
        const reticleTicks = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
        reticleTicks.forEach((a) => {
          ctx.beginPath();
          ctx.moveTo(mouse.x + Math.cos(a) * 16, mouse.y + Math.sin(a) * 16);
          ctx.lineTo(mouse.x + Math.cos(a) * 23, mouse.y + Math.sin(a) * 23);
          ctx.stroke();
        });

        // Live Cursor Telemetry Tag
        ctx.font = "8px monospace";
        ctx.fillStyle = isDark ? "rgba(0, 229, 255, 0.50)" : "rgba(14, 34, 71, 0.45)";
        ctx.fillText(`PROBE: [${Math.round(mouse.x)}, ${Math.round(mouse.y)}] · NODES: ${linkedCount}`, mouse.x + 14, mouse.y - 12);
      }

      // ─────────────────────────────────────────────────────────────
      // 5. TRAVELLING CYBER DATA PACKETS (Luminous Signals)
      // ─────────────────────────────────────────────────────────────
      packets.forEach((pkt) => {
        pkt.progress += pkt.speed;
        if (pkt.progress >= 1) {
          pkt.progress = 0;
          pkt.from = Math.floor(Math.random() * nodes.length);
          pkt.to = Math.floor(Math.random() * nodes.length);
        }

        const p1 = projected[pkt.from];
        const p2 = projected[pkt.to];
        if (!p1 || !p2) return;

        const px = p1.x + (p2.x - p1.x) * pkt.progress;
        const py = p1.y + (p2.y - p1.y) * pkt.progress;
        const pScale = p1.scale + (p2.scale - p1.scale) * pkt.progress;

        const pulseAlpha = Math.sin(pkt.progress * Math.PI) * (isDark ? 0.65 : 0.52);

        // Glowing cyan packet head
        ctx.fillStyle = isDark ? `rgba(0, 229, 255, ${pulseAlpha.toFixed(2)})` : `rgba(0, 180, 216, ${pulseAlpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(px, py, pkt.size * pScale, 0, Math.PI * 2);
        ctx.fill();

        // Outer halo
        ctx.strokeStyle = `rgba(37, 117, 252, ${(pulseAlpha * 0.35).toFixed(2)})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.arc(px, py, pkt.size * 2.0 * pScale, 0, Math.PI * 2);
        ctx.stroke();
      });

      // ─────────────────────────────────────────────────────────────
      // 6. DRAW 3D NODES BY DEPTH (Back to Front)
      // ─────────────────────────────────────────────────────────────
      const visibleNodes = projected.filter(Boolean).sort((a, b) => a.z - b.z);

      visibleNodes.forEach((p) => {
        const depthFactor = Math.max(0.5, Math.min(1.0, (p.z + 250) / 500));

        if (p.type === 1) {
          // ── TYPE 1: FORENSIC HUB NODE (High-Tech Reticle + Tag) ──
          const hubPulse = 14 + Math.sin(time * 3.0 + p.pulseOffset) * 3;
          ctx.strokeStyle = isDark ? "rgba(0, 229, 255, 0.32)" : "rgba(0, 180, 216, 0.30)";
          ctx.lineWidth = 0.9;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(p.x, p.y, hubPulse * p.scale, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          // Solid Navy / Blue Core Ring (softened)
          ctx.fillStyle = isDark ? "rgba(14, 34, 71, 0.65)" : "rgba(14, 34, 71, 0.55)";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.2, 0, Math.PI * 2);
          ctx.fill();

          // Electric Cyan Center Pin
          ctx.fillStyle = isDark ? "rgba(0, 229, 255, 0.75)" : "rgba(0, 180, 216, 0.65)";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
          ctx.fill();

          // Technical Hub Label
          if (p.tag && p.z > -80) {
            ctx.font = `${Math.floor(7.5 * p.scale)}px monospace`;
            ctx.fillStyle = isDark ? "rgba(0, 229, 255, 0.55)" : "rgba(14, 34, 71, 0.45)";
            ctx.fillText(p.tag, p.x + 12 * p.scale, p.y + 3);
          }

        } else if (p.type === 2) {
          // ── TYPE 2: EVIDENCE ANOMALY NODE (Golden Amber Diamond) ──
          const s = p.size * 1.3;

          // Diamond boundary (soft translucent gold)
          ctx.strokeStyle = isDark ? "rgba(251, 191, 36, 0.65)" : "rgba(217, 164, 65, 0.55)";
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - s);
          ctx.lineTo(p.x + s, p.y);
          ctx.lineTo(p.x, p.y + s);
          ctx.lineTo(p.x - s, p.y);
          ctx.closePath();
          ctx.stroke();

          // Center glowing gold dot
          ctx.fillStyle = isDark ? "rgba(251, 191, 36, 0.70)" : "rgba(217, 164, 65, 0.60)";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.55, 0, Math.PI * 2);
          ctx.fill();

        } else {
          // ── TYPE 0: CORE EVIDENCE NETWORK NODE (Deep Navy + Cyan Core) ──
          // Deep Navy / Indigo Body
          const baseNavy = isDark
            ? `rgba(56, 189, 248, ${(0.42 * depthFactor).toFixed(2)})`
            : `rgba(14, 34, 71, ${(0.52 * depthFactor).toFixed(2)})`;
          ctx.fillStyle = baseNavy;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(1.6, p.size), 0, Math.PI * 2);
          ctx.fill();

          // Electric Cyan Inner Core
          const cyanCore = isDark
            ? `rgba(0, 229, 255, ${(0.65 * depthFactor).toFixed(2)})`
            : `rgba(0, 180, 216, ${(0.58 * depthFactor).toFixed(2)})`;
          ctx.fillStyle = cyanCore;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.9, p.size * 0.45), 0, Math.PI * 2);
          ctx.fill();

          // Subtle cyan halo on closest nodes
          if (p.z > 60) {
            ctx.strokeStyle = isDark ? "rgba(0, 229, 255, 0.20)" : "rgba(37, 117, 252, 0.18)";
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 2.0, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render3D);
    }

    // Pause the ambient canvas when it can't be seen (offscreen tab,
    // scrolled past, or user prefers reduced motion → one static frame).
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let canvasVisible = true;
    function manageCanvas() {
      const shouldRun = canvasVisible && !document.hidden && !reduceMotion.matches;
      if (shouldRun && animationFrameId === null) {
        render3D();
      } else if (!shouldRun && animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      if (reduceMotion.matches && animationFrameId === null) {
        time += 0.0018;
        try { render3DStatic(); } catch (e) { /* noop */ }
      }
    }
    function render3DStatic() {
      // Single static paint for reduced-motion users.
      ctx.clearRect(0, 0, width, height);
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        canvasVisible = entries[0].isIntersecting;
        manageCanvas();
      }, { threshold: 0 }).observe(canvas);
    }
    document.addEventListener("visibilitychange", manageCanvas);
    if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", manageCanvas);

    manageCanvas();
  }
});




