/* Thatcham Baptist Church — shared feed helpers (TBCFeed)
   Used by both the Small Groups page and the What's On / homepage events.
   Dependency-free. Exposes a small global so each page's script can reuse the
   same fetch / sanitise / format / fallback behaviour instead of duplicating it. */
(function () {
  "use strict";

  /* ---------- HTML sanitiser ----------
     Feed descriptions contain HTML (<br>, links). We render it as HTML so line
     breaks and mailto/links work, but rebuild it from a strict allow-list so
     nothing hostile (scripts, event handlers, iframes) survives. This is the
     original small-groups.js sanitiser, moved here so both pages share it. */
  var ALLOWED_TAGS = { A: 1, BR: 1, P: 1, EM: 1, STRONG: 1, B: 1, I: 1, U: 1, UL: 1, OL: 1, LI: 1, SPAN: 1, DIV: 1 };
  var DROP_TAGS = { SCRIPT: 1, STYLE: 1, IFRAME: 1, OBJECT: 1, EMBED: 1, LINK: 1, META: 1, HEAD: 1, SVG: 1, IMG: 1 };

  function cloneClean(src, dest) {
    var nodes = src.childNodes;
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (node.nodeType === 3) {
        dest.appendChild(document.createTextNode(node.nodeValue));
      } else if (node.nodeType === 1) {
        var tag = node.tagName;
        if (DROP_TAGS[tag]) continue; // skip entirely, contents included
        if (ALLOWED_TAGS[tag]) {
          var el = document.createElement(tag.toLowerCase());
          if (tag === "A") {
            var href = node.getAttribute("href") || "";
            if (/^(https?:|mailto:)/i.test(href)) {
              el.setAttribute("href", href);
              if (/^https?:/i.test(href)) {
                el.setAttribute("target", "_blank");
                el.setAttribute("rel", "noopener noreferrer");
              }
            }
          }
          cloneClean(node, el);
          dest.appendChild(el);
        } else {
          cloneClean(node, dest); // unknown tag: unwrap, keep children
        }
      }
    }
  }

  function sanitize(html) {
    var frag = document.createDocumentFragment();
    if (!html) return frag;
    var doc = new DOMParser().parseFromString(String(html), "text/html");
    cloneClean(doc.body, frag);
    return frag;
  }

  /* Does the (sanitised) HTML carry any visible text? Used to skip empty
     descriptions (the events feed often has description === ""). */
  function hasText(html) {
    if (!html) return false;
    var doc = new DOMParser().parseFromString(String(html), "text/html");
    return (doc.body.textContent || "").trim().length > 0;
  }

  /* ---------- Fetch with timeout ---------- */
  function fetchJSON(url, timeoutMs) {
    timeoutMs = timeoutMs || 12000;
    var controller = "AbortController" in window ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, timeoutMs) : null;
    return fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller ? controller.signal : undefined,
    })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        if (timer) clearTimeout(timer);
        return data;
      })
      .catch(function (err) {
        if (timer) clearTimeout(timer);
        throw err;
      });
  }

  /* ---------- Icons (match the site's stroke style) ---------- */
  function icon(kind) {
    if (kind === "cal") {
      return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="5" width="16" height="16" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M4 9h16M8 3v3M16 3v3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
    }
    if (kind === "clock") {
      return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.8"/><path d="M12 7.5V12l3 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21s-7-5.7-7-11a7 7 0 1114 0c0 5.3-7 11-7 11z" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="10" r="2.4" stroke="currentColor" stroke-width="1.8"/></svg>';
  }

  /* ---------- Images ---------- */
  function imageUrl(image) {
    return image && (image.medium || image.small || image.large || image.thumbnail) || "";
  }

  function placeholderEl(name, cls) {
    var ph = document.createElement("div");
    ph.className = cls || "sg-card__ph";
    ph.setAttribute("aria-hidden", "true");
    ph.textContent = ((name || "?").trim().charAt(0) || "?").toUpperCase();
    return ph;
  }

  /* ---------- UK date / time formatting ----------
     The calendar feed stores times in UTC (…Z). We render them in Europe/London
     so BST/GMT is handled automatically (e.g. 09:30Z -> 10:30am in summer). */
  var UK = "en-GB";
  var TZ = "Europe/London";

  function londonParts(date) {
    var parts = {};
    try {
      new Intl.DateTimeFormat(UK, {
        timeZone: TZ, weekday: "long", day: "numeric", month: "long",
        hour: "numeric", minute: "2-digit", hour12: true,
      }).formatToParts(date).forEach(function (p) { parts[p.type] = p.value; });
    } catch (e) { /* very old browser: fall back below */ }
    return parts;
  }

  // "Wednesday 16 September" (weekday optional)
  function formatDate(date, withWeekday) {
    var p = londonParts(date);
    if (!p.day) {
      return date.toLocaleDateString(UK, { day: "numeric", month: "long" });
    }
    var base = p.day + " " + p.month;
    return withWeekday && p.weekday ? p.weekday + " " + base : base;
  }

  // "7:15pm", "8am", "12pm"
  function formatTime(date) {
    var p = londonParts(date);
    if (!p.hour) {
      return date.toLocaleTimeString(UK, { hour: "numeric", minute: "2-digit" });
    }
    var period = (p.dayPeriod || "").toLowerCase().replace(/[^a-z]/g, "");
    var min = p.minute && p.minute !== "00" ? ":" + p.minute : "";
    return p.hour + min + period;
  }

  function parseDate(iso) {
    if (!iso) return null;
    var d = new Date(iso);
    return isNaN(d.getTime()) ? null : d;
  }

  window.TBCFeed = {
    sanitize: sanitize,
    hasText: hasText,
    fetchJSON: fetchJSON,
    icon: icon,
    imageUrl: imageUrl,
    placeholderEl: placeholderEl,
    formatDate: formatDate,
    formatTime: formatTime,
    parseDate: parseDate,
  };
})();
