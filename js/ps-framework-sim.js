// ══════════════════════════════════════════════════════════════════
// SUTRAM 2026 — AI Digital Forensics Investigation Engine Simulation
// 1. Central Head Profile + Glowing Fingerprint + Scanning Beam + Circuit Traces
// 2. Laptop with Dynamic Analysis Terminal (Files / Waveforms / Pattern Alerts)
// 3. Sequential Evidence Icons Pipeline (Document → Lock → Network → Chart)
// 4. End-to-End Traveling Data Particles (Folder → Head → Laptop → Network)
// ══════════════════════════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("frameworkCanvas");
  if (!canvas) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cssW = 440;
  const cssH = 330;
  canvas.width = cssW * dpr;
  canvas.height = cssH * dpr;
  canvas.style.width = "100%";
  canvas.style.maxWidth = cssW + "px";
  canvas.style.height = cssH + "px";

  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  let isHover = false;
  canvas.addEventListener("mouseenter", () => { isHover = true; });
  canvas.addEventListener("mouseleave", () => { isHover = false; });

  // ─── Pipeline traveling particles ───
  const particles = [];
  const MAX_PARTICLES = 28;
  for (let i = 0; i < MAX_PARTICLES; i++) {
    particles.push({
      progress: Math.random(),
      speed: 0.0018 + Math.random() * 0.0025,
      pathIndex: i % 3,
      size: 1.5 + Math.random() * 2,
      color: ["#38bdf8", "#60a5fa", "#34d399", "#a78bfa"][i % 4]
    });
  }

  // Define Flow Waypoints across the forensic poster stage:
  // Route 0: Evidence Intake (Left) -> Head/Fingerprint -> Laptop -> Results
  // Route 1: Fingerprint -> Circuit Branches -> Upper Security Nodes
  // Route 2: Laptop Analysis -> Correlated Intelligence Output
  function getPathPoint(t, route) {
    if (route === 0) {
      // Flow from bottom-left (Collect) through Head to Laptop
      if (t < 0.35) {
        const u = t / 0.35;
        return { x: 30 + u * 150, y: 280 - Math.sin(u * Math.PI) * 50 - u * 140 };
      } else if (t < 0.7) {
        const u = (t - 0.35) / 0.35;
        return { x: 180 + u * 100, y: 140 + u * 75 };
      } else {
        const u = (t - 0.7) / 0.3;
        return { x: 280 + u * 110, y: 215 - Math.sin(u * Math.PI * 0.5) * 50 };
      }
    } else if (route === 1) {
      // Flow around Head / Brain circuits
      const ang = t * Math.PI * 2;
      const rx = 36 + Math.sin(t * 8) * 8;
      const ry = 42 + Math.cos(t * 8) * 8;
      return { x: 175 + Math.cos(ang) * rx, y: 125 + Math.sin(ang) * ry };
    } else {
      // Laptop to Right-Side Intelligence Pipeline Icons
      const u = t;
      return {
        x: 270 + u * 125,
        y: 235 - Math.pow(u, 0.8) * 160
      };
    }
  }

  let startTime = performance.now();

  function render(now) {
    const time = (now - startTime) * 0.001;
    ctx.clearRect(0, 0, cssW, cssH);

    // ─── 0. Ambient Grid & Digital Evidence Glow Background ───
    ctx.save();
    ctx.strokeStyle = "rgba(56, 189, 248, 0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= cssW; x += 22) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, cssH);
      ctx.stroke();
    }
    for (let y = 0; y <= cssH; y += 22) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(cssW, y);
      ctx.stroke();
    }
    ctx.restore();

    // ─── 1. HEAD PROFILE & FINGERPRINT CORE ───
    const headCX = 175;
    const headCY = 135;

    // Outer Digital Brain Silhouette / Head Profile
    ctx.save();
    ctx.beginPath();
    // Simplified elegant profile facing left
    ctx.moveTo(headCX + 35, headCY + 70); // back neck
    ctx.lineTo(headCX + 35, headCY + 30);
    ctx.bezierCurveTo(headCX + 60, headCY - 10, headCX + 55, headCY - 65, headCX - 5, headCY - 70); // skull top
    ctx.bezierCurveTo(headCX - 45, headCY - 68, headCX - 68, headCY - 35, headCX - 65, headCY - 15); // forehead
    ctx.lineTo(headCX - 80, headCY + 5); // nose tip
    ctx.lineTo(headCX - 68, headCY + 18); // nose base
    ctx.lineTo(headCX - 72, headCY + 30); // lips
    ctx.lineTo(headCX - 55, headCY + 55); // chin
    ctx.lineTo(headCX - 35, headCY + 65); // jaw
    ctx.lineTo(headCX - 30, headCY + 75); // throat
    ctx.closePath();

    ctx.fillStyle = "rgba(14, 165, 233, 0.08)";
    ctx.fill();
    ctx.strokeStyle = "rgba(56, 189, 248, 0.55)";
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.restore();

    // Circuit lines extending from skull to the right
    ctx.save();
    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.lineWidth = 1.2;
    const circuitPoints = [
      [[headCX + 25, headCY - 40], [headCX + 75, headCY - 40], [headCX + 105, headCY - 65]],
      [[headCX + 35, headCY - 10], [headCX + 90, headCY - 10], [headCX + 115, headCY - 10]],
      [[headCX + 28, headCY + 20], [headCX + 70, headCY + 20], [headCX + 95, headCY + 45], [headCX + 120, headCY + 45]]
    ];
    circuitPoints.forEach((pts, idx) => {
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let p = 1; p < pts.length; p++) {
        ctx.lineTo(pts[p][0], pts[p][1]);
      }
      ctx.stroke();

      // Sequential circuit pulse node
      const activeIdx = Math.floor((time * 2 + idx) % pts.length);
      const nodeX = pts[activeIdx][0];
      const nodeY = pts[activeIdx][1];
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // ── Fingerprint Inside Head Core ──
    const fpCX = headCX - 5;
    const fpCY = headCY - 10;
    const fpRadiusMax = 28;

    ctx.save();
    // Pulse scale effect
    const fpPulse = 1 + Math.sin(time * 2.2) * 0.04;
    // Digital glitch scan effect every few seconds
    const isGlitching = Math.sin(time * 0.8) > 0.94;
    const glitchOffset = isGlitching ? (Math.random() - 0.5) * 4 : 0;

    ctx.translate(fpCX + glitchOffset, fpCY);
    ctx.scale(fpPulse, fpPulse);

    // Fingerprint ridges (concentric stylized forensic loops)
    for (let r = 8; r <= fpRadiusMax; r += 5) {
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.75, r, 0, Math.PI * 0.15, Math.PI * 1.85);
      const ridgeAlpha = 0.35 + Math.sin(time * 2 + r * 0.4) * 0.25;
      ctx.strokeStyle = `rgba(56, 189, 248, ${ridgeAlpha})`;
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
    ctx.restore();

    // Scanning vertical beam traveling through fingerprint
    const scanScanHeight = 58;
    const scanY = fpCY - 30 + ((time * 38) % scanScanHeight);
    const scanGrad = ctx.createLinearGradient(fpCX - 30, scanY, fpCX + 30, scanY);
    scanGrad.addColorStop(0, "rgba(56, 189, 248, 0)");
    scanGrad.addColorStop(0.5, "rgba(56, 189, 248, 0.85)");
    scanGrad.addColorStop(1, "rgba(56, 189, 248, 0)");

    ctx.save();
    ctx.strokeStyle = scanGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(fpCX - 28, scanY);
    ctx.lineTo(fpCX + 26, scanY);
    ctx.stroke();
    // Scan beam glow aura
    ctx.fillStyle = "rgba(56, 189, 248, 0.12)";
    ctx.fillRect(fpCX - 28, scanY - 3, 54, 6);
    ctx.restore();

    // ─── 2. LAPTOP: AI ANALYSIS ENGINE ───
    const lapX = 275;
    const lapY = 225;

    ctx.save();
    // Laptop Screen Base (angled 3D perspective)
    // Screen back lid
    ctx.fillStyle = "#091c33";
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(lapX - 44, lapY - 58, 88, 54, 4);
    ctx.fill();
    ctx.stroke();

    // Screen display interior
    ctx.fillStyle = "#030c18";
    ctx.fillRect(lapX - 40, lapY - 54, 80, 46);

    // Animated screen analysis cycle:
    // Cycle every 4.5 seconds:
    // 0.0 - 1.5s: SCANNING / Magnifier
    // 1.5 - 3.0s: ANALYZING 73 FILES / Waveform
    // 3.0 - 4.5s: PATTERN DETECTED / Alert Check
    const screenPhase = (time % 4.5);
    ctx.font = "bold 7px monospace";

    if (screenPhase < 1.5) {
      // Magnifying search
      ctx.fillStyle = "#38bdf8";
      ctx.fillText("SCANNING...", lapX - 35, lapY - 40);

      const magX = lapX + Math.sin(time * 4) * 14;
      const magY = lapY - 24;
      ctx.strokeStyle = "#34d399";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(magX, magY, 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(magX + 3.5, magY + 3.5);
      ctx.lineTo(magX + 7, magY + 7);
      ctx.stroke();
    } else if (screenPhase < 3.0) {
      // Waveform / file analysis
      ctx.fillStyle = "#60a5fa";
      ctx.fillText("ANALYZING 73 FILES", lapX - 37, lapY - 42);

      // Mini waveform bars
      ctx.fillStyle = "#38bdf8";
      for (let b = 0; b < 10; b++) {
        const barH = 3 + Math.abs(Math.sin(time * 6 + b)) * 11;
        ctx.fillRect(lapX - 32 + b * 6.5, lapY - 14 - barH, 4, barH);
      }
    } else {
      // Pattern detected
      ctx.fillStyle = "#34d399";
      ctx.fillText("PATTERN DETECTED", lapX - 37, lapY - 38);
      ctx.fillText("CORRELATION 99.4%", lapX - 36, lapY - 25);
      ctx.fillStyle = "#10b981";
      ctx.fillRect(lapX - 36, lapY - 18, 70, 3);
    }

    // Laptop keyboard base (trapezoid isometric view)
    ctx.beginPath();
    ctx.moveTo(lapX - 52, lapY + 12);
    ctx.lineTo(lapX - 44, lapY - 4);
    ctx.lineTo(lapX + 44, lapY - 4);
    ctx.lineTo(lapX + 52, lapY + 12);
    ctx.closePath();
    ctx.fillStyle = "#0c2542";
    ctx.fill();
    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.stroke();

    // Trackpad
    ctx.fillStyle = "rgba(56, 189, 248, 0.25)";
    ctx.fillRect(lapX - 10, lapY + 4, 20, 6);
    ctx.restore();

    // ─── 3. RIGHT-SIDE SEQUENTIAL EVIDENCE ICONS ───
    // Icons: Document (0) -> Lock (1) -> Network (2) -> Chart (3)
    const rightIcons = [
      { name: "DOC", label: "Document", x: 388, y: 72, icon: "📄" },
      { name: "AUTH", label: "Lock", x: 388, y: 130, icon: "🔒" },
      { name: "NET", label: "Network", x: 388, y: 188, icon: "🔗" },
      { name: "CHART", label: "Evidence Graph", x: 388, y: 246, icon: "📊" }
    ];

    const activePipelineStep = Math.floor((time * 1.3) % 4);

    rightIcons.forEach((item, index) => {
      const isActive = activePipelineStep === index;
      const bubbleRadius = isActive ? 18 : 15;

      ctx.save();
      ctx.beginPath();
      ctx.arc(item.x, item.y, bubbleRadius, 0, Math.PI * 2);

      if (isActive) {
        ctx.fillStyle = "rgba(14, 165, 233, 0.35)";
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 12;
      } else {
        ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
        ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
        ctx.lineWidth = 1.2;
      }
      ctx.fill();
      ctx.stroke();

      // Mini text symbol inside circle
      ctx.font = isActive ? "13px sans-serif" : "11px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(item.icon, item.x, item.y);
      ctx.restore();

      // Connecting line between consecutive right icons
      if (index < rightIcons.length - 1) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(item.x, item.y + bubbleRadius + 2);
        ctx.lineTo(item.x, rightIcons[index + 1].y - 16);
        ctx.strokeStyle = isActive ? "#38bdf8" : "rgba(56, 189, 248, 0.2)";
        ctx.lineWidth = isActive ? 1.8 : 1;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.restore();
      }
    });

    // ─── 4. TRAVELING DATA PARTICLES ───
    // Particles flow: Folder -> Head -> Fingerprint -> Laptop -> Network
    ctx.save();
    particles.forEach((p) => {
      p.progress += p.speed;
      if (p.progress > 1) {
        p.progress = 0;
        p.pathIndex = (p.pathIndex + 1) % 3;
      }
      const pt = getPathPoint(p.progress, p.pathIndex);

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.fill();
    });
    ctx.restore();

    // ─── 5. FORENSIC INTELLIGENCE LABELS ───
    ctx.save();
    ctx.font = "9px monospace";
    ctx.fillStyle = "rgba(125, 211, 252, 0.85)";
    ctx.fillText("AI INVESTIGATION ENGINE // LIVE", 18, 24);

    ctx.fillStyle = "rgba(148, 163, 184, 0.7)";
    ctx.fillText("MULTISOURCE CORRELATION", 18, 38);
    ctx.restore();

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
});
