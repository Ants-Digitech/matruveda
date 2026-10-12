(function(){
"use strict";
var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var hasGsap = typeof gsap !== "undefined";
var hasST = hasGsap && typeof ScrollTrigger !== "undefined";
if (hasST) gsap.registerPlugin(ScrollTrigger);
var isTouch = window.matchMedia && window.matchMedia("(hover:none)").matches;
function showAll(){ document.querySelectorAll("[data-reveal]").forEach(function(el){ el.style.opacity = 1; el.style.transform = "none"; el.style.visibility = "visible"; }); }
window.addEventListener("error", showAll);
try{
document.documentElement.classList.add("js");
/* every page starts at the top unless a hash asks otherwise; a back-to-top arrow appears after one screen */
try{ if ("scrollRestoration" in history) history.scrollRestoration = "manual"; }catch(e){}
(function(){ var moved = false; ["wheel","touchstart","keydown","pointerdown"].forEach(function(ev){ window.addEventListener(ev, function(){ moved = true; }, {passive:true, once:true}); });
  function top(){ if (!location.hash && !moved && window.scrollY > 0) window.scrollTo(0, 0); }
  top(); [60, 250, 600, 1000, 1600].forEach(function(t){ setTimeout(top, t); }); window.addEventListener("pageshow", top); })();
(function(){ var top = document.querySelector("[data-top]"); if (!top) return; var t = false; function f(){ top.classList.toggle("show", window.scrollY > window.innerHeight * .9); t = false; } window.addEventListener("scroll", function(){ if (!t){ t = true; requestAnimationFrame(f); } }, {passive:true}); f(); top.addEventListener("click", function(e){ e.preventDefault(); window.scrollTo({top: 0, behavior: reduced ? "auto" : "smooth"}); }); })();
/* the menu item of the page you are on */
(function(){ var file = (location.pathname.split("/").pop() || "index.html").toLowerCase(); document.querySelectorAll(".links a[href]").forEach(function(a){ var h = (a.getAttribute("href") || "").split("#")[0].toLowerCase(); var inDd = !!a.closest(".dd"); var on = inDd ? h === file : (h === file || (file.indexOf("stage-") === 0 && h === "journey.html")); a.classList.toggle("on", on); if (on) a.setAttribute("aria-current", "page"); }); })();
/* journey dropdown: hover on desktop, first tap opens on touch, Esc closes */
(function(){ document.querySelectorAll("[data-ddtog]").forEach(function(t){ t.addEventListener("click", function(e){
  e.preventDefault(); e.stopPropagation();
  var g = t.closest("[data-dd]"); if (!g) return;
  var open = !g.classList.contains("open"); g.classList.toggle("open", open);
  t.setAttribute("aria-expanded", String(open));
  var a = g.querySelector(":scope > a"); if (a) a.setAttribute("aria-expanded", String(open));
}); }); })();
(function(){ document.querySelectorAll("[data-dd]").forEach(function(dd){ var a = dd.querySelector(":scope > a"); if (!a) return;
  a.addEventListener("click", function(e){ if (isTouch && !dd.classList.contains("open") && window.innerWidth > 1024){ e.preventDefault(); dd.classList.add("open"); a.setAttribute("aria-expanded", "true"); } });
  a.addEventListener("keydown", function(e){ if (e.key === "ArrowDown" || e.key === " "){ e.preventDefault(); dd.classList.add("open"); a.setAttribute("aria-expanded", "true"); var f = dd.querySelector(".dd a"); if (f) f.focus(); } });
  dd.addEventListener("keydown", function(e){ if (e.key === "Escape"){ dd.classList.remove("open"); a.setAttribute("aria-expanded", "false"); a.focus(); } });
  document.addEventListener("click", function(e){ if (!dd.contains(e.target)){ dd.classList.remove("open"); a.setAttribute("aria-expanded", "false"); } }); }); })();
/* screen-in-screen: [data-open="id"] opens <dialog id>, closes on backdrop click or Esc */
(function(){ document.querySelectorAll("[data-open]").forEach(function(b){ b.addEventListener("click", function(){ var d = document.getElementById(b.dataset.open); if (!d) return; if (d.showModal){ d.showModal(); } else { d.setAttribute("open", ""); } document.body.classList.add("modal-open"); }); });
  document.querySelectorAll("dialog.modal").forEach(function(d){ d.addEventListener("click", function(e){ if (e.target === d) d.close(); }); d.querySelectorAll("[data-close]").forEach(function(c){ c.addEventListener("click", function(){ d.close(); }); }); d.addEventListener("close", function(){ document.body.classList.remove("modal-open"); }); }); })();

/* ---------- nav ---------- */
var nav = document.querySelector(".nav");
var onScroll = function(){ if (nav) nav.classList.toggle("scrolled", window.scrollY > 24); };
window.addEventListener("scroll", onScroll, {passive:true}); onScroll();
var toggle = document.querySelector("[data-menu]"), links = document.querySelector(".links");
if (toggle && links){
  toggle.addEventListener("click", function(){ var o = links.classList.toggle("open"); toggle.setAttribute("aria-expanded", o ? "true" : "false"); document.body.classList.toggle("menu-open", o); });
  links.addEventListener("click", function(e){ if (e.target.closest("a")){ links.classList.remove("open"); toggle.setAttribute("aria-expanded","false"); document.body.classList.remove("menu-open"); } });
}

/* ---------- petal particles on a canvas (#petals) ---------- */
(function(){
  var cv = document.getElementById("petals"); if (!cv || reduced) return;
  var ctx = cv.getContext("2d"), W, H, petals = [];
  var COLORS = (cv.dataset.colors || "rgba(240,150,60,.45)|rgba(60,110,88,.35)|rgba(245,198,165,.5)").split("|");
  function resize(){ W = cv.width = cv.offsetWidth || window.innerWidth; H = cv.height = cv.offsetHeight || window.innerHeight; var n = Math.round(Math.min(16, Math.max(7, W/100))); while (petals.length < n) petals.push(make(true)); petals.length = n; }
  function make(any){ return { x: Math.random()*W, y: any ? Math.random()*H : -20, r: 5 + Math.random()*7, vy: .18 + Math.random()*.35, sway: 18 + Math.random()*26, ph: Math.random()*Math.PI*2, spin: (Math.random()-.5)*.012, a: Math.random()*Math.PI*2, c: COLORS[Math.random()*COLORS.length|0] }; }
  function draw(p){ ctx.save(); ctx.translate(p.x + Math.sin(p.ph)*p.sway*.04, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.beginPath(); ctx.moveTo(0,-p.r); ctx.bezierCurveTo(p.r*.9,-p.r*.55,p.r*.75,p.r*.55,0,p.r); ctx.bezierCurveTo(-p.r*.75,p.r*.55,-p.r*.9,-p.r*.55,0,-p.r); ctx.fill(); ctx.restore(); }
  var running = true;
  function tick(){ if (!running) return; ctx.clearRect(0,0,W,H); for (var i=0;i<petals.length;i++){ var p = petals[i]; p.y += p.vy; p.ph += .008; p.a += p.spin; p.x += Math.cos(p.ph)*.25; if (p.y > H + 24 || p.x < -30 || p.x > W + 30) petals[i] = make(false); draw(petals[i]); } requestAnimationFrame(tick); }
  document.addEventListener("visibilitychange", function(){ var was = running; running = !document.hidden; if (running && !was) tick(); });
  window.addEventListener("resize", resize); resize(); tick();
})();

/* ---------- stars on a canvas (#stars) ---------- */
(function(){
  var cv = document.getElementById("stars"); if (!cv || reduced) return;
  var ctx = cv.getContext("2d"), W, H, st = [];
  function resize(){ W = cv.width = cv.offsetWidth || window.innerWidth; H = cv.height = cv.offsetHeight || window.innerHeight; st = []; var n = Math.round(W/14); for (var i=0;i<n;i++) st.push({x:Math.random()*W, y:Math.random()*H, r:.4+Math.random()*1.4, ph:Math.random()*6.28, sp:.004+Math.random()*.01}); }
  var running = true;
  function tick(){ if (!running) return; ctx.clearRect(0,0,W,H); for (var i=0;i<st.length;i++){ var s = st[i]; s.ph += s.sp; var a = .25 + .55*(0.5+0.5*Math.sin(s.ph)); ctx.fillStyle = "rgba(240,204,122,"+a.toFixed(2)+")"; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.28); ctx.fill(); } requestAnimationFrame(tick); }
  document.addEventListener("visibilitychange", function(){ var was = running; running = !document.hidden; if (running && !was) tick(); });
  window.addEventListener("resize", resize); resize(); tick();
})();

/* ---------- blob morphing (.morph with data-alt1 / data-alt2) + drift ---------- */
if (hasGsap && !reduced){
  document.querySelectorAll(".morph").forEach(function(path, i){
    var d0 = path.getAttribute("d"), d1 = path.dataset.alt1, d2 = path.dataset.alt2; if (!d1 || !d2) return;
    gsap.timeline({repeat:-1, yoyo:true, defaults:{ease:"sine.inOut"}}).to(path, {attr:{d:d1}, duration: 9 + i*2.4}).to(path, {attr:{d:d2}, duration: 11 + i*1.8}).to(path, {attr:{d:d0}, duration: 10 + i*2.1});
  });
  gsap.utils.toArray("[data-drift]").forEach(function(el, i){ var a = +el.dataset.drift || 6; gsap.to(el, {yPercent: (i%2?-1:1)*a, xPercent: (i%2?1:-1)*a*.5, duration: 14 + i*3, repeat:-1, yoyo:true, ease:"sine.inOut"}); });
}

/* ---------- hero entrance (data-hero, children with data-h, words with data-words) ---------- */
(function(){
  var hero = document.querySelector("[data-hero]"); if (!hero) return;
  var items = hero.querySelectorAll("[data-h]");
  if (hasGsap && !reduced){ gsap.from(items, {y: 28, autoAlpha: 0, duration: 1.1, ease: "power3.out", stagger: .12, delay: .15});
    /* safety net: a background tab pauses the ticker; never leave the hero invisible */
    setTimeout(function(){ var all = Array.prototype.slice.call(items).concat(Array.prototype.slice.call(hero.querySelectorAll("[data-words] .w"))); all.forEach(function(el){ if (getComputedStyle(el).opacity === "0" || getComputedStyle(el).visibility === "hidden") gsap.set(el, {clearProps: "opacity,visibility,transform"}); }); }, 3600);
    document.addEventListener("visibilitychange", function(){ if (!document.hidden && hasST) setTimeout(function(){ ScrollTrigger.refresh(); }, 60); }); }
  hero.querySelectorAll("[data-words]").forEach(function(w){ if (reduced || !hasGsap) return; var nodes = Array.prototype.slice.call(w.childNodes); w.textContent = ""; nodes.forEach(function(n){ if (n.nodeType === 3){ n.textContent.split(/(\s+)/).forEach(function(part){ if (!part) return; if (/^\s+$/.test(part)){ w.appendChild(document.createTextNode(part)); return; } var s = document.createElement("span"); s.className = "w"; s.textContent = part; w.appendChild(s); }); } else { n.classList && n.classList.add("w"); w.appendChild(n); } });
    gsap.from(w.querySelectorAll(".w"), {y: "0.6em", autoAlpha: 0, duration: .9, ease: "power3.out", stagger: .07, delay: .3}); });
})();

/* ---------- scroll reveals ---------- */
(function(){
  var els = document.querySelectorAll("[data-reveal]"); if (!els.length) return;
  if (hasST && !reduced){
    els.forEach(function(el){ var d = +(el.dataset.reveal) || 0; gsap.from(el, {y: 34, autoAlpha: 0, duration: 1.05, ease: "power3.out", delay: d*.1, scrollTrigger: {trigger: el, start: "top 92%", once: true}}); });
    return;
  }
  if (reduced || !("IntersectionObserver" in window)){ showAll(); return; }
  els.forEach(function(el){ el.classList.add("rv"); });
  var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } }); }, {threshold:.12});
  els.forEach(function(el){ io.observe(el); });
})();

