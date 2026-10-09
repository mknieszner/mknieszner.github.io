'use strict';

// Apply a saved appearance before the first paint; storage is optional.
try {
  const theme = localStorage.getItem('signal-theme');
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
} catch (_) {}

function initializeSignal() {
  const root = document.documentElement;
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const motionButton = document.getElementById('motion-toggle');
  const motionLabel = document.getElementById('motion-label');
  const themeButton = document.getElementById('theme-toggle');
  const themeLabel = document.getElementById('theme-label');
  const canvas = document.getElementById('signal-canvas');
  const hero = document.querySelector('.hero');
  const context = canvas.getContext('2d', { alpha: true });
  const TAU = Math.PI * 2;
  let preferredMotion = true;
  let visible = true;
  let frame = 0;
  let lastTime = 0;
  let time = 0;
  let width = 0;
  let height = 0;
  let palette = {};
  let pointer = { x: 0, y: 0 };
  let camera = { x: 0, y: 0 };

  const readStorage = key => { try { return localStorage.getItem(key); } catch (_) { return null; } };
  const saveStorage = (key, value) => { try { localStorage.setItem(key, value); } catch (_) {} };
  preferredMotion = readStorage('signal-motion') !== 'off';

  function isDark() { return root.dataset.theme ? root.dataset.theme === 'dark' : darkQuery.matches; }
  function canAnimate() { return preferredMotion && !motionQuery.matches && visible && !document.hidden; }

  function readPalette() {
    const style = getComputedStyle(root);
    palette = { ink: style.getPropertyValue('--ink').trim(), accent: style.getPropertyValue('--accent').trim(), muted: style.getPropertyValue('--muted').trim() };
  }

  function applyTheme() {
    const dark = isDark();
    themeLabel.textContent = dark ? 'Light' : 'Dark';
    themeButton.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    document.getElementById('theme-color').setAttribute('content', dark ? '#101610' : '#f0f2ec');
    readPalette();
    draw();
  }

  function applyMotion() {
    const enabled = preferredMotion && !motionQuery.matches;
    root.dataset.motion = enabled ? 'on' : 'off';
    motionButton.disabled = motionQuery.matches;
    motionButton.setAttribute('aria-pressed', String(!enabled));
    motionButton.setAttribute('aria-label', motionQuery.matches ? 'Animations disabled by your reduced motion preference' : enabled ? 'Pause animations' : 'Resume animations');
    motionLabel.textContent = motionQuery.matches ? 'Reduced motion' : enabled ? 'Pause motion' : 'Play motion';
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    draw();
    if (context && canAnimate()) frame = requestAnimationFrame(tick);
  }

  // A small precomputed torus mesh; no WebGL or rendering library is needed.
  const vertices = [];
  const rows = 70;
  const columns = 24;
  for (let row = 0; row < rows; row++) {
    const a = row / rows * TAU;
    for (let column = 0; column < columns; column++) {
      const b = column / columns * TAU;
      const tube = .325 + Math.sin(a * 3) * .016;
      vertices.push({ x: (1 + tube * Math.cos(b)) * Math.cos(a), y: (1 + tube * Math.cos(b)) * Math.sin(a), z: tube * Math.sin(b), row, column });
    }
  }

  function draw() {
    if (!context || width < 2 || height < 2 || !palette.ink) return;
    context.clearRect(0, 0, width, height);
    const centerX = width * .52;
    const centerY = height * .465;
    const radius = Math.min(width * .31, height * .365);
    const yaw = .32 + time * .09 + camera.x * .16;
    const pitch = -.76 + camera.y * .13;
    const roll = -.37;
    const cosYaw = Math.cos(yaw), sinYaw = Math.sin(yaw);
    const cosPitch = Math.cos(pitch), sinPitch = Math.sin(pitch);
    const cosRoll = Math.cos(roll), sinRoll = Math.sin(roll);
    const projected = vertices.map(vertex => {
      const x = vertex.x * cosYaw - vertex.z * sinYaw;
      const z = vertex.x * sinYaw + vertex.z * cosYaw;
      const y = vertex.y * cosPitch - z * sinPitch;
      const depth = vertex.y * sinPitch + z * cosPitch;
      const perspective = 1 + depth * .07;
      return { x: centerX + (x * cosRoll - y * sinRoll) * radius * perspective, y: centerY + (x * sinRoll + y * cosRoll) * radius * perspective, depth, row: vertex.row, column: vertex.column };
    });
    projected.sort((a, b) => a.depth - b.depth);
    const pulse = time * 2;
    for (const point of projected) {
      const prominence = Math.max(0, Math.min(1, (point.depth + 1.4) / 2.8));
      const active = (point.row - pulse + rows * 1000) % rows < 3;
      const accent = point.column % 6 === 0 || active;
      context.fillStyle = accent ? palette.accent : palette.ink;
      context.globalAlpha = .17 + prominence * .7;
      const dotRadius = (accent ? 1.22 : .7) * (.75 + prominence * .5);
      context.beginPath();
      context.arc(point.x, point.y, dotRadius, 0, TAU);
      context.fill();
    }
    // Registration marks give the sculpture the character of an engineering drawing.
    context.strokeStyle = palette.muted;
    context.lineWidth = .65;
    context.globalAlpha = .32;
    const left = centerX - radius * 1.56, right = centerX + radius * 1.56;
    context.beginPath();
    context.moveTo(left, centerY); context.lineTo(left + 25, centerY);
    context.moveTo(right - 25, centerY); context.lineTo(right, centerY);
    context.moveTo(centerX, centerY - radius * 1.38); context.lineTo(centerX, centerY - radius * 1.22);
    context.stroke();
    context.globalAlpha = 1;
    if (root.dataset.renderer !== 'canvas') root.dataset.renderer = 'canvas';
  }

  function tick(now) {
    frame = 0;
    if (!canAnimate()) { lastTime = 0; return; }
    if (!lastTime) lastTime = now;
    const delta = now - lastTime;
    // A 30 fps cap and clamped elapsed time keep the animation quiet and inexpensive.
    if (delta >= 1000 / 30) {
      time += Math.min(delta, 70) / 1000;
      camera.x += (pointer.x - camera.x) * .075;
      camera.y += (pointer.y - camera.y) * .075;
      draw();
      lastTime = now - delta % (1000 / 30);
    }
    frame = requestAnimationFrame(tick);
  }

  function resize() {
    if (!context) return;
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    const resolution = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * resolution);
    canvas.height = Math.round(height * resolution);
    context.setTransform(resolution, 0, 0, resolution, 0, 0);
    draw();
  }

  themeButton.addEventListener('click', () => {
    const theme = isDark() ? 'light' : 'dark';
    root.dataset.theme = theme;
    saveStorage('signal-theme', theme);
    applyTheme();
  });
  motionButton.addEventListener('click', () => {
    if (motionQuery.matches) return;
    preferredMotion = !preferredMotion;
    saveStorage('signal-motion', preferredMotion ? 'on' : 'off');
    applyMotion();
  });
  motionQuery.addEventListener('change', applyMotion);
  darkQuery.addEventListener('change', applyTheme);
  document.addEventListener('visibilitychange', () => {
    root.dataset.suspended = String(document.hidden);
    applyMotion();
  });
  hero.addEventListener('pointermove', event => {
    if (!finePointer.matches || !canAnimate()) return;
    const bounds = hero.getBoundingClientRect();
    pointer = { x: (event.clientX - bounds.left) / bounds.width * 2 - 1, y: (event.clientY - bounds.top) / bounds.height * 2 - 1 };
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { pointer = { x: 0, y: 0 }; });
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
  else window.addEventListener('resize', resize, { passive: true });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; applyMotion(); }, { threshold: 0 }).observe(hero);
  }
  applyTheme();
  resize();
  applyMotion();
  document.querySelector('.preferences').hidden = false;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSignal, { once: true });
} else {
  initializeSignal();
}
