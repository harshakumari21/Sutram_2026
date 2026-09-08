// ══════════════════════════════════════════════════════════════════
// SUTRAM 2026 — Live 3D Forensic Systems for Problem Statements
// Miniature, real-time forensic engines for PS01 - PS05 cards
// ══════════════════════════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".problem-card[data-ps]");
  if (!cards.length) return;

  // Track hover states for cards
  const hoverStates = {
    ps01: false,
    ps02: false,
    ps03: false,
    ps04: false,
    ps05: false
  };

  cards.forEach((card) => {
    const ps = card.getAttribute("data-ps");
    if (!ps) return;
    card.addEventListener("mouseenter", () => { hoverStates[ps] = true; });
    card.addEventListener("mouseleave", () => { hoverStates[ps] = false; });
  });

  // Setup canvases
  const canvases = {
    ps01: document.getElementById("canvasPS01"),
    ps02: document.getElementById("canvasPS02"),
    ps03: document.getElementById("canvasPS03"),
    ps04: document.getElementById("canvasPS04"),
    ps05: document.getElementById("canvasPS05")
  };

  // Check if canvases exist
  if (!canvases.ps01 && !canvases.ps02) return;

  // Handle DPR for crisp retina rendering
  function initCanvasDPR(canvas) {
    if (!canvas) return null;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = parseInt(canvas.getAttribute("width"), 10) || 220;
    const cssH = parseInt(canvas.getAttribute("height"), 10) || 150;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.width = cssW + "px";
    canvas.style.height = cssH + "px";
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    return { ctx, w: cssW, h: cssH };
  }

  const contexts = {
    ps01: initCanvasDPR(canvases.ps01),
    ps02: initCanvasDPR(canvases.ps02),
    ps03: initCanvasDPR(canvases.ps03),
    ps04: initCanvasDPR(canvases.ps04),
    ps05: initCanvasDPR(canvases.ps05)
  };

  // ══════════════════════════════════════════════════════════════════
  // PS01: 3D Smartphone + Forensic Scan + Emitting Evidence Bits
  // ══════════════════════════════════════════════════════════════════
  const ps01Particles = [];
  for (let i = 0; i < 14; i++) {
    ps01Particles.push({
      x: (Math.random() - 0.5) * 36,
      y: (Math.random() - 0.5) * 55,
      z: Math.random() * 35,
      vz: 0.4 + Math.random() * 0.7,
      vy: -0.2 - Math.random() * 0.4,
      size: 1.2 + Math.random() * 1.6,
      type: i % 3, // 0: dot, 1: hex, 2: pulse
      hex: ["0xFA", "0x3C", "SMS", "LOG", "0x91"][i % 5]
    });
  }

  function renderPS01(ctx, w, h, time, isHover) {
    ctx.clearRect(0, 0, w, h);

    const cx = w * 0.54;
    const cy = h * 0.52;

    // 3D Isometric angles
    const rotY = -0.38 + (isHover ? 0.12 : 0) + Math.sin(time * 0.8) * 0.05;
    const rotX = 0.24 + Math.cos(time * 0.6) * 0.04;
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

    function project3D(x, y, z) {
      // Y-axis rotation
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;
      // X-axis rotation
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;
      const fov = 280;
      const scale = fov / (fov + z2);
      return { x: cx + x1 * scale, y: cy + y2 * scale, z: z2, scale };
    }

    const pw = 46;
    const ph = 82;
    const pd = 6;

    // Draw 3D phone chassis
    const corners = [
      project3D(-pw / 2, -ph / 2, 0),
      project3D(pw / 2, -ph / 2, 0),
      project3D(pw / 2, ph / 2, 0),
      project3D(-pw / 2, ph / 2, 0),
      project3D(-pw / 2, -ph / 2, -pd),
      project3D(pw / 2, -ph / 2, -pd),
      project3D(pw / 2, ph / 2, -pd),
      project3D(-pw / 2, ph / 2, -pd)
    ];

    // Phone back & side depth bevel
    ctx.beginPath();
    ctx.strokeStyle = "rgba(44, 123, 229, 0.28)";
    ctx.lineWidth = 1;
    // Edge connections for 3D depth
    [0, 1, 2, 3].forEach((i) => {
      ctx.moveTo(corners[i].x, corners[i].y);
      ctx.lineTo(corners[i + 4].x, corners[i + 4].y);
    });
    ctx.stroke();

    // Screen glass background
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    ctx.lineTo(corners[1].x, corners[1].y);
    ctx.lineTo(corners[2].x, corners[2].y);
    ctx.lineTo(corners[3].x, corners[3].y);
    ctx.closePath();
    ctx.fillStyle = "rgba(44, 123, 229, 0.05)";
    ctx.fill();
    ctx.strokeStyle = "rgba(44, 123, 229, 0.65)";
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Screen grid lines
    ctx.strokeStyle = "rgba(44, 123, 229, 0.12)";
    ctx.lineWidth = 0.8;
    for (let f = 0.25; f <= 0.75; f += 0.25) {
      const p1 = project3D(-pw / 2 + pw * f, -ph / 2, 0);
      const p2 = project3D(-pw / 2 + pw * f, ph / 2, 0);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    // Top speaker / camera notch
    const notchP = project3D(0, -ph / 2 + 5, 0);
    ctx.fillStyle = "rgba(44, 123, 229, 0.5)";
    ctx.beginPath();
    ctx.arc(notchP.x, notchP.y, 2, 0, Math.PI * 2);
    ctx.fill();

    // Forensic Scanning Laser Grid
    const scanSpeed = isHover ? 1.4 : 0.8;
    const scanProgress = (time * scanSpeed) % 1;
    const scanYVal = -ph / 2 + ph * scanProgress;
    const leftScan = project3D(-pw / 2 + 2, scanYVal, 0);
    const rightScan = project3D(pw / 2 - 2, scanYVal, 0);

    // Laser beam
    ctx.beginPath();
    ctx.moveTo(leftScan.x, leftScan.y);
    ctx.lineTo(rightScan.x, rightScan.y);
    ctx.strokeStyle = "rgba(0, 180, 216, 0.95)";
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Trailing scan grid mesh
    const trailH = 18;
    const tLeft = project3D(-pw / 2 + 2, Math.max(-ph / 2, scanYVal - trailH), 0);
    const tRight = project3D(pw / 2 - 2, Math.max(-ph / 2, scanYVal - trailH), 0);
    ctx.beginPath();
    ctx.moveTo(leftScan.x, leftScan.y);
    ctx.lineTo(rightScan.x, rightScan.y);
    ctx.lineTo(tRight.x, tRight.y);
    ctx.lineTo(tLeft.x, tLeft.y);
    ctx.closePath();
    ctx.fillStyle = "rgba(0, 180, 216, 0.12)";
    ctx.fill();

    // Emitting Evidence Data Particles (floating out in 3D)
    ps01Particles.forEach((p) => {
      p.z += p.vz;
      p.y += p.vy;

      // Respawn near scan line
      if (p.z > 50 || p.y < -ph / 2 - 10) {
        p.z = 2;
        p.y = scanYVal + (Math.random() - 0.5) * 8;
        p.x = (Math.random() - 0.5) * (pw - 8);
      }

      const proj = project3D(p.x, p.y, p.z);
      const alpha = Math.max(0, Math.min(1, 1 - p.z / 50));

      if (p.type === 1) {
        // Mini hex / label tag
        ctx.font = "8px monospace";
        ctx.fillStyle = `rgba(0, 180, 216, ${alpha.toFixed(2)})`;
        ctx.fillText(p.hex, proj.x, proj.y);
      } else {
        // Glowing data bit
        ctx.fillStyle = `rgba(44, 123, 229, ${alpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, p.size * proj.scale, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Clean 3D viewport without footer label
  }

  // ══════════════════════════════════════════════════════════════════
  // PS02: 3D Face Landmark Mesh + Media Frame + Authenticity HUD Ring
  // ══════════════════════════════════════════════════════════════════
  // Normalized 3D facial landmarks
  const faceLandmarks = [
    { x: 0, y: -34, z: 12 },    // 0: forehead center
    { x: -16, y: -28, z: 6 },   // 1: left brow arch
    { x: 16, y: -28, z: 6 },    // 2: right brow arch
    { x: -12, y: -18, z: 14 },  // 3: left eye
    { x: 12, y: -18, z: 14 },   // 4: right eye
    { x: 0, y: -14, z: 22 },    // 5: nose bridge
    { x: 0, y: -2, z: 26 },     // 6: nose tip
    { x: -8, y: -1, z: 18 },    // 7: left nostril
    { x: 8, y: -1, z: 18 },     // 8: right nostril
    { x: -26, y: -6, z: 2 },    // 9: left cheek
    { x: 26, y: -6, z: 2 },     // 10: right cheek
    { x: -14, y: 12, z: 16 },   // 11: left mouth corner
    { x: 14, y: 12, z: 16 },    // 12: right mouth corner
    { x: 0, y: 11, z: 21 },     // 13: upper lip
    { x: 0, y: 18, z: 19 },     // 14: lower lip
    { x: -20, y: 22, z: 4 },    // 15: left jaw
    { x: 20, y: 22, z: 4 },     // 16: right jaw
    { x: 0, y: 32, z: 15 }      // 17: chin
  ];

  // Triangulation lines between face landmarks
  const faceEdges = [
    [0, 1], [0, 2], [1, 3], [2, 4], [1, 5], [2, 5],
    [3, 5], [4, 5], [5, 6], [6, 7], [6, 8], [7, 9],
    [8, 10], [9, 15], [10, 16], [15, 17], [16, 17],
    [6, 13], [13, 11], [13, 12], [11, 14], [12, 14],
    [14, 17], [9, 11], [10, 12]
  ];

  function renderPS02(ctx, w, h, time, isHover) {
    ctx.clearRect(0, 0, w, h);

    const cx = w * 0.52;
    const cy = h * 0.52;

    // Gentle 3D head yaw and pitch
    const rotY = Math.sin(time * 0.75) * 0.24 + (isHover ? 0.12 : 0);
    const rotX = Math.cos(time * 0.55) * 0.12;
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

    function project3D(x, y, z) {
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;
      const fov = 260;
      const scale = fov / (fov + z2);
      return { x: cx + x1 * scale, y: cy + y2 * scale, z: z2, scale };
    }

    // Authenticity state cycle: 70% verified green, 30% deepfake analysis
    const cycle = (time * 0.35) % 1;
    const isSyntheticCheck = cycle > 0.65;
    const ringColor = isSyntheticCheck ? "#EF4444" : "#10B981";
    const statusText = isSyntheticCheck ? "ANOMALY: DEEPFAKE" : "AUTHENTIC: 99.4%";

    // Draw Media Video Bounding Box
    const bw = 55;
    const bh = 58;
    const bCorners = [
      { x: cx - bw, y: cy - bh },
      { x: cx + bw, y: cy - bh },
      { x: cx + bw, y: cy + bh },
      { x: cx - bw, y: cy + bh }
    ];

    // Corner brackets [ ]
    ctx.strokeStyle = isSyntheticCheck ? "rgba(239, 68, 68, 0.7)" : "rgba(44, 123, 229, 0.5)";
    ctx.lineWidth = 1.6;
    const bLen = 10;
    // Top-left
    ctx.beginPath(); ctx.moveTo(bCorners[0].x, bCorners[0].y + bLen); ctx.lineTo(bCorners[0].x, bCorners[0].y); ctx.lineTo(bCorners[0].x + bLen, bCorners[0].y); ctx.stroke();
    // Top-right
    ctx.beginPath(); ctx.moveTo(bCorners[1].x - bLen, bCorners[1].y); ctx.lineTo(bCorners[1].x, bCorners[1].y); ctx.lineTo(bCorners[1].x, bCorners[1].y + bLen); ctx.stroke();
    // Bottom-right
    ctx.beginPath(); ctx.moveTo(bCorners[2].x, bCorners[2].y - bLen); ctx.lineTo(bCorners[2].x, bCorners[2].y); ctx.lineTo(bCorners[2].x - bLen, bCorners[2].y); ctx.stroke();
    // Bottom-left
    ctx.beginPath(); ctx.moveTo(bCorners[3].x + bLen, bCorners[3].y); ctx.lineTo(bCorners[3].x, bCorners[3].y); ctx.lineTo(bCorners[3].x, bCorners[3].y - bLen); ctx.stroke();

    // Frame tag
    ctx.font = "8px monospace";
    ctx.fillStyle = "rgba(44, 123, 229, 0.7)";
    ctx.fillText("FRAME #0418", bCorners[0].x, bCorners[0].y - 5);

    // Project face landmarks
    const projLandmarks = faceLandmarks.map((pt) => project3D(pt.x, pt.y, pt.z));

    // Draw Wireframe Face Mesh
    ctx.strokeStyle = isSyntheticCheck ? "rgba(239, 68, 68, 0.35)" : "rgba(44, 123, 229, 0.35)";
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    faceEdges.forEach(([i1, i2]) => {
      ctx.moveTo(projLandmarks[i1].x, projLandmarks[i1].y);
      ctx.lineTo(projLandmarks[i2].x, projLandmarks[i2].y);
    });
    ctx.stroke();

    // Landmark tracking dots
    projLandmarks.forEach((pt, idx) => {
      // If synthetic check, highlight deepfake artifact nodes around jaw/mouth in red
      const isAnomalyNode = isSyntheticCheck && (idx === 13 || idx === 14 || idx === 6);
      ctx.fillStyle = isAnomalyNode ? "#EF4444" : "#00B4D8";
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, isAnomalyNode ? 3.0 : 1.8 * pt.scale, 0, Math.PI * 2);
      ctx.fill();
    });

    // Circular Authenticity HUD Ring
    const ringRadius = 56;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(time * 0.9);

    ctx.strokeStyle = ringColor;
    ctx.lineWidth = 1.4;
    ctx.setLineDash([12, 10, 24, 8]);
    ctx.beginPath();
    ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

  }

  // ══════════════════════════════════════════════════════════════════
  // PS03: 3D Evidence Nodes / Crime Board + Interactive Timeline
  // ══════════════════════════════════════════════════════════════════
  const crimeNodes = [
    { x: -50, y: -26, z: -10, label: "TOWER PING", timeTag: "02:14" },
    { x: -14, y: -38, z: 12, label: "CCTV MATCH", timeTag: "02:26" },
    { x: 12, y: -10, z: -8, label: "ENCRYPTED CHAT", timeTag: "02:45" },
    { x: -28, y: 18, z: 15, label: "CRYPTO WALLET", timeTag: "03:10" },
    { x: 44, y: 22, z: -5, label: "GEO-EXIT", timeTag: "03:32" }
  ];

  function renderPS03(ctx, w, h, time, isHover) {
    ctx.clearRect(0, 0, w, h);

    const cx = w * 0.52;
    const cy = h * 0.50;

    // 3D Isometric Crime Board Perspective
    const rotX = 0.44 + (isHover ? 0.08 : 0);
    const rotY = -0.22 + Math.sin(time * 0.5) * 0.06;
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

    function project3D(x, y, z) {
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;
      const fov = 260;
      const scale = fov / (fov + z2);
      return { x: cx + x1 * scale, y: cy + y2 * scale, z: z2, scale };
    }

    // 3D Crime Board Plane
    const bw = 70;
    const bh = 52;
    const boardCorners = [
      project3D(-bw, -bh, -15),
      project3D(bw, -bh, -15),
      project3D(bw, bh, 15),
      project3D(-bw, bh, 15)
    ];

    ctx.beginPath();
    ctx.moveTo(boardCorners[0].x, boardCorners[0].y);
    ctx.lineTo(boardCorners[1].x, boardCorners[1].y);
    ctx.lineTo(boardCorners[2].x, boardCorners[2].y);
    ctx.lineTo(boardCorners[3].x, boardCorners[3].y);
    ctx.closePath();
    ctx.fillStyle = "rgba(44, 123, 229, 0.04)";
    ctx.fill();
    ctx.strokeStyle = "rgba(44, 123, 229, 0.22)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Project evidence nodes
    const projectedNodes = crimeNodes.map((n) => ({
      ...n,
      proj: project3D(n.x, n.y, n.z)
    }));

    // Draw Correlating Laser Threads between nodes (0 -> 1 -> 2 -> 3 -> 4)
    ctx.strokeStyle = "rgba(44, 123, 229, 0.45)";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    projectedNodes.forEach((n, idx) => {
      if (idx === 0) ctx.moveTo(n.proj.x, n.proj.y);
      else ctx.lineTo(n.proj.x, n.proj.y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Traveling Timeline Packet Tracer
    const speed = isHover ? 1.6 : 1.0;
    const travelProgress = (time * 0.45 * speed) % 1; // 0 to 1
    const totalSegments = projectedNodes.length - 1;
    const currentSegment = Math.floor(travelProgress * totalSegments);
    const segProgress = (travelProgress * totalSegments) - currentSegment;

    const nFrom = projectedNodes[currentSegment];
    const nTo = projectedNodes[Math.min(currentSegment + 1, totalSegments)];

    if (nFrom && nTo) {
      const tx = nFrom.proj.x + (nTo.proj.x - nFrom.proj.x) * segProgress;
      const ty = nFrom.proj.y + (nTo.proj.y - nFrom.proj.y) * segProgress;

      // Bright gold/cyan forensic signal tracer
      ctx.fillStyle = "#00B4D8";
      ctx.beginPath();
      ctx.arc(tx, ty, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 180, 216, 0.45)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(tx, ty, 6.5, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw Evidence Nodes & Timeline Tags
    projectedNodes.forEach((n, idx) => {
      // Evidence Pin Node
      ctx.fillStyle = idx === currentSegment ? "#D9A441" : "#2C7BE5";
      ctx.beginPath();
      ctx.arc(n.proj.x, n.proj.y, 3.0 * n.proj.scale, 0, Math.PI * 2);
      ctx.fill();

      // Node ring
      ctx.strokeStyle = "rgba(44, 123, 229, 0.6)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(n.proj.x, n.proj.y, 6.0 * n.proj.scale, 0, Math.PI * 2);
      ctx.stroke();

      // Timestamp tag
      ctx.font = "7.5px monospace";
      ctx.fillStyle = "rgba(14, 34, 71, 0.65)";
      ctx.fillText(n.timeTag, n.proj.x + 8, n.proj.y + 3);
    });

    // Clean 3D Crime Board Viewport
  }

  // ══════════════════════════════════════════════════════════════════
  // PS04: 3D Digital Fingerprint + Threat Attribution Network
  // ══════════════════════════════════════════════════════════════════
  const threatNodes = [
    { x: -55, y: -30, label: "IP 198.51.100" },
    { x: 50, y: -32, label: "MULE A/C #84" },
    { x: -52, y: 28, label: "BURNER IMEI" },
    { x: 54, y: 26, label: "MALWARE C2" }
  ];

  function renderPS04(ctx, w, h, time, isHover) {
    ctx.clearRect(0, 0, w, h);

    const cx = w * 0.52;
    const cy = h * 0.50;

    // 3D Perspective Tilt
    const rotX = 0.35 + (isHover ? 0.08 : 0);
    const rotY = Math.sin(time * 0.6) * 0.12;
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

    function project3D(x, y, z) {
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;
      const fov = 260;
      const scale = fov / (fov + z2);
      return { x: cx + x1 * scale, y: cy + y2 * scale, z: z2, scale };
    }

    // 3D Digital Fingerprint Ridges (Concentric Elliptical Loops with gaps)
    const ridgeCount = 6;
    for (let r = 1; r <= ridgeCount; r++) {
      const rx = r * 6.5;
      const ry = r * 9.5;
      ctx.strokeStyle = `rgba(44, 123, 229, ${(0.18 + r * 0.06).toFixed(2)})`;
      ctx.lineWidth = 1.3;

      ctx.beginPath();
      // Plot ridge arc in 3D
      const steps = 24;
      for (let s = 0; s <= steps; s++) {
        const theta = (s / steps) * Math.PI * 2;
        // Introduce forensic ridge gap
        if (s === 4 || s === 16) continue;
        const px = rx * Math.cos(theta);
        const py = ry * Math.sin(theta);
        const pt = project3D(px, py, (r - 3) * 2);
        if (s === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
    }

    // Radar Scanning Beam across Fingerprint
    const scanAngle = time * (isHover ? 2.2 : 1.4);
    const scanLen = 48;
    const scanEnd = project3D(Math.cos(scanAngle) * scanLen, Math.sin(scanAngle) * scanLen, 0);
    const centerPt = project3D(0, 0, 0);

    ctx.beginPath();
    ctx.moveTo(centerPt.x, centerPt.y);
    ctx.lineTo(scanEnd.x, scanEnd.y);
    ctx.strokeStyle = "rgba(0, 180, 216, 0.75)";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Central Attributed Threat Actor Target
    ctx.fillStyle = "#EF4444";
    ctx.beginPath();
    ctx.arc(centerPt.x, centerPt.y, 3.8, 0, Math.PI * 2);
    ctx.fill();

    // Pulsing target reticle
    const reticleSize = 9 + Math.sin(time * 3) * 2.5;
    ctx.strokeStyle = "#EF4444";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(centerPt.x, centerPt.y, reticleSize, 0, Math.PI * 2);
    ctx.stroke();

    // Threat Attribution Network Nodes (branching IP, mule account, IMEI, C2)
    threatNodes.forEach((n, idx) => {
      const nProj = project3D(n.x, n.y, 0);

      // Attribution trace connecting to center suspect
      ctx.strokeStyle = "rgba(239, 68, 68, 0.4)";
      ctx.lineWidth = 1.1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(nProj.x, nProj.y);
      ctx.lineTo(centerPt.x, centerPt.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Threat Node
      ctx.fillStyle = "#0E2247";
      ctx.beginPath();
      ctx.arc(nProj.x, nProj.y, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Node label
      ctx.font = "7px monospace";
      ctx.fillStyle = "rgba(14, 34, 71, 0.7)";
      ctx.fillText(n.label, nProj.x - 18, nProj.y + 11);
    });

    // Clean viewport without footer label
  }

  // ══════════════════════════════════════════════════════════════════
  // PS05: 3D AI Neural Core / Holographic Assistant + Orbiting Cards
  // ══════════════════════════════════════════════════════════════════
  const orbitingArtifacts = [
    { angle: 0, label: "DOSSIER", icon: "📄", speed: 0.8 },
    { angle: Math.PI * 0.5, label: "WAVEFORM", icon: "📊", speed: 0.8 },
    { angle: Math.PI, label: "CRYPTO KEY", icon: "🔑", speed: 0.8 },
    { angle: Math.PI * 1.5, label: "GEO BEACON", icon: "🛰️", speed: 0.8 }
  ];

  function renderPS05(ctx, w, h, time, isHover) {
    ctx.clearRect(0, 0, w, h);

    const cx = w * 0.54;
    const cy = h * 0.50;

    // Central AI Core Orbiting Coordinates
    function projectOrb(x, y, z) {
      const fov = 300;
      const scale = fov / (fov + z);
      return { x: cx + x * scale, y: cy + y * scale, z, scale };
    }

    // Update orbiting cards
    const rotSpeed = isHover ? 1.4 : 0.8;
    const rx = 82;
    const ry = 30;

    const cards3D = orbitingArtifacts.map((art, idx) => {
      const curAngle = art.angle + time * art.speed * rotSpeed;
      const ox = Math.cos(curAngle) * rx;
      const oz = Math.sin(curAngle) * 45;
      const oy = Math.sin(curAngle) * ry + Math.cos(curAngle * 2) * 5;
      return {
        ...art,
        proj: projectOrb(ox, oy, oz),
        z: oz
      };
    });

    // 1. Draw cards behind the core (z < 0)
    cards3D.filter((c) => c.z < 0).forEach((c) => {
      drawFloatingCard(ctx, c.proj.x, c.proj.y, c.label, c.icon, 0.45 * c.proj.scale);
    });

    // 2. Draw 3D Gyroscope Holographic Rings around Central AI Core
    ctx.save();
    ctx.translate(cx, cy);

    // Ring 1 (X-Y Tilt)
    ctx.rotate(time * 0.9);
    ctx.strokeStyle = "rgba(0, 180, 216, 0.45)";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([8, 6, 16, 6]);
    ctx.beginPath();
    ctx.ellipse(0, 0, 32, 14, time * 0.5, 0, Math.PI * 2);
    ctx.stroke();

    // Ring 2 (Counter-rotation)
    ctx.strokeStyle = "rgba(44, 123, 229, 0.45)";
    ctx.lineWidth = 1.0;
    ctx.setLineDash([12, 8]);
    ctx.beginPath();
    ctx.ellipse(0, 0, 36, 16, -time * 0.7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Central Glowing AI Neural Core
    const orbPulse = 14 + Math.sin(time * 3) * 2;
    const orbGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, orbPulse);
    orbGrad.addColorStop(0, "#FFFFFF");
    orbGrad.addColorStop(0.35, "#00B4D8");
    orbGrad.addColorStop(0.8, "#2C7BE5");
    orbGrad.addColorStop(1, "rgba(44, 123, 229, 0)");

    ctx.fillStyle = orbGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, orbPulse, 0, Math.PI * 2);
    ctx.fill();

    // 3. Draw cards in front of the core (z >= 0)
    cards3D.filter((c) => c.z >= 0).forEach((c) => {
      drawFloatingCard(ctx, c.proj.x, c.proj.y, c.label, c.icon, 0.95 * c.proj.scale);
    });

    // Clean viewport without footer label
  }

  function drawFloatingCard(ctx, x, y, label, icon, scale) {
    const cw = 44 * scale;
    const ch = 24 * scale;

    // Card background
    ctx.beginPath();
    ctx.roundRect(x - cw / 2, y - ch / 2, cw, ch, 4 * scale);
    ctx.fillStyle = `rgba(255, 255, 255, ${scale.toFixed(2)})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(44, 123, 229, ${(0.3 + scale * 0.4).toFixed(2)})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Mini icon & label
    ctx.font = `${Math.max(7, Math.floor(8 * scale))}px monospace`;
    ctx.fillStyle = `rgba(14, 34, 71, ${scale.toFixed(2)})`;
    ctx.fillText(icon, x - cw / 2 + 3 * scale, y + 3 * scale);
    ctx.font = `${Math.max(6, Math.floor(6.5 * scale))}px monospace`;
    ctx.fillText(label.slice(0, 6), x - cw / 2 + 15 * scale, y + 3 * scale);
  }

  // ══════════════════════════════════════════════════════════════════
  // Main Animation Loop
  // ══════════════════════════════════════════════════════════════════
  let animTime = 0;
  function animate() {
    animTime += 0.02;

    if (contexts.ps01) renderPS01(contexts.ps01.ctx, contexts.ps01.w, contexts.ps01.h, animTime, hoverStates.ps01);
    if (contexts.ps02) renderPS02(contexts.ps02.ctx, contexts.ps02.w, contexts.ps02.h, animTime, hoverStates.ps02);
    if (contexts.ps03) renderPS03(contexts.ps03.ctx, contexts.ps03.w, contexts.ps03.h, animTime, hoverStates.ps03);
    if (contexts.ps04) renderPS04(contexts.ps04.ctx, contexts.ps04.w, contexts.ps04.h, animTime, hoverStates.ps04);
    if (contexts.ps05) renderPS05(contexts.ps05.ctx, contexts.ps05.w, contexts.ps05.h, animTime, hoverStates.ps05);

    requestAnimationFrame(animate);
  }

  animate();
});
