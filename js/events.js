/* Thatcham Baptist Church — live events from the ChurchSuite calendar feed.
   Renders "special events / dates for your diary" on the What's On page and a
   compact "What's coming up" element on the homepage. Reuses the shared
   fetch / sanitise / format helpers in js/feed-common.js (window.TBCFeed).

   What the feed contains (checked against live data):
   - Mostly dated INSTANCES of recurring services — Sunday Morning Service and
     Prayer Breakfast come through as many repeated dates, not a weekly pattern.
   - A handful of genuine specials/one-offs (Alpha, Flourish, kids' faith club,
     Barn Dance, church meetings, special Sunday services).
   The weekly midweek rhythm (Coffee Morning, Toddlers, Youth, Foodbank, etc.)
   is NOT in this feed, so we COMPLEMENT the hand-built weekly rhythm here with
   the specials rather than replacing it. Regular weekly series are collapsed
   out of this view (they're already shown in the weekly rhythm / service times). */
(function () {
  "use strict";

  var F = window.TBCFeed;
  var FEED_URL =
    "https://thatchambaptist.churchsuite.com/-/calendar/4fdca2be-5a23-4d7e-95ab-2a5bcbe63534/json";
  var EMAIL = "office@thatchambaptist.org.uk";

  // A series counts as a "regular" (weekly-ish) gathering when it recurs often
  // and tightly — those are handled by the weekly rhythm, so we leave them out
  // of the specials view. Occasional/monthly/one-off events are kept.
  var REGULAR_MIN_COUNT = 6;
  var REGULAR_MAX_GAP_DAYS = 10;

  // Collect render targets present on this page.
  var targets = [];
  var whatsOn = document.getElementById("ev-whatson");
  if (whatsOn) {
    targets.push({
      grid: document.getElementById("ev-grid"),
      status: document.getElementById("ev-status"),
      section: null,
      limit: 0, // 0 = show all
      mode: "fallback",
    });
  }
  var home = document.getElementById("ev-home");
  if (home) {
    targets.push({
      grid: document.getElementById("evh-grid"),
      status: document.getElementById("evh-status"),
      section: document.getElementById("coming-up"),
      limit: 3,
      mode: "hide", // homepage: hide the whole block if it fails or is empty
    });
  }
  if (!targets.length) return;

  /* ---------- Classification ---------- */
  function seriesKey(e) {
    return String(e.sequence_id || e.merge_identifier || e.name || "");
  }
  function normName(s) {
    return String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  }
  function medianGapDays(dates) {
    if (dates.length < 2) return null;
    var g = [];
    for (var i = 1; i < dates.length; i++) g.push((dates[i] - dates[i - 1]) / 86400000);
    g.sort(function (a, b) { return a - b; });
    var m = Math.floor(g.length / 2);
    return g.length % 2 ? g[m] : (g[m - 1] + g[m]) / 2;
  }
  function londonDateKey(date) {
    try {
      return date.toLocaleDateString("en-GB", { timeZone: "Europe/London" });
    } catch (e) {
      return String(date.getTime());
    }
  }

  function upcomingSpecials(events) {
    var cutoff = Date.now() - 12 * 3600 * 1000; // keep today's events
    var series = {};
    events.forEach(function (e) {
      var d = F.parseDate(e.starts_at);
      if (!d) return;
      var k = seriesKey(e);
      (series[k] || (series[k] = [])).push({ e: e, d: d });
    });

    var out = [];
    Object.keys(series).forEach(function (k) {
      var items = series[k];
      items.sort(function (a, b) { return a.d - b.d; });
      var dates = items.map(function (x) { return x.d; });
      var gap = medianGapDays(dates);
      var isRegular =
        items.length >= REGULAR_MIN_COUNT && gap !== null && gap <= REGULAR_MAX_GAP_DAYS;
      if (isRegular) return; // covered by the weekly rhythm

      // next upcoming instance in this series
      var next = null;
      for (var i = 0; i < items.length; i++) {
        if (items[i].d.getTime() >= cutoff) { next = items[i]; break; }
      }
      if (!next) return;
      out.push({ event: next.e, start: next.d, count: items.length });
    });

    // Merge any duplicate series that share a name + date (the feed has e.g.
    // "Prayer 4 Thatcham" and "Prayer4Thatcham" as two series on the same day).
    var seen = {};
    var deduped = [];
    out.sort(function (a, b) { return a.start - b.start; });
    out.forEach(function (item) {
      var key = normName(item.event.name) + "@" + londonDateKey(item.start);
      if (seen[key]) return;
      seen[key] = 1;
      deduped.push(item);
    });
    return deduped;
  }

  /* ---------- Location text ---------- */
  function locationText(loc) {
    if (!loc) return "";
    if (loc.type === "online") return loc.name ? "Online (" + loc.name + ")" : "Online";
    var parts = [];
    if (loc.name && String(loc.name).trim()) parts.push(String(loc.name).trim());
    var addr = loc.address ? String(loc.address).trim() : "";
    if (addr && parts.indexOf(addr) === -1) parts.push(addr.replace(/\s*\n\s*/g, ", "));
    return parts.join(" · ");
  }

  /* ---------- Card ---------- */
  function metaRow(kind, text) {
    var span = document.createElement("span");
    span.innerHTML = F.icon(kind);
    span.appendChild(document.createTextNode(text));
    return span;
  }

  function buildCard(item) {
    var e = item.event;
    var card = document.createElement("article");
    card.className = "sg-card reveal in";

    // Media
    var media = document.createElement("div");
    media.className = "sg-card__media";
    var imgUrl = F.imageUrl(e.image);
    if (imgUrl) {
      var img = document.createElement("img");
      img.src = imgUrl;
      img.alt = e.name ? e.name + " event" : "Event";
      img.loading = "lazy";
      img.decoding = "async";
      img.addEventListener("error", function () { media.replaceChild(F.placeholderEl(e.name), img); });
      media.appendChild(img);
    } else {
      media.appendChild(F.placeholderEl(e.name));
    }
    if (e.signup_enabled) {
      var badge = document.createElement("span");
      badge.className = "sg-badge sg-badge--open";
      badge.textContent = "Booking open";
      media.appendChild(badge);
    }
    card.appendChild(media);

    // Body
    var body = document.createElement("div");
    body.className = "sg-card__body";

    var when = document.createElement("p");
    when.className = "ev-when";
    when.innerHTML = F.icon("cal");
    var whenText = F.formatDate(item.start, true);
    if (!e.all_day) whenText += " · " + F.formatTime(item.start);
    when.appendChild(document.createTextNode(whenText));
    body.appendChild(when);

    var h3 = document.createElement("h3");
    h3.className = "sg-card__name";
    h3.textContent = e.name || "Event";
    body.appendChild(h3);

    var locText = locationText(e.location);
    if (locText) {
      var meta = document.createElement("p");
      meta.className = "sg-card__meta";
      meta.appendChild(metaRow("pin", locText));
      body.appendChild(meta);
    }

    if (F.hasText(e.description)) {
      var desc = document.createElement("div");
      desc.className = "sg-card__desc is-clamped";
      desc.appendChild(F.sanitize(e.description));
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
      card._checkClamp = function () {
        if (desc.scrollHeight - desc.clientHeight > 4) btn.hidden = false;
      };
    }

    // CTA — every event has a ChurchSuite page; signup_enabled means bookable.
    if (e.url) {
      var cta = document.createElement("div");
      cta.className = "sg-card__cta";
      var a = document.createElement("a");
      a.className = "btn btn--sm";
      a.href = e.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = e.signup_enabled ? "Sign up" : "More info";
      cta.appendChild(a);
      body.appendChild(cta);
    }

    card.appendChild(body);
    return card;
  }

  /* ---------- States ---------- */
  function fallbackHTML(target) {
    target.status.innerHTML = "";
    var box = document.createElement("div");
    box.className = "sg-fallback";
    box.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none"><path d="M4 4h16v12H7l-3 3V4z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
    var p = document.createElement("p");
    p.appendChild(
      document.createTextNode(
        "We're having trouble loading our events calendar right now. Please email "
      )
    );
    var a = document.createElement("a");
    a.href = "mailto:" + EMAIL;
    a.textContent = EMAIL;
    p.appendChild(a);
    p.appendChild(document.createTextNode(" or check our What's On page."));
    box.appendChild(p);
    target.status.appendChild(box);
    target.status.hidden = false;
  }

  function emptyHTML(target) {
    target.status.innerHTML =
      '<p class="sg-empty">No special events are in the diary just now — do check back soon, ' +
      'or take a look at our regular weekly rhythm.</p>';
    target.status.hidden = false;
  }

  function renderInto(target, items) {
    if (!target.grid || !target.status) return;
    if (!items.length) {
      if (target.mode === "hide" && target.section) target.section.hidden = true;
      else emptyHTML(target);
      return;
    }
    var list = target.limit > 0 ? items.slice(0, target.limit) : items;
    var cards = [];
    var frag = document.createDocumentFragment();
    list.forEach(function (item) {
      var c = buildCard(item);
      cards.push(c);
      frag.appendChild(c);
    });
    target.status.hidden = true;
    target.status.innerHTML = "";
    target.grid.appendChild(frag);
    requestAnimationFrame(function () {
      cards.forEach(function (c) { if (c._checkClamp) c._checkClamp(); });
    });
  }

  function failInto(target) {
    if (target.mode === "hide" && target.section) { target.section.hidden = true; return; }
    if (target.grid) target.grid.innerHTML = "";
    fallbackHTML(target);
  }

  /* ---------- Go ---------- */
  if (!F) { targets.forEach(failInto); return; }

  F.fetchJSON(FEED_URL)
    .then(function (data) {
      var events = data && Array.isArray(data.events) ? data.events : [];
      var items = upcomingSpecials(events);
      targets.forEach(function (t) { renderInto(t, items); });
    })
    .catch(function () {
      targets.forEach(failInto);
    });
})();
