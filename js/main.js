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

    function loadDisqusFallback(panel) {
      var thread = panel.querySelector("#disqus_thread");
      if (!thread) { return; }
      /* Disqus embed is injected statically in the layout; if 8s passed and
         Disqus never inserted an iframe, show a helpful hint. */
      setTimeout(function () {
        if (thread.querySelector("iframe")) { return; }
        thread.innerHTML = '<p class="comments-loading">Disqus 评论尚未加载。请检查：'
          + '<br>① <code>disqus.com</code> 后台是否将 <code>xiaokai-wang.github.io</code> 加入「信任的域名」；'
          + '<br>② 浏览器或扩展是否拦截了第三方资源；'
          + '<br>③ 或切换上方的「GitHub 登录」标签使用 giscus。</p>';
      }, 8000);
    }

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
          if (t.id === "tab-disqus") { loadDisqusFallback(panel); }
          if (t.id === "tab-giscus") { loadGiscus(panel); }
          if (t.id === "tab-waline") { loadWaline(panel); }
          activated = true;
        } else {
          panel.setAttribute("hidden", "");
        }
      });
      if (activated) {
        try { localStorage.setItem(STORAGE_KEY, tabId); } catch (e) { /* noop */ }
      }
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

    function loadWaline(panel) {
      if (panel.getAttribute("data-loaded")) { return; }
      var serverURL = panel.getAttribute("data-waline-server-url") || "";
      var lang      = panel.getAttribute("data-waline-lang") || "zh-CN";
      var path      = panel.getAttribute("data-waline-path") || window.location.pathname;
      if (!serverURL) {
        showCommentError(panel, "未配置 Waline 服务端地址（comment.xiaokai.wang）。");
        return;
      }

      var container = document.createElement("div");
      container.id = "waline-thread";
      var placeholder = panel.querySelector(".comments-loading");
      if (placeholder) { placeholder.parentNode.replaceChild(container, placeholder); }
      else { panel.appendChild(container); }

      var s = document.createElement("script");
      s.src = "https://cdn.staticfile.org/waline/3.5.2/waline.js";
      s.async = true;
      s.onload = function () {
        if (!(window.Waline && typeof window.Waline.init === "function")) {
          showCommentError(panel, "Waline 脚本已加载但初始化接口缺失。");
          return;
        }
        try {
          window.Waline.init({
            el: "#waline-thread",
            serverURL: serverURL,
            lang: lang,
            path: path,
            dark: 'html[data-theme="dark"]',
            reaction: false
          });
        } catch (e) {
          showCommentError(panel, "初始化异常：" + (e && e.message ? e.message : e));
          return;
        }
        /* 兜底：后端未就绪 / 域名未解析 / 跨域未配置时，
           8 秒后若容器内仍无评论节点，给出明确提示。 */
        setTimeout(function () {
          if (container && container.isConnected && !container.querySelector(".wl-panel")) {
            showCommentError(panel, "评论后端 8 秒内未返回数据。");
          }
        }, 8000);
      };
      s.onerror = function () {
        showCommentError(panel, "Waline 脚本加载失败，请检查网络或 CDN 可达性。");
      };
      panel.appendChild(s);
      panel.setAttribute("data-loaded", "1");
    }

    function showCommentError(panel, reason) {
      if (!panel) { return; }
      var container = panel.querySelector("#waline-thread") || panel;
      container.innerHTML =
        '<div class="comments-fallback">' +
        '<p><strong>评论暂时无法加载</strong></p>' +
        '<p class="comments-fallback-reason">' + reason + '</p>' +
        '<p>常见原因：后端函数未部署 / 自定义域名未解析 / 数据库未连通 / ' +
        '跨域（CORS）未放行 xiaokai-wang.github.io。</p>' +
        '<p>可切换到「GitHub 登录」或「Disqus」标签留言，不受影响。</p>' +
        '</div>';
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
