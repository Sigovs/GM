/* GM Motors NY — site JS
   Keep it small; let Bootstrap do the heavy lifting. */
(function () {
  "use strict";

  // Mark JS as available so reveal elements are only hidden when we can reveal them
  document.documentElement.classList.add("js");

  // Footer year
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  var root = document.documentElement;
  var header = document.querySelector("header.sticky-top");

  // Measure header height so the full-screen hero always fits the viewport
  function setHeaderHeight() {
    if (header) root.style.setProperty("--header-h", header.offsetHeight + "px");
  }
  setHeaderHeight();
  window.addEventListener("resize", setHeaderHeight);
  window.addEventListener("load", setHeaderHeight);

  // Soft shadow on the header once the page is scrolled
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Staggered scroll-reveal (transform/opacity only, respects reduced-motion)
  var groups = document.querySelectorAll("[data-reveal-group]");
  groups.forEach(function (g) {
    Array.prototype.forEach.call(g.children, function (child, i) {
      child.style.setProperty("--d", (i * 0.08).toFixed(2) + "s");
    });
  });
  var revealItems = document.querySelectorAll(".reveal, [data-reveal-group] > *");
  if ("IntersectionObserver" in window && revealItems.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealItems.forEach(function (el) { io.observe(el); });
    // Safety net: never leave content hidden if an observer callback is missed
    window.setTimeout(function () {
      revealItems.forEach(function (el) { el.classList.add("is-visible"); });
    }, 2500);
  } else {
    revealItems.forEach(function (el) { el.classList.add("is-visible"); });
  }

  // VDP gallery — swap the main image when a thumbnail is clicked
  var galleryMain = document.getElementById("galleryMain");
  var thumbWrap = document.querySelector("[data-gallery-thumbs]");
  if (galleryMain && thumbWrap) {
    thumbWrap.querySelectorAll("button[data-full]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        galleryMain.src = btn.getAttribute("data-full");
        thumbWrap.querySelectorAll(".is-active").forEach(function (a) {
          a.classList.remove("is-active");
        });
        btn.classList.add("is-active");
      });
    });
  }

  // Close the mobile navbar after tapping an in-page anchor
  var nav = document.getElementById("nav");
  if (nav) {
    nav.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function () {
        var open = bootstrap.Collapse.getInstance(nav);
        if (open && nav.classList.contains("show")) open.hide();
      });
    });
  }
})();