/* ---------- parallax (data-parallax = px to travel) ---------- */
if (hasST && !reduced && !isTouch){
  gsap.utils.toArray("[data-parallax]").forEach(function(el){ var d = +el.dataset.parallax || 60; gsap.fromTo(el, {y: -d}, {y: d, ease: "none", scrollTrigger: {trigger: el.closest("section") || el, start: "top bottom", end: "bottom top", scrub: true}}); });
}

/* ---------- journey path draw + milestone blooms ---------- */
(function(){
  var jp = document.getElementById("journeyPath"); if (!jp) return;
  var len = jp.getTotalLength();
  if (hasST && !reduced){
    gsap.set(jp, {strokeDasharray: len, strokeDashoffset: len});
    gsap.to(jp, {strokeDashoffset: 0, ease: "none", scrollTrigger: {trigger: jp.closest("section"), start: "top 70%", end: "bottom 70%", scrub: .6}});
    gsap.utils.toArray(".milestone").forEach(function(m, i){
      var core = m.querySelector(".core"), bloom = m.querySelector(".bloom"), lab = m.querySelector(".mlabel");
      var tl = gsap.timeline({scrollTrigger: {trigger: m, start: "top 86%", once: true}, delay: (i%3)*.1});
      if (core) tl.from(core, {scale: 0, transformOrigin: "50% 50%", duration: .7, ease: "back.out(2.2)"});
      if (bloom) tl.from(bloom, {scale: .2, rotation: -70, transformOrigin: "50% 50%", autoAlpha: 0, duration: 1.1, ease: "elastic.out(1,.55)"}, "-=.45");
      if (lab) tl.from(lab, {y: 14, autoAlpha: 0, duration: .6}, "-=.6");
    });
  }
})();

/* ---------- gold line that draws on scroll (#lineDraw) ---------- */
(function(){ var l = document.getElementById("lineDraw"); if (!l || !hasST || reduced) return; var len = l.getTotalLength(); gsap.set(l, {strokeDasharray: len, strokeDashoffset: len}); gsap.to(l, {strokeDashoffset: 0, ease: "none", scrollTrigger: {trigger: l.closest("section"), start: "top 75%", end: "bottom 70%", scrub: .5}}); })();

/* ---------- hero stage picker: [data-picker] > [data-pick] / [data-scene] ---------- */
document.querySelectorAll("[data-picker]").forEach(function(box){
  var bs = box.querySelectorAll("[data-pick]"), sc = box.querySelectorAll("[data-scene]"), timer = null, idx = 0;
  function go(id){ bs.forEach(function(b, i){ var on = b.dataset.pick === id; b.classList.toggle("on", on); if (on) idx = i; });
    sc.forEach(function(s){ var on = s.dataset.scene === id; if (on && !s.classList.contains("on") && hasGsap && !reduced){ gsap.fromTo(s, {autoAlpha:0, y:12, scale:.98}, {autoAlpha:1, y:0, scale:1, duration:.6, ease:"power3.out", clearProps:"transform"}); } s.classList.toggle("on", on); }); }
  bs.forEach(function(b){ b.addEventListener("click", function(){ go(b.dataset.pick); restart(); }); });
  function restart(){ if (timer) clearInterval(timer); if (!reduced && box.dataset.auto) timer = setInterval(function(){ go(bs[(idx+1)%bs.length].dataset.pick); }, 5200); }
  box.addEventListener("mouseenter", function(){ if (timer) clearInterval(timer); }); box.addEventListener("mouseleave", restart);
  restart();
});

