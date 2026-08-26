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

  /* comment system chooser: tab switch with lazy load + remember last choice */
  function initCommentTabs() {
    var tabs = document.querySelectorAll(".comments-tab");
    if (!tabs.length) { return; }

    var STORAGE_KEY = "preferredCommentTab";
    var savedTab = null;
    try { savedTab = localStorage.getItem(STORAGE_KEY); } catch (e) { /* noop */ }

    function activate(tabId) {
      var activated = false;
      tabs.forEach(function (t) {
        var active = t.id === tabId;
        t.setAttribute("aria-selected", active ? "true" : "false");
        t.classList.toggle("is-active", active);
        var panel = document.getElementById(t.getAttribute("data-target"));
        if (!panel) { return; }
        if (active) {
          panel.removeAttribute("hidden");
          if (t.id === "tab-disqus") { loadDisqus(panel); }
          if (t.id === "tab-giscus") { loadGiscus(panel); }
          activated = true;
        } else {
          panel.setAttribute("hidden", "");
        }
      });
      if (activated) {
        try { localStorage.setItem(STORAGE_KEY, tabId); } catch (e) { /* noop */ }
      }
    }

    function loadDisqus(panel) {
      var thread = panel.querySelector("#disqus_thread");
      if (!thread || thread.getAttribute("data-loaded")) { return; }
      var shortname = thread.getAttribute("data-disqus");
      if (!shortname) { return; }
      var s = document.createElement("script");
      s.async = true;
      s.src = "https://" + shortname + ".disqus.com/embed.js";
      s.setAttribute("data-timestamp", +new Date());
      (document.head || document.body).appendChild(s);
      thread.setAttribute("data-loaded", "1");
    }

    function loadGiscus(panel) {
      if (panel.getAttribute("data-loaded")) { return; }
      var s = document.createElement("script");
      s.src = "https://giscus.app/client.js";
      s.async = true;
      s.crossOrigin = "anonymous";
      s.setAttribute("data-repo",            panel.getAttribute("data-giscus-repo") || "");
      s.setAttribute("data-repo-id",         panel.getAttribute("data-giscus-repo-id") || "");
      s.setAttribute("data-category",        panel.getAttribute("data-giscus-category") || "General");
      s.setAttribute("data-category-id",     panel.getAttribute("data-giscus-category-id") || "");
      s.setAttribute("data-mapping",         "pathname");
      s.setAttribute("data-strict",          "1");
      s.setAttribute("data-reactions-enabled","1");
      s.setAttribute("data-emit-metadata",   "0");
      s.setAttribute("data-input-position",  "top");
      s.setAttribute("data-theme",           "preferred_color_scheme");
      s.setAttribute("data-lang",            panel.getAttribute("data-giscus-lang") || "zh-CN");
      s.onload = function () {
        /* once giscus client is ready, sync to current site theme */
        var trySync = function () {
          if (window.giscus && typeof window.giscus.setTheme === "function") {
            window.giscus.setTheme(root.getAttribute("data-theme") || "light");
          } else {
            setTimeout(trySync, 200);
          }
        };
        trySync();
      };
      var placeholder = panel.querySelector(".comments-loading");
      if (placeholder) { placeholder.parentNode.removeChild(placeholder); }
      panel.appendChild(s);
      panel.setAttribute("data-loaded", "1");
    }

    tabs.forEach(function (t) {
      t.addEventListener("click", function () { activate(t.id); });
    });

    /* initial active: prefer saved choice; else first available tab */
    var initial = (savedTab && document.getElementById(savedTab)) ? savedTab : tabs[0].id;
    activate(initial);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCommentTabs);
  } else {
    initCommentTabs();
  }
})();
