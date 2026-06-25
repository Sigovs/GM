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
    { id: "s3500xd24", year: 2024, make: "Mercedes-Benz", model: "Sprinter 3500XD", trim: "High Roof 4-Cyl Diesel HO", price: 62900, mileage: 12980,  drivetrain: "RWD", transmission: "7G-TRONIC", body: "High Roof Cargo",  color: "Arctic White", image: IMG + "van-12.jpg", featured: true },
    { id: "s4500_22",  year: 2022, make: "Mercedes-Benz", model: "Sprinter 4500",   trim: "High Roof V6",             price: 54900, mileage: 41300,  drivetrain: "RWD", transmission: "7G-TRONIC", body: "Extended Cargo",   color: "Arctic White", image: IMG + "van-07.jpg" },
    { id: "s2500d_23", year: 2023, make: "Mercedes-Benz", model: "Sprinter 2500",   trim: "High Roof 4-Cyl Diesel",   price: 48500, mileage: 28770,  drivetrain: "RWD", transmission: "7G-TRONIC", body: "Crew Van",         color: "Arctic White", image: IMG + "van-03.jpg" },
    { id: "s2500v6_21",year: 2021, make: "Mercedes-Benz", model: "Sprinter 2500",   trim: "High Roof V6",             price: 39900, mileage: 63210,  drivetrain: "RWD", transmission: "7G-TRONIC", body: "Cargo Van",        color: "Arctic White", image: IMG + "van-01.jpg" },
    { id: "s2500v6_18",year: 2018, make: "Mercedes-Benz", model: "Sprinter 2500",   trim: "High Roof V6",             price: 24495, mileage: 135777, drivetrain: "RWD", transmission: "7G-TRONIC", body: "Cargo Van",        color: "Arctic White", image: IMG + "van-02.jpg" },
    { id: "exec_conv", year: 2019, make: "Mercedes-Benz", model: "Sprinter 3500",   trim: "Executive Lounge Conversion", price: 89900, mileage: 47500, drivetrain: "RWD", transmission: "7G-TRONIC", body: "Luxury Conversion", color: "Obsidian Black", image: IMG + "van-04.jpg" }
  ];

  var usd = function (n) { return "$" + n.toLocaleString("en-US"); };
  var mi  = function (n) { return n.toLocaleString("en-US") + " mi"; };
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  document.addEventListener("DOMContentLoaded", function () {
    $all("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

    var featured = INVENTORY.filter(function (v) { return v.featured; })[0] || INVENTORY[0];
    renderPanel(featured);
    buildCarousel();
    initNav();
    initReveal();
    initStats();
    initParallax();
    initForm();
  });

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
            '<a href="vehicle.html" class="v-card__cta">View Details <i class="bi bi-arrow-right arrow"></i></a>' +
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
        var max = r.height * 0.22;            // stay within the bg overflow, no edge reveal
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