/* ---------- tabs: [data-tabs] > [data-t] / [data-panel] ---------- */
document.querySelectorAll("[data-tabs]").forEach(function(box){
  var tabs = box.querySelectorAll("[data-t]"), panels = box.querySelectorAll("[data-panel]");
  function go(id){ tabs.forEach(function(t){ var on = t.dataset.t === id; t.classList.toggle("on", on); t.setAttribute("aria-selected", on ? "true" : "false"); });
    panels.forEach(function(p){ var on = p.dataset.panel === id; p.hidden = !on; if (on && hasGsap && !reduced) gsap.from(p, {autoAlpha:0, y:16, duration:.5, ease:"power2.out"}); }); }
  tabs.forEach(function(t){ t.addEventListener("click", function(){ go(t.dataset.t); }); });
  var h = location.hash.replace("#",""); go(box.querySelector('[data-t="'+h+'"]') ? h : tabs[0].dataset.t);
});

/* ---------- accordions (.qa .q / .a) unfurl ---------- */
(function(){
  var qs = document.querySelectorAll(".qa .q"); if (!qs.length) return;
  function set(panel, open, animate){
    if (hasGsap && !reduced && animate){ if (open) gsap.fromTo(panel, {height:0, autoAlpha:0}, {height:"auto", autoAlpha:1, duration:.6, ease:"power3.inOut", onComplete:function(){ panel.style.height = "auto"; }}); else gsap.to(panel, {height:0, autoAlpha:0, duration:.45, ease:"power3.inOut"}); }
    else { panel.style.height = open ? "auto" : "0"; panel.style.opacity = open ? "1" : "0"; panel.style.visibility = open ? "visible" : "hidden"; }
  }
  qs.forEach(function(btn){ var p = document.getElementById(btn.getAttribute("aria-controls")); p.style.overflow = "hidden"; if (btn.getAttribute("aria-expanded") !== "true") set(p, false, false);
    btn.addEventListener("click", function(){ var open = btn.getAttribute("aria-expanded") !== "true"; btn.setAttribute("aria-expanded", open ? "true" : "false"); set(p, open, true); }); });
})();

/* ---------- sticky story: [data-stage] drives [data-stage-art] ---------- */
(function(){
  var arts = document.querySelectorAll("[data-stage-art]"); if (!arts.length || !("IntersectionObserver" in window)) return;
  var so = new IntersectionObserver(function(es){ es.forEach(function(e){ if (!e.isIntersecting) return; var id = e.target.dataset.stage;
    arts.forEach(function(a){ var on = a.dataset.stageArt === id; if (on && !a.classList.contains("on") && hasGsap && !reduced) gsap.fromTo(a, {autoAlpha:0, scale:.96, rotate:-2}, {autoAlpha:1, scale:1, rotate:0, duration:.7, ease:"power3.out"}); a.classList.toggle("on", on); });
    document.querySelectorAll("[data-stage-dot]").forEach(function(d){ d.classList.toggle("on", d.dataset.stageDot === id); }); }); }, {threshold:.5});
  document.querySelectorAll("[data-stage]").forEach(function(s){ so.observe(s); });
})();

/* ---------- horizontal rail progress ([data-rail] + [data-rail-bar]) ---------- */
(function(){
  var rail = document.querySelector("[data-rail]"), bar = document.querySelector("[data-rail-bar]"); if (!rail) return;
  function upd(){ if (!bar) return; var max = rail.scrollWidth - rail.clientWidth; var p = max > 0 ? rail.scrollLeft / max : 0; bar.style.transform = "scaleX(" + (0.2 + 0.8*p).toFixed(3) + ")"; }
  rail.addEventListener("scroll", upd, {passive:true}); upd();
  document.querySelectorAll("[data-rail-prev],[data-rail-next]").forEach(function(b){ b.addEventListener("click", function(){ var card = rail.querySelector(".rcard"); var w = card ? card.offsetWidth + 20 : 320; rail.scrollBy({left: b.hasAttribute("data-rail-next") ? w : -w, behavior: reduced ? "auto" : "smooth"}); }); });
})();

/* ---------- magnetic buttons (desktop only) ---------- */
if (hasGsap && !reduced && !isTouch){
  document.querySelectorAll("[data-magnet]").forEach(function(b){
    b.addEventListener("mousemove", function(e){ var r = b.getBoundingClientRect(); gsap.to(b, {x: (e.clientX - r.left - r.width/2)*.25, y: (e.clientY - r.top - r.height/2)*.35, duration:.4, ease:"power2.out"}); });
    b.addEventListener("mouseleave", function(){ gsap.to(b, {x:0, y:0, duration:.6, ease:"elastic.out(1,.4)"}); });
  });
}

/* ---------- cursor glow (.glow-follow) ---------- */
(function(){ var g = document.querySelector(".glow-follow"); if (!g || isTouch || reduced) return; var x = 0, y = 0, tx = -400, ty = -400; window.addEventListener("mousemove", function(e){ tx = e.clientX; ty = e.clientY; }, {passive:true}); (function f(){ x += (tx-x)*.08; y += (ty-y)*.08; g.style.transform = "translate(" + (x-220) + "px," + (y-220) + "px)"; requestAnimationFrame(f); })(); })();

/* ---------- tilt cards (desktop) ---------- */
if (hasGsap && !reduced && !isTouch){
  document.querySelectorAll("[data-tilt]").forEach(function(c){
    c.addEventListener("mousemove", function(e){ var r = c.getBoundingClientRect(); var px = (e.clientX - r.left)/r.width - .5, py = (e.clientY - r.top)/r.height - .5; gsap.to(c, {rotateY: px*8, rotateX: -py*8, transformPerspective: 800, duration:.5, ease:"power2.out"}); });
    c.addEventListener("mouseleave", function(){ gsap.to(c, {rotateY:0, rotateX:0, duration:.7, ease:"power3.out"}); });
  });
}

/* ---------- breathing guide: 4 in, 4 hold, 6 out ---------- */
document.querySelectorAll("[data-breathe]").forEach(function(w){
  var lbl = w.querySelector("[data-blabel]"), ring = w.querySelector(".bring"), btn = w.querySelector("[data-bstart]"), bar = w.querySelector("[data-bbar]"), timer = null, on = false;
  var phases = [["Breathe in","श्वास घ्या",4000,"in"],["Hold","थांबा",4000,"hold"],["Breathe out","श्वास सोडा",6000,"out"]];
  function run(i){ var p = phases[i%3]; lbl.innerHTML = p[0] + "<small>" + p[1] + "</small>"; if (ring) ring.className = "bring " + p[3]; if (bar){ bar.style.transition = "none"; bar.style.transform = "scaleX(0)"; void bar.offsetWidth; bar.style.transition = "transform " + p[2] + "ms linear"; bar.style.transform = "scaleX(1)"; } timer = setTimeout(function(){ run(i+1); }, p[2]); }
  if (btn) btn.addEventListener("click", function(){ on = !on; w.classList.toggle("going", on); btn.innerHTML = on ? "Stop <small>थांबवा</small>" : "Start <small>सुरू करा</small>"; if (on){ run(0); } else { clearTimeout(timer); lbl.innerHTML = "Ready?<small>तयार?</small>"; if (ring) ring.className = "bring"; if (bar) bar.style.transform = "scaleX(0)"; } });
});

