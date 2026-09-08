// ══════════════════════════════════════════════════════════════════
// SUTRAM 2026 — Interactive 3D Cyber Forensic Chrono Stream
// Background animation for Timeline page
// ══════════════════════════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("timelineCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let animationFrameId = null;

  const mouse = {
    x: -9999,
    y: -9999,
    targetRotX: 0,
    targetRotY: 0,
    currentRotX: 0,
    currentRotY: 0,
    isActive: false
  };

  // Milestone time markers mapped vertically along the timeline page
  const milestones = [
    { label: "07.09 | REG/IDEA_OPEN", hex: "0xT0", yFrac: 0.12, flank: -1 },
    { label: "05.10 | REG/IDEA_CLOSE", hex: "0xT1", yFrac: 0.22, flank: 1 },
    { label: "25.10 | ROUND_1_RESULTS", hex: "0xT2", yFrac: 0.32, flank: -1 },
    { label: "28.10 | PS_RELEASE", hex: "0xT3", yFrac: 0.42, flank: 1 },
    { label: "01.11 | MENTORSHIP", hex: "0xT4", yFrac: 0.52, flank: -1 },
    { label: "20.11 | PROTO_SUBMIT", hex: "0xT5", yFrac: 0.62, flank: 1 },
    { label: "05.12 | TOP_25_SELECTED", hex: "0xT6", yFrac: 0.72, flank: -1 },
    { label: "26.12 | FINALE_START", hex: "0xT7", yFrac: 0.82, flank: -1 },
    { label: "27.12 | WINNERS", hex: "0xT8", yFrac: 0.92, flank: 1 }
  ];

  // Traveling Telemetry Pulses along side conduits
  const PULSE_COUNT = 24;
  const pulses = [];
  for (let i = 0; i < PULSE_COUNT; i++) {
    pulses.push({
      flank: i % 2 === 0 ? -1 : 1, // left or right conduit
      progress: Math.random(),
      speed: 0.0015 + Math.random() * 0.0025,
      size: 1.6 + Math.random() * 2.0,
      offset: (Math.random() - 0.5) * 25
    });
  }

  // Floating time spark particles
  const SPARK_COUNT = 45;
  const sparks = [];
  for (let i = 0; i < SPARK_COUNT; i++) {
    sparks.push({
      x: (Math.random() - 0.5) * 1200,
      yFrac: Math.random(),
      z: (Math.random() - 0.5) * 350,
      size: 1.2 + Math.random() * 1.8,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.6
    });
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.isActive = true;

    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    mouse.targetRotY = nx * 0.22;
    mouse.targetRotX = -ny * 0.18;
  });

  window.addEventListener("mouseleave", () => {
    mouse.x = -9999;
    mouse.y = -9999;
    mouse.isActive = false;
    mouse.targetRotX = 0;
    mouse.targetRotY = 0;
  });

  let time = 0;

  function renderTimeline() {
    time += 0.0018;

    ctx.clearRect(0, 0, width, height);

    // Smooth 3D parallax
    mouse.currentRotX += (mouse.targetRotX - mouse.currentRotX) * 0.05;
    mouse.currentRotY += (mouse.targetRotY - mouse.currentRotY) * 0.05;

    const rotY = mouse.currentRotY;
    const rotX = mouse.currentRotX;
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

    const fov = 750;
    const centerX = width / 2;
    const centerY = height / 2;

    const currentScrollY = window.scrollY || window.pageYOffset || 0;
    const docHeight = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
      window.innerHeight * 2.5
    );

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
        scale
      };
    }

    // ─────────────────────────────────────────────────────────────
    // 1. Dual Flowing Forensic Time Conduits (Left & Right Flanks)
    // ─────────────────────────────────────────────────────────────
    const flankDist = Math.max(width * 0.38, 380);

    [-1, 1].forEach((flank) => {
      ctx.beginPath();
      const points = 16;
      for (let p = 0; p <= points; p++) {
        const frac = p / points;
        const worldY = frac * docHeight;
        const screenRelY = worldY - currentScrollY - centerY;

        // Wave oscillation down the conduit
        const waveX = flank * flankDist + Math.sin(frac * 8 + time * 1.8) * 18;
        const pt = project(waveX, screenRelY, Math.cos(frac * 6 + time) * 30);

        if (p === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = "rgba(100, 116, 139, 0.14)";
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // Parallel secondary pulse track (dashed)
      ctx.beginPath();
      for (let p = 0; p <= points; p++) {
        const frac = p / points;
        const worldY = frac * docHeight;
        const screenRelY = worldY - currentScrollY - centerY;
        const waveX = flank * (flankDist + 16) + Math.sin(frac * 8 + time * 1.8 + 1) * 12;
        const pt = project(waveX, screenRelY, 0);

        if (p === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = "rgba(0, 180, 216, 0.08)";
      ctx.lineWidth = 0.8;
      ctx.setLineDash([6, 8]);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // ─────────────────────────────────────────────────────────────
    // 2. Traveling Telemetry Pulses down the conduits
    // ─────────────────────────────────────────────────────────────
    pulses.forEach((pkt) => {
      pkt.progress += pkt.speed;
      if (pkt.progress >= 1) pkt.progress = 0;

      const worldY = pkt.progress * docHeight;
      const screenRelY = worldY - currentScrollY - centerY;

      // Only render if within visible viewport
      if (screenRelY > -height * 0.6 && screenRelY < height * 0.6) {
        const waveX = pkt.flank * flankDist + Math.sin(pkt.progress * 8 + time * 1.8) * 18 + pkt.offset;
        const pt = project(waveX, screenRelY, 15);

        const pAlpha = Math.sin(pkt.progress * Math.PI) * 0.45;
        ctx.fillStyle = `rgba(0, 180, 216, ${pAlpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pkt.size * pt.scale, 0, Math.PI * 2);
        ctx.fill();

        // Subtle glowing halo
        ctx.strokeStyle = `rgba(44, 123, 229, ${(pAlpha * 0.5).toFixed(2)})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pkt.size * 2.2 * pt.scale, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    // ─────────────────────────────────────────────────────────────
    // 3. Rotating 3D Chronometer Dial in Upper Hero Background
    // ─────────────────────────────────────────────────────────────
    const heroWorldY = 180;
    const heroScreenRelY = heroWorldY - currentScrollY - centerY;

    if (heroScreenRelY > -height && heroScreenRelY < height) {
      const dialPt = project(0, heroScreenRelY, -120);

      ctx.save();
      ctx.translate(dialPt.x, dialPt.y);

      // Outer chronometer ring
      ctx.rotate(time * 0.4);
      ctx.strokeStyle = "rgba(100, 116, 139, 0.16)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, 110 * dialPt.scale, 0, Math.PI * 2);
      ctx.stroke();

      // Minute / compass ticks around ring
      const ticks = 24;
      for (let t = 0; t < ticks; t++) {
        const angle = (t / ticks) * Math.PI * 2;
        const r1 = (t % 6 === 0 ? 102 : 106) * dialPt.scale;
        const r2 = 110 * dialPt.scale;
        ctx.strokeStyle = t % 6 === 0 ? "rgba(0, 180, 216, 0.35)" : "rgba(100, 116, 139, 0.14)";
        ctx.lineWidth = t % 6 === 0 ? 1.4 : 0.8;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
        ctx.lineTo(Math.cos(angle) * r2, Math.sin(angle) * r2);
        ctx.stroke();
      }

      // Middle counter-rotating dashed ring
      ctx.rotate(-time * 0.8);
      ctx.strokeStyle = "rgba(44, 123, 229, 0.18)";
      ctx.lineWidth = 1.0;
      ctx.setLineDash([8, 12, 24, 12]);
      ctx.beginPath();
      ctx.arc(0, 0, 78 * dialPt.scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Inner time-core pulse
      ctx.rotate(time * 0.6);
      ctx.strokeStyle = "rgba(0, 180, 216, 0.25)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, 42 * dialPt.scale, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }

    // ─────────────────────────────────────────────────────────────
    // 4. Floating Milestone Time Badges & Coordinates
    // ─────────────────────────────────────────────────────────────
    milestones.forEach((m) => {
      const worldY = m.yFrac * docHeight;
      const screenRelY = worldY - currentScrollY - centerY;

      if (screenRelY > -height * 0.6 && screenRelY < height * 0.6) {
        const xPos = m.flank * (flankDist + 30);
        const pt = project(xPos, screenRelY, 20);

        // Milestone badge tag
        ctx.font = "8px monospace";
        ctx.fillStyle = "rgba(100, 116, 139, 0.38)";
        ctx.fillText(m.label, pt.x - 30, pt.y - 4);

        // Milestone point
        ctx.fillStyle = "rgba(0, 180, 216, 0.35)";
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2.5 * pt.scale, 0, Math.PI * 2);
        ctx.fill();

        // Delicate connecting tick pointing inward toward center timeline
        ctx.strokeStyle = "rgba(100, 116, 139, 0.12)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(pt.x - m.flank * 32, pt.y);
        ctx.stroke();
      }
    });

    // ─────────────────────────────────────────────────────────────
    // 5. Floating Time Spark Field in 3D Depth
    // ─────────────────────────────────────────────────────────────
    sparks.forEach((sp) => {
      const worldY = sp.yFrac * docHeight;
      const screenRelY = worldY - currentScrollY - centerY;

      if (screenRelY > -height * 0.65 && screenRelY < height * 0.65) {
        const breath = Math.sin(time * 2 + sp.phase) * 6;
        const pt = project(sp.x + breath, screenRelY + breath, sp.z);

        const sAlpha = Math.max(0.12, Math.min(0.32, 0.22 + (pt.z / 400) * 0.1));
        ctx.fillStyle = `rgba(120, 135, 155, ${sAlpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, sp.size * pt.scale, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // ─────────────────────────────────────────────────────────────
    // 6. Interactive Mouse Timeline Marker
    // ─────────────────────────────────────────────────────────────
    if (mouse.isActive) {
      // Subtle horizontal time-sync indicator line following mouse Y
      ctx.strokeStyle = "rgba(0, 180, 216, 0.16)";
      ctx.lineWidth = 0.9;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(0, mouse.y);
      ctx.lineTo(width, mouse.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Floating cursor timestamp readout tag
      const scrollPct = Math.min(100, Math.max(0, Math.round((currentScrollY / (docHeight - height)) * 100)));
      ctx.font = "8px monospace";
      ctx.fillStyle = "rgba(0, 180, 216, 0.45)";
      ctx.fillText(`TIMELINE_SYNC: ${scrollPct}%`, mouse.x + 12, mouse.y - 8);
    }

    animationFrameId = requestAnimationFrame(renderTimeline);
  }

  renderTimeline();
});
