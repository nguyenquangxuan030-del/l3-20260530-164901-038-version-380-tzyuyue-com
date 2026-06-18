(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        var expanded = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!expanded));
        panel.hidden = expanded;
        toggle.textContent = expanded ? "☰" : "×";
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var prev = hero.querySelector(".hero-prev");
      var next = hero.querySelector(".hero-next");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          start();
        });
      });

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    }

    var scopes = document.querySelectorAll("[data-filter-scope]");

    scopes.forEach(function (scope) {
      var keyword = scope.querySelector("[data-filter-keyword]");
      var year = scope.querySelector("[data-filter-year]");
      var list = document.querySelector("[data-filter-list]");

      if (!list) {
        return;
      }

      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

      function applyFilter() {
        var key = keyword ? keyword.value.trim().toLowerCase() : "";
        var selectedYear = year ? year.value : "";

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" ").toLowerCase();
          var matchKeyword = !key || haystack.indexOf(key) !== -1;
          var matchYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
          card.classList.toggle("is-hidden-card", !(matchKeyword && matchYear));
        });
      }

      if (keyword) {
        keyword.addEventListener("input", applyFilter);
      }

      if (year) {
        year.addEventListener("change", applyFilter);
      }
    });

    var searchInput = document.getElementById("searchInput");
    var searchResults = document.getElementById("searchResults");
    var searchStatus = document.getElementById("searchStatus");

    if (searchInput && searchResults && Array.isArray(window.SEARCH_MOVIES)) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q") || "";
      searchInput.value = q;

      function createCard(movie) {
        return [
          '<a class="movie-card" href="' + movie.url + '">',
          '  <span class="poster-frame">',
          '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
          '    <span class="year-badge">' + escapeHtml(movie.year) + '</span>',
          '    <span class="play-layer"><span>▶</span></span>',
          '  </span>',
          '  <span class="movie-card-body">',
          '    <strong>' + escapeHtml(movie.title) + '</strong>',
          '    <span class="movie-line">' + escapeHtml(movie.oneLine) + '</span>',
          '    <span class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.year) + '</span></span>',
          '  </span>',
          '</a>'
        ].join("");
      }

      function escapeHtml(value) {
        return String(value || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;");
      }

      function runSearch() {
        var value = searchInput.value.trim().toLowerCase();
        var matches = window.SEARCH_MOVIES.filter(function (movie) {
          var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(" ").toLowerCase();
          return value && haystack.indexOf(value) !== -1;
        }).slice(0, 120);

        if (!value) {
          searchStatus.textContent = "请输入关键词开始搜索";
          searchResults.innerHTML = "";
          return;
        }

        if (!matches.length) {
          searchStatus.textContent = "未找到相关影片";
          searchResults.innerHTML = "";
          return;
        }

        searchStatus.textContent = "搜索结果";
        searchResults.innerHTML = matches.map(createCard).join("");
      }

      searchInput.addEventListener("input", runSearch);
      runSearch();
    }
  });
})();
