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
      var next = current === "dark" ? "light" : "dark";
      setTheme(next);
      if (window.giscus && typeof window.giscus.setTheme === "function") {
        window.giscus.setTheme(next);
      }
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

  /* auto-load Disqus comments on page load */
  function bootDisqus() {
    var thread = document.getElementById("disqus_thread");
    if (!thread) { return; }
    var shortname = thread.getAttribute("data-disqus");
    if (!shortname) { return; }
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://" + shortname + ".disqus.com/embed.js";
    s.setAttribute("data-timestamp", +new Date());
    (document.head || document.body).appendChild(s);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootDisqus);
  } else {
    bootDisqus();
  }

  /* sync giscus (GitHub Discussions) theme with the site theme once it loads */
  function syncGiscusTheme() {
    if (window.giscus && typeof window.giscus.setTheme === "function") {
      window.giscus.setTheme(root.getAttribute("data-theme") || "light");
      return true;
    }
    return false;
  }
  var giscusTimer = setInterval(function () {
    if (syncGiscusTheme()) { clearInterval(giscusTimer); }
  }, 250);
  setTimeout(function () { clearInterval(giscusTimer); }, 15000);
})();
