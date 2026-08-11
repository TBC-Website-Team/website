/* Thatcham Baptist Church — demo interactions
   Small, dependency-free. Progressive enhancement only. */
(function () {
  "use strict";

  /* ---- Current year in footer ---- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---- Mobile nav drawer ---- */
  var toggle = document.querySelector(".nav-toggle");
  var drawer = document.getElementById("mobile-nav");
  if (toggle && drawer) {
    toggle.addEventListener("click", function () {
      var open = drawer.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    drawer.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        drawer.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- Scroll-in reveal ---- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- What's On day filter ---- */
  var filterBtns = document.querySelectorAll(".filter-btn");
  var dayGroups = document.querySelectorAll(".day-group");
  if (filterBtns.length && dayGroups.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var day = btn.getAttribute("data-day");
        filterBtns.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        dayGroups.forEach(function (group) {
          var show = day === "all" || group.getAttribute("data-day") === day;
          group.style.display = show ? "" : "none";
        });
      });
    });
  }

  /* ---- Demo form: no backend, show a gentle confirmation ---- */
  document.querySelectorAll("form[data-demo]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var note = form.querySelector(".form-result");
      if (note) {
        note.hidden = false;
        note.textContent = "Thank you! This is a demo form — in the live site this would send your message to the welcome team. We'd love to see you soon.";
        note.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      form.reset();
    });
  });

  /* ---- Hash anchor scroll fixer (accounts for sticky header) ---- */
  function adjustHashScroll() {
    if (!location.hash) return;
    var id = location.hash.slice(1);
    if (!id) return;
    var header = document.querySelector('.site-header');
    var headerHeight = header ? header.offsetHeight : 0;
    // Prefer targets inside the weekly rhythm section to avoid matching feed-generated anchors
    var rhythm = document.querySelector('[aria-labelledby="rhythm-h"]');
    var el = null;
    if (rhythm) {
      try { el = rhythm.querySelector('#' + CSS.escape(id)); } catch (e) { el = null; }
    }
    // Fallback to any element with the id on the page
    if (!el) el = document.getElementById(id);
    if (!el) return;
    // Debug logging to help identify incorrect targets when navigating from another page
    try {
      console.debug('[hash-scroll] id=', id, 'foundInRhythm=', !!rhythm && !!rhythm.querySelector && !!rhythm.querySelector('#' + CSS.escape(id)), 'finalEl=', el, 'text=', (el.textContent || '').trim().slice(0,120));
    } catch (e) { console.debug('[hash-scroll] id=', id, 'finalEl=', el); }
    // Allow layout to settle; sometimes fonts/images or feed injection shift content.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        var top = el.getBoundingClientRect().top + window.pageYOffset - headerHeight - 8;
        window.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
      });
    });
  }

  window.addEventListener('load', adjustHashScroll);
  window.addEventListener('hashchange', function () { setTimeout(adjustHashScroll, 0); });
  // Re-run adjust after the feed renders (the feed inserts content above the rhythm)
  document.addEventListener('tbc:feed-rendered', function () { setTimeout(adjustHashScroll, 50); });
})();
