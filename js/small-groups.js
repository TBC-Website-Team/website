/* Thatcham Baptist Church — Small Groups
   Fetches the ChurchSuite small-groups JSON feed and renders each group as a
   card in the site's own design. Dependency-free, progressive enhancement.
   The graceful fallback (no JS / fetch fails) lives in the page markup. */
(function () {
  "use strict";

  var FEED_URL =
    "https://thatchambaptist.churchsuite.com/-/smallgroups/a9210c48-099f-402a-8b71-2990b27c46a1/json";
  var EMAIL = "smallgroups@thatchambaptist.org.uk";
  var TIMEOUT_MS = 12000;

  var root = document.getElementById("sg-app");
  if (!root) return;

  var statusEl = document.getElementById("sg-status");
  var filtersEl = document.getElementById("sg-filters");
  var gridEl = document.getElementById("sg-grid");

  /* ---------- Small helpers ---------- */

  var DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function dayName(day) {
    if (day === null || day === undefined || day === "") return "";
    if (typeof day === "number") return DAY_NAMES[day] || "";
    var s = String(day).trim();
    if (/^\d+$/.test(s)) return DAY_NAMES[parseInt(s, 10)] || "";
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }

  function dayPlural(name) {
    if (!name) return "";
    return name + (/s$/i.test(name) ? "" : "s");
  }

  function formatTime(t) {
    if (!t) return "";
    var m = String(t).match(/^(\d{1,2}):(\d{2})/);
    if (!m) return String(t);
    var h = parseInt(m[1], 10);
    var min = m[2];
    var ap = h < 12 ? "am" : "pm";
    var h12 = h % 12;
    if (h12 === 0) h12 = 12;
    return h12 + (min === "00" ? "" : ":" + min) + ap;
  }

  function dayTimeLine(group) {
    var parts = [];
    var d = dayPlural(dayName(group.day));
    var t = formatTime(group.time);
    if (d && t) parts.push(d + ", " + t);
    else if (d) parts.push(d);
    else if (t) parts.push(t);
    var freq = group.frequency ? String(group.frequency).trim() : "";
    if (freq && freq.toLowerCase() !== "weekly") {
      parts.push(freq.charAt(0).toUpperCase() + freq.slice(1).toLowerCase());
    }
    return parts.join(" · ");
  }

  function locationText(loc) {
    if (!loc) return "Location to be confirmed";
    if (loc.type === "online") return "Online (Zoom)";
    // physical
    var addr = loc.address ? String(loc.address).trim() : "";
    if (addr) return addr.replace(/\s*\n\s*/g, ", ");
    return "In a home";
  }

  /* ---------- HTML sanitiser ----------
     Shared with the events feed — the allow-list sanitiser now lives in
     js/feed-common.js (window.TBCFeed) so both pages use one implementation. */
  var sanitize = (window.TBCFeed && window.TBCFeed.sanitize) ||
    function () { return document.createDocumentFragment(); };

  /* ---------- Icons (match the site's stroke style) ---------- */
  function icon(kind) {
    if (kind === "cal") {
      return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="5" width="16" height="16" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M4 9h16M8 3v3M16 3v3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
    }
    return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21s-7-5.7-7-11a7 7 0 1114 0c0 5.3-7 11-7 11z" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="10" r="2.4" stroke="currentColor" stroke-width="1.8"/></svg>';
  }

  /* ---------- Card builder ---------- */
  function buildCard(group) {
    var card = document.createElement("article");
    card.className = "sg-card reveal in";
    var dayKey = dayName(group.day).toLowerCase();
    card.setAttribute("data-day", dayKey || "other");

    // Media
    var media = document.createElement("div");
    media.className = "sg-card__media";
    var imgUrl =
      group.image &&
      (group.image.medium || group.image.small || group.image.large || group.image.thumbnail);
    if (imgUrl) {
      var img = document.createElement("img");
      img.src = imgUrl;
      img.alt = group.name ? group.name + " small group" : "Small group";
      img.loading = "lazy";
      img.decoding = "async";
      img.addEventListener("error", function () {
        media.replaceChild(placeholder(group.name), img);
      });
      media.appendChild(img);
    } else {
      media.appendChild(placeholder(group.name));
    }

    // Status badge
    var open = group.signup_enabled === true;
    var badge = document.createElement("span");
    badge.className = "sg-badge " + (open ? "sg-badge--open" : "sg-badge--full");
    badge.textContent = open ? "Open to new members" : "Not taking new members right now";
    media.appendChild(badge);
    card.appendChild(media);

    // Body
    var body = document.createElement("div");
    body.className = "sg-card__body";

    var h3 = document.createElement("h3");
    h3.className = "sg-card__name";
    h3.textContent = group.name || "Small group";
    body.appendChild(h3);

    var meta = document.createElement("p");
    meta.className = "sg-card__meta";
    var dt = dayTimeLine(group);
    if (dt) meta.appendChild(metaRow("cal", dt));
    meta.appendChild(metaRow("pin", locationText(group.location)));
    body.appendChild(meta);

    // Description (sanitised HTML, clamped with read-more)
    if (group.description) {
      var desc = document.createElement("div");
      desc.className = "sg-card__desc is-clamped";
      desc.appendChild(sanitize(group.description));
      body.appendChild(desc);

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sg-readmore";
      btn.textContent = "Read more";
      btn.hidden = true;
      btn.addEventListener("click", function () {
        var clamped = desc.classList.toggle("is-clamped");
        btn.textContent = clamped ? "Read more" : "Show less";
      });
      body.appendChild(btn);
      // Show the toggle only if the text actually overflows the clamp.
      card._checkClamp = function () {
        if (desc.scrollHeight - desc.clientHeight > 4) btn.hidden = false;
      };
    }

    // Members count (subtle)
    var n = parseInt(group.num_members, 10);
    if (!isNaN(n) && n > 0) {
      var foot = document.createElement("div");
      foot.className = "sg-card__foot";
      foot.textContent = n + (n === 1 ? " member" : " members");
      body.appendChild(foot);
    }

    card.appendChild(body);
    return card;
  }

  function metaRow(iconKind, text) {
    var span = document.createElement("span");
    span.innerHTML = icon(iconKind);
    span.appendChild(document.createTextNode(text));
    return span;
  }

  function placeholder(name) {
    var ph = document.createElement("div");
    ph.className = "sg-card__ph";
    ph.setAttribute("aria-hidden", "true");
    ph.textContent = (name || "?").trim().charAt(0).toUpperCase() || "?";
    return ph;
  }

  /* ---------- Day filter ---------- */
  function buildFilters(groups) {
    var present = {};
    groups.forEach(function (g) {
      var k = dayName(g.day).toLowerCase();
      if (k) present[k] = true;
    });
    var ordered = DAY_NAMES.map(function (d) { return d.toLowerCase(); }).filter(function (d) {
      return present[d];
    });
    if (ordered.length < 2) return; // nothing useful to filter by

    filtersEl.innerHTML = "";
    filtersEl.setAttribute("role", "group");
    filtersEl.setAttribute("aria-label", "Filter groups by day");

    addFilterBtn("all", "All groups", true);
    ordered.forEach(function (d) {
      addFilterBtn(d, d.charAt(0).toUpperCase() + d.slice(1));
    });
    filtersEl.hidden = false;
  }

  function addFilterBtn(day, label, active) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "filter-btn" + (active ? " active" : "");
    b.setAttribute("data-day", day);
    b.textContent = label;
    b.addEventListener("click", function () {
      filtersEl.querySelectorAll(".filter-btn").forEach(function (x) {
        x.classList.remove("active");
      });
      b.classList.add("active");
      var cards = gridEl.querySelectorAll(".sg-card");
      cards.forEach(function (card) {
        var show = day === "all" || card.getAttribute("data-day") === day;
        card.style.display = show ? "" : "none";
      });
    });
    filtersEl.appendChild(b);
  }

  /* ---------- States ---------- */
  function showFallback(message) {
    if (filtersEl) filtersEl.hidden = true;
    gridEl.innerHTML = "";

    var box = document.createElement("div");
    box.className = "sg-fallback";
    box.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none"><path d="M4 4h16v12H7l-3 3V4z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';

    var p = document.createElement("p");
    p.appendChild(document.createTextNode(message + " "));
    var a = document.createElement("a");
    a.href = "mailto:" + EMAIL;
    a.textContent = EMAIL;
    p.appendChild(a);
    p.appendChild(
      document.createTextNode(" and we'll tell you about groups that might suit you.")
    );
    box.appendChild(p);

    statusEl.innerHTML = "";
    statusEl.appendChild(box);
    statusEl.hidden = false;
  }

  function render(groups) {
    // Sort: open to new members first, preserving feed order within each bucket.
    var withIndex = groups.map(function (g, i) { return { g: g, i: i }; });
    withIndex.sort(function (a, b) {
      var ao = a.g.signup_enabled === true ? 0 : 1;
      var bo = b.g.signup_enabled === true ? 0 : 1;
      if (ao !== bo) return ao - bo;
      return a.i - b.i;
    });

    var cards = [];
    var frag = document.createDocumentFragment();
    withIndex.forEach(function (item) {
      var card = buildCard(item.g);
      cards.push(card);
      frag.appendChild(card);
    });

    statusEl.hidden = true;
    statusEl.innerHTML = "";
    gridEl.appendChild(frag);
    buildFilters(groups);

    // Reveal read-more buttons where descriptions overflow (needs layout).
    requestAnimationFrame(function () {
      cards.forEach(function (c) { if (c._checkClamp) c._checkClamp(); });
    });
  }

  /* ---------- Fetch ---------- */
  function load() {
    var controller = "AbortController" in window ? new AbortController() : null;
    var timer = controller
      ? setTimeout(function () { controller.abort(); }, TIMEOUT_MS)
      : null;

    fetch(FEED_URL, {
      headers: { Accept: "application/json" },
      signal: controller ? controller.signal : undefined,
    })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        if (timer) clearTimeout(timer);
        var groups = data && Array.isArray(data.groups) ? data.groups : [];
        if (!groups.length) {
          showFallback("We don't have any groups listed to show right now. Please email");
          return;
        }
        render(groups);
      })
      .catch(function () {
        if (timer) clearTimeout(timer);
        showFallback(
          "We're having trouble loading our groups list right now. Please email"
        );
      });
  }

  load();
})();
