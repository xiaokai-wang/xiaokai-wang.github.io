/* Xiaokai Wang — theme toggle & small interactions */
(function () {
  "use strict";

  var root = document.documentElement;

  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("theme", theme);
    } catch (e) { /* private mode */ }
  }

  var toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
      setTheme(current === "dark" ? "light" : "dark");
    });
  }

  /* follow system preference changes unless user has an explicit choice */
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var onChange = function (e) {
      var stored = null;
      try { stored = localStorage.getItem("theme"); } catch (err) { /* noop */ }
      if (!stored) {
        root.setAttribute("data-theme", e.matches ? "dark" : "light");
      }
    };
    if (mq.addEventListener) { mq.addEventListener("change", onChange); }
    else if (mq.addListener) { mq.addListener(onChange); }
  }

  /* lazy-load Disqus comments on demand */
  var loadBtn = document.getElementById("load-comments");
  if (loadBtn) {
    loadBtn.addEventListener("click", function () {
      var shortname = loadBtn.getAttribute("data-disqus");
      if (!shortname) { return; }
      var d = document;
      var s = d.createElement("script");
      s.async = true;
      s.src = "https://" + shortname + ".disqus.com/embed.js";
      s.setAttribute("data-timestamp", +new Date());
      (d.head || d.body).appendChild(s);
      loadBtn.style.display = "none";
    });
  }
})();
