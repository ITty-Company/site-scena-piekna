/* Scena Piękna — ontwerpvoorstel ITty Company */
(function () {
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lenis = null;
  if (window.Lenis && !reduced) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href'); if (id.length < 2) return;
        var el = document.querySelector(id); if (!el) return;
        e.preventDefault(); closeMenu(); lenis.scrollTo(el, { offset: id === '#top' ? 0 : -10 });
      });
    });
  }

  /* page transition: curtain */
  var cur = document.getElementById('curtain');
  if (cur) {
    requestAnimationFrame(function () { cur.classList.add('out'); });
    document.querySelectorAll('a[href$=".html"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || a.target) return;
        e.preventDefault(); var href = a.getAttribute('href');
        cur.classList.remove('out'); cur.classList.add('in');
        setTimeout(function () { location.href = href; }, reduced ? 0 : 650);
      });
    });
    addEventListener('pageshow', function (e) { if (e.persisted) { cur.classList.remove('in'); cur.classList.add('out'); } });
  }

  /* nav + mobile menu */
  var nav = document.getElementById('nav'), burger = nav.querySelector('.nav__burger'), mm = document.getElementById('mmenu');
  function closeMenu() { mm.hidden = true; burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }
  burger.addEventListener('click', function () {
    var open = mm.hidden; mm.hidden = !open; burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  mm.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* hero tab bar cycles through the four acts */
  var bar = document.getElementById('tabbar'), ti = 0;
  if (bar && !reduced) setInterval(function () { ti = (ti + 1) % 4; bar.style.transform = 'translateX(' + ti * 100 + '%)'; }, 2600);

  /* reveals (geometry based) */
  var rev = [].slice.call(document.querySelectorAll('.reveal'));
  function reveals() {
    var h = innerHeight;
    rev = rev.filter(function (el) { var r = el.getBoundingClientRect(); if (r.top < h * 0.9) { el.classList.add('in'); return false; } return true; });
  }

  /* story: camera flies into the mirror, treatments appear in the glass */
  var story = document.querySelector('.story');
  var storyFrame = function () {};
  if (story) (function () {
  var stage = story.querySelector('.story__stage'), scene = document.getElementById('scene'),
      disc = document.getElementById('disc'), discImgs = disc.querySelectorAll('img'), acts = document.querySelectorAll('.act'),
      dots = document.querySelectorAll('.dots i');
  var IW = 1344, IH = 752, GX = 1093, GY = 312, GR = 172;
  disc.style.left = (GX - GR) / IW * 100 + '%'; disc.style.top = (GY - GR) / IH * 100 + '%';
  disc.style.width = 2 * GR / IW * 100 + '%'; disc.style.height = 2 * GR / IH * 100 + '%';
  var halo = document.getElementById('halo'), HR = GR * 1.38;
  halo.style.left = (GX - HR) / IW * 100 + '%'; halo.style.top = (GY - HR) / IH * 100 + '%'; halo.style.width = 2 * HR / IW * 100 + '%'; halo.style.height = 2 * HR / IH * 100 + '%';
  var g = {};
  function measure() {
    var w = stage.clientWidth, h = stage.clientHeight, s0 = Math.max(w / IW, h / IH);
    var sw = IW * s0, sh = IH * s0, mob = w < 900;
    /* keep the mirror in frame on narrow screens (object-position 78%) */
    var ox = mob ? -(sw - w) * 0.78 : -(sw - w) * 0.7, oy = -(sh - h) * 0.3;
    scene.style.width = sw + 'px'; scene.style.height = sh + 'px';
    var D = mob ? Math.min(w * 0.86, h * 0.48) : Math.min(h * 0.8, w * 0.46);
    g = { s0: s0, ox: ox, oy: oy, k1: D / (2 * GR * s0), X: mob ? w * 0.5 : w * 0.68, Y: mob ? h * 0.3 : h * 0.5 };
  }
  function cl(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(t) { t = cl(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  var last = -1;
  function frameFn() {
    var r = story.getBoundingClientRect(), span = story.offsetHeight - innerHeight;
    var P = cl(-r.top / span), z = ease((P - 0.04) / 0.2);
    var k = Math.exp(Math.log(g.k1) * z);
    var cx = GX * g.s0, cy = GY * g.s0;
    var tx = (1 - z) * g.ox + z * (g.X - cx * g.k1), ty = (1 - z) * g.oy + z * (g.Y - cy * g.k1);
    /* interpolate so the mirror centre follows a straight path */
    var cxNow = (1 - z) * (g.ox + cx) + z * g.X, cyNow = (1 - z) * (g.oy + cy) + z * g.Y;
    tx = cxNow - cx * k; ty = cyNow - cy * k;
    scene.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) scale(' + k.toFixed(4) + ')';
    stage.style.setProperty('--sh', z.toFixed(3)); stage.style.setProperty('--dz', cl((z - .25) / .5).toFixed(3)); stage.style.setProperty('--pa', cl((P - 0.2) / 0.06).toFixed(3));
    stage.style.setProperty('--ho', (1 - cl(P / 0.06)).toFixed(3)); stage.style.setProperty('--fo', cl((P - 0.9) / 0.1).toFixed(3));
    var i = Math.min(3, Math.max(0, Math.floor((P - 0.26) / 0.16)));
    if (i !== last) {
      last = i;
      acts.forEach(function (a, n) { a.classList.toggle('on', n === i); });
      dots.forEach(function (d, n) { d.classList.toggle('on', n === i); });
      discImgs.forEach(function (im, n) { im.classList.toggle('on', n === i); });
    }
  }
  measure(); addEventListener('resize', function () { measure(); tick(); });
  storyFrame = frameFn;
  discImgs.forEach(function (im) { im.loading = 'eager'; });
  })();

  /* split headings into words */
  document.querySelectorAll('.split').forEach(function (h) {
    var i = 0;
    (function walk(node) {
      [].slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (t) {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(t)); return; }
            var w = document.createElement('span'); w.className = 'w';
            var inner = document.createElement('span'); inner.textContent = t; inner.style.setProperty('--i', i++);
            w.appendChild(inner); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    })(h);
    rev.push(h);
  });

  /* scroll parallax on photo backgrounds */
  var pars = [].slice.call(document.querySelectorAll('[data-par]'));
  function parallax() {
    pars.forEach(function (el) {
      var r = el.parentNode.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      var d = (r.top + r.height / 2 - innerHeight / 2) * -parseFloat(el.dataset.par);
      el.style.transform = 'translate3d(0,' + d.toFixed(1) + 'px,0) scale(1.18)';
    });
  }

  /* hero: pointer parallax */
  var heroImg = document.querySelector('.hero__img'), mx = 0, my = 0, cx2 = 0, cy2 = 0;
  addEventListener('pointermove', function (e) { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });
  (function loop() {
    cx2 += (mx - cx2) * .06; cy2 += (my - cy2) * .06;
    if (heroImg && !reduced && scrollY < innerHeight) heroImg.style.translate = (cx2 * -24).toFixed(1) + 'px ' + (cy2 * -16).toFixed(1) + 'px';
    requestAnimationFrame(loop);
  })();

  /* steps: cursor glow */
  document.querySelectorAll('.steps__list li').forEach(function (li) {
    li.addEventListener('pointermove', function (e) { var r = li.getBoundingClientRect(); li.style.setProperty('--mx', e.clientX - r.left + 'px'); li.style.setProperty('--my', e.clientY - r.top + 'px'); });
  });

  /* particles: glowing dust and falling petals, only while visible */
  function FX(cv) {
    var ctx = cv.getContext('2d'), kind = cv.dataset.fx, P = [], W = 0, H = 0, vis = false, dpr = Math.min(devicePixelRatio || 1, 2);
    function size() { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function spawn(init) {
      return kind === 'petals'
        ? { x: Math.random() * W, y: init ? Math.random() * H : -20, s: 6 + Math.random() * 9, vy: .4 + Math.random() * .7, vx: -.3 + Math.random() * .6, a: Math.random() * 6.28, va: -.02 + Math.random() * .04, ph: Math.random() * 6.28 }
        : { x: Math.random() * W, y: init ? Math.random() * H : H + 10, r: .6 + Math.random() * 2.2, vy: -(.15 + Math.random() * .45), vx: -.15 + Math.random() * .3, ph: Math.random() * 6.28, hue: Math.random() < .35 ? 'rgba(255,62,146,' : 'rgba(255,214,170,' };
    }
    size(); var n = kind === 'petals' ? Math.round(W / 40) : Math.round(W * H / 14000);
    for (var i = 0; i < n; i++) P.push(spawn(true));
    addEventListener('resize', size);
    new IntersectionObserver(function (en) { vis = en[0].isIntersecting; }).observe(cv);
    var t = 0;
    (function frame() {
      requestAnimationFrame(frame); if (!vis || reduced) return; t += .016;
      ctx.clearRect(0, 0, W, H);
      P.forEach(function (p, i) {
        if (kind === 'petals') {
          p.y += p.vy; p.x += p.vx + Math.sin(t + p.ph) * .5; p.a += p.va;
          if (p.y > H + 20) P[i] = spawn(false);
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.scale(1, .6 + .4 * Math.sin(t * 2 + p.ph));
          var g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.s); g.addColorStop(0, 'rgba(255,120,170,.95)'); g.addColorStop(1, 'rgba(160,10,60,.85)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, p.s, p.s * .62, 0, 0, 6.28); ctx.fill(); ctx.restore();
        } else {
          p.y += p.vy; p.x += p.vx + Math.sin(t * .8 + p.ph) * .15;
          if (p.y < -10) P[i] = spawn(false);
          var al = .35 + .35 * Math.sin(t * 2 + p.ph);
          ctx.fillStyle = p.hue + al.toFixed(2) + ')'; ctx.shadowColor = p.hue + '.9)'; ctx.shadowBlur = 8;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fill();
        }
      });
    })();
  }
  document.querySelectorAll('canvas.fx').forEach(FX);

  function tick() {
    nav.classList.toggle('solid', scrollY > 40);
    reveals(); storyFrame(); parallax();
  }
  if (lenis) lenis.on('scroll', tick); addEventListener('scroll', tick, { passive: true }); tick();
  setTimeout(tick, 300);
})();