/* ---------- seed to tree: [data-growth-sec] holds <svg data-growth> + [data-stage-block] blocks ---------- */
(function(){
  var sec = document.querySelector("[data-growth-sec]"); if (!sec) return;
  var svg = sec.querySelector("[data-growth]"), stem = svg && svg.querySelector("#stem"), roots = svg && svg.querySelector("#rootPath");
  var stages = svg ? svg.querySelectorAll(".stage") : [], blocks = sec.querySelectorAll("[data-stage-block]");
  var len = stem ? stem.getTotalLength() : 0, rlen = roots ? roots.getTotalLength() : 0;
  if (stem){ stem.style.strokeDasharray = len; stem.style.strokeDashoffset = reduced ? 0 : len; }
  if (roots){ roots.style.strokeDasharray = rlen; roots.style.strokeDashoffset = reduced ? 0 : rlen; }
  var thresholds = [0, .18, .4, .62, .84];
  function paint(p){
    if (stem) stem.style.strokeDashoffset = len * (1 - Math.min(1, Math.max(0, (p - .06) / .9)));
    if (roots) roots.style.strokeDashoffset = rlen * (1 - Math.min(1, p / .15));
    stages.forEach(function(g, i){ g.classList.toggle("on", p >= thresholds[i]); });
    var cur = 0; thresholds.forEach(function(t, i){ if (p >= t) cur = i; });
    blocks.forEach(function(b, i){ b.classList.toggle("on", i === cur); });
  }
  if (reduced){ paint(1); return; }
  var t = false;
  function f(){ var r = sec.getBoundingClientRect(); var vh = window.innerHeight || 1; var p = (vh * .55 - r.top) / (r.height - vh * .4); paint(Math.min(1, Math.max(0, p))); t = false; }
  window.addEventListener("scroll", function(){ if (!t){ requestAnimationFrame(f); t = true; } }, {passive:true}); window.addEventListener("resize", f); f();
  blocks.forEach(function(b, i){ b.addEventListener("click", function(){ var r = sec.getBoundingClientRect(); var vh = window.innerHeight; var target = window.pageYOffset + r.top - vh * .55 + (thresholds[i] + .04) * (r.height - vh * .4); window.scrollTo({top: target, behavior: "smooth"}); }); });
})();

/* ---------- warli mural: [data-mural] reveals .wg groups one by one, ground line draws ---------- */
(function(){
  document.querySelectorAll("[data-mural]").forEach(function(svg){
    var gs = svg.querySelectorAll(".wg"), ground = svg.querySelector("#muralGround");
    if (ground){ var gl = ground.getTotalLength(); ground.style.strokeDasharray = "3 9"; }
    if (reduced || !("IntersectionObserver" in window)){ gs.forEach(function(g){ g.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if (!e.isIntersecting) return; io.disconnect(); gs.forEach(function(g, i){ setTimeout(function(){ g.classList.add("in"); }, 120 + i * 140); }); }); }, {threshold:.25});
    io.observe(svg);
  });
})();

/* ---------- sketches draw themselves: <svg data-sketch> ---------- */
(function(){
  var svgs = document.querySelectorAll("svg[data-sketch]"); if (!svgs.length) return;
  svgs.forEach(function(svg){
    var shapes = Array.prototype.slice.call(svg.querySelectorAll("path,circle,ellipse,rect,line,polyline,polygon")).filter(function(s){ return s.getTotalLength && getComputedStyle(s).display !== "none"; });
    var total = 0; var items = shapes.map(function(s){ var L = 0; try{ L = s.getTotalLength(); }catch(e){} total += L; return {el: s, L: L}; });
    if (reduced || !hasST || !total){ return; }
    items.forEach(function(it){ it.el.style.strokeDasharray = it.L + " " + it.L; it.el.style.strokeDashoffset = it.L; it.el.classList.add("drawing"); });
    var auto = svg.getAttribute("data-sketch") === "auto";
    var tl = auto ? gsap.timeline({delay: .4}) : gsap.timeline({scrollTrigger: {trigger: svg, start: "top 94%", end: (svg.getBoundingClientRect().height < 220 ? "top 62%" : "top 32%"), scrub: .4}});
    var scale = auto ? 3.2 : 1;
    var at = 0; items.forEach(function(it){ var d = Math.max(.02, it.L / total) * scale; tl.to(it.el, {strokeDashoffset: 0, duration: d, ease: auto ? "power1.inOut" : "none"}, at); at += d * .85; });
    tl.add(function(){ svg.classList.add("washed"); }, at);
  });
})();

/* ---------- belief chain: [data-chain] children reveal in sequence ---------- */
(function(){
  var chains = document.querySelectorAll("[data-chain]"); if (!chains.length || !("IntersectionObserver" in window)) return;
  var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if (!e.isIntersecting) return; io.unobserve(e.target); var kids = e.target.children; for (var i=0;i<kids.length;i++){ (function(k, i){ setTimeout(function(){ k.classList.add("in"); }, reduced ? 0 : i * 260); })(kids[i], i); } }); }, {threshold:.3});
  chains.forEach(function(c){ io.observe(c); });
})();

/* ---------- counters: [data-count] ---------- */
(function(){
  var els = document.querySelectorAll("[data-count]"); if (!els.length) return;
  if (reduced || !("IntersectionObserver" in window)){ els.forEach(function(el){ el.textContent = el.dataset.count + (el.dataset.suffix || ""); }); return; }
  var io = new IntersectionObserver(function(es){ es.forEach(function(en){ if (!en.isIntersecting) return; io.unobserve(en.target); var el = en.target, target = +el.dataset.count, suf = el.dataset.suffix || "", t0 = null;
    function step(t){ if (!t0) t0 = t; var k = Math.min((t - t0)/1400, 1); k = 1 - Math.pow(1-k, 3); el.textContent = Math.round(target*k) + suf; if (k < 1) requestAnimationFrame(step); } requestAnimationFrame(step); }); }, {threshold:.6});
  els.forEach(function(el){ io.observe(el); });
})();

/* ---------- day cycle: [data-sky] changes the page's sky as you scroll ---------- */
(function(){
  var root = document.querySelector("[data-sky]"); if (!root || reduced) return;
  var t = false; function f(){ var d = document.documentElement; var max = (d.scrollHeight - d.clientHeight) || 1; var p = Math.min(1, Math.max(0, window.pageYOffset / max)); root.style.setProperty("--sky", p.toFixed(3)); t = false; }
  window.addEventListener("scroll", function(){ if (!t){ requestAnimationFrame(f); t = true; } }, {passive:true}); f();
})();

/* ---------- where are you today: [data-anytime] with [data-opt] buttons and [data-result] ---------- */
document.querySelectorAll("[data-anytime]").forEach(function(box){
  var opts = box.querySelectorAll("[data-opt]"), cards = box.querySelectorAll("[data-from]"), res = box.querySelector("[data-result]");
  var order = ["pre","t1","t2","t3","post"];
  function go(from){ opts.forEach(function(o){ o.classList.toggle("on", o.dataset.opt === from); });
    var idx = order.indexOf(from);
    cards.forEach(function(c){ var i = order.indexOf(c.dataset.from); var state = i < idx ? "past" : (i === idx ? "now" : "next"); c.className = c.className.replace(/\b(past|now|next)\b/g, "").trim() + " " + state; });
    if (res) res.classList.add("on");
    if (hasGsap && !reduced){ var vis = Array.prototype.filter.call(cards, function(c){ return order.indexOf(c.dataset.from) >= idx; }); gsap.fromTo(vis, {y: 14, autoAlpha: 0}, {y: 0, autoAlpha: 1, duration: .5, stagger: .08, ease: "power2.out", clearProps: "transform"}); }
  }
  opts.forEach(function(o){ o.addEventListener("click", function(){ go(o.dataset.opt); }); });
  var pre = box.getAttribute("data-anytime"); if (pre) go(pre);
});

