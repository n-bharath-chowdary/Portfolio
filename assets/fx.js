/* ═══════════════════════════════════════════════════════════
   FX: the motion on this page. No libraries, no build step.
   Every effect checks "reduce motion" and degrades to plain.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var cssVar = function (n, fallback) { return getComputedStyle(document.body).getPropertyValue(n).trim() || fallback; };

  root.classList.add('js');
  root.classList.remove('no-js');

  /* ── scroll progress ── */
  var bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  /* ── timeline progress (CSS var --p, 0..1) ── */
  var timeline = $('.timeline');
  function onScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, window.scrollY / h) : 0) + ')';
    if (timeline) {
      var r = timeline.getBoundingClientRect();
      var p = (window.innerHeight * 0.62 - r.top) / r.height;
      timeline.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ── reveal on scroll, staggered among siblings ── */
  var revealSel = '.section-header, .card, .timeline-item, .trinetro-card, .skill-group, .about-grid, .trinetro-hero, .scout-card, .connect-grid, .hero-text > *';
  var revealEls = $$(revealSel);
  revealEls.forEach(function (el) {
    el.classList.add('reveal');
    var sibs = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
    el.style.setProperty('--d', Math.min(sibs, 8) * 70 + 'ms');
  });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ── typed role line in the hero ── */
  var typed = $('.typed-text');
  if (typed && !reduce) {
    var phrases = (typed.getAttribute('data-phrases') || '').split('|').filter(Boolean);
    var pi = 0, ci = 0, del = false;
    (function tick() {
      var full = phrases[pi];
      ci += del ? -1 : 1;
      typed.textContent = full.slice(0, ci);
      var wait = del ? 28 : 62;
      if (!del && ci === full.length) { del = true; wait = 1700; }
      else if (del && ci === 0) { del = false; pi = (pi + 1) % phrases.length; wait = 380; }
      setTimeout(tick, wait);
    })();
  }

  /* ── counters ── */
  if (!reduce && 'IntersectionObserver' in window) $$('[data-count]').forEach(function (el) { el.textContent = '0'; });
  function countUp(el) {
    var to = parseFloat(el.getAttribute('data-count'));
    if (isNaN(to)) return;
    if (reduce) { el.textContent = to; return; }
    var t0 = null, dur = 1400;
    (function step(t) {
      if (t0 === null) t0 = t;
      var k = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    })(performance.now());
  }
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { $$('[data-count]', e.target).forEach(countUp); cio.unobserve(e.target); }
      });
    }, { threshold: 0.35 });
    $$('.scout-stats').forEach(function (el) { cio.observe(el); });
  } else {
    $$('[data-count]').forEach(function (el) { el.textContent = el.getAttribute('data-count'); });
  }

  /* ── plane along the route (SVG animateMotion, started when the card is seen) ── */
  var scoutCard = $('.scout-card');
  var plane = $('#plane-motion');
  if (scoutCard && plane && 'IntersectionObserver' in window && !reduce) {
    var pio = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        try { plane.beginElement(); } catch (e) { /* SMIL not available: the dashed route still tells the story */ }
        pio.disconnect();
      }
    }, { threshold: 0.3 });
    pio.observe(scoutCard);
  }

  /* ── tilt + glare on cards (mouse only) ── */
  if (fine && !reduce) {
    $$('.card, .trinetro-card, .skill-group').forEach(function (el) { el.classList.add('tilt'); });
    $$('.tilt').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.classList.add('tilting');
        el.style.setProperty('--ry', ((x - 0.5) * 9).toFixed(2) + 'deg');
        el.style.setProperty('--rx', ((0.5 - y) * 7).toFixed(2) + 'deg');
        el.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      });
      el.addEventListener('pointerleave', function () {
        el.classList.remove('tilting');
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
    });

    /* magnetic buttons */
    $$('.btn-primary, .btn-secondary, .about-cta, .trinetro-visit-btn, .badge-scout').forEach(function (el) {
      el.classList.add('magnetic');
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--tx', ((e.clientX - r.left - r.width / 2) * 0.14).toFixed(1) + 'px');
        el.style.setProperty('--ty', ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px');
      });
      el.addEventListener('pointerleave', function () {
        el.style.setProperty('--tx', '0px');
        el.style.setProperty('--ty', '0px');
      });
    });

    /* cursor glow */
    var glow = document.createElement('div');
    glow.className = 'cursor-glow';
    glow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(glow);
    var gx = window.innerWidth / 2, gy = window.innerHeight / 2, tx = gx, ty = gy;
    window.addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; glow.classList.add('on'); }, { passive: true });
    document.addEventListener('pointerleave', function () { glow.classList.remove('on'); });
    (function follow() {
      gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
      glow.style.transform = 'translate3d(' + gx.toFixed(1) + 'px,' + gy.toFixed(1) + 'px,0)';
      requestAnimationFrame(follow);
    })();
  }

  /* ── living background: a constellation that leans toward the pointer ── */
  var canvas = document.createElement('canvas');
  canvas.id = 'bg-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(canvas, document.body.firstChild);
  var ctx = canvas.getContext && canvas.getContext('2d');
  if (ctx && !reduce) {
    var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), pts = [], mouse = { x: -999, y: -999 }, running = true;
    var color = { r: 0, g: 230, b: 118 };
    var parse = function () {
      var light = document.body.getAttribute('data-theme') === 'light';
      color = light ? { r: 109, g: 40, b: 217 } : { r: 0, g: 230, b: 118 };
    };
    var size = function () {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.max(24, Math.min(80, Math.round(W * H / 22000)));
      pts = [];
      for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35, r: Math.random() * 1.4 + 0.6 });
    };
    window.addEventListener('resize', size);
    window.addEventListener('pointermove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    document.addEventListener('visibilitychange', function () { running = !document.hidden; if (running) draw(); });
    new MutationObserver(parse).observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
    parse(); size();
    var LINK = 128;
    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      var c = color.r + ',' + color.g + ',' + color.b;
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        var dx = mouse.x - p.x, dy = mouse.y - p.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 170 && d > 0) { p.x += dx / d * 0.35; p.y += dy / d * 0.35; }
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = W + 10; else if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10; else if (p.y > H + 10) p.y = -10;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx.fillStyle = 'rgba(' + c + ',.55)'; ctx.fill();
        for (var j = i + 1; j < pts.length; j++) {
          var q = pts[j], ex = p.x - q.x, ey = p.y - q.y, dd = ex * ex + ey * ey;
          if (dd < LINK * LINK) {
            ctx.strokeStyle = 'rgba(' + c + ',' + (0.2 * (1 - Math.sqrt(dd) / LINK)).toFixed(3) + ')';
            ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    draw();
  } else if (canvas.parentNode) {
    canvas.parentNode.removeChild(canvas);
  }

  /* ── confetti, shared with the robot ── */
  window.portfolioConfetti = function (opts) {
    if (reduce) return;
    opts = opts || {};
    var cv = document.getElementById('confetti');
    if (!cv) { cv = document.createElement('canvas'); cv.id = 'confetti'; cv.setAttribute('aria-hidden', 'true'); document.body.appendChild(cv); }
    var x = cv.getContext('2d'), w = cv.width = window.innerWidth, h = cv.height = window.innerHeight;
    var colors = ['#ffc83d', '#ffe58a', '#00e676', '#69ff9c', '#ffffff', '#00c853'];
    var ox = (opts.x != null ? opts.x : 0.5) * w, oy = (opts.y != null ? opts.y : 0.35) * h, n = opts.count || 130, ps = [];
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2, s = 4 + Math.random() * 9;
      ps.push({ x: ox, y: oy, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 6, g: 0.28, w: 5 + Math.random() * 6, h: 3 + Math.random() * 5, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: colors[i % colors.length], life: 0 });
    }
    var start = performance.now();
    (function frame(t) {
      x.clearRect(0, 0, w, h);
      var alive = false;
      ps.forEach(function (p) {
        p.vy += p.g; p.vx *= 0.992; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life++;
        if (p.y < h + 20 && t - start < 4200) alive = true;
        x.save(); x.translate(p.x, p.y); x.rotate(p.rot);
        x.globalAlpha = Math.max(0, 1 - (t - start) / 4200);
        x.fillStyle = p.c; x.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); x.restore();
      });
      if (alive) requestAnimationFrame(frame); else x.clearRect(0, 0, w, h);
    })(start);
  };

  /* fire it once when the SCOUT card first comes into view */
  if (scoutCard && 'IntersectionObserver' in window) {
    var cfo = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        setTimeout(function () { window.portfolioConfetti({ x: 0.5, y: 0.3 }); document.dispatchEvent(new CustomEvent('scout:seen')); }, 700);
        cfo.disconnect();
      }
    }, { threshold: 0.45 });
    cfo.observe(scoutCard);
  }
})();
