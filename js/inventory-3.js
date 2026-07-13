/* ============================================================
   GM MOTORS — INVENTORY LISTING (SRP) logic — VARIANT 2
   Same behaviour as inventory.js, but the four quick actions
   (View Photos · Schedule Test Drive · Apply for Financing ·
   Send to Phone) live INSIDE the card body as CTAs, with a
   full-width "View Details" button below them.
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

  /* ---------- extra facets for the top search ---------- */
  var UNIQ_MODELS = [];
  DATA.forEach(function (v) { if (UNIQ_MODELS.indexOf(v.model) === -1) UNIQ_MODELS.push(v.model); });
  function modelsFor(make) { var out = []; DATA.forEach(function (v) { if ((!make || v.make === make) && out.indexOf(v.model) === -1) out.push(v.model); }); return out; }
  function selOptions(list, ph) { var h = '<option value="">' + ph + "</option>"; list.forEach(function (x) { h += '<option value="' + x + '">' + x + "</option>"; }); return h; }
  var minPrice = Math.min.apply(null, prices), maxPrice = Math.max.apply(null, prices);
  var P_LO = Math.floor(minPrice / 500) * 500, P_HI = Math.ceil(maxPrice / 500) * 500;

  /* ---------- advanced ("All filters") facets ---------- */
  function uniqField(key) { var out = []; DATA.forEach(function (v) { if (v[key] && out.indexOf(v[key]) === -1) out.push(v[key]); }); return out; }
  var EXT_COLORS = uniqField("color");
  var INT_COLORS = uniqField("interior"); if (INT_COLORS.length < 2) INT_COLORS = ["Black", "Grey", "Beige", "Tan"];
  var FUELS = uniqField("fuel"); if (FUELS.length < 2) FUELS = ["Diesel", "Gasoline", "Bio-diesel", "Hybrid"];
  var BODY_OPTS = ["SUV", "Van", "Other"];
  var INTTYPE_OPTS = ["Cloth", "Leather", "Vinyl", "Other"];
  var MPG_OPTS = [18, 20, 22, 25];

  /* ---------- state ---------- */
  // bodyCats is a list: Passenger and Cargo are independent toggles, so both can be on at once.
  var state = { q: "", bodyCats: [], make: [], model: [], body: [], drivetrain: [], extColor: [], intColor: [], fuel: [], intType: [], mpgHwy: null, priceMin: null, priceMax: null, yearMin: null, yearMax: null, mileageMin: null, mileageMax: null, sort: "featured" };

  /* Two van families the buyer actually chooses between. Everything that
     isn't a cargo body (Passenger Van, Crew Van, Luxury Conversion) carries
     people, so it lands on the passenger side. */
  function bodyCatOf(v) { return /cargo/i.test(v.body || "") ? "cargo" : "passenger"; }

  /* ---------- URL sync ---------- */
  function readURL() {
    var p = new URLSearchParams(location.search);
    state.q = p.get("q") || "";
    state.bodyCats = (p.get("type") ? p.get("type").split(",") : []).filter(function (t) { return t === "passenger" || t === "cargo"; });
    state.make = p.get("make") ? p.get("make").split(",") : [];
    state.model = p.get("model") ? p.get("model").split(",") : [];
    state.body = p.get("body") ? p.get("body").split(",") : [];
    state.drivetrain = p.get("dt") ? p.get("dt").split(",") : [];
    state.priceMin = p.get("pmin") ? +p.get("pmin") : null;
    state.priceMax = p.get("pmax") ? +p.get("pmax") : null;
    state.yearMin = p.get("ymin") ? +p.get("ymin") : null;
    state.yearMax = p.get("ymax") ? +p.get("ymax") : null;
    state.mileageMin = p.get("mmin") ? +p.get("mmin") : null;
    state.mileageMax = p.get("mmax") ? +p.get("mmax") : null;
    state.sort = p.get("sort") || "featured";
  }
  function writeURL() {
    var p = new URLSearchParams();
    if (state.q) p.set("q", state.q);
    if (state.bodyCats.length) p.set("type", state.bodyCats.join(","));
    if (state.make.length) p.set("make", state.make.join(","));
    if (state.model.length) p.set("model", state.model.join(","));
    if (state.body.length) p.set("body", state.body.join(","));
    if (state.drivetrain.length) p.set("dt", state.drivetrain.join(","));
    if (state.priceMin) p.set("pmin", state.priceMin);
    if (state.priceMax) p.set("pmax", state.priceMax);
    if (state.yearMin) p.set("ymin", state.yearMin);
    if (state.yearMax) p.set("ymax", state.yearMax);
    if (state.mileageMin) p.set("mmin", state.mileageMin);
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
  // Sidebar removed — all filtering lives in the static top search now.
  function renderFilters() { /* no-op: no side menu */ }

  /* ---------- filtering ---------- */
  function matches(v) {
    if (state.q) {
      var hay = (v.year + " " + v.make + " " + v.model + " " + v.trim + " " + v.body).toLowerCase();
      var ok = state.q.toLowerCase().split(/\s+/).every(function (w) { return !w || hay.indexOf(w) !== -1; });
      if (!ok) return false;
    }
    if (state.bodyCats.length && state.bodyCats.indexOf(bodyCatOf(v)) === -1) return false;
    if (state.make.length && state.make.indexOf(v.make) === -1) return false;
    if (state.model.length && state.model.indexOf(v.model) === -1) return false;
    // NOTE: no strict state.body check here — the body chips hold loose labels
    // ("Van", "SUV", "Other"), which never equal a full body string like
    // "Cargo Van". The substring/Other match further down is the real one.
    if (state.drivetrain.length && state.drivetrain.indexOf(v.drivetrain) === -1) return false;
    if (state.priceMin && v.price < state.priceMin) return false;
    if (state.priceMax && v.price > state.priceMax) return false;
    if (state.yearMin && v.year < state.yearMin) return false;
    if (state.yearMax && v.year > state.yearMax) return false;
    if (state.mileageMin && v.mileage < state.mileageMin) return false;
    if (state.mileageMax && v.mileage > state.mileageMax) return false;
    // advanced ("All filters"): strict where the field exists on every vehicle,
    // lenient (missing value passes) for fields the dataset may not carry.
    if (state.drivetrain.length && state.drivetrain.indexOf(v.drivetrain) === -1) return false;
    if (state.extColor.length && state.extColor.indexOf(v.color) === -1) return false;
    if (state.intColor.length && v.interior && state.intColor.indexOf(v.interior) === -1) return false;
    if (state.fuel.length && v.fuel && state.fuel.indexOf(v.fuel) === -1) return false;
    if (state.intType.length && v.interiorType && state.intType.indexOf(v.interiorType) === -1) return false;
    if (state.mpgHwy && v.mpgHwy && v.mpgHwy < state.mpgHwy) return false;
    if (state.body.length) {
      var vb = (v.body || "").toLowerCase();
      var bodyOk = state.body.some(function (b) {
        if (b === "Other") return !/van|suv/.test(vb);
        return vb.indexOf(b.toLowerCase()) !== -1;
      });
      if (!bodyOk) return false;
    }
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

  /* ---------- card (VARIANT 2: CTAs in the body) ---------- */
  function card(v) {
    var title = v.year + " " + v.make + " " + v.model;
    var status = v.status === "sold" ? '<span class="v-card__status v-card__status--sold">Sold</span>'
      : v.status === "pending" ? '<span class="v-card__status v-card__status--pending">Sale in Progress</span>' : "";
    var cls = "v-card v-card--v2" + (v.status === "sold" ? " is-sold" : "");
    return '<article class="' + cls + '" data-id="' + v.id + '">' +
      '<div class="v-card__media">' +
        '<img src="' + v.image + '" alt="' + title + '" loading="lazy" />' +
        status +
      '</div>' +
      '<div class="v-card__body">' +
        '<h3 class="v-card__name"><a href="vehicle3.html?id=' + v.id + '">' + title + '</a></h3>' +
        '<div class="v-card__meta"><span>' + v.trim + '</span><span>' + miles(v.mileage) + '</span><span>' + v.drivetrain + '</span><span>' + v.transmission + '</span></div>' +
        '<div class="v-card__foot"><span class="v-card__price">' + usd(v.price) + '</span></div>' +
        '<div class="v-card__cta-grid">' +
          '<button type="button" class="qcta" data-act="photos"><i class="bi bi-images"></i> View Photos</button>' +
          '<button type="button" class="qcta" data-act="testdrive"><i class="bi bi-calendar-check"></i> Schedule Test Drive</button>' +
          '<button type="button" class="qcta" data-act="finance"><i class="bi bi-cash-coin"></i> Apply for Financing</button>' +
          '<button type="button" class="qcta" data-act="send"><i class="bi bi-phone"></i> Send to Phone</button>' +
        '</div>' +
        '<a href="vehicle3.html?id=' + v.id + '" class="v-card__details">View Details <i class="bi bi-arrow-right arrow"></i></a>' +
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
    state.bodyCats.forEach(function (c) { chips.push(chip(c === "cargo" ? "Cargo van" : "Passenger van", "bodyCats", c)); });
    state.make.forEach(function (m) { chips.push(chip(m, "make", m)); });
    state.model.forEach(function (m) { chips.push(chip(m, "model", m)); });
    state.body.forEach(function (b) { chips.push(chip(b, "body", b)); });
    state.drivetrain.forEach(function (d) { chips.push(chip(d, "drivetrain", d)); });
    state.extColor.forEach(function (c) { chips.push(chip(c, "extColor", c)); });
    state.intColor.forEach(function (c) { chips.push(chip(c + " interior", "intColor", c)); });
    state.fuel.forEach(function (f) { chips.push(chip(f, "fuel", f)); });
    state.intType.forEach(function (t) { chips.push(chip(t + " seats", "intType", t)); });
    if (state.mpgHwy) chips.push(chip(state.mpgHwy + "+ mpg hwy", "mpgHwy", null));
    if (state.yearMin || state.yearMax) {
      var yl = (state.yearMin && state.yearMax && state.yearMin === state.yearMax) ? ("" + state.yearMin)
        : (state.yearMin && state.yearMax) ? (state.yearMin + "–" + state.yearMax)
        : state.yearMin ? (state.yearMin + "+") : ("Up to " + state.yearMax);
      chips.push(chip("Year " + yl, "yearR", null));
    }
    if (state.priceMin || state.priceMax) {
      var pl = (state.priceMin && state.priceMax) ? ("$" + state.priceMin / 1000 + "k–$" + state.priceMax / 1000 + "k")
        : state.priceMax ? ("Under $" + state.priceMax / 1000 + "k") : ("$" + state.priceMin / 1000 + "k+");
      chips.push(chip(pl, "priceR", null));
    }
    if (state.mileageMin || state.mileageMax) {
      var ml = (state.mileageMin && state.mileageMax) ? (state.mileageMin / 1000 + "k–" + state.mileageMax / 1000 + "k mi")
        : state.mileageMax ? ("Under " + state.mileageMax / 1000 + "k mi") : (state.mileageMin / 1000 + "k+ mi");
      chips.push(chip(ml, "mileageR", null));
    }
    if (state.q) chips.push(chip('“' + state.q + '”', "q", null));
    host.innerHTML = chips.join("");
  }

  /* ---------- render ---------- */
  function hasFilters() {
    return !!(state.q || state.bodyCats.length || state.make.length || state.model.length || state.body.length || state.drivetrain.length ||
      state.extColor.length || state.intColor.length || state.fuel.length || state.intType.length || state.mpgHwy ||
      state.priceMin || state.priceMax || state.yearMin || state.yearMax || state.mileageMin || state.mileageMax);
  }
  function apply() {
    var list = sortList(DATA.filter(matches));
    grid.innerHTML = list.map(card).join("");
    // hero band and toolbar both show the count — keep them in sync
    $$("[data-result-count]").forEach(function (el) { el.textContent = list.length; });
    var fc = $("[data-found-count]"); if (fc) fc.textContent = list.length;
    $("[data-empty]").classList.toggle("is-shown", list.length === 0);
    grid.style.display = list.length ? "" : "none";
    renderChips();
    syncBodyPick();
    $("[data-clear]").disabled = !hasFilters();
    var cnt = $("[data-adv-count]"); if (cnt) { var n = advCount(); cnt.textContent = n ? n : ""; cnt.classList.toggle("is-shown", !!n); }
    writeURL();
  }

  /* ---------- static top search — modeled on the AAN reference ---------- */
  var M_HI = Math.ceil(maxMileage / 1000) * 1000;   // mileage slider upper bound
  function fmtFor(key) {
    if (key === "price") return function (x, m) { return "$" + (x >= 1000 ? Math.round(x / 1000) + "k" : x) + (m ? "+" : ""); };
    if (key === "mileage") return function (x, m) { return (x >= 1000 ? Math.round(x / 1000) + "k" : x) + (m ? "+" : "") + " mi"; };
    return function (x) { return "" + x; };
  }
  function dualHTML(key, label, lo, hi, step) {
    return '<div class="fb-field fb-field--range" data-dual="' + key + '" data-lo="' + lo + '" data-hi="' + hi + '" data-step="' + step + '">' +
      '<div class="fb-field__head"><label>' + label + "</label>" +
        '<span class="fb-field__val"><span data-dual-lo></span>–<span data-dual-hi></span></span></div>' +
      '<div class="range">' +
        '<div class="range__track"></div>' +
        '<div class="range__fill" data-dual-fill></div>' +
        '<input type="range" class="range__min" data-dual-min min="' + lo + '" max="' + hi + '" step="' + step + '" value="' + lo + '" aria-label="' + label + ' minimum" />' +
        '<input type="range" class="range__max" data-dual-max min="' + lo + '" max="' + hi + '" step="' + step + '" value="' + hi + '" aria-label="' + label + ' maximum" />' +
      "</div></div>";
  }
  // ---- single dropdowns (Year exact · Price / Mileage buckets), Aston-style ----
  var YEAR_OPTS = []; for (var _y = maxYear; _y >= minYear; _y--) YEAR_OPTS.push({ v: _y + "-" + _y, l: "" + _y });
  var PRICE_OPTS = [
    { v: "0-30000", l: "Under $30,000" },
    { v: "30000-50000", l: "$30,000 – $50,000" },
    { v: "50000-75000", l: "$50,000 – $75,000" },
    { v: "75000-100000", l: "$75,000 – $100,000" },
    { v: "100000-", l: "$100,000+" }
  ];
  var MILE_OPTS = [
    { v: "0-25000", l: "Under 25,000 mi" },
    { v: "0-50000", l: "Under 50,000 mi" },
    { v: "0-75000", l: "Under 75,000 mi" },
    { v: "0-100000", l: "Under 100,000 mi" },
    { v: "100000-", l: "100,000+ mi" }
  ];
  function oneSelect(key, label, ph, opts) {
    return '<div class="fb-field" data-single="' + key + '"><label>' + label + "</label>" +
      '<select class="fb-ctrl" data-single-sel aria-label="' + label + '"><option value="">' + ph + "</option>" +
      opts.map(function (o) { return '<option value="' + o.v + '">' + o.l + "</option>"; }).join("") +
      "</select></div>";
  }

  function buildTopSearch() {
    var host = $("[data-ts-fields]"); if (!host) return;
    host.innerHTML =
      oneSelect("year", "Year", "Any year", YEAR_OPTS) +
      '<div class="fb-field"><label for="ts-make">Make</label><select id="ts-make" class="fb-ctrl" data-ts-make>' + selOptions(MAKES.values, "Any make") + "</select></div>" +
      '<div class="fb-field"><label for="ts-model">Model</label><select id="ts-model" class="fb-ctrl" data-ts-model>' + selOptions(UNIQ_MODELS, "Any model") + "</select></div>" +
      oneSelect("price", "Price", "Any price", PRICE_OPTS) +
      oneSelect("mileage", "Mileage", "Any mileage", MILE_OPTS) +
      '<button type="button" class="fb-adv-toggle" data-adv-toggle aria-expanded="false">' +
        '<i class="bi bi-sliders"></i> All filters<span class="fb-adv-count" data-adv-count></span>' +
        '<i class="bi bi-chevron-down fb-adv-caret"></i></button>' +
      '<button type="button" class="fb-clear" data-clear disabled>Clear all</button>';

    // single "range" dropdowns (Year, Price, Mileage) — value is "min-max"
    $$("[data-single]", host).forEach(function (d) {
      var key = d.getAttribute("data-single");
      var sel = $("[data-single-sel]", d);
      sel.addEventListener("change", function () {
        var parts = (sel.value || "").split("-");
        var a = +parts[0] || null, b = (parts.length > 1 && parts[1]) ? (+parts[1] || null) : null;
        state[key + "Min"] = a; state[key + "Max"] = b;
        apply();
      });
      d._single = sel;
    });

    // make / model selects
    var makeSel = $("[data-ts-make]", host), modelSel = $("[data-ts-model]", host);
    makeSel.addEventListener("change", function () {
      state.make = makeSel.value ? [makeSel.value] : [];
      var cur = state.model[0] || "";
      var list = modelsFor(makeSel.value);
      modelSel.innerHTML = selOptions(list, "Any model");
      if (cur && list.indexOf(cur) !== -1) modelSel.value = cur; else state.model = [];
      apply();
    });
    modelSel.addEventListener("change", function () { state.model = modelSel.value ? [modelSel.value] : []; apply(); });

    buildAdvanced();
  }

  /* ---------- advanced ("All filters") accordion ---------- */
  function chipGroup(facet, opts) {
    return '<div class="adv-chips" data-adv-group="' + facet + '">' + opts.map(function (o) {
      return '<label class="adv-chip"><input type="checkbox" value="' + o + '" data-adv-facet="' + facet + '" /><span>' + o + "</span></label>";
    }).join("") + "</div>";
  }
  function buildAdvanced() {
    var host = $("[data-adv-fields]"); if (!host) return;
    host.innerHTML =
      '<div class="adv-grid">' +
        '<div class="fb-field"><label>Exterior color</label><select class="fb-ctrl" data-adv-sel="extColor">' + selOptions(EXT_COLORS, "Any color") + "</select></div>" +
        '<div class="fb-field"><label>Interior color</label><select class="fb-ctrl" data-adv-sel="intColor">' + selOptions(INT_COLORS, "Any color") + "</select></div>" +
        '<div class="fb-field"><label>Fuel type</label><select class="fb-ctrl" data-adv-sel="fuel">' + selOptions(FUELS, "Any fuel") + "</select></div>" +
        '<div class="fb-field"><label>Drive type</label><select class="fb-ctrl" data-adv-sel="drivetrain">' + selOptions(DRIVE.values, "Any drivetrain") + "</select></div>" +
        '<div class="fb-field"><label>MPG highway</label><select class="fb-ctrl" data-adv-sel="mpgHwy"><option value="">Any</option>' +
          MPG_OPTS.map(function (m) { return '<option value="' + m + '">' + m + "+ mpg</option>"; }).join("") + "</select></div>" +
      "</div>" +
      '<div class="adv-groups">' +
        '<div class="adv-block"><div class="adv-block__label">Body style</div>' + chipGroup("body", BODY_OPTS) + "</div>" +
        '<div class="adv-block"><div class="adv-block__label">Interior type</div>' + chipGroup("intType", INTTYPE_OPTS) + "</div>" +
      "</div>";

    // single-select advanced fields (stored as arrays / value)
    $$("[data-adv-sel]", host).forEach(function (sel) {
      sel.addEventListener("change", function () {
        var facet = sel.getAttribute("data-adv-sel");
        if (facet === "mpgHwy") state.mpgHwy = sel.value ? +sel.value : null;
        else state[facet] = sel.value ? [sel.value] : [];
        apply();
      });
    });
    // checkbox chip groups (multi-select)
    host.addEventListener("change", function (e) {
      var cb = e.target.closest("input[data-adv-facet]"); if (!cb) return;
      onFacetChange(cb.getAttribute("data-adv-facet"), cb.value, cb.checked);
      apply();
    });

    // accordion open / close
    var bar = $("[data-filterbar]"), toggle = $("[data-adv-toggle]");
    if (toggle && bar) {
      toggle.addEventListener("click", function () {
        var open = bar.classList.toggle("is-adv-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }
  }
  function advCount() {
    return state.extColor.length + state.intColor.length + state.fuel.length +
      state.drivetrain.length + state.body.length + state.intType.length + (state.mpgHwy ? 1 : 0);
  }
  function syncTopSearch() {
    var host = $("[data-ts-fields]"); if (!host) return;
    var kw = $("[data-search]"); if (kw) kw.value = state.q;
    var makeSel = $("[data-ts-make]", host), modelSel = $("[data-ts-model]", host);
    if (makeSel) makeSel.value = state.make[0] || "";
    if (modelSel) { modelSel.innerHTML = selOptions(modelsFor(state.make[0] || ""), "Any model"); modelSel.value = state.model[0] || ""; }
    $$("[data-single]", host).forEach(function (d) {
      var key = d.getAttribute("data-single"), sel = d._single; if (!sel) return;
      var mn = state[key + "Min"], mx = state[key + "Max"];
      sel.value = (mn || mx) ? ((mn || 0) + "-" + (mx || "")) : "";
    });

    // advanced panel controls
    var advSelVal = { extColor: state.extColor[0] || "", intColor: state.intColor[0] || "", fuel: state.fuel[0] || "", drivetrain: state.drivetrain[0] || "", mpgHwy: state.mpgHwy || "" };
    $$("[data-adv-sel]").forEach(function (sel) { var f = sel.getAttribute("data-adv-sel"); sel.value = advSelVal[f]; });
    $$("input[data-adv-facet]").forEach(function (cb) {
      var f = cb.getAttribute("data-adv-facet");
      cb.checked = state[f] && state[f].indexOf(cb.value) !== -1;
    });
    var cnt = $("[data-adv-count]"); if (cnt) { var n = advCount(); cnt.textContent = n ? n : ""; cnt.classList.toggle("is-shown", !!n); }
  }

  /* ---------- van type quick-pick (Passenger / Cargo) ---------- */
  // Counts are faceted: every other active filter applies, but not the
  // category itself — so each tile shows what you'd get by picking it.
  function catCounts() {
    var saved = state.bodyCats;
    state.bodyCats = [];
    var pool = DATA.filter(matches);
    state.bodyCats = saved;
    var out = { passenger: 0, cargo: 0 };
    pool.forEach(function (v) { out[bodyCatOf(v)]++; });
    return out;
  }
  function syncBodyPick() {
    var host = $("[data-bodypick]"); if (!host) return;
    var counts = catCounts();
    $$("[data-body-cat]", host).forEach(function (b) {
      var cat = b.getAttribute("data-body-cat");
      var on = state.bodyCats.indexOf(cat) !== -1;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
      var c = $("[data-cat-count]", b); if (c) c.textContent = counts[cat];
      b.disabled = !on && counts[cat] === 0;   // never trap the user on an empty tile
    });
  }
  var bodypickHost = $("[data-bodypick]");
  if (bodypickHost) bodypickHost.addEventListener("click", function (e) {
    var b = e.target.closest("[data-body-cat]"); if (!b || b.disabled) return;
    // independent toggles — Passenger and Cargo can both be on
    onFacetChange("bodyCats", b.getAttribute("data-body-cat"), state.bodyCats.indexOf(b.getAttribute("data-body-cat")) === -1);
    apply();
  });

  /* ---------- events: filters ---------- */
  function onFacetChange(facet, val, on) {
    var arr = state[facet];
    var i = arr.indexOf(val);
    if (on && i === -1) arr.push(val);
    else if (!on && i !== -1) arr.splice(i, 1);
  }
  // build the static top search (creates the [data-search] keyword input + [data-clear])
  buildTopSearch();

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
    state = { q: "", bodyCats: [], make: [], model: [], body: [], drivetrain: [], extColor: [], intColor: [], fuel: [], intType: [], mpgHwy: null, priceMin: null, priceMax: null, yearMin: null, yearMax: null, mileageMin: null, mileageMax: null, sort: state.sort };
    searchEl.value = "";
    renderFilters(); apply(); syncTopSearch();
  }
  $("[data-clear]").addEventListener("click", clearAll);
  var clear2 = $("[data-clear-2]"); if (clear2) clear2.addEventListener("click", clearAll);

  // chip removal
  $("[data-chips]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-remove-facet]"); if (!b) return;
    var facet = b.getAttribute("data-remove-facet"), val = b.getAttribute("data-remove-val");
    if (facet === "make" || facet === "model" || facet === "body" || facet === "drivetrain" || facet === "bodyCats" ||
        facet === "extColor" || facet === "intColor" || facet === "fuel" || facet === "intType") onFacetChange(facet, val, false);
    else if (facet === "q") { state.q = ""; searchEl.value = ""; }
    else if (facet === "yearR") { state.yearMin = null; state.yearMax = null; }
    else if (facet === "priceR") { state.priceMin = null; state.priceMax = null; }
    else if (facet === "mileageR") { state.mileageMin = null; state.mileageMax = null; }
    else state[facet] = null;
    renderFilters(); apply(); syncTopSearch();
  });

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
    var act = e.target.closest("[data-act]");
    if (act) {
      e.preventDefault();
      var cardEl = act.closest(".v-card"); if (!cardEl) return;
      var v = byId(cardEl.getAttribute("data-id")); if (!v) return;
      if (act.getAttribute("data-act") === "photos") { location.href = "vehicle3.html?id=" + v.id; return; }
      openModal(v, act.getAttribute("data-act"));
      return;
    }
    // clicks on a real link (title, View Details) follow their href
    if (e.target.closest("a")) return;
    // any other click on the card → open the VDP
    var mc = e.target.closest(".v-card");
    if (mc) location.href = "vehicle3.html?id=" + mc.getAttribute("data-id");
  });
  $$("[data-modal-close]").forEach(function (el) { el.addEventListener("click", closeModal); });
  $("[data-modal-form]").addEventListener("submit", function (e) {
    e.preventDefault();
    // (front-end demo) — swap for a real endpoint later
    $("[data-modal-form]").style.display = "none";
    $("[data-modal-success]").classList.add("is-shown");
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeModal(); }
  });

  /* ---------- boot ---------- */
  readURL();
  renderFilters();
  syncTopSearch();
  var totalEl = $("[data-total-count]"); if (totalEl) totalEl.textContent = DATA.length;
  apply();
})();