/* ---------- practices ---------- */
document.querySelectorAll("[data-practice]").forEach(function(w){
  var kind = w.dataset.practice, btn = w.querySelector("[data-pstart]"), lbl = w.querySelector("[data-plabel]"), bar = w.querySelector("[data-pbar]"), rounds = w.querySelector("[data-prounds]");
  var timer = null, on = false, round = 0;
  function setBar(ms){ if (!bar) return; bar.style.transition = "none"; bar.style.transform = "scaleX(0)"; void bar.offsetWidth; bar.style.transition = "transform " + ms + "ms linear"; bar.style.transform = "scaleX(1)"; }
  function stop(){ on = false; clearTimeout(timer); w.classList.remove("going"); if (btn) btn.innerHTML = "Start"; }
  if (kind === "breath"){
    var lot = w.querySelector(".plotus"), petals = lot ? lot.querySelectorAll(".petal") : [];
    var phases = [["श्वास घ्या","Breathe in",4000,"in"],["थांबा","Hold",4000,"hold"],["श्वास सोडा","Breathe out",6000,"out"]];
    function open(k){ petals.forEach(function(p){ var a = +p.dataset.a; p.style.transform = "rotate(" + (a * (0.35 + 0.65 * k)) + "deg) scaleY(" + (0.72 + 0.28 * k) + ")"; }); }
    open(0);
    function run(i){ var p = phases[i % 3]; if (lbl) lbl.innerHTML = p[0] + "<small>" + p[1] + "</small>"; if (lot){ lot.setAttribute("class", "plotus " + p[3]); } if (p[3] === "in") open(1); if (p[3] === "out") open(0); setBar(p[2]); if (i % 3 === 2){ round++; if (rounds) rounds.textContent = round + " rounds"; } timer = setTimeout(function(){ run(i + 1); }, p[2]); }
    if (btn) btn.addEventListener("click", function(){ if (on){ stop(); if (lbl) lbl.innerHTML = "Ready?"; open(0); if (lot) lot.setAttribute("class", "plotus"); if (bar) bar.style.transform = "scaleX(0)"; return; } on = true; round = 0; w.classList.add("going"); btn.innerHTML = "Stop"; run(0); });
  }
  if (kind === "om"){
    var ring = w.querySelector(".omring"), wrap = w.querySelector(".omwrap"), L = 754, total = 6;
    function cycle(n){ if (n > total){ stop(); if (lbl) lbl.innerHTML = "छान. सहा ओंकार पूर्ण.<small>Well done. Six rounds complete.</small>"; if (wrap) wrap.classList.remove("going"); return; }
      if (lbl) lbl.innerHTML = "दीर्घ श्वास घ्या<small>Breathe in deeply</small>"; ring.style.transition = "none"; ring.style.strokeDashoffset = L; if (wrap) wrap.classList.remove("going");
      timer = setTimeout(function(){ if (lbl) lbl.innerHTML = "ओंऽऽऽम्<small>Chant slowly until the ring completes</small>"; if (wrap) wrap.classList.add("going"); ring.style.transition = "stroke-dashoffset 9s linear"; ring.style.strokeDashoffset = 0; if (rounds) rounds.textContent = n + " / " + total; timer = setTimeout(function(){ cycle(n + 1); }, 9400); }, 3000); }
    if (btn) btn.addEventListener("click", function(){ if (on){ stop(); if (wrap) wrap.classList.remove("going"); ring.style.transition = "none"; ring.style.strokeDashoffset = L; if (lbl) lbl.innerHTML = "Ready?"; return; } on = true; w.classList.add("going"); btn.innerHTML = "Stop"; cycle(1); });
  }
  if (kind === "samvad"){
    var lines = w.querySelectorAll(".line"), per = 20000;
    function step(i){ if (i >= lines.length){ stop(); if (rounds) rounds.textContent = "complete"; return; }
      lines.forEach(function(l, k){ l.classList.toggle("on", k === i); l.classList.toggle("done", k < i); var arc = l.querySelector(".arc"); if (k === i){ arc.style.transition = "none"; arc.style.strokeDashoffset = 107; void arc.getBoundingClientRect(); arc.style.transition = "stroke-dashoffset " + per + "ms linear"; arc.style.strokeDashoffset = 0; } else if (k > i){ arc.style.transition = "none"; arc.style.strokeDashoffset = 107; } });
      if (rounds) rounds.textContent = (i + 1) + " / " + lines.length; timer = setTimeout(function(){ step(i + 1); }, per); }
    if (btn) btn.addEventListener("click", function(){ if (on){ stop(); lines.forEach(function(l){ l.classList.remove("on","done"); }); if (rounds) rounds.textContent = ""; return; } on = true; w.classList.add("going"); btn.innerHTML = "Stop"; step(0); });
  }
  if (kind === "affirm"){
    var cards = w.querySelectorAll(".acard"), next = w.querySelector("[data-pnext]"), cur = 0, say = 1;
    var counts = ["१","२","३"];
    function paint(){ cards.forEach(function(c, k){ c.classList.toggle("on", k === cur); var ac = c.querySelector(".acount"); if (ac) ac.textContent = counts[say - 1] + " / ३"; }); if (rounds) rounds.textContent = "वाक्य " + (cur + 1) + " / " + cards.length + " · मनात " + say + " वेळा"; }
    if (next) next.addEventListener("click", function(){ if (say < 3){ say++; } else { say = 1; cur = (cur + 1) % cards.length; } paint(); });
    paint();
  }
  if (kind === "stretch"){
    var moves = w.querySelectorAll(".move"), secs = 30;
    function doMove(i){ if (i >= moves.length){ stop(); if (rounds) rounds.textContent = "complete"; return; }
      var m = moves[i], arc = m.querySelector(".arc"), num = m.querySelector("[data-sec]"), left = secs;
      moves.forEach(function(x, k){ x.classList.toggle("on", k === i); x.classList.toggle("done", k < i); });
      arc.style.transition = "none"; arc.style.strokeDashoffset = 163; void arc.getBoundingClientRect(); arc.style.transition = "stroke-dashoffset " + secs + "s linear"; arc.style.strokeDashoffset = 0;
      if (rounds) rounds.textContent = (i + 1) + " / " + moves.length;
      (function tick(){ num.textContent = left; if (left <= 0){ doMove(i + 1); return; } left--; timer = setTimeout(tick, 1000); })(); }
    if (btn) btn.addEventListener("click", function(){ if (on){ stop(); moves.forEach(function(m){ m.classList.remove("on","done"); m.querySelector("[data-sec]").textContent = secs; }); if (rounds) rounds.textContent = ""; return; } on = true; w.classList.add("going"); btn.innerHTML = "Stop"; doMove(0); });
  }
});

