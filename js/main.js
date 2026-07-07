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
})();
