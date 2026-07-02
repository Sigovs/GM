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
  if (!V) { location.replace("inventory.html"); return; }

  var TITLE = V.year + " " + V.make + " " + V.model;

  /* ---------- derive extra specs ---------- */
  function engine() {
    if (V.make === "Ford") return "3.5L EcoBoost V6";
    if (/Diesel/.test(V.trim)) return "4-Cyl Turbo Diesel";
    if (/V6/.test(V.trim)) return "V6 Gas";
    return "—";
  }
  function fuel() { return (V.make === "Ford" || /V6/.test(V.trim)) ? "Gasoline" : "Diesel"; }
  function driveLong() { return V.drivetrain === "RWD" ? "Rear-wheel drive" : V.drivetrain === "AWD" ? "All-wheel drive" : V.drivetrain === "4MATIC" ? "4MATIC all-wheel drive" : V.drivetrain; }
  var STOCK = "GM-" + V.id.toUpperCase().replace(/[^A-Z0-9]/g, "");

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

  /* ---------- quick specs chips ---------- */
  $("[data-quickspecs]").innerHTML = [
    ["bi-speedometer2", miles(V.mileage)],
    ["bi-gear", V.transmission],
    ["bi-diagram-3", V.drivetrain],
    ["bi-palette", V.color]
  ].map(function (s) { return '<span class="vdp__spec-chip"><i class="bi ' + s[0] + '"></i>' + s[1] + "</span>"; }).join("");

  /* ---------- description ---------- */
  var descEl = $("[data-desc]");
  if (descEl) {
    descEl.textContent = "This " + TITLE + " (" + V.trim + ") is a " + V.body.toLowerCase() + " with " +
      miles(V.mileage) + " on the clock, " + driveLong().toLowerCase() + ", and the " + V.transmission +
      " transmission. It's been multi-point inspected, serviced, and detailed — buy the whole thing online and we deliver it insured to your door, anywhere in the 50 states.";
  }

  /* ---------- gallery ---------- */
  var images = (V.images && V.images.length) ? V.images : [V.image];
  var gi = 0;
  var mainImg = $("[data-main-img]");
  var counter = $("[data-gallery-counter]");
  var thumbsWrap = $("[data-gallery-thumbs]");
  var gallery = $("[data-gallery]");
  if (V.status === "sold") {
    gallery.classList.add("is-sold");
    gallery.insertAdjacentHTML("afterbegin", '<span class="v-card__status v-card__status--sold">Sold</span>');
  } else if (V.status === "pending") {
    gallery.insertAdjacentHTML("afterbegin", '<span class="v-card__status v-card__status--pending">Sale in Progress</span>');
  }
  function showImg(i) {
    gi = (i + images.length) % images.length;
    mainImg.src = images[gi]; mainImg.alt = TITLE + " — photo " + (gi + 1);
    counter.textContent = (gi + 1) + " / " + images.length;
    $$(".vdp__thumb", thumbsWrap).forEach(function (t, k) { t.classList.toggle("is-active", k === gi); });
  }
  thumbsWrap.innerHTML = images.map(function (src, k) {
    return '<button class="vdp__thumb' + (k === 0 ? " is-active" : "") + '" data-thumb="' + k + '"><img src="' + src + '" alt="" /></button>';
  }).join("");
  thumbsWrap.addEventListener("click", function (e) { var t = e.target.closest("[data-thumb]"); if (t) showImg(+t.getAttribute("data-thumb")); });
  $("[data-gallery-prev]").addEventListener("click", function () { showImg(gi - 1); });
  $("[data-gallery-next]").addEventListener("click", function () { showImg(gi + 1); });
  if (images.length < 2) { $(".vdp__arrows").style.display = "none"; }
  showImg(0);

  // lightbox
  $("[data-gallery-main]").addEventListener("click", function (e) {
    if (e.target.closest(".vdp__arrow")) return;
    var lb = document.createElement("div");
    lb.className = "vdp-lightbox";
    lb.innerHTML = '<img src="' + images[gi] + '" alt="' + TITLE + '" />';
    lb.style.cssText = "position:fixed;inset:0;z-index:300;background:rgba(9,13,17,.92);display:grid;place-items:center;padding:2rem;cursor:zoom-out";
    lb.querySelector("img").style.cssText = "max-width:100%;max-height:100%;border-radius:8px;box-shadow:0 30px 80px -20px rgba(0,0,0,.6)";
    lb.addEventListener("click", function () { lb.remove(); });
    document.body.appendChild(lb);
  });

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
    specGroup("Details", [["Mileage", miles(V.mileage)], ["Exterior", V.color], ["Interior", "Black cloth"], ["VIN", "Available on request"]]);

  /* ---------- related ---------- */
  function relatedCard(v) {
    var t = v.year + " " + v.make + " " + v.model;
    var status = v.status === "sold" ? '<span class="v-card__status v-card__status--sold">Sold</span>'
      : v.status === "pending" ? '<span class="v-card__status v-card__status--pending">Sale in Progress</span>' : "";
    return '<a class="v-card' + (v.status === "sold" ? " is-sold" : "") + '" href="vehicle.html?id=' + v.id + '">' +
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
})();