/* ---------- booking: compose a WhatsApp message (+ optional live phone preview [data-bubble]) ---------- */
var PHONE = "917760498085";
var ENDPOINT = "";
function val(f, n){ var el = f.elements[n]; if (!el) return ""; if (el.length && el[0] && el[0].type === "radio"){ for (var i=0;i<el.length;i++) if (el[i].checked) return el[i].value; return ""; } return (el.value || "").trim(); }
function line(k, v){ return v ? k + ": " + v + "\n" : ""; }
function compose(f){
  if (f.getAttribute("data-kind") === "guide"){
    return "नमस्कार Matruveda,\nPlease send me the five free practices as a one page guide.\n" + line("Contact", val(f,"phone")) + "\n(sent from matruveda.in)";
  }
  var prog = val(f,"program") || "(program)";
  var sf = f.querySelector("[data-stagefield]");
  var stage = (sf && sf.hidden) ? "" : val(f,"stage");
  return "नमस्कार Matruveda,\nI would like to know about " + prog + ".\n" + line("Name", val(f,"name")) + line("For", val(f,"for")) + line("Stage", stage) + line("Pincode", val(f,"pincode")) + line("Place", [val(f,"city"), val(f,"state"), val(f,"country")].filter(Boolean).join(", ")) + line("Preferred time", val(f,"slot")) + line("Contact", val(f,"phone")) + (val(f,"msg") ? "\n" + val(f,"msg") + "\n" : "") + "\n(sent from matruveda.in)";
}
document.querySelectorAll("[data-booking]").forEach(function(f){
  var q = new URLSearchParams(location.search).get("p"), sel = f.elements.program;
  if (q && sel){ for (var i=0;i<sel.options.length;i++) if (sel.options[i].dataset.id === q){ sel.selectedIndex = i; break; } }
  var JSTAGE = {pre:"planning a baby", t1:"1st trimester", t2:"2nd trimester", t3:"3rd trimester", post:"baby is born"};
  var sfield = f.querySelector("[data-stagefield]"), snote = f.querySelector("[data-soonnote]");
  function syncProgram(){
    if (!sel) return;
    var o = sel.options[sel.selectedIndex], id = o ? o.dataset.id : "", want = JSTAGE[id];
    if (sfield){
      sfield.hidden = !want;
      if (want){ var rs = f.elements.stage; if (rs) for (var i=0;i<rs.length;i++) rs[i].checked = (rs[i].value === want); try{ sfield.dispatchEvent(new Event("change")); }catch(e){} }
    }
    if (snote) snote.hidden = !(o && o.dataset.soon === "1");
  }
  if (sel) sel.addEventListener("change", syncProgram);
  syncProgram();
  var prev = document.querySelector("[data-bubble]");
  if (prev){ var paint = function(){ prev.textContent = compose(f); }; f.addEventListener("input", paint); f.addEventListener("change", paint); paint(); }
  /* a pincode fills in city, state and country */
  var pin = f.elements.pincode, pinout = f.querySelector("[data-pinout]");
  if (pin){
    var lastPin = "";
    var setPlace = function(city, state, country){
      if (f.elements.city) f.elements.city.value = city || "";
      if (f.elements.state) f.elements.state.value = state || "";
      if (f.elements.country) f.elements.country.value = country || "";
    };
    var lookup = function(){
      var v = (pin.value || "").replace(/[^0-9]/g, "").slice(0, 6);
      if (pin.value !== v) pin.value = v;
      if (v === lastPin) return;
      lastPin = v;
      setPlace("", "", "India");
      if (!pinout) return;
      if (v.length !== 6){ pinout.textContent = ""; pinout.className = "pinout"; return; }
      pinout.textContent = "Looking up " + v; pinout.className = "pinout";
      var settled = false;
      var fail = function(){ if (settled) return; settled = true;
        setPlace("", "", "India");
        pinout.textContent = "We could not look that up. Send anyway and we will confirm.";
        pinout.className = "pinout warn"; };
      setTimeout(fail, 7000);
      try {
        fetch("https://api.postalpincode.in/pincode/" + v).then(function(r){ return r.json(); }).then(function(d){
          if (settled) return;
          var rec = d && d[0], po = rec && rec.PostOffice && rec.PostOffice[0];
          if (!po || rec.Status !== "Success"){ fail(); return; }
          settled = true;
          setPlace(po.District || po.Division || "", po.State || "", po.Country || "India");
          pinout.textContent = [po.District, po.State, po.Country].filter(Boolean).join(", ");
          pinout.className = "pinout ok";
        })["catch"](fail);
      } catch(e){ fail(); }
    };
    pin.addEventListener("input", lookup);
    pin.addEventListener("blur", lookup);
  }

  /* say exactly what is missing rather than refusing silently */
  var errbox = f.querySelector("[data-errbox]");
  var labelOf = function(el){
    var lb = el.closest("label"), sp = lb && lb.querySelector("span");
    if (sp) return sp.textContent.replace("*", "").replace("?", "").trim();
    var fs = el.closest("fieldset"), lg = fs && fs.querySelector("legend");
    return lg ? lg.textContent.trim() : (el.name || "this field");
  };
  var check = function(){
    var missing = [];
    f.querySelectorAll("[required]").forEach(function(el){
      if (el.type !== "hidden" && el.offsetParent === null) return;
      var v = (el.value || "").trim(), bad = !v, digits = v.replace(/[^0-9]/g, "");
      if (!bad && el.name === "phone") bad = digits.length < 10;
      if (!bad && el.name === "pincode") bad = !/^[1-9][0-9]{5}$/.test(digits);
      el.classList.toggle("bad", bad);
      if (bad){ el.setAttribute("aria-invalid", "true"); missing.push({ el: el, label: labelOf(el) }); }
      else el.removeAttribute("aria-invalid");
    });
    return missing;
  };
  f.addEventListener("input", function(e){ if (e.target.classList && e.target.classList.contains("bad")) check(); });

  f.addEventListener("submit", function(ev){ ev.preventDefault();
    var missing = check();
    if (missing.length){
      if (errbox){
        var items = "";
        for (var i = 0; i < missing.length; i++) items += "<li>" + missing[i].label + "</li>";
        errbox.innerHTML = "<strong>" + (missing.length === 1 ? "One thing is still needed:" : missing.length + " things are still needed:") + "</strong><ul>" + items + "</ul>";
        errbox.hidden = false;
        errbox.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
      }
      f.classList.add("shake"); setTimeout(function(){ f.classList.remove("shake"); }, 500);
      try { missing[0].el.focus({ preventScroll: true }); } catch(e){}
      return;
    }
    if (errbox) errbox.hidden = true;
    var msg = compose(f), url = "https://wa.me/" + PHONE + "?text=" + encodeURIComponent(msg);
    var done = f.parentNode.querySelector("[data-bdone]");
    var showDone = function(heading, note, showWa){
      if (!done){ if (showWa){ try { window.open(url, "_blank", "noopener"); } catch(e){} } return; }
      f.hidden = true; done.hidden = false;
      var h = done.querySelector("h3, .pch"); if (h) h.textContent = heading;
      var p0 = done.querySelector("p"); if (p0) p0.textContent = note;
      var a = done.querySelector("[data-walink]"); if (a){ a.href = url; a.hidden = !showWa; }
      var cp = done.querySelector(".small"); if (cp) cp.hidden = !showWa;
      var ta = done.querySelector("[data-msg]");
      if (ta){
        ta.value = msg; ta.hidden = !showWa;
        var selAll = function(){ try { ta.focus(); ta.setSelectionRange(0, ta.value.length); } catch(e){ try { ta.select(); } catch(e2){} } };
        if (showWa) selAll();
        var rs = done.querySelector("[data-reselect]"); if (rs){ rs.hidden = !showWa; rs.addEventListener("click", selAll); }
      }
      done.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    };
    if (ENDPOINT){
      var btn = f.querySelector("button[type=submit]");
      if (btn){ btn.disabled = true; btn.setAttribute("data-label", btn.innerHTML); btn.textContent = "Sending"; }
      var payload = {}, keys = ["name", "phone", "program", "for", "stage", "pincode", "city", "state", "country", "slot", "msg"];
      for (var k = 0; k < keys.length; k++) payload[keys[k]] = val(f, keys[k]);
      payload.page = location.pathname.split("/").pop();
      payload.message = msg;
      var restore = function(){ if (btn){ btn.disabled = false; var l = btn.getAttribute("data-label"); if (l) btn.innerHTML = l; } };
      try {
        fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) })
          .then(function(r){ if (!r.ok) throw new Error("bad status"); restore();
            showDone("We have your request.", "It reached Matruveda just now. We call back within a day.", false); })
          ["catch"](function(){ restore();
            showDone("Send it on WhatsApp.", "We could not reach our desk just now, so please send this on WhatsApp instead.", true);
            try { window.open(url, "_blank", "noopener"); } catch(e){} });
      } catch(e){ restore(); showDone("Send it on WhatsApp.", "We could not reach our desk just now, so please send this on WhatsApp instead.", true); }
    } else {
      showDone("Your message is ready.", "If WhatsApp did not open, use the button below.", true);
      try { window.open(url, "_blank", "noopener"); } catch(e){}
    }
  });
});
document.querySelectorAll("[data-chips]").forEach(function(fs){ var paint = function(){ fs.querySelectorAll("label").forEach(function(l){ l.classList.toggle("on", l.querySelector("input").checked); }); }; fs.addEventListener("change", paint); paint(); });

