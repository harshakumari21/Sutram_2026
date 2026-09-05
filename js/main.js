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

  // Desktop: drop it into the top bar next to Login. Pages without a top
  // bar (login, registration) get a floating one instead.
  const topbarRight = document.querySelector(".topbar-right");
  if (topbarRight) {
    topbarRight.insertBefore(buildToggle(), topbarRight.querySelector(".login-btn"));
  } else {
    document.body.appendChild(buildToggle("floating"));
  }


  applyTheme(currentTheme());

  // 3-Line Hamburger Menu Toggle Logic
  const menuToggle = document.getElementById("menuToggle");
  const closeDrawer = document.getElementById("closeDrawer");
  const navDrawer = document.getElementById("navDrawer");
  const navBackdrop = document.getElementById("navBackdrop");

  if (menuToggle && closeDrawer && navDrawer && navBackdrop) {
    function toggleNav() {
      menuToggle.classList.toggle("active");
      navDrawer.classList.toggle("open");
      navBackdrop.classList.toggle("open");
    }

    menuToggle.addEventListener("click", toggleNav);
    closeDrawer.addEventListener("click", toggleNav);
    navBackdrop.addEventListener("click", toggleNav);
  }

  // Desktop navbar dropdowns (About / Compete / Submit / Timeline)
  const navItems = document.querySelectorAll(".primary-nav .nav-item");

  function closeAllNavItems(except) {
    navItems.forEach((item) => {
      if (item !== except) {
        item.classList.remove("open");
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
      const isOpen = item.classList.contains("open");
      closeAllNavItems(item);
      item.classList.toggle("open", !isOpen);
      toggle.setAttribute("aria-expanded", String(!isOpen));
    });

    toggle.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        item.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
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

        if (nodeDate < referenceToday) {
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

      // Scroll the current milestone into view.
      const targetNode = nodes[currentIndex];
      if (targetNode) {
        targetNode.scrollIntoView({ block: "center", behavior: "smooth" });
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
      box._vtlCountdownTimer = setInterval(tick, 1000);
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
});
