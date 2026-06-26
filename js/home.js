/* ============================================================
   GM MOTORS NY — homepage interactions
   Vanilla JS. Drives hero, featured panel, and carousel from a
   single inventory data array so images/data swap in one place.
   ============================================================ */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- inventory data (single source of truth) ---------- */
  var IMG = "assets/img/vans/";
  var INVENTORY = [
    { id: "s3500xd24", year: 2024, make: "Mercedes-Benz", model: "Sprinter 3500XD", trim: "High Roof 4-Cyl Diesel HO", price: 62900,  mileage: 12980,  drivetrain: "RWD",    transmission: "7G-TRONIC",    body: "High Roof Cargo",   color: "Arctic White",  image: IMG + "van-12.jpg", featured: true },
    { id: "s4500_22",  year: 2022, make: "Mercedes-Benz", model: "Sprinter 4500",   trim: "High Roof V6",                price: 54900,  mileage: 41300,  drivetrain: "RWD",    transmission: "7G-TRONIC",    body: "Extended Cargo",    color: "Arctic White",  image: IMG + "van-07.jpg" },
    { id: "s2500d_23", year: 2023, make: "Mercedes-Benz", model: "Sprinter 2500",   trim: "High Roof 4-Cyl Diesel",      price: 48500,  mileage: 28770,  drivetrain: "RWD",    transmission: "7G-TRONIC",    body: "Crew Van",          color: "Arctic White",  image: IMG + "van-03.jpg" },
    { id: "transit350",year: 2024, make: "Ford",          model: "Transit 350",     trim: "High Roof EcoBoost",          price: 46995,  mileage: 9150,   drivetrain: "AWD",    transmission: "10-Speed Auto", body: "High Roof Cargo",  color: "Oxford White",  image: IMG + "van-08.jpg" },
    { id: "fl3500_23", year: 2023, make: "Freightliner",  model: "Sprinter 3500",   trim: "Crew 4-Cyl Diesel",           price: 51900,  mileage: 22400,  drivetrain: "RWD",    transmission: "7G-TRONIC",    body: "Crew Van",          color: "Selenite Grey", image: IMG + "van-06.jpg" },
    { id: "s2500v6_21",year: 2021, make: "Mercedes-Benz", model: "Sprinter 2500",   trim: "High Roof V6",                price: 39900,  mileage: 63210,  drivetrain: "RWD",    transmission: "7G-TRONIC",    body: "Cargo Van",         color: "Arctic White",  image: IMG + "van-01.jpg" },
    { id: "firstclass",year: 2022, make: "Mercedes-Benz", model: "Sprinter 3500",   trim: "First-Class Lounge Conversion", price: 139495, mileage: 18900, drivetrain: "4MATIC", transmission: "7G-TRONIC",    body: "Luxury Conversion", color: "Obsidian Black", image: IMG + "van-10.jpg" },
    { id: "exec_conv", year: 2019, make: "Mercedes-Benz", model: "Sprinter 3500",   trim: "Executive Lounge Conversion", price: 89900,  mileage: 47500,  drivetrain: "RWD",    transmission: "7G-TRONIC",    body: "Luxury Conversion", color: "Obsidian Black", image: IMG + "van-04.jpg" },
    { id: "transit250",year: 2020, make: "Ford",          model: "Transit 250",     trim: "Medium Roof EcoBoost",        price: 32900,  mileage: 78400,  drivetrain: "RWD",    transmission: "10-Speed Auto", body: "Cargo Van",        color: "Magnetic Grey", image: IMG + "van-11.jpg" },
    { id: "s2500_18",  year: 2018, make: "Mercedes-Benz", model: "Sprinter 2500",   trim: "High Roof V6",                price: 24495,  mileage: 135777, drivetrain: "RWD",    transmission: "7G-TRONIC",    body: "Passenger Van",     color: "Arctic White",  image: IMG + "van-02.jpg" },
    { id: "s2500_17",  year: 2017, make: "Mercedes-Benz", model: "Sprinter 2500",   trim: "Standard Roof 4-Cyl Diesel",  price: 20495,  mileage: 142300, drivetrain: "RWD",    transmission: "7G-TRONIC",    body: "Cargo Van",         color: "Arctic White",  image: IMG + "van-09.jpg" }
  ];

  var usd = function (n) { return "$" + n.toLocaleString("en-US"); };
  var mi  = function (n) { return n.toLocaleString("en-US") + " mi"; };
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  document.addEventListener("DOMContentLoaded", function () {
    $all("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

    var featured = INVENTORY.filter(function (v) { return v.featured; })[0] || INVENTORY[0];
    renderPanel(featured);
    initHeroSlider();
    initReviews();
    buildCarousel();
    initNav();
    initReveal();
    initStats();
    initParallax();
    initLux360();
    initInspectedGlow();
    initForm();
  });

  /* ---------- google reviews (paginated) ---------- */
  var REVIEWS = [
    { initial: "D", name: "Dominic Russo",  text: "Found the exact Sprinter spec my business needed, did the whole deal from my office, and it showed up clean and ready to work. Easiest van purchase I've made." },
    { initial: "P", name: "Priya Nair",     text: "They gave me a real trade number on my old van in minutes — no games — and beat my local dealer. Delivery to another state was completely seamless. This is how it should be done." },
    { initial: "G", name: "Garrett Hale",   text: "Financing was quick and transparent, and the team actually knew the vans. The Sprinter was exactly as described — I'll be back for the next one for our fleet." },
    { initial: "M", name: "Marcus Delgado", text: "Bought a 3500XD for our delivery routes sight-unseen and it showed up exactly as listed. Zero drama, and it's been on the road every day since." },
    { initial: "T", name: "Tanya Brooks",   text: "They walked me through the whole inspection before I paid a cent. Felt like buying from someone I trust, not a lot full of question marks." },
    { initial: "W", name: "Wesley Okafor",  text: "Door-to-door delivery all the way to Texas was on time and the van was spotless. We'll buy the next one for the company here too." }
  ];

  function initReviews() {
    var root = $("[data-reviews-grid]");
    var track = $("[data-rev-track]");
    var dotsWrap = $("[data-reviews-dots]");
    if (!root || !track) return;

    function card(r) {
      return '<article class="review">' +
        '<div class="review__stars" aria-label="5 out of 5 stars">★★★★★</div>' +
        '<p class="review__text">"' + r.text + '"</p>' +
        '<div class="review__who"><span class="review__avatar">' + r.initial + '</span>' +
        '<div><div class="review__name">' + r.name + '</div>' +
        '<div class="review__src"><i class="bi bi-google"></i> Google Review</div></div></div>' +
        '</article>';
    }
    track.innerHTML = REVIEWS.map(card).join("");

    var viewport = track.parentElement;
    var prev = $("[data-rev-prev]");
    var next = $("[data-rev-next]");
    var cards = $all(".review", track);
    var index = 0, perView = 3, maxIndex = 0;

    function perFor() { var w = window.innerWidth; return w <= 640 ? 1 : (w <= 980 ? 2 : 3); }
    function step() { var gap = parseFloat(getComputedStyle(track).gap) || 0; return cards[0].getBoundingClientRect().width + gap; }
    function render() { track.style.transform = "translateX(" + (-index * step()) + "px)"; sync(); }
    function sync() {
      if (dotsWrap) $all("button", dotsWrap).forEach(function (d, i) { d.classList.toggle("is-active", i === index); });
      if (prev) prev.disabled = index <= 0;
      if (next) next.disabled = index >= maxIndex;
    }
    function dots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      for (var i = 0; i <= maxIndex; i++) {
        var b = document.createElement("button");
        b.className = "carousel__dot"; b.type = "button";
        b.setAttribute("aria-label", "Reviews slide " + (i + 1));
        (function (i) { b.addEventListener("click", function () { index = i; render(); }); })(i);
        dotsWrap.appendChild(b);
      }
    }
    function layout() {
      perView = perFor();
      root.style.setProperty("--per", perView);
      maxIndex = Math.max(0, cards.length - perView);
      if (index > maxIndex) index = maxIndex;
      dots(); render();
    }

    if (prev) prev.addEventListener("click", function () { index = Math.max(0, index - 1); render(); });
    if (next) next.addEventListener("click", function () { index = Math.min(maxIndex, index + 1); render(); });

    var dragging = false, startX = 0, startTx = 0, curTx = 0, moved = false;
    function clampTx(tx) { var min = -maxIndex * step(), max = 0; if (tx > max) return max + (tx - max) * 0.35; if (tx < min) return min + (tx - min) * 0.35; return tx; }
    viewport.addEventListener("pointerdown", function (e) {
      if (e.button != null && e.button !== 0) return;
      dragging = true; moved = false; startX = e.clientX; startTx = -index * step(); curTx = startTx;
      track.style.transition = "none"; viewport.classList.add("is-dragging");
      try { viewport.setPointerCapture(e.pointerId); } catch (_) {}
    });
    viewport.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX; if (Math.abs(dx) > 4) moved = true;
      curTx = clampTx(startTx + dx); track.style.transform = "translateX(" + curTx + "px)";
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false; track.style.transition = ""; viewport.classList.remove("is-dragging");
      index = Math.max(0, Math.min(maxIndex, Math.round(-curTx / step()))); render();
    }
    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);
    viewport.addEventListener("click", function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);

    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(layout, 120); });
    layout();
  }

  /* ---------- luxury breaker: 360° look-around on hover ---------- */
  function initLux360() {
    var lux = document.querySelector(".breaker--lux");
    if (!lux || prefersReduced) return;
    var img = lux.querySelector(".breaker__bg img");
    if (!img) return;
    lux.addEventListener("pointermove", function (e) {
      var r = lux.getBoundingClientRect();
      var nx = ((e.clientX - r.left) / r.width - 0.5) * 2;   // -1..1
      var ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
      img.style.transition = "transform .3s var(--ease)";
      img.style.transform = "translate(" + (-nx * 105) + "px," + (-ny * 52) + "px) scale(1.16)";
    });
    lux.addEventListener("pointerleave", function () {
      img.style.transition = "transform .8s var(--ease)";
      img.style.transform = "translate(0,0) scale(1.16)";
    });
  }

  /* ---------- Buy With Confidence: twin glow follows the cursor ---------- */
  function initInspectedGlow() {
    var sec = document.querySelector(".inspected");
    if (!sec || prefersReduced) return;
    sec.addEventListener("pointermove", function (e) {
      var r = sec.getBoundingClientRect();
      sec.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
      sec.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
    });
    sec.addEventListener("pointerleave", function () {
      sec.style.removeProperty("--mx");
      sec.style.removeProperty("--my");
    });
  }

  /* ---------- hero background slider ---------- */
  /* Image slides auto-advance after a fixed delay; the video slide plays to the
     end first, then advances. Dots give manual control. */
  function initHeroSlider() {
    var slides = $all(".hero__slide");
    if (slides.length < 2) return;
    var dotsWrap = $("[data-hero-dots]");
    var IMG_MS = 6000;
    var i = 0, timer = null;

    // per-slide hero copy — swapped as the background changes
    var heroIntro = { eyebrow: $(".hero__eyebrow"), title: $(".hero__title"), sub: $("[data-hero-sub]"), marker: $(".hero__marker") };
    var HERO_TEXT = [
      { eyebrow: "Vans that earn their keep", marker: "Featured",
        lines: ["The right van —", "ready to work,", "delivered."],
        sub: "Quality pre-owned Sprinter, Transit & ProMaster vans for work and travel — inspected, financed, and delivered to all 50 states." },
      { eyebrow: "Delivered nationwide", marker: "Delivery",
        lines: ["Buy from home.", "We bring the", "van to you."],
        sub: "Shop online, lock in your price, and we handle insured door-to-door transport to any of the 50 states." },
      { eyebrow: "Financing & trade", marker: "Financing",
        lines: ["Real numbers.", "No games.", "Drive sooner."],
        sub: "A straight value on your current van and competitive financing — sorted before you ever leave the house." }
    ];
    function reanimate(el) { if (!el) return; el.classList.remove("hero-swap"); void el.offsetWidth; el.classList.add("hero-swap"); }
    function setHeroText(n) {
      var c = HERO_TEXT[n]; if (!c) return;
      if (heroIntro.eyebrow) { heroIntro.eyebrow.textContent = c.eyebrow; reanimate(heroIntro.eyebrow); }
      if (heroIntro.title) heroIntro.title.innerHTML = c.lines.map(function (l) { return "<span>" + l + "</span>"; }).join("");
      if (heroIntro.sub) { heroIntro.sub.textContent = c.sub; reanimate(heroIntro.sub); }
      if (heroIntro.marker) { heroIntro.marker.innerHTML = '<span class="num">' + ("0" + (n + 1)).slice(-2) + '</span><span>' + c.marker + '</span>'; reanimate(heroIntro.marker); }
    }

    function clearTimer() { if (timer) { window.clearTimeout(timer); timer = null; } }

    function schedule() {
      clearTimer();
      if (prefersReduced) return;
      var vid = slides[i].querySelector("video");
      if (vid) {
        try { vid.currentTime = 0; var p = vid.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
        // fallback in case 'ended' never fires (e.g., load issue)
        var dur = (vid.duration && isFinite(vid.duration)) ? vid.duration * 1000 + 1500 : 16000;
        timer = window.setTimeout(function () { go(i + 1); }, dur);
      } else {
        timer = window.setTimeout(function () { go(i + 1); }, IMG_MS);
      }
    }

    function go(n) {
      var prev = slides[i];
      prev.classList.remove("is-active");
      var pv = prev.querySelector("video"); if (pv) pv.pause();
      i = (n + slides.length) % slides.length;
      slides[i].classList.add("is-active");
      setHeroText(i);
      if (dotsWrap) $all("button", dotsWrap).forEach(function (d, k) { d.classList.toggle("is-active", k === i); });
      schedule();
    }

    slides.forEach(function (slide) {
      var v = slide.querySelector("video");
      if (v) v.addEventListener("ended", function () { if (slide.classList.contains("is-active")) go(i + 1); });
    });

    if (dotsWrap) {
      slides.forEach(function (_, k) {
        var b = document.createElement("button");
        b.className = "hero__dot" + (k === 0 ? " is-active" : "");
        b.type = "button";
        b.setAttribute("aria-label", "Show hero slide " + (k + 1));
        b.addEventListener("click", function () { go(k); });
        dotsWrap.appendChild(b);
      });
    }
    schedule();
  }

  /* ---------- floating featured panel ---------- */
  function renderPanel(v) {
    var p = $("[data-panel]");
    if (!p) return;
    var img = $("[data-panel-img]", p);
    if (img) { img.src = v.image; img.alt = v.year + " " + v.make + " " + v.model; }
    $("[data-panel-badge]", p).textContent = v.body;
    $("[data-panel-name]", p).textContent = v.year + " " + v.make + " " + v.model;
    $("[data-panel-price]", p).textContent = usd(v.price);
  }

  /* ---------- featured inventory carousel ---------- */
  function cardHTML(v) {
    return '' +
      '<article class="v-card">' +
        '<div class="v-card__media">' +
          '<img src="' + v.image + '" alt="' + v.year + " " + v.make + " " + v.model + '" loading="lazy" />' +
          '<span class="v-card__badge">' + v.body + '</span>' +
          '<div class="v-card__actions">' +
            '<button type="button" class="qbtn"><i class="bi bi-images"></i>Photos</button>' +
            '<button type="button" class="qbtn"><i class="bi bi-cash-coin"></i>Finance</button>' +
            '<button type="button" class="qbtn"><i class="bi bi-arrow-left-right"></i>Trade</button>' +
            '<button type="button" class="qbtn"><i class="bi bi-send"></i>Send</button>' +
          '</div>' +
        '</div>' +
        '<div class="v-card__body">' +
          '<h3 class="v-card__name">' + v.year + " " + v.make + " " + v.model + '</h3>' +
          '<div class="v-card__meta">' +
            '<span>' + v.trim + '</span><span>' + mi(v.mileage) + '</span>' +
            '<span>' + v.drivetrain + '</span><span>' + v.transmission + '</span>' +
          '</div>' +
          '<div class="v-card__foot">' +
            '<span class="v-card__price">' + usd(v.price) + '</span>' +
            '<a href="#" class="v-card__cta">View Details <i class="bi bi-arrow-right arrow"></i></a>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function buildCarousel() {
    var track = $("[data-car-track]");
    if (!track) return;
    track.innerHTML = INVENTORY.map(cardHTML).join("");

    var carousel = track.closest(".carousel");
    var viewport = track.parentElement;
    var prev = $("[data-car-prev]");
    var next = $("[data-car-next]");
    var dotsWrap = $("[data-car-dots]");
    var cards = $all(".v-card", track);
    var index = 0, perView = 3, maxIndex = 0;

    function perFor() { var w = window.innerWidth; return w <= 640 ? 1 : (w <= 980 ? 2 : (w >= 1600 ? 4 : 3)); }
    function step() {
      var gap = parseFloat(getComputedStyle(track).gap) || 0;
      return cards[0].getBoundingClientRect().width + gap;
    }
    function render() { track.style.transform = "translateX(" + (-index * step()) + "px)"; sync(); }
    function sync() {
      if (prev) prev.disabled = index <= 0;
      if (next) next.disabled = index >= maxIndex;
      if (dotsWrap) $all("button", dotsWrap).forEach(function (d, i) { d.classList.toggle("is-active", i === index); });
    }
    function dots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      for (var i = 0; i <= maxIndex; i++) {
        var b = document.createElement("button");
        b.className = "carousel__dot";
        b.setAttribute("aria-label", "Go to slide " + (i + 1));
        (function (i) { b.addEventListener("click", function () { index = i; render(); }); })(i);
        dotsWrap.appendChild(b);
      }
    }
    function layout() {
      perView = perFor();
      carousel.style.setProperty("--per", perView);
      maxIndex = Math.max(0, cards.length - perView);
      if (index > maxIndex) index = maxIndex;
      dots();
      render();
    }

    if (prev) prev.addEventListener("click", function () { index = Math.max(0, index - 1); render(); });
    if (next) next.addEventListener("click", function () { index = Math.min(maxIndex, index + 1); render(); });

    // click-and-drag / touch-drag to scrub the carousel
    var dragging = false, startX = 0, startTx = 0, curTx = 0, moved = false;
    function clampTx(tx) {
      var min = -maxIndex * step(), max = 0;
      if (tx > max) return max + (tx - max) * 0.35;   // edge resistance
      if (tx < min) return min + (tx - min) * 0.35;
      return tx;
    }
    viewport.addEventListener("pointerdown", function (e) {
      if (e.button != null && e.button !== 0) return;
      dragging = true; moved = false;
      startX = e.clientX; startTx = -index * step(); curTx = startTx;
      track.style.transition = "none";
      viewport.classList.add("is-dragging");
      try { viewport.setPointerCapture(e.pointerId); } catch (_) {}
    });
    viewport.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      curTx = clampTx(startTx + dx);
      track.style.transform = "translateX(" + curTx + "px)";
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      track.style.transition = "";
      viewport.classList.remove("is-dragging");
      index = Math.max(0, Math.min(maxIndex, Math.round(-curTx / step())));
      render();
    }
    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);
    // a drag must not also fire a card link click
    viewport.addEventListener("click", function (e) {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);

    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(layout, 120); });
    layout();
  }

  /* ---------- navbar: solidify + mobile drawer ---------- */
  function initNav() {
    var nav = $(".nav");
    var toggle = $("[data-nav-toggle]");
    var drawer = $(".drawer");
    if (!nav) return;

    var onScroll = function () { nav.classList.toggle("is-scrolled", window.scrollY > 24); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (!toggle || !drawer) return;
    function close() {
      nav.classList.remove("is-open"); drawer.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false"); document.body.style.overflow = "";
    }
    function open() {
      nav.classList.add("is-open"); drawer.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true"); document.body.style.overflow = "hidden";
    }
    toggle.addEventListener("click", function () {
      nav.classList.contains("is-open") ? close() : open();
    });
    $all("a", drawer).forEach(function (a) { a.addEventListener("click", close); });
    window.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }

  /* ---------- staggered scroll reveal ---------- */
  function initReveal() {
    // Section heads: titles + eyebrows slide in from the left (stepped); supporting text rises from below.
    function decorateHead(container) {
      var i = 0;
      Array.prototype.forEach.call(container.children, function (child) {
        if (child.hasAttribute("data-reveal-group")) return; // leave staggered groups alone
        var title = child.matches(".eyebrow, h1, h2, h3, .section-title, .reviews__label");
        child.setAttribute("data-reveal", title ? "left" : "");
        child.style.setProperty("--d", (i * 0.14).toFixed(2) + "s");
        i++;
      });
    }
    $all(".nation__copy, .trade__copy, .about__copy, .inspected__copy, .fin__text, .reviews__head").forEach(function (w) {
      w.removeAttribute("data-reveal");
      decorateHead(w);
    });
    $all(".section-head > div:first-child").forEach(decorateHead);
    var finInner = $(".fin__inner");
    if (finInner) {
      finInner.removeAttribute("data-reveal");
      var finBtn = $(".fin__inner > .btn");
      if (finBtn) { finBtn.setAttribute("data-reveal", ""); finBtn.style.setProperty("--d", ".3s"); }
    }

    $all("[data-reveal-group]").forEach(function (g) {
      Array.prototype.slice.call(g.children).forEach(function (c, i) {
        c.style.setProperty("--d", (i * 0.08).toFixed(2) + "s");
      });
    });
    var items = $all("[data-reveal], [data-reveal-group] > *");
    if (!("IntersectionObserver" in window) || prefersReduced) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- count-up stats ---------- */
  function initStats() {
    var nums = $all("[data-count]");
    if (!nums.length) return;
    if (prefersReduced || !("IntersectionObserver" in window)) {
      nums.forEach(function (n) { n.textContent = n.getAttribute("data-count"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { countUp(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { io.observe(n); });
  }
  function countUp(node) {
    var target = parseInt(node.getAttribute("data-count"), 10);
    var dur = 1100, start = null;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      node.textContent = Math.round(eased * target);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- subtle parallax (hero bg + flagged elements) ---------- */
  function initParallax() {
    if (prefersReduced) return;
    var bg = $(".hero__bg");
    var items = $all("[data-parallax]");
    var ticking = false;
    function update() {
      var y = window.scrollY;
      if (bg && y < window.innerHeight) bg.style.transform = "translateY(" + (y * 0.18) + "px)";
      items.forEach(function (it) {
        var f = parseFloat(it.getAttribute("data-parallax")) || 0.04;
        var r = it.getBoundingClientRect();
        var off = (r.top + r.height / 2) - window.innerHeight / 2;
        var ty = off * -f;
        var maxFrac = parseFloat(it.getAttribute("data-parallax-max")) || 0.22;
        var max = r.height * maxFrac;         // stay within the bg overflow, no edge reveal
        if (ty > max) ty = max; else if (ty < -max) ty = -max;
        it.style.transform = "translateY(" + ty + "px)";
      });
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---------- trade/sell lead form ---------- */
  function initForm() {
    var form = $("[data-lead]");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      $all("input[required]", form).forEach(function (input) {
        if (!input.value.trim()) { ok = false; input.classList.add("is-error"); }
        else input.classList.remove("is-error");
      });
      if (!ok) return;
      var success = $("[data-lead-success]", form);
      $all(".field, .lead__submit, .lead__note", form).forEach(function (x) { x.style.display = "none"; });
      if (success) success.style.display = "block";
    });
    $all("input", form).forEach(function (input) {
      input.addEventListener("input", function () { input.classList.remove("is-error"); });
    });
  }
})();