/* ---------- current nav link ---------- */
(function(){ var secs = document.querySelectorAll("section[id]"); var ls = document.querySelectorAll(".links a[href^='#'], .rail a[href^='#']"); if (!secs.length || !ls.length || !("IntersectionObserver" in window)) return;
  var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting){ ls.forEach(function(a){ a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id); }); } }); }, {rootMargin: "-40% 0px -55% 0px"});
  secs.forEach(function(s){ io.observe(s); });
  var top = document.getElementById("top"); if (top){ var tio = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting) ls.forEach(function(a){ a.classList.toggle("on", a.getAttribute("href") === "#top"); }); }); }, {rootMargin: "0px 0px -60% 0px"}); tio.observe(top); }
  /* hooks: smooth scroll and mark as passed */
  document.querySelectorAll("[data-hook]").forEach(function(h){ h.addEventListener("click", function(ev){ var t = document.querySelector(h.getAttribute("href")); if (!t) return; ev.preventDefault(); t.scrollIntoView({behavior: reduced ? "auto" : "smooth", block: "start"}); }); }); })();

}catch(e){ showAll(); if (window.console) console.error(e); }
})();

(function(){
  var btn = document.querySelector("[data-pal-open]"), wrap = document.getElementById("palwrap"),
      back = document.querySelector("[data-pal-back]");
  if (!btn || !wrap) return;
  var opts = wrap.querySelectorAll("[data-pal-set]");
  function current(){ return document.documentElement.getAttribute("data-pal") || "haldi"; }
  function mark(){ var c = current(); for (var i=0;i<opts.length;i++) opts[i].setAttribute("aria-pressed", String(opts[i].getAttribute("data-pal-set") === c)); }
  function open(v){ wrap.classList.toggle("open", v); if (back) back.classList.toggle("open", v); btn.setAttribute("aria-expanded", String(v)); }
  btn.addEventListener("click", function(e){ e.preventDefault(); mark(); open(true); });
  var close = wrap.querySelector("[data-pal-close]");
  if (close) close.addEventListener("click", function(){ open(false); });
  if (back) back.addEventListener("click", function(){ open(false); });
  for (var i=0;i<opts.length;i++) opts[i].addEventListener("click", function(){
    var id = this.getAttribute("data-pal-set");
    if (id === "haldi") document.documentElement.removeAttribute("data-pal");
    else document.documentElement.setAttribute("data-pal", id);
    try { localStorage.setItem("mv-pal", id); } catch(e){}
    mark();
  });
  document.addEventListener("keydown", function(e){ if (e.key === "Escape" && wrap.classList.contains("open")) open(false); });
  mark();
})();

