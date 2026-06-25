/* GM Motors NY — site JS
   Keep it small; let Bootstrap do the heavy lifting. */
(function () {
  "use strict";

  // Footer year
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

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
