/* ═══════════════════════════════════════════════════════════
   KIDDO: a little guide robot for this portfolio.
   Idles, follows the pointer with its eyes, waves hello, and
   runs a 60-second spotlight tour (blur everything, light one
   thing, point at it, explain it). Skippable at any moment.
   No libraries. Nothing is sent anywhere.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var KEY = 'kiddo_seen_v1';
  var remembered = function () { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } };
  var remember = function () { try { localStorage.setItem(KEY, '1'); } catch (e) { /* private window: it just asks again */ } };

  /* ── the tour: what to light up and what to say ── */
  var STEPS = [
    { sel: '#home .hero-text', pose: 'wave', title: "Hi, I'm Kiddo!",
      text: "I'm Bharath's little guide. This is a 60-second tour of his work: eight stops, skip me whenever you like." },
    { sel: '.scout-card', pose: 'cheer', title: "The big one: SCOUT '24, London",
      text: "Selected from Karnataka among the top 1% of undergrad students, 15 days of training in London, then a final round pitching a sustainable business idea. We won first place." },
    { sel: '#about .about-grid', pose: 'point', title: 'Who he is',
      text: 'A BCA graduate from Yadgir who went from building AI models in college to founding a company.' },
    { sel: '#trinetro .trinetro-hero', pose: 'point', title: 'Trinetro Labs',
      text: 'His company. Ask your data a question in plain English and get an exact, explainable answer. Worth a visit at trinetrolabs.com.' },
    { sel: '#projects .cards-grid', pose: 'point', title: 'Things he built',
      text: 'Face-recognising assistants, skin and stroke detection, a steganography tool, a campus platform. Every card links to its code.' },
    { sel: '#skills .skills-grid', pose: 'point', title: 'Skills',
      text: 'Python and SQL on the technical side, computer vision and NLP on the AI side, and founder muscles too.' },
    { sel: '#experience .timeline', pose: 'point', title: 'Where he has worked',
      text: 'Trinetro Labs at the top, then research, app and web internships, and talent acquisition. The line draws itself as you scroll.' },
    { sel: '#connect .connect-grid', pose: 'cheer', title: "Let's talk",
      text: 'Collaborations, partnerships or just hello: this is the place. Thanks for the tour!' }
  ];

  /* ── the character (own design, built as inline SVG so it needs no image) ── */
  var uid = 'kd' + Math.random().toString(36).slice(2, 7);
  var g = function (n) { return n + '-' + uid; };
  var SVG =
    '<svg viewBox="0 0 200 250" role="img" aria-label="Kiddo, the portfolio guide robot" focusable="false">' +
    '<defs>' +
    '<linearGradient id="' + g('shell') + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#e4efe9"/><stop offset="1" stop-color="#9fb8ac"/></linearGradient>' +
    '<linearGradient id="' + g('body') + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#69ff9c"/><stop offset=".6" stop-color="#00d26a"/><stop offset="1" stop-color="#05843a"/></linearGradient>' +
    '<linearGradient id="' + g('visor') + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d2218"/><stop offset="1" stop-color="#020805"/></linearGradient>' +
    '<linearGradient id="' + g('gold') + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe58a"/><stop offset="1" stop-color="#ffb300"/></linearGradient>' +
    '<radialGradient id="' + g('eye') + '" cx="50%" cy="38%" r="65%"><stop offset="0" stop-color="#ffffff"/><stop offset=".4" stop-color="#b9ffd2"/><stop offset="1" stop-color="#19e07a"/></radialGradient>' +
    '<linearGradient id="' + g('flame') + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6c2"/><stop offset=".5" stop-color="#ffc83d"/><stop offset="1" stop-color="#ff6a00" stop-opacity="0"/></linearGradient>' +
    '</defs>' +
    '<ellipse cx="100" cy="238" rx="38" ry="6" fill="#000" opacity=".28"/>' +
    '<g class="kd-float">' +
    /* jet flame */
    '<g class="kd-flame"><path d="M84 198 Q 100 246 116 198 Z" fill="url(#' + g('flame') + ')"/></g>' +
    '<rect x="78" y="186" width="44" height="16" rx="8" fill="#31453b"/>' +
    /* far arm */
    '<g class="kd-arm-rest"><path d="M64 150 C 46 156, 40 172, 46 188" stroke="url(#' + g('shell') + ')" stroke-width="13" stroke-linecap="round" fill="none"/><circle cx="47" cy="190" r="11" fill="url(#' + g('shell') + ')"/></g>' +
    /* body */
    '<rect x="62" y="128" width="76" height="68" rx="28" fill="url(#' + g('body') + ')"/>' +
    '<ellipse cx="82" cy="142" rx="13" ry="6" fill="#fff" opacity=".35" transform="rotate(-24 82 142)"/>' +
    '<path d="M100 157 l4.3 8.8 9.7 1.4 -7 6.8 1.7 9.6 -8.7-4.6 -8.7 4.6 1.7-9.6 -7-6.8 9.7-1.4z" fill="url(#' + g('gold') + ')"/>' +
    /* scarf */
    '<path d="M66 126 Q 100 144 134 126 L 134 140 Q 100 158 66 140 Z" fill="url(#' + g('gold') + ')"/>' +
    '<g class="kd-tail"><path d="M122 140 L 132 176 L 118 170 L 112 146 Z" fill="url(#' + g('gold') + ')"/><path d="M122 140 L 132 176" stroke="#c98a00" stroke-width="1.5" opacity=".5"/></g>' +
    /* head */
    '<rect x="38" y="36" width="124" height="96" rx="40" fill="url(#' + g('shell') + ')"/>' +
    '<circle cx="30" cy="84" r="11" fill="url(#' + g('gold') + ')"/><circle cx="170" cy="84" r="11" fill="url(#' + g('gold') + ')"/>' +
    '<rect x="52" y="52" width="96" height="60" rx="28" fill="url(#' + g('visor') + ')"/>' +
    '<path d="M64 62 C 84 55, 116 55, 136 62" stroke="#fff" stroke-opacity=".22" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<g class="kd-pupils" id="' + g('pupils') + '"><g class="kd-eyes">' +
    '<circle cx="78" cy="80" r="13" fill="url(#' + g('eye') + ')"/><circle cx="122" cy="80" r="13" fill="url(#' + g('eye') + ')"/>' +
    '<circle cx="73" cy="75" r="4" fill="#fff"/><circle cx="117" cy="75" r="4" fill="#fff"/>' +
    '</g></g>' +
    '<path class="kd-mouth" d="M88 100 Q 100 109 112 100" stroke="#39ff8a" stroke-width="3.2" stroke-linecap="round" fill="none"/>' +
    '<ellipse cx="62" cy="96" rx="8" ry="4.5" fill="#ff8fb0" opacity=".35"/><ellipse cx="138" cy="96" rx="8" ry="4.5" fill="#ff8fb0" opacity=".35"/>' +
    '<ellipse cx="68" cy="48" rx="20" ry="7" fill="#fff" opacity=".55" transform="rotate(-22 68 48)"/>' +
    /* antenna with a star */
    '<line x1="100" y1="36" x2="100" y2="16" stroke="#8fa89c" stroke-width="4" stroke-linecap="round"/>' +
    '<g class="kd-star"><path d="M100 0 l4.6 9.4 10.4 1.5 -7.5 7.3 1.8 10.3 -9.3-4.9 -9.3 4.9 1.8-10.3 -7.5-7.3 10.4-1.5z" fill="url(#' + g('gold') + ')"/></g>' +
    /* near arm (the pointing one) */
    '<g class="kd-arm" id="' + g('arm') + '"><path d="M138 150 C 156 148, 170 148, 184 150" stroke="url(#' + g('shell') + ')" stroke-width="13" stroke-linecap="round" fill="none"/>' +
    '<circle cx="189" cy="150" r="12" fill="url(#' + g('shell') + ')"/><path d="M198 145 L 216 150 L 198 155 Z" fill="#f4f8f6" stroke="#9fb8ac" stroke-width="1.5" stroke-linejoin="round"/></g>' +
    '</g></svg>';

  /* ── build the DOM ── */
  var wrap = document.createElement('div');
  wrap.className = 'kd entering pose-idle';
  wrap.innerHTML =
    '<div class="kd-bubble" id="kd-bubble" role="dialog" aria-live="polite" aria-label="Kiddo, portfolio guide"></div>' +
    '<button class="kd-bot" type="button" aria-label="Open Kiddo, the portfolio guide" aria-expanded="false" aria-controls="kd-bubble">' + SVG + '</button>';
  var veil = document.createElement('div'); veil.className = 'kd-veil'; veil.setAttribute('aria-hidden', 'true');
  var ring = document.createElement('div'); ring.className = 'kd-ring'; ring.setAttribute('aria-hidden', 'true');
  document.body.appendChild(veil); document.body.appendChild(ring); document.body.appendChild(wrap);

  var bubble = $('#kd-bubble', wrap), bot = $('.kd-bot', wrap);
  var pupils = document.getElementById(g('pupils')), arm = document.getElementById(g('arm'));
  var mode = 'idle';              // 'idle' | 'menu' | 'tour'
  var stepI = -1, typer = null, raf = null, toastT = null, poseT = null;
  var intro = false, introY = 0, introT = null;   // the one-time offer: it must never nag

  /* ── helpers ── */
  function setPose(p, ms) {
    wrap.className = wrap.className.replace(/pose-\w+/, 'pose-' + p);
    clearTimeout(poseT);
    if (ms) poseT = setTimeout(function () { setPose('idle'); }, ms);
  }
  function say(html, cls) { bubble.className = 'kd-bubble on ' + (cls || ''); bubble.innerHTML = html; bot.setAttribute('aria-expanded', 'true'); }
  function hush() { bubble.classList.remove('on'); bot.setAttribute('aria-expanded', 'false'); }
  function xFor(side) { return side === 'left' ? 16 : Math.max(16, window.innerWidth - wrap.offsetWidth - 16); }
  function side(s) {
    wrap.style.setProperty('--kx', xFor(s) + 'px');
    wrap.classList.toggle('face-left', s === 'right');   // on the right, face the content (to the left)
    wrap.dataset.side = s;
  }
  function typeInto(el, text) {
    clearInterval(typer);
    if (reduce) { el.textContent = text; return; }
    var i = 0; el.textContent = '';
    typer = setInterval(function () { i += 2; el.textContent = text.slice(0, i); if (i >= text.length) clearInterval(typer); }, 16);
  }

  /* eyes follow the pointer */
  window.addEventListener('pointermove', function (e) {
    if (!pupils) return;
    var r = bot.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height * 0.33;
    var dx = e.clientX - cx, dy = e.clientY - cy, d = Math.sqrt(dx * dx + dy * dy) || 1, k = Math.min(1, d / 260) * 6;
    pupils.style.transform = 'translate(' + (dx / d * k).toFixed(1) + 'px,' + (dy / d * k).toFixed(1) + 'px)';
  }, { passive: true });

  /* ── the spotlight ── */
  function holePath(r, pad, rad) {
    var x = Math.max(4, r.left - pad), y = Math.max(4, r.top - pad);
    var w = Math.min(window.innerWidth - 8, r.right + pad) - x, h = Math.min(window.innerHeight - 8, r.bottom + pad) - y;
    rad = Math.min(rad, w / 2, h / 2);
    return { x: x, y: y, w: w, h: h, d:
      'M0 0H' + window.innerWidth + 'V' + window.innerHeight + 'H0Z' +
      'M' + (x + rad) + ' ' + y + 'H' + (x + w - rad) + 'A' + rad + ' ' + rad + ' 0 0 1 ' + (x + w) + ' ' + (y + rad) +
      'V' + (y + h - rad) + 'A' + rad + ' ' + rad + ' 0 0 1 ' + (x + w - rad) + ' ' + (y + h) +
      'H' + (x + rad) + 'A' + rad + ' ' + rad + ' 0 0 1 ' + x + ' ' + (y + h - rad) +
      'V' + (y + rad) + 'A' + rad + ' ' + rad + ' 0 0 1 ' + (x + rad) + ' ' + y + 'Z' };
  }
  function frame() {
    if (mode !== 'tour') return;
    var st = STEPS[stepI], el = st && $(st.sel);
    if (el) {
      var r = el.getBoundingClientRect(), h = holePath(r, 14, 20);
      var clip = 'path(evenodd, "' + h.d + '")';
      veil.style.clipPath = clip; veil.style.webkitClipPath = clip;
      ring.style.cssText = 'left:' + h.x + 'px;top:' + h.y + 'px;width:' + h.w + 'px;height:' + h.h + 'px;';
      /* aim the pointing arm at the middle of the lit area */
      var b = bot.getBoundingClientRect(), sx = b.left + b.width * (wrap.classList.contains('face-left') ? 0.31 : 0.69), sy = b.top + b.height * 0.6;
      var tx = h.x + h.w / 2, ty = h.y + h.h / 2, face = wrap.classList.contains('face-left') ? -1 : 1;
      var ang = Math.atan2(ty - sy, (tx - sx) * face) * 180 / Math.PI;
      ang = Math.max(-80, Math.min(80, ang));
      if (arm && wrap.className.indexOf('pose-point') > -1) arm.style.transform = 'rotate(' + ang.toFixed(1) + 'deg)';
    }
    raf = requestAnimationFrame(frame);
  }
  function dots() {
    var s = ''; for (var i = 0; i < STEPS.length; i++) s += '<i class="' + (i === stepI ? 'on' : '') + '"></i>';
    return '<span class="kd-dots" aria-hidden="true">' + s + '</span>';
  }

  /* ── tour control ── */
  function go(i) {
    intro = false; clearTimeout(introT);
    if (i < 0) i = 0;
    if (i >= STEPS.length) { return finish(); }
    stepI = i; mode = 'tour';
    var st = STEPS[i], el = $(st.sel);
    if (!el) return go(i + 1);
    veil.classList.add('on'); ring.classList.add('on');
    var r0 = el.getBoundingClientRect(), tall = r0.height > window.innerHeight * 0.7;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: tall ? 'start' : 'center' });
    /* sit on the side of the screen the target is not on */
    var mid = r0.left + r0.width / 2;
    side(mid > window.innerWidth * 0.55 ? 'left' : 'right');
    if (window.innerWidth <= 640) side('right');
    setPose(st.pose === 'wave' ? 'wave' : st.pose === 'cheer' ? 'cheer' : 'point');
    if (st.pose !== 'point' && arm) arm.style.transform = '';
    say(
      '<span class="kd-step">' + (i + 1) + ' / ' + STEPS.length + '</span><h4></h4><p></p>' +
      '<div class="kd-actions">' +
      (i > 0 ? '<button class="kd-btn" data-a="back" type="button">Back</button>' : '') +
      '<button class="kd-btn kd-btn--go" data-a="next" type="button">' + (i === STEPS.length - 1 ? 'Finish' : 'Next') + '</button>' +
      '<button class="kd-btn kd-btn--ghost" data-a="skip" type="button">Skip tour</button>' + dots() + '</div>');
    $('h4', bubble).textContent = st.title;
    typeInto($('p', bubble), st.text);
    var nb = $('[data-a="next"]', bubble); if (nb) nb.focus({ preventScroll: true });
    cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
  }
  function stop() {
    mode = 'idle'; cancelAnimationFrame(raf); clearInterval(typer);
    veil.classList.remove('on'); ring.classList.remove('on');
    if (arm) arm.style.transform = '';
    side('right'); setPose('idle'); hush();
  }
  function finish() {
    stop(); remember();
    setPose('cheer', 3600);
    if (window.portfolioConfetti) window.portfolioConfetti({ x: 0.8, y: 0.7, count: 90 });
    say('<h4>That was it. Thanks for stopping by!</h4><p>Want to say hello to Bharath?</p><div class="kd-actions"><button class="kd-btn kd-btn--go" data-a="hello" type="button">Say hello</button><button class="kd-btn kd-btn--ghost" data-a="close" type="button">Close</button></div>');
  }
  function openMenu() {
    intro = false; clearTimeout(introT);
    mode = 'menu'; setPose('wave', 2400);
    say('<h4>Hi, I\'m Kiddo!</h4><p>Want a guided tour, or to jump somewhere?</p><div class="kd-menu">' +
      '<button class="kd-btn kd-btn--go" data-a="tour" type="button"><i class="fas fa-play" aria-hidden="true"></i> Take the 60-second tour</button>' +
      '<button class="kd-btn" data-a="scout" type="button"><i class="fas fa-trophy" aria-hidden="true"></i> Show me the SCOUT \'24 win</button>' +
      '<button class="kd-btn" data-a="hello" type="button"><i class="fas fa-paper-plane" aria-hidden="true"></i> Say hello to Bharath</button>' +
      '<button class="kd-btn kd-btn--ghost" data-a="close" type="button">Not now</button></div>');
  }
  function toast(text, ms) {
    if (mode === 'tour') return;
    clearTimeout(toastT);
    say('<p></p>', 'kd-toast'); $('p', bubble).textContent = text;
    toastT = setTimeout(function () { if (mode !== 'tour' && mode !== 'menu') hush(); }, ms || 3800);
  }

  bubble.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-a]'); if (!a) return;
    var act = a.getAttribute('data-a');
    if (act === 'next') go(stepI + 1);
    else if (act === 'back') go(stepI - 1);
    else if (act === 'skip') { stop(); remember(); toast('No problem. Tap me any time.', 2600); }
    else if (act === 'tour') { remember(); go(0); }
    else if (act === 'close') { stop(); remember(); }
    else if (act === 'scout') { stop(); remember(); var s = $('#scout'); if (s) s.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
    else if (act === 'hello') { stop(); remember(); var c = $('#connect'); if (c) c.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
  });
  bot.addEventListener('click', function () {
    if (mode === 'tour') return;
    if (bubble.classList.contains('on') && mode === 'menu') { stop(); return; }
    openMenu();
  });
  document.addEventListener('keydown', function (e) {
    if (mode !== 'tour') { if (e.key === 'Escape' && mode === 'menu') stop(); return; }
    if (e.key === 'Escape') { stop(); remember(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(stepI + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(stepI - 1); }
  });
  window.addEventListener('resize', function () { side(wrap.dataset.side || 'right'); });
  window.addEventListener('scroll', function () {
    if (intro && mode === 'menu' && Math.abs(window.scrollY - introY) > 320) { intro = false; clearTimeout(introT); stop(); remember(); }
  }, { passive: true });
  document.addEventListener('scout:seen', function () {
    if (mode === 'idle') { setPose('cheer', 3200); toast("That's the win! 🏆", 3600); }
  });

  /* ── arrive: slide in, wave, and (first visit only) offer the tour ── */
  side('right');
  setTimeout(function () { wrap.classList.remove('entering'); setPose('wave', 2600); }, reduce ? 0 : 1100);
  if (!remembered()) {
    setTimeout(function () {
      if (mode !== 'idle') return;
      mode = 'menu'; intro = true; introY = window.scrollY;
      /* an offer, not a trap: it goes away by itself after a while or as soon as you scroll on */
      introT = setTimeout(function () { if (intro) { intro = false; stop(); remember(); } }, 14000);
      say('<h4>Hi, I\'m Kiddo! 👋</h4><p>Want a 60-second tour of Bharath\'s work?</p><div class="kd-actions"><button class="kd-btn kd-btn--go" data-a="tour" type="button">Show me</button><button class="kd-btn kd-btn--ghost" data-a="close" type="button">Maybe later</button></div>');
    }, reduce ? 800 : 4800);
  }
})();