/* ---------- petals fall the length of the page and build a turning helix ---------- */
(function(){
  var cv = document.querySelector("[data-petalfall]"); if (!cv) return;
  var sec = document.querySelector("[data-sci]"), stage = sec && sec.querySelector("[data-scistage]");
  var ctx = cv.getContext("2d");
  var W = 0, H = 0, dpr = 1, raf = 0, running = false, narrow = false;
  var fall = [], slots = [], sprites = [], rungT = [];
  var phase = 0, SPIN = 0.0024, TURNS = 4.5, FOCAL = 620, TILT = -1.02, CT = Math.cos(TILT), ST = Math.sin(TILT);
  var CX = 0, TOP = 0, HH = 0, RAD = 0, LEN = 0, TUBE = 0, MIDY = 0;
  /* the stage is measured against the document once, then tracked by scroll offset, so the
     animation loop performs no layout reads at all */
  var docTop = 0, docCx = 0, buf = [], tick = 0;

  function rnd(a,b){ return a + Math.random()*(b-a); }

  /* ---- one glossy bead per size bucket, drawn once, then only blitted ---- */
  var BUCKETS = 11, RMIN = 1.6, RMAX = 7.0;
  function buildSprites(){
    sprites.length = 0;
    for (var i=0;i<BUCKETS;i++){
      var r = RMIN + (RMAX - RMIN)*i/(BUCKETS-1);
      var pad = Math.ceil(r*1.5), s = pad*2;
      var c = document.createElement("canvas");
      c.width = Math.ceil(s*dpr); c.height = Math.ceil(s*dpr);
      var g = c.getContext("2d"); g.setTransform(dpr,0,0,dpr,0,0);
      var halo = g.createRadialGradient(pad, pad, r*0.78, pad, pad, r*1.45);
      halo.addColorStop(0, "rgba(232,140,46,.40)");
      halo.addColorStop(1, "rgba(232,140,46,0)");
      g.fillStyle = halo; g.beginPath(); g.arc(pad, pad, r*1.45, 0, 6.2832); g.fill();
      var body = g.createRadialGradient(pad - r*0.38, pad - r*0.42, r*0.08, pad, pad, r);
      body.addColorStop(0,    "rgba(255,241,214,1)");
      body.addColorStop(0.22, "rgba(250,200,124,1)");
      body.addColorStop(0.55, "rgba(233,126,30,1)");
      body.addColorStop(0.86, "rgba(190,84,14,1)");
      body.addColorStop(1,    "rgba(140,57,8,1)");
      g.fillStyle = body; g.beginPath(); g.arc(pad, pad, r, 0, 6.2832); g.fill();
      g.globalAlpha = .5; g.fillStyle = "#fff";
      g.beginPath(); g.ellipse(pad - r*0.34, pad - r*0.40, r*0.26, r*0.16, -0.6, 0, 6.2832); g.fill();
      sprites.push({ c: c, pad: pad });
    }
  }
  function bead(x, y, r, alpha){
    var i = Math.round((r - RMIN)/(RMAX - RMIN)*(BUCKETS-1));
    if (i < 0) i = 0; else if (i > BUCKETS-1) i = BUCKETS-1;
    var sp = sprites[i], d = sp.pad*2;
    ctx.globalAlpha = alpha;
    ctx.drawImage(sp.c, x - sp.pad, y - sp.pad, d, d);
  }

  var PCOL = ["rgba(224,122,31,.55)","rgba(242,162,76,.5)","rgba(201,162,74,.45)","rgba(184,92,18,.5)"];
  function petal(p){
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a);
    ctx.globalAlpha = p.al; ctx.fillStyle = p.c;
    var r = p.r;
    ctx.beginPath(); ctx.moveTo(0,-r);
    ctx.bezierCurveTo(r*.92,-r*.52, r*.78, r*.52, 0, r);
    ctx.bezierCurveTo(-r*.78, r*.52, -r*.92,-r*.52, 0,-r);
    ctx.closePath(); ctx.fill(); ctx.restore();
  }
  function makeFall(fromTop){
    return { x: rnd(0, W), y: fromTop ? rnd(-H*0.45, -12) : rnd(-H*0.4, H),
             r: rnd(3.4, 6.8), vy: rnd(.5, 1.15), a: rnd(0, 6.283), spin: rnd(-.016, .016),
             ph: rnd(0, 6.283), al: rnd(.3, .55), c: PCOL[(Math.random()*PCOL.length)|0],
             seat: -1, grab: 0 };
  }

  function measure(){
    narrow = W < 900;
    if (!stage) return;
    var sr = stage.getBoundingClientRect();
    docTop = sr.top + (window.pageYOffset || 0);
    docCx  = sr.left + sr.width/2 + (window.pageXOffset || 0);
    HH = sr.height;
    LEN  = Math.min(HH*0.64, narrow ? 215 : 300);   /* about half the old axis length, with
                                                      enough pitch that the two strands stay apart */
    MIDY = HH/2;
    RAD  = Math.min(sr.width*0.24, narrow ? 46 : 66);
    TUBE = narrow ? 6.2 : 8.4;                       /* a tight bundle, so the curl reads as rope */
    track();
  }
  function track(){
    TOP = docTop - (window.pageYOffset || 0);
    CX  = docCx  - (window.pageXOffset || 0);
  }

  function buildSeats(){
    var n = narrow ? 620 : 1200;
    slots.length = 0;
    for (var i=0;i<n;i++){
      var u = Math.random()*6.2832, v = Math.sqrt(Math.random());
      slots.push({ t: (i>>1)/((n>>1)-1), side: i & 1, filled: Math.random() < .93,
                   claimed: false, life: rnd(0, 26), r: rnd(2.9, 6.1),
                   or: Math.cos(u)*v*TUBE, oy: Math.sin(u)*v*TUBE, oz: Math.cos(u+1.7)*v*TUBE });
    }
  }

  function resize(){
    dpr = Math.min(window.innerWidth < 760 ? 1.4 : 1.75, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W*dpr); cv.height = Math.round(H*dpr);
    cv.style.width = W + "px"; cv.style.height = H + "px";
    ctx.setTransform(dpr,0,0,dpr,0,0);
    buildSprites();
    var want = W < 760 ? 9 : 16;
    while (fall.length < want) fall.push(makeFall(false));
    fall.length = want;
    narrow = W < 900;
    if (!slots.length) buildSeats();
    measure();
  }

  function lean(x, y){
    var dx = x - CX, dy = y - (TOP + MIDY);
    return { x: CX + dx*CT - dy*ST, y: TOP + MIDY + dx*ST + dy*CT };
  }
  function axisY(t){ return TOP + MIDY - LEN/2 + t*LEN; }
  function seatPos(s){
    var ang = s.t*TURNS*6.2832 + phase + (s.side ? Math.PI : 0);
    var rr = RAD + s.or;
    var z = Math.cos(ang)*rr + s.oz, k = FOCAL/(FOCAL + z);
    var q = lean(CX + Math.sin(ang)*rr*k, axisY(s.t) + s.oy);
    return { x: q.x, y: q.y, k: k, z: z };
  }

  function byZ(m,n){ return m.z - n.z; }
  function freeSeat(){
    for (var i=0;i<slots.length;i++) if (!slots[i].filled && !slots[i].claimed) return i;
    return -1;
  }

  function drawHelix(){
    if (!stage) return;
    for (var side=0; side<2; side++){
      ctx.beginPath();
      for (var i=0;i<=96;i++){
        var t = i/96, ang = t*TURNS*6.2832 + phase + (side ? Math.PI : 0);
        var z = Math.cos(ang)*RAD, k = FOCAL/(FOCAL + z);
        var q = lean(CX + Math.sin(ang)*RAD*k, axisY(t));
        i ? ctx.lineTo(q.x,q.y) : ctx.moveTo(q.x,q.y);
      }
      ctx.globalAlpha = .12; ctx.lineWidth = 1.4; ctx.strokeStyle = "rgba(170,86,20,.7)"; ctx.stroke();
    }
    ctx.lineWidth = 1.5; ctx.strokeStyle = "rgba(150,74,16,.85)";
    for (var p=0;p+1<slots.length;p+=90){
      if (!slots[p].filled && !slots[p+1].filled) continue;
      var a = seatPos(slots[p]), b = seatPos(slots[p+1]);
      ctx.globalAlpha = Math.max(.07, .32*((a.k + b.k)/2 - .78));
      ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
    }
    var n = 0;
    for (var s=0;s<slots.length;s++){
      if (!slots[s].filled) continue;
      var pos = seatPos(slots[s]);
      var rec = buf[n] || (buf[n] = { x:0, y:0, k:0, z:0, r:0 });
      rec.x = pos.x; rec.y = pos.y; rec.k = pos.k; rec.z = pos.z; rec.r = slots[s].r;
      n++;
    }
    var view = buf.length === n ? buf : buf.slice(0, n);
    view.sort(byZ);
    for (var v=0;v<n;v++){
      var it = view[v];
      bead(it.x, it.y, it.r*it.k, Math.max(.3, Math.min(1, it.k*it.k)));
    }
  }

  function step(){
    raf = 0; if (!running) return;
    ctx.clearRect(0,0,W,H);
    phase += SPIN;
    if (stage){ track(); if ((++tick & 63) === 0) measure(); }   /* re-measure about once a second */
    var onScreen = !!stage && TOP < H + 100 && TOP + HH > -100;
    var past = !!stage && (TOP + HH) < 0;   /* the helix is the end of the fall, so nothing below it */

    for (var i=0;i<fall.length;i++){
      var p = fall[i];
      if (p.seat >= 0){
        var s = slots[p.seat];
        if (!onScreen){ s.claimed = false; p.seat = -1; p.al = .4; continue; }
        var pos = seatPos(s);
        p.grab += .035;
        var e = p.grab < 1 ? p.grab*p.grab*(3-2*p.grab) : 1;
        p.x += (pos.x - p.x)*(.07 + .15*e);
        p.y += (pos.y - p.y)*(.07 + .15*e);
        p.a += p.spin*(1-e);
        p.al = .45 + .45*e;
        if (e >= 1 && Math.abs(p.x-pos.x) < 2.5 && Math.abs(p.y-pos.y) < 2.5){
          s.filled = true; s.claimed = false; s.life = 0;
          fall[i] = makeFall(true);
          continue;
        }
        petal(p);
        continue;
      }
      if (past) continue;                       /* scrolled below the helix: the air is clear */
      p.y += p.vy; p.ph += .01; p.a += p.spin; p.x += Math.cos(p.ph)*.35;
      if (onScreen && p.y > TOP - H*0.45 && p.y < TOP + HH){
        var fs = freeSeat();
        if (fs >= 0){ p.seat = fs; slots[fs].claimed = true; p.grab = 0; }
      }
      if (onScreen && p.y > TOP + HH - 12){     /* every seat taken: absorb it rather than let it pass */
        p.al -= .03;
        if (p.al <= 0){ fall[i] = makeFall(true); continue; }
      }
      if (p.y > H + 26){ fall[i] = makeFall(true); continue; }
      petal(p);
    }

    if (onScreen){
      for (var k=0;k<slots.length;k++){
        var sl = slots[k];
        if (!sl.filled) continue;
        sl.life += .016;
        if (sl.life > 18 && Math.random() < .00014){ sl.filled = false; sl.life = 0; }
      }
      drawHelix();
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(step);
  }

  function start(){ if (running) return; running = true; if (!raf) raf = requestAnimationFrame(step); }
  function stop(){ running = false; if (raf){ cancelAnimationFrame(raf); raf = 0; } }

  var reducedQ = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  resize();
  if (reducedQ){
    for (var z=0;z<slots.length;z++) slots[z].filled = true;
    measure(); ctx.clearRect(0,0,W,H); drawHelix();
    return;
  }
  var rt = 0;
  window.addEventListener("resize", function(){ clearTimeout(rt); rt = setTimeout(resize, 160); }, { passive: true });
  document.addEventListener("visibilitychange", function(){ document.hidden ? stop() : start(); });
  start();
})();

