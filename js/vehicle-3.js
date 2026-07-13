/* ============================================================
   GM MOTORS — VEHICLE DETAIL PAGE (VDP) logic
   Reads ?id= from the URL, populates from GM_INVENTORY.
   ============================================================ */
(function () {
  "use strict";
  var DATA = window.GM_INVENTORY || [];
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var usd = function (n) { return "$" + n.toLocaleString("en-US"); };
  var miles = function (n) { return n.toLocaleString("en-US") + " mi"; };

  function byId(id) { for (var i = 0; i < DATA.length; i++) if (DATA[i].id === id) return DATA[i]; return null; }
  var params = new URLSearchParams(location.search);
  var V = byId(params.get("id")) || DATA[0];
  if (!V) { location.replace("inventory3.html"); return; }

  var TITLE = V.year + " " + V.make + " " + V.model;

  /* ---------- derive extra specs ---------- */
  function engine() {
    if (V.engine) return V.engine;
    if (V.make === "Ford") return "3.5L EcoBoost V6";
    if (/Diesel/.test(V.trim)) return "4-Cyl Turbo Diesel";
    if (/V6/.test(V.trim)) return "V6 Gas";
    return "—";
  }
  function fuel() { return V.fuel ? V.fuel : (V.make === "Ford" || /V6/.test(V.trim)) ? "Gasoline" : "Diesel"; }
  function driveLong() { return V.drivetrain === "RWD" ? "Rear-wheel drive" : V.drivetrain === "AWD" ? "All-wheel drive" : V.drivetrain === "4MATIC" ? "4MATIC all-wheel drive" : V.drivetrain; }
  var STOCK = V.stock ? ("GM-" + V.stock) : ("GM-" + V.id.toUpperCase().replace(/[^A-Z0-9]/g, ""));

  /* ---------- head / title / breadcrumb ---------- */
  document.title = TITLE + " — GM Motors NY";
  $("[data-doc-title]") && ($("[data-doc-title]").textContent = TITLE + " — GM Motors NY");
  $("[data-crumb]").textContent = TITLE;
  $("[data-title]").textContent = TITLE;
  $("[data-trim]").textContent = V.trim + " · " + V.body;
  $("[data-price]").textContent = usd(V.price);

  /* status */
  var statusEl = $("[data-status-eyebrow]");
  if (V.status === "sold") { statusEl.textContent = "Sold"; statusEl.style.color = "var(--ink-soft)"; }
  else if (V.status === "pending") { statusEl.textContent = "Sale in Progress"; statusEl.style.color = "#B7791F"; }

  /* ---------- description ---------- */
  var descEl = $("[data-desc]");
  if (descEl) {
    descEl.textContent = "This " + TITLE + " (" + V.trim + ") is a " + V.body.toLowerCase() + " with " +
      miles(V.mileage) + " on the clock, " + driveLong().toLowerCase() + ", and the " + V.transmission +
      " transmission. It's been multi-point inspected, serviced, and detailed — buy the whole thing online and we deliver it insured to your door, anywhere in the 50 states.";
  }

  /* ---------- gallery (media-aware: photos + optional walkaround video) ---------- */
  function buildMedia() {
    if (V.media && V.media.length) return V.media;
    var imgs = (V.images && V.images.length)
      ? V.images.slice()
      : [V.image].concat(DATA.map(function (v) { return v.image; }).filter(function (p) { return p !== V.image; })).slice(0, 6);
    var list = imgs.map(function (src) { return { type: "image", src: src }; });
    if (V.video && V.video.src) {
      // slot the video in as the 2nd item so the beauty shot still leads
      list.splice(list.length > 1 ? 1 : list.length, 0, { type: "video", src: V.video.src, poster: V.video.poster || imgs[0] });
    }
    return list;
  }
  var media = buildMedia();
  var imgCount = media.filter(function (m) { return m.type === "image"; }).length;
  var vidCount = media.length - imgCount;
  var gi = 0;
  var mainStage = $("[data-gallery-main]");
  var mainImg = $("[data-main-img]");
  var mainVideo = $("[data-main-video]");
  var playBtn = $("[data-play]");
  var muteBtn = $("[data-mute]");
  function setMuteUI(muted) {
    if (!muteBtn) return;
    muteBtn.classList.toggle("is-unmuted", !muted);
    muteBtn.querySelector("i").className = muted ? "bi bi-volume-mute-fill" : "bi bi-volume-up-fill";
    muteBtn.setAttribute("aria-label", muted ? "Turn sound on" : "Mute");
  }
  var counter = $("[data-gallery-counter]");
  var gallery = $("[data-gallery]");
  if (V.status === "sold") {
    gallery.classList.add("is-sold");
    gallery.insertAdjacentHTML("afterbegin", '<span class="v-card__status v-card__status--sold">Sold</span>');
  } else if (V.status === "pending") {
    gallery.insertAdjacentHTML("afterbegin", '<span class="v-card__status v-card__status--pending">Sale in Progress</span>');
  }
  // thumbnail carousel under the main image (Aston-style: arrows + paged strip)
  var thumbsWrap = $("[data-gallery-thumbs]");
  var thumbsVp = null;
  if (thumbsWrap) {
    thumbsWrap.innerHTML =
      '<button type="button" class="vdp__thumbs-arrow" data-thumbs-prev aria-label="Scroll thumbnails left"><i class="bi bi-chevron-left"></i></button>' +
      '<div class="vdp__thumbs-vp" data-thumbs-vp>' +
        media.map(function (m, k) {
          var poster = m.type === "video" ? (m.poster || "") : m.src;
          var badge = m.type === "video" ? '<span class="vdp__thumb-badge"><i class="bi bi-play-fill"></i></span>' : "";
          var label = m.type === "video" ? "walkaround video" : "photo " + (k + 1);
          return '<button type="button" class="vdp__thumb' + (m.type === "video" ? " vdp__thumb--video" : "") + '" data-thumb="' + k + '"><img src="' + poster + '" alt="' + TITLE + " — " + label + '" loading="lazy" />' + badge + "</button>";
        }).join("") +
      "</div>" +
      '<button type="button" class="vdp__thumbs-arrow" data-thumbs-next aria-label="Scroll thumbnails right"><i class="bi bi-chevron-right"></i></button>';
    thumbsVp = $("[data-thumbs-vp]", thumbsWrap);
    thumbsWrap.addEventListener("click", function (e) { var b = e.target.closest("[data-thumb]"); if (b) showMain(+b.getAttribute("data-thumb")); });
    $("[data-thumbs-prev]", thumbsWrap).addEventListener("click", function () { thumbsVp.scrollBy({ left: -thumbsVp.clientWidth * 0.8, behavior: "smooth" }); });
    $("[data-thumbs-next]", thumbsWrap).addEventListener("click", function () { thumbsVp.scrollBy({ left: thumbsVp.clientWidth * 0.8, behavior: "smooth" }); });
    var updThumbArrows = function () {
      var over = thumbsVp.scrollWidth > thumbsVp.clientWidth + 4;
      $$(".vdp__thumbs-arrow", thumbsWrap).forEach(function (a) { a.style.display = over ? "" : "none"; });
    };
    updThumbArrows();
    window.addEventListener("resize", updThumbArrows);
  }
  function stopMainVideo() {
    if (!mainVideo) return;
    mainVideo.pause();
    mainVideo.removeAttribute("src"); mainVideo.load();
    mainStage.classList.remove("is-playing");
  }
  function playMainVideo() {
    var m = media[gi];
    if (!m || m.type !== "video" || !mainVideo) return;
    mainVideo.src = m.src;
    mainVideo.muted = true; setMuteUI(true); // start muted; user can tap for sound
    mainStage.classList.add("is-playing");
    var p = mainVideo.play(); if (p && p.catch) p.catch(function () {});
  }
  function showMain(i) {
    gi = (i + media.length) % media.length;
    var m = media[gi];
    stopMainVideo();
    if (m.type === "video") {
      mainStage.classList.add("is-video");
      mainImg.src = m.poster || ""; mainImg.alt = TITLE + " — walkaround video";
    } else {
      mainStage.classList.remove("is-video");
      mainImg.src = m.src; mainImg.alt = TITLE + " — photo " + (gi + 1);
    }
    counter.textContent = (gi + 1) + " / " + media.length;
    if (thumbsVp) $$(".vdp__thumb", thumbsVp).forEach(function (t, k) {
      var on = k === gi; t.classList.toggle("is-active", on);
      if (on) {
        if (t.offsetLeft < thumbsVp.scrollLeft) thumbsVp.scrollTo({ left: t.offsetLeft - 8, behavior: "smooth" });
        else if (t.offsetLeft + t.offsetWidth > thumbsVp.scrollLeft + thumbsVp.clientWidth) thumbsVp.scrollTo({ left: t.offsetLeft + t.offsetWidth - thumbsVp.clientWidth + 8, behavior: "smooth" });
      }
    });
  }
  if (playBtn) playBtn.addEventListener("click", function (e) { e.stopPropagation(); playMainVideo(); });
  if (muteBtn) muteBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    if (!mainVideo) return;
    mainVideo.muted = !mainVideo.muted;
    setMuteUI(mainVideo.muted);
  });
  $("[data-gallery-prev]").addEventListener("click", function (e) { e.stopPropagation(); showMain(gi - 1); });
  $("[data-gallery-next]").addEventListener("click", function (e) { e.stopPropagation(); showMain(gi + 1); });
  if (media.length < 2) $(".vdp__arrows").style.display = "none";
  $("[data-viewall-count]").textContent = "View all " + imgCount + " photos" + (vidCount ? " + video" : "");
  showMain(0);

  // lightbox (media-aware: photos + video, prev/next, keyboard, counter)
  function openLightbox(start) {
    stopMainVideo();
    var i = start;
    var lb = document.createElement("div"); lb.className = "lb";
    var nav = media.length > 1
      ? '<button class="lb__btn lb__prev" aria-label="Previous"><i class="bi bi-chevron-left"></i></button><button class="lb__btn lb__next" aria-label="Next"><i class="bi bi-chevron-right"></i></button><span class="lb__counter"></span>'
      : "";
    lb.innerHTML = '<div class="lb__slot"></div><button class="lb__btn lb__close" aria-label="Close"><i class="bi bi-x-lg"></i></button>' + nav;
    document.body.appendChild(lb); document.body.classList.add("modal-open");
    var slot = lb.querySelector(".lb__slot"), cEl = lb.querySelector(".lb__counter");
    function upd() {
      var m = media[i];
      slot.innerHTML = m.type === "video"
        ? '<video class="lb__video" src="' + m.src + '" controls autoplay playsinline muted></video>'
        : '<img class="lb__img" src="' + m.src + '" alt="' + TITLE + '" />';
      if (cEl) cEl.textContent = (i + 1) + " / " + media.length;
    }
    function go(d) { i = (i + d + media.length) % media.length; upd(); }
    function close() { lb.remove(); document.body.classList.remove("modal-open"); document.removeEventListener("keydown", key); }
    function key(e) { if (e.key === "Escape") close(); else if (e.key === "ArrowLeft") go(-1); else if (e.key === "ArrowRight") go(1); }
    lb.addEventListener("click", function (e) {
      if (e.target.closest(".lb__next")) go(1);
      else if (e.target.closest(".lb__prev")) go(-1);
      else if (e.target.closest(".lb__close") || e.target === lb) close();
    });
    document.addEventListener("keydown", key);
    upd();
  }
  $("[data-fullscreen]").addEventListener("click", function (e) { e.stopPropagation(); openLightbox(gi); });
  $("[data-gallery-main]").addEventListener("click", function (e) {
    if (e.target.closest(".vdp__arrow") || e.target.closest(".vdp__viewall") || e.target.closest(".vdp__fs") || e.target.closest(".vdp__play") || e.target.closest(".vdp__mute")) return;
    if (mainStage.classList.contains("is-playing")) return;
    if (media[gi] && media[gi].type === "video") { playMainVideo(); return; }
    openLightbox(gi);
  });
  $("[data-viewall]").addEventListener("click", function (e) { e.stopPropagation(); openLightbox(gi); });

  /* ---------- dedicated Video section (under Specs) ---------- */
  var vsec = document.getElementById("video");
  if (vsec) {
    var videoJump = $("[data-video-jump]");
    if (V.video && V.video.src) {
      var fvid = $("[data-feature-video]", vsec);
      var fbox = $(".vdp-videobox", vsec);
      var fplay = $("[data-feature-play]", vsec);
      var fmute = $("[data-feature-mute]", vsec);
      if (fvid) fvid.poster = V.video.poster || (media[0] && media[0].src) || "";
      var setFMute = function (m) {
        if (!fmute) return;
        fmute.classList.toggle("is-unmuted", !m);
        fmute.querySelector("i").className = m ? "bi bi-volume-mute-fill" : "bi bi-volume-up-fill";
        fmute.setAttribute("aria-label", m ? "Turn sound on" : "Mute");
      };
      var playFeature = function () {
        if (!fvid || fbox.classList.contains("is-playing")) return;
        fvid.src = V.video.src;
        fvid.muted = true; setFMute(true);        // start muted; tap for sound
        fvid.setAttribute("controls", "");         // native controls only once playing
        fbox.classList.add("is-playing");
        var p = fvid.play(); if (p && p.catch) p.catch(function () {});
      };
      if (fplay) fplay.addEventListener("click", function (e) { e.stopPropagation(); playFeature(); });
      if (fbox) fbox.addEventListener("click", function (e) {
        if (e.target.closest("[data-feature-mute]") || e.target.closest("video")) return;
        playFeature();
      });
      if (fmute) fmute.addEventListener("click", function (e) { e.stopPropagation(); fvid.muted = !fvid.muted; setFMute(fvid.muted); });
    } else {
      // no video for this vehicle — drop the section and the sub-nav button
      vsec.style.display = "none";
      if (videoJump) videoJump.style.display = "none";
    }
  }

  /* ---------- highlights ---------- */
  var HL = [];
  HL.push(["bi-clipboard2-check", "Multi-point inspected", "Passed before it was listed"]);
  HL.push(["bi-diagram-3", driveLong(), engine()]);
  HL.push(["bi-box-seam", V.body, "Ready to work day one"]);
  if (V.mileage < 30000) HL.push(["bi-speedometer2", "Low miles", miles(V.mileage)]);
  HL.push(["bi-file-earmark-check", "Clean title & history", "Verified — no surprises"]);
  HL.push(["bi-truck", "Nationwide delivery", "Insured, door-to-door"]);
  $("[data-highlights]").innerHTML = HL.slice(0, 6).map(function (h) {
    return '<div class="vdp-hl"><span class="ic"><i class="bi ' + h[0] + '"></i></span><div><h4>' + h[1] + "</h4><p>" + h[2] + "</p></div></div>";
  }).join("");

  /* ---------- specifications ---------- */
  function specGroup(title, rows) {
    return '<div class="vdp-specs__group"><h4>' + title + '</h4><ul class="vdp-specs__list">' +
      rows.map(function (r) { return '<li><span class="k">' + r[0] + '</span><span class="v">' + r[1] + "</span></li>"; }).join("") + "</ul></div>";
  }
  $("[data-specs]").innerHTML =
    specGroup("Overview", [["Year", V.year], ["Make", V.make], ["Model", V.model], ["Trim", V.trim], ["Body", V.body], ["Stock #", STOCK]]) +
    specGroup("Powertrain", [["Engine", engine()], ["Fuel", fuel()], ["Transmission", V.transmission], ["Drivetrain", driveLong()]]) +
    specGroup("Details", [["Mileage", miles(V.mileage)], ["Exterior", V.color], ["Interior", V.interior || "Black cloth"], ["VIN", "Available on request"]]);

  /* ---------- related ---------- */
  function relatedCard(v) {
    var t = v.year + " " + v.make + " " + v.model;
    var status = v.status === "sold" ? '<span class="v-card__status v-card__status--sold">Sold</span>'
      : v.status === "pending" ? '<span class="v-card__status v-card__status--pending">Sale in Progress</span>' : "";
    return '<a class="v-card' + (v.status === "sold" ? " is-sold" : "") + '" href="vehicle3.html?id=' + v.id + '">' +
      '<div class="v-card__media"><img src="' + v.image + '" alt="' + t + '" />' + status + "</div>" +
      '<div class="v-card__body"><h3 class="v-card__name">' + t + "</h3>" +
      '<div class="v-card__meta"><span>' + v.trim + '</span><span>' + miles(v.mileage) + "</span><span>" + v.drivetrain + "</span></div>" +
      '<div class="v-card__foot"><span class="v-card__price">' + usd(v.price) + '</span><span class="v-card__cta">View <i class="bi bi-arrow-right arrow"></i></span></div>' +
      "</div></a>";
  }
  var related = DATA.filter(function (v) { return v.id !== V.id && (v.make === V.make || v.body === V.body); });
  if (related.length < 3) DATA.forEach(function (v) { if (v.id !== V.id && related.indexOf(v) === -1) related.push(v); });
  $("[data-related]").innerHTML = related.slice(0, 3).map(relatedCard).join("");

  /* ---------- lead modal ---------- */
  var modal = $("[data-modal]");
  var MODAL_COPY = {
    todayprice: { eyebrow: "Best price", title: "Get today's price" },
    testdrive: { eyebrow: "Schedule", title: "Schedule a test drive" },
    finance: { eyebrow: "Financing", title: "Apply for financing" },
    trade: { eyebrow: "Trade-in", title: "Value your trade" },
    send: { eyebrow: "Send to phone", title: "Send this van to your phone" }
  };
  function openModal(act) {
    var c = MODAL_COPY[act] || MODAL_COPY.todayprice;
    $("[data-modal-eyebrow]").textContent = c.eyebrow;
    $("[data-modal-title]").textContent = c.title;
    $("[data-modal-veh]").innerHTML = '<img src="' + V.image + '" alt="" /> ' + TITLE + ' · <strong style="color:var(--ink)">' + usd(V.price) + "</strong>";
    $("[data-modal-form]").style.display = "";
    $("[data-modal-success]").classList.remove("is-shown");
    modal.classList.add("is-open");
    document.body.classList.add("modal-open");
    var f = $("[data-modal-form] input"); if (f) setTimeout(function () { f.focus(); }, 60);
  }
  function closeModal() { modal.classList.remove("is-open"); document.body.classList.remove("modal-open"); }

  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-act]"); if (!a) return;
    openModal(a.getAttribute("data-act"));
  });
  $$("[data-modal-close]").forEach(function (el) { el.addEventListener("click", closeModal); });
  $("[data-modal-form]").addEventListener("submit", function (e) {
    e.preventDefault();
    $("[data-modal-form]").style.display = "none";
    $("[data-modal-success]").classList.add("is-shown");
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });

  /* ---------- sticky panel form ---------- */
  $("[data-vdp-form]").addEventListener("submit", function (e) {
    e.preventDefault();
    $("[data-vdp-form]").style.display = "none";
    $("[data-vdp-success]").classList.add("is-shown");
  });

  /* ---------- sticky section sub-nav ---------- */
  var subTitle = $("[data-subnav-title]"); if (subTitle) subTitle.textContent = TITLE;
  var subPrice = $("[data-subnav-price]"); if (subPrice) subPrice.textContent = usd(V.price);

  /* active-link spy: highlight the sub-nav link for the section in view */
  var subLinks = $$("[data-subnav-links] a");
  if (subLinks.length && "IntersectionObserver" in window) {
    var linkFor = {};
    subLinks.forEach(function (a) { linkFor[a.getAttribute("href").slice(1)] = a; });
    var sections = subLinks
      .map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); })
      .filter(Boolean);
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          subLinks.forEach(function (a) { a.classList.remove("is-active"); });
          var l = linkFor[en.target.id];
          if (l) {
            l.classList.add("is-active");
            // on mobile the row scrolls sideways — keep the current section in view
            var row = l.parentElement;
            if (row.scrollWidth > row.clientWidth + 4) {
              if (l.offsetLeft < row.scrollLeft) row.scrollTo({ left: Math.max(0, l.offsetLeft - 12), behavior: "smooth" });
              else if (l.offsetLeft + l.offsetWidth > row.scrollLeft + row.clientWidth) row.scrollTo({ left: l.offsetLeft + l.offsetWidth - row.clientWidth + 12, behavior: "smooth" });
            }
          }
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* scroll reveal — sections rise in as they enter the viewport */
  var reveals = $$(".vdp-reveal");
  if (reveals.length && "IntersectionObserver" in window) {
    var ro = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); obs.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { ro.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }
})();
