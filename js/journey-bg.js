// ══════════════════════════════════════════════════════════════════
// SUTRAM 2026 — Interactive 3D Cyber Forensic Journey Highway
// Background animation for Hackathon Journey page (7 Stages)
// ══════════════════════════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("journeyCanvas");
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

  // 7 Holographic Waypoints mapped to the 7 Journey Stages
  const waypoints = [
    { label: "WP-01 | REGISTRATION", tag: "STAGE_01", flank: -1, yFrac: 0.18 },
    { label: "WP-02 | ONLINE QUIZ", tag: "STAGE_02", flank: 1, yFrac: 0.30 },
    { label: "WP-03 | IDEA & EVAL", tag: "STAGE_03", flank: -1, yFrac: 0.42 },
    { label: "WP-04 | MENTORSHIP", tag: "STAGE_04", flank: 1, yFrac: 0.54 },
    { label: "WP-05 | ELMS PORTAL", tag: "STAGE_05", flank: -1, yFrac: 0.66 },
    { label: "WP-06 | FINALISTS", tag: "STAGE_06", flank: 1, yFrac: 0.78 },
    { label: "WP-07 | FINALE @ IGDTUW", tag: "GRAND_FINALE", flank: 0, yFrac: 0.90 }
  ];

  // Traveling Journey Stream Pulses along the 3D trajectory
  const PULSE_COUNT = 20;
  const streamPulses = [];
  for (let i = 0; i < PULSE_COUNT; i++) {
    streamPulses.push({
      progress: Math.random(),
      speed: 0.0016 + Math.random() * 0.0022,
      size: 1.8 + Math.random() * 1.8
    });
  }

  // Floating Cyber Telemetry Dust / Sparks across document height
  const SPARK_COUNT = 45;
  const sparks = [];
  for (let i = 0; i < SPARK_COUNT; i++) {
    sparks.push({
      x: (Math.random() - 0.5) * 1200,
      yFrac: Math.random(),
      z: (Math.random() - 0.5) * 360,
      size: 1.2 + Math.random() * 1.6,
      phase: Math.random() * Math.PI * 2
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
    mouse.targetRotX = -ny * 0.16;
  });

  window.addEventListener("mouseleave", () => {
    mouse.x = -9999;
    mouse.y = -9999;
    mouse.isActive = false;
    mouse.targetRotX = 0;
    mouse.targetRotY = 0;
  });

  let time = 0;

  function renderJourney() {
    time += 0.002;

    ctx.clearRect(0, 0, width, height);

    const isDark = document.documentElement.getAttribute("data-theme") === "dark";

    // Smooth 3D parallax tilt
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

    // Dynamic placement based on real DOM elements if present
    const stepElements = document.querySelectorAll(".journey-step");
    const stepWorldYs = [];
    if (stepElements && stepElements.length > 0) {
      for (let s = 0; s < stepElements.length; s++) {
        const r = stepElements[s].getBoundingClientRect();
        stepWorldYs.push(r.top + currentScrollY + r.height * 0.5);
      }
    }

    const flankDist = Math.max(width * 0.38, 380);

    // ─────────────────────────────────────────────────────────────
    // 1. Rotating 3D Navigational Compass in Hero
    // ─────────────────────────────────────────────────────────────
    const heroEl = document.querySelector(".journey-hero");
    let heroWorldY = 170;
    if (heroEl) {
      const hr = heroEl.getBoundingClientRect();
      heroWorldY = hr.top + currentScrollY + hr.height * 0.5;
    }
    const heroRelY = heroWorldY - currentScrollY - centerY;

    if (heroRelY > -height && heroRelY < height) {
      const gyroPt = project(0, heroRelY, -130);

      ctx.save();
      ctx.translate(gyroPt.x, gyroPt.y);

      // Rotating Outer Compass Ring
      ctx.rotate(time * 0.35);
      ctx.strokeStyle = isDark ? "rgba(0, 180, 216, 0.28)" : "rgba(100, 116, 139, 0.16)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, 118 * gyroPt.scale, 0, Math.PI * 2);
      ctx.stroke();

      // Cardinal Navigation Ticks (24 divisions)
      const divisions = 24;
      for (let d = 0; d < divisions; d++) {
        const theta = (d / divisions) * Math.PI * 2;
        const r1 = (d % 6 === 0 ? 106 : 113) * gyroPt.scale;
        const r2 = 118 * gyroPt.scale;
        ctx.strokeStyle = d % 6 === 0 ? "rgba(0, 180, 216, 0.38)" : "rgba(100, 116, 139, 0.14)";
        ctx.lineWidth = d % 6 === 0 ? 1.4 : 0.8;
        ctx.beginPath();
        ctx.moveTo(Math.cos(theta) * r1, Math.sin(theta) * r1);
        ctx.lineTo(Math.cos(theta) * r2, Math.sin(theta) * r2);
        ctx.stroke();
      }

      // Middle Counter-rotating Gyro Ring with Coordinates
      ctx.rotate(-time * 0.7);
      ctx.strokeStyle = isDark ? "rgba(79, 148, 240, 0.32)" : "rgba(44, 123, 229, 0.18)";
      ctx.lineWidth = 1.0;
      ctx.setLineDash([14, 8, 22, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, 80 * gyroPt.scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Radar Sweep Wedge
      ctx.save();
      ctx.rotate(time * 1.4);
      const sweepGrad = ctx.createLinearGradient(0, 0, 75 * gyroPt.scale, 0);
      sweepGrad.addColorStop(0, "rgba(0, 180, 216, 0.24)");
      sweepGrad.addColorStop(1, "rgba(0, 180, 216, 0)");
      ctx.fillStyle = sweepGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 78 * gyroPt.scale, 0, 0.55);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // GPS Coordinates for IGDTUW Delhi Finale
      ctx.font = `${Math.floor(7.5 * gyroPt.scale)}px monospace`;
      ctx.fillStyle = isDark ? "rgba(0, 180, 216, 0.5)" : "rgba(0, 180, 216, 0.36)";
      ctx.fillText("DEST: IGDTUW [28.66°N · 77.23°E]", -72 * gyroPt.scale, -88 * gyroPt.scale);

      ctx.restore();
    }

    // ─────────────────────────────────────────────────────────────
    // 2. Project 7 Holographic Waypoints & Draw Connecting Highway
    // ─────────────────────────────────────────────────────────────
    const projectedWaypoints = waypoints.map((wp, idx) => {
      const worldY = (stepWorldYs[idx] !== undefined) ? stepWorldYs[idx] : (wp.yFrac * docHeight);
      const screenRelY = worldY - currentScrollY - centerY;
      const xPos = wp.flank === 0 ? 0 : wp.flank * flankDist;
      const proj = project(xPos, screenRelY, wp.flank === 0 ? 40 : 15);
      return {
        ...wp,
        proj,
        screenRelY,
        worldY,
        isVisible: screenRelY > -height * 0.7 && screenRelY < height * 0.7
      };
    });

    // Draw 3D Zig-Zag Journey Trajectory connecting WP-01 -> WP-07
    ctx.beginPath();
    ctx.strokeStyle = isDark ? "rgba(100, 140, 180, 0.22)" : "rgba(100, 116, 139, 0.16)";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([5, 6]);

    for (let i = 0; i < projectedWaypoints.length; i++) {
      const pt = projectedWaypoints[i].proj;
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // ─────────────────────────────────────────────────────────────
    // 3. Traveling Journey Telemetry Pulses along the Highway
    // ─────────────────────────────────────────────────────────────
    const totalSegments = projectedWaypoints.length - 1;
    streamPulses.forEach((pkt) => {
      pkt.progress += pkt.speed;
      if (pkt.progress >= 1) pkt.progress = 0;

      const segFloat = pkt.progress * totalSegments;
      const segIndex = Math.floor(segFloat);
      const frac = segFloat - segIndex;

      const pA = projectedWaypoints[segIndex];
      const pB = projectedWaypoints[Math.min(segIndex + 1, totalSegments)];

      if (pA && pB && (pA.isVisible || pB.isVisible)) {
        const px = pA.proj.x + (pB.proj.x - pA.proj.x) * frac;
        const py = pA.proj.y + (pB.proj.y - pA.proj.y) * frac;
        const pScale = pA.proj.scale + (pB.proj.scale - pA.proj.scale) * frac;

        const pulseAlpha = Math.sin(pkt.progress * Math.PI) * 0.48;
        ctx.fillStyle = `rgba(0, 180, 216, ${pulseAlpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(px, py, pkt.size * pScale, 0, Math.PI * 2);
        ctx.fill();

        // Subtle glow halo
        ctx.strokeStyle = `rgba(44, 123, 229, ${(pulseAlpha * 0.45).toFixed(2)})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(px, py, pkt.size * 2.2 * pScale, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    // ─────────────────────────────────────────────────────────────
    // 4. Render 7 Holographic Waypoint Beacons
    // ─────────────────────────────────────────────────────────────
    projectedWaypoints.forEach((wp, idx) => {
      if (!wp.isVisible) return;
      const pt = wp.proj;

      const isFinale = idx === 6; // Grand Finale Beacon
      const beaconColor = isFinale ? "#D9A441" : "#00B4D8";
      const ringAlpha = isFinale ? 0.5 : (isDark ? 0.36 : 0.28);

      // Outer Waypoint Radar Ring
      const pulseR = (isFinale ? 18 : 12) + Math.sin(time * 2.5 + idx) * 3;
      ctx.strokeStyle = `rgba(${isFinale ? "217, 164, 65" : "0, 180, 216"}, ${ringAlpha})`;
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pulseR * pt.scale, 0, Math.PI * 2);
      ctx.stroke();

      // Waypoint Diamond / Center Beacon
      ctx.fillStyle = beaconColor;
      ctx.beginPath();
      if (isFinale) {
        ctx.arc(pt.x, pt.y, 4.5 * pt.scale, 0, Math.PI * 2);
      } else {
        ctx.arc(pt.x, pt.y, 2.8 * pt.scale, 0, Math.PI * 2);
      }
      ctx.fill();

      // Holographic Waypoint Label
      ctx.font = "8px monospace";
      ctx.fillStyle = isFinale
        ? "rgba(217, 164, 65, 0.8)"
        : (isDark ? "rgba(160, 185, 210, 0.55)" : "rgba(100, 116, 139, 0.45)");
      const labelX = wp.flank === -1 ? pt.x - 110 : (wp.flank === 0 ? pt.x - 48 : pt.x + 16);
      const labelY = wp.flank === 0 ? pt.y - 18 : pt.y + 3;
      ctx.fillText(wp.label, labelX, labelY);

      // Connecting horizontal guide line towards the center
      if (wp.flank !== 0) {
        ctx.strokeStyle = isDark ? "rgba(100, 140, 180, 0.14)" : "rgba(100, 116, 139, 0.12)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(wp.flank === -1 ? pt.x + 38 : pt.x - 38, pt.y);
        ctx.stroke();
      }
    });

    // ─────────────────────────────────────────────────────────────
    // 5. Floating Telemetry Sparks in 3D Depth
    // ─────────────────────────────────────────────────────────────
    sparks.forEach((sp) => {
      const worldY = sp.yFrac * docHeight;
      const screenRelY = worldY - currentScrollY - centerY;

      if (screenRelY > -height * 0.7 && screenRelY < height * 0.7) {
        const drift = Math.sin(time * 1.8 + sp.phase) * 6;
        const pt = project(sp.x + drift, screenRelY + drift, sp.z);

        const sAlpha = Math.max(0.12, Math.min(0.35, 0.22 + (pt.z / 400) * 0.1));
        ctx.fillStyle = isDark
          ? `rgba(140, 170, 210, ${sAlpha.toFixed(2)})`
          : `rgba(120, 135, 155, ${sAlpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, sp.size * pt.scale, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // ─────────────────────────────────────────────────────────────
    // 6. Interactive Mouse Navigation Crosshair
    // ─────────────────────────────────────────────────────────────
    if (mouse.isActive) {
      // Subtle horizon tracking reticle
      ctx.strokeStyle = isDark ? "rgba(0, 180, 216, 0.24)" : "rgba(0, 180, 216, 0.18)";
      ctx.lineWidth = 0.8;
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      ctx.moveTo(0, mouse.y);
      ctx.lineTo(width, mouse.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Live journey navigation progress tag
      const journeyPct = Math.min(100, Math.max(0, Math.round((currentScrollY / (docHeight - height)) * 100)));
      ctx.font = "8px monospace";
      ctx.fillStyle = isDark ? "rgba(0, 180, 216, 0.6)" : "rgba(0, 180, 216, 0.45)";
      ctx.fillText(`JOURNEY_NAV: STAGE 01 -> FINALE [${journeyPct}%]`, mouse.x + 12, mouse.y - 8);
    }

    animationFrameId = requestAnimationFrame(renderJourney);
  }

  renderJourney();
});
