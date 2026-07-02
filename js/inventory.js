/* ============================================================
   GM MOTORS — INVENTORY LISTING (SRP) logic
   Client-side filter / search / sort over GM_INVENTORY.
   ============================================================ */
(function () {
  "use strict";
  var DATA = (window.GM_INVENTORY || []).slice();
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var usd = function (n) { return "$" + n.toLocaleString("en-US"); };
  var miles = function (n) { return n.toLocaleString("en-US") + " mi"; };

  var grid = $("[data-grid]");
  if (!grid) return;

  /* ---------- derive filter facets from data ---------- */
  function uniq(key) {
    var seen = [], counts = {};
    DATA.forEach(function (v) { if (seen.indexOf(v[key]) === -1) seen.push(v[key]); counts[v[key]] = (counts[v[key]] || 0) + 1; });
    return { values: seen, counts: counts };
  }
  var MAKES = uniq("make");
  var BODIES = uniq("body");
  var DRIVE = uniq("drivetrain");
  var prices = DATA.map(function (v) { return v.price; });
  var years = DATA.map(function (v) { return v.year; });
  var maxMileage = Math.max.apply(null, DATA.map(function (v) { return v.mileage; }));
  var minYear = Math.min.apply(null, years), maxYear = Math.max.apply(null, years);

  var PRICE_STEPS = [25000, 35000, 50000, 75000, 100000, 125000, 150000].filter(function (p) { return p <= Math.max.apply(null, prices) + 25000; });
  var MILEAGE_STEPS = [25000, 50000, 75000, 100000, 150000].filter(function (m) { return m <= maxMileage + 25000; });
  var YEARS = []; for (var y = maxYear; y >= minYear; y--) YEARS.push(y);

  /* ---------- state ---------- */
  var state = { q: "", make: [], body: [], drivetrain: [], priceMin: null, priceMax: null, yearMin: null, yearMax: null, mileageMax: null, sort: "featured" };

  /* ---------- URL sync ---------- */
  function readURL() {
    var p = new URLSearchParams(location.search);
    state.q = p.get("q") || "";
    state.make = p.get("make") ? p.get("make").split(",") : [];
    state.body = p.get("body") ? p.get("body").split(",") : [];
    state.drivetrain = p.get("dt") ? p.get("dt").split(",") : [];
    state.priceMin = p.get("pmin") ? +p.get("pmin") : null;
    state.priceMax = p.get("pmax") ? +p.get("pmax") : null;
    state.yearMin = p.get("ymin") ? +p.get("ymin") : null;
    state.yearMax = p.get("ymax") ? +p.get("ymax") : null;
    state.mileageMax = p.get("mmax") ? +p.get("mmax") : null;
    state.sort = p.get("sort") || "featured";
  }
  function writeURL() {
    var p = new URLSearchParams();
    if (state.q) p.set("q", state.q);
    if (state.make.length) p.set("make", state.make.join(","));
    if (state.body.length) p.set("body", state.body.join(","));
    if (state.drivetrain.length) p.set("dt", state.drivetrain.join(","));
    if (state.priceMin) p.set("pmin", state.priceMin);
    if (state.priceMax) p.set("pmax", state.priceMax);
    if (state.yearMin) p.set("ymin", state.yearMin);
    if (state.yearMax) p.set("ymax", state.yearMax);
    if (state.mileageMax) p.set("mmax", state.mileageMax);
    if (state.sort && state.sort !== "featured") p.set("sort", state.sort);
    var qs = p.toString();
    history.replaceState(null, "", qs ? "?" + qs : location.pathname);
  }

  /* ---------- filter UI ---------- */
  function checkRow(name, val, count, checked) {
    return '<label class="check"><input type="checkbox" data-facet="' + name + '" value="' + val + '"' + (checked ? " checked" : "") + ' />' +
      '<span class="check__box"><i class="bi bi-check-lg"></i></span>' + val +
      '<span class="check__count">' + count + '</span></label>';
  }
  function opt(v, label, sel) { return '<option value="' + v + '"' + (sel ? " selected" : "") + ">" + label + "</option>"; }
  function rangeSelect(facet, which, steps, fmt, curVal, placeholder) {
    var html = '<select data-range="' + facet + '" data-bound="' + which + '">' + opt("", placeholder, !curVal);
    steps.forEach(function (s) { html += opt(s, fmt(s), curVal === s); });
    return html + "</select>";
  }
  function group(title, key, bodyHtml) {
    return '<div class="filter-group" data-group="' + key + '">' +
      '<button type="button" class="filter-group__title" data-toggle-group>' + title + ' <i class="bi bi-chevron-down"></i></button>' +
      '<div class="filter-group__body">' + bodyHtml + "</div></div>";
  }
  function renderFilters() {
    var host = $("[data-filter-groups]");
    var makeRows = MAKES.values.map(function (m) { return checkRow("make", m, MAKES.counts[m], state.make.indexOf(m) !== -1); }).join("");
    var bodyRows = BODIES.values.map(function (b) { return checkRow("body", b, BODIES.counts[b], state.body.indexOf(b) !== -1); }).join("");
    var driveRows = DRIVE.values.map(function (d) { return checkRow("drivetrain", d, DRIVE.counts[d], state.drivetrain.indexOf(d) !== -1); }).join("");

    var priceBody = '<div class="range-row">' +
      rangeSelect("price", "min", PRICE_STEPS, function (s) { return usd(s); }, state.priceMin, "No min") +
      '<span class="dash">–</span>' +
      rangeSelect("price", "max", PRICE_STEPS, function (s) { return usd(s); }, state.priceMax, "No max") + "</div>";
    var yearBody = '<div class="range-row">' +
      rangeSelect("year", "min", YEARS.slice().reverse(), function (s) { return s; }, state.yearMin, "Oldest") +
      '<span class="dash">–</span>' +
      rangeSelect("year", "max", YEARS, function (s) { return s; }, state.yearMax, "Newest") + "</div>";
    var mileBody = rangeSelect("mileage", "max", MILEAGE_STEPS, function (s) { return "Under " + s.toLocaleString("en-US") + " mi"; }, state.mileageMax, "Any mileage");

    host.innerHTML =
      group("Make", "make", makeRows) +
      group("Body style", "body", bodyRows) +
      group("Price", "price", priceBody) +
      group("Year", "year", yearBody) +
      group("Mileage", "mileage", mileBody) +
      group("Drivetrain", "drivetrain", driveRows);
  }

  /* ---------- filtering ---------- */
  function matches(v) {
    if (state.q) {
      var hay = (v.year + " " + v.make + " " + v.model + " " + v.trim + " " + v.body).toLowerCase();
      var ok = state.q.toLowerCase().split(/\s+/).every(function (w) { return !w || hay.indexOf(w) !== -1; });
      if (!ok) return false;
    }
    if (state.make.length && state.make.indexOf(v.make) === -1) return false;
    if (state.body.length && state.body.indexOf(v.body) === -1) return false;
    if (state.drivetrain.length && state.drivetrain.indexOf(v.drivetrain) === -1) return false;
    if (state.priceMin && v.price < state.priceMin) return false;
    if (state.priceMax && v.price > state.priceMax) return false;
    if (state.yearMin && v.year < state.yearMin) return false;
    if (state.yearMax && v.year > state.yearMax) return false;
    if (state.mileageMax && v.mileage > state.mileageMax) return false;
    return true;
  }
  function sortList(list) {
    var s = state.sort;
    var arr = list.slice();
    if (s === "price-asc") arr.sort(function (a, b) { return a.price - b.price; });
    else if (s === "price-desc") arr.sort(function (a, b) { return b.price - a.price; });
    else if (s === "year-desc") arr.sort(function (a, b) { return b.year - a.year; });
    else if (s === "mileage-asc") arr.sort(function (a, b) { return a.mileage - b.mileage; });
    else arr.sort(function (a, b) { return (b.featured ? 1 : 0) - (a.featured ? 1 : 0); }); // featured first, stable
    return arr;
  }

  /* ---------- card ---------- */
  function card(v) {
    var title = v.year + " " + v.make + " " + v.model;
    var status = v.status === "sold" ? '<span class="v-card__status v-card__status--sold">Sold</span>'
      : v.status === "pending" ? '<span class="v-card__status v-card__status--pending">Sale in Progress</span>' : "";
    var cls = "v-card" + (v.status === "sold" ? " is-sold" : "");
    return '<article class="' + cls + '" data-id="' + v.id + '">' +
      '<div class="v-card__media">' +
        '<img src="' + v.image + '" alt="' + title + '" loading="lazy" />' +
        status +
        '<div class="v-card__actions">' +
          '<button type="button" class="qbtn" data-act="photos"><i class="bi bi-images"></i>Photos</button>' +
          '<button type="button" class="qbtn" data-act="testdrive"><i class="bi bi-calendar-check"></i>Test Drive</button>' +
          '<button type="button" class="qbtn" data-act="finance"><i class="bi bi-cash-coin"></i>Finance</button>' +
          '<button type="button" class="qbtn" data-act="send"><i class="bi bi-phone"></i>Send</button>' +
        '</div>' +
      '</div>' +
      '<div class="v-card__body">' +
        '<h3 class="v-card__name">' + title + '</h3>' +
        '<div class="v-card__meta"><span>' + v.trim + '</span><span>' + miles(v.mileage) + '</span><span>' + v.drivetrain + '</span><span>' + v.transmission + '</span></div>' +
        '<div class="v-card__foot"><span class="v-card__price">' + usd(v.price) + '</span></div>' +
        '<div class="v-card__ctas">' +
          '<button type="button" class="btn btn--outline btn--sm" data-act="finance"><i class="bi bi-cash-coin"></i> Finance</button>' +
          '<a href="#" class="v-card__cta" data-act="details">View Details <i class="bi bi-arrow-right arrow"></i></a>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  /* ---------- chips ---------- */
  function chip(label, facet, val) {
    return '<span class="chip">' + label + '<button type="button" data-remove-facet="' + facet + '" data-remove-val="' + (val == null ? "" : val) + '" aria-label="Remove ' + label + '"><i class="bi bi-x-lg"></i></button></span>';
  }
  function renderChips() {
    var host = $("[data-chips]");
    var chips = [];
    state.make.forEach(function (m) { chips.push(chip(m, "make", m)); });
    state.body.forEach(function (b) { chips.push(chip(b, "body", b)); });
    state.drivetrain.forEach(function (d) { chips.push(chip(d, "drivetrain", d)); });
    if (state.priceMin) chips.push(chip("Min " + usd(state.priceMin), "priceMin", null));
    if (state.priceMax) chips.push(chip("Max " + usd(state.priceMax), "priceMax", null));
    if (state.yearMin) chips.push(chip("From " + state.yearMin, "yearMin", null));
    if (state.yearMax) chips.push(chip("To " + state.yearMax, "yearMax", null));
    if (state.mileageMax) chips.push(chip("Under " + state.mileageMax.toLocaleString("en-US") + " mi", "mileageMax", null));
    if (state.q) chips.push(chip('“' + state.q + '”', "q", null));
    host.innerHTML = chips.join("");
  }

  /* ---------- render ---------- */
  function hasFilters() {
    return !!(state.q || state.make.length || state.body.length || state.drivetrain.length ||
      state.priceMin || state.priceMax || state.yearMin || state.yearMax || state.mileageMax);
  }
  function apply() {
    var list = sortList(DATA.filter(matches));
    grid.innerHTML = list.map(card).join("");
    $("[data-result-count]").textContent = list.length;
    $("[data-empty]").classList.toggle("is-shown", list.length === 0);
    grid.style.display = list.length ? "" : "none";
    renderChips();
    $("[data-clear]").disabled = !hasFilters();
    writeURL();
  }

  /* ---------- events: filters ---------- */
  function onFacetChange(facet, val, on) {
    var arr = state[facet];
    var i = arr.indexOf(val);
    if (on && i === -1) arr.push(val);
    else if (!on && i !== -1) arr.splice(i, 1);
  }
  $("[data-filter-groups]").addEventListener("change", function (e) {
    var cb = e.target.closest('input[data-facet]');
    if (cb) { onFacetChange(cb.getAttribute("data-facet"), cb.value, cb.checked); apply(); return; }
    var sel = e.target.closest("select[data-range]");
    if (sel) {
      var facet = sel.getAttribute("data-range"), bound = sel.getAttribute("data-bound");
      var v = sel.value ? +sel.value : null;
      if (facet === "price") state[bound === "min" ? "priceMin" : "priceMax"] = v;
      else if (facet === "year") state[bound === "min" ? "yearMin" : "yearMax"] = v;
      else if (facet === "mileage") state.mileageMax = v;
      apply();
    }
  });
  $("[data-filter-groups]").addEventListener("click", function (e) {
    var t = e.target.closest("[data-toggle-group]");
    if (t) t.closest(".filter-group").classList.toggle("is-collapsed");
  });

  // search (debounced)
  var searchEl = $("[data-search]"); searchEl.value = state.q;
  var deb;
  searchEl.addEventListener("input", function () {
    clearTimeout(deb); deb = setTimeout(function () { state.q = searchEl.value.trim(); apply(); }, 220);
  });

  // sort
  var sortEl = $("[data-sort]"); sortEl.value = state.sort;
  sortEl.addEventListener("change", function () { state.sort = sortEl.value; apply(); });

  // clear
  function clearAll() {
    state = { q: "", make: [], body: [], drivetrain: [], priceMin: null, priceMax: null, yearMin: null, yearMax: null, mileageMax: null, sort: state.sort };
    searchEl.value = "";
    renderFilters(); apply();
  }
  $("[data-clear]").addEventListener("click", clearAll);
  var clear2 = $("[data-clear-2]"); if (clear2) clear2.addEventListener("click", clearAll);

  // chip removal
  $("[data-chips]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-remove-facet]"); if (!b) return;
    var facet = b.getAttribute("data-remove-facet"), val = b.getAttribute("data-remove-val");
    if (facet === "make" || facet === "body" || facet === "drivetrain") onFacetChange(facet, val, false);
    else if (facet === "q") { state.q = ""; searchEl.value = ""; }
    else state[facet] = null;
    renderFilters(); apply();
  });

  /* ---------- mobile filters slide-over ---------- */
  var panel = $("[data-filters-panel]"), backdrop = $("[data-backdrop]");
  function openFilters() { panel.classList.add("is-open"); backdrop.classList.add("is-open"); document.body.classList.add("modal-open"); }
  function closeFilters() { panel.classList.remove("is-open"); backdrop.classList.remove("is-open"); document.body.classList.remove("modal-open"); }
  var fo = $("[data-filters-open]"); if (fo) fo.addEventListener("click", openFilters);
  var fc = $("[data-filters-close]"); if (fc) fc.addEventListener("click", closeFilters);
  backdrop.addEventListener("click", closeFilters);

  /* ---------- lead modal ---------- */
  var modal = $("[data-modal]");
  var MODAL_COPY = {
    photos: { eyebrow: "Photos", title: "See more photos" },
    testdrive: { eyebrow: "Schedule", title: "Schedule a test drive" },
    finance: { eyebrow: "Financing", title: "Apply for financing" },
    send: { eyebrow: "Send to phone", title: "Send this van to your phone" },
    details: { eyebrow: "Details", title: "Request full details" }
  };
  function byId(id) { for (var i = 0; i < DATA.length; i++) if (DATA[i].id === id) return DATA[i]; return null; }
  function openModal(v, act) {
    var c = MODAL_COPY[act] || MODAL_COPY.details;
    $("[data-modal-eyebrow]").textContent = c.eyebrow;
    $("[data-modal-title]").textContent = c.title;
    $("[data-modal-veh]").innerHTML = '<img src="' + v.image + '" alt="" /> ' + v.year + " " + v.make + " " + v.model + " · <strong style=\"color:var(--ink)\">" + usd(v.price) + "</strong>";
    $("[data-modal-form]").style.display = "";
    $("[data-modal-success]").classList.remove("is-shown");
    $("[data-modal-form]").setAttribute("data-veh", v.id);
    modal.classList.add("is-open");
    document.body.classList.add("modal-open");
    var f = $("[data-modal-form] input"); if (f) setTimeout(function () { f.focus(); }, 60);
  }
  function closeModal() { modal.classList.remove("is-open"); document.body.classList.remove("modal-open"); }

  grid.addEventListener("click", function (e) {
    var act = e.target.closest("[data-act]"); if (!act) return;
    e.preventDefault();
    var cardEl = act.closest(".v-card"); if (!cardEl) return;
    var v = byId(cardEl.getAttribute("data-id")); if (!v) return;
    openModal(v, act.getAttribute("data-act"));
  });
  $$("[data-modal-close]").forEach(function (el) { el.addEventListener("click", closeModal); });
  $("[data-modal-form]").addEventListener("submit", function (e) {
    e.preventDefault();
    // (front-end demo) — swap for a real endpoint later
    $("[data-modal-form]").style.display = "none";
    $("[data-modal-success]").classList.add("is-shown");
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeModal(); closeFilters(); }
  });

  /* ---------- boot ---------- */
  readURL();
  renderFilters();
  var totalEl = $("[data-total-count]"); if (totalEl) totalEl.textContent = DATA.length;
  apply();
})();
