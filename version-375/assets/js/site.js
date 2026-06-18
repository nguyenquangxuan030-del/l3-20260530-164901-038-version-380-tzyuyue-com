(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var open = panel.classList.toggle("open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var root = document.querySelector(".hero-carousel");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    var prev = root.querySelector(".hero-prev");
    var next = root.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var roots = document.querySelectorAll("[data-filter-root]");
    roots.forEach(function (root) {
      var page = root.closest(".page-layout");
      if (!page) {
        return;
      }
      var keyword = root.querySelector(".filter-keyword");
      var year = root.querySelector(".filter-year");
      var type = root.querySelector(".filter-type");
      var items = Array.prototype.slice.call(page.querySelectorAll(".filter-item"));

      function apply() {
        var query = keyword ? keyword.value.trim().toLowerCase() : "";
        var selectedYear = year ? year.value : "";
        var selectedType = type ? type.value : "";
        items.forEach(function (item) {
          var text = item.textContent.toLowerCase();
          var matchQuery = !query || text.indexOf(query) !== -1;
          var matchYear = !selectedYear || item.getAttribute("data-year") === selectedYear;
          var matchType = !selectedType || item.getAttribute("data-type") === selectedType;
          item.classList.toggle("is-hidden", !(matchQuery && matchYear && matchType));
        });
      }

      [keyword, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function createSearchCard(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card movie-card-default\">",
      "<a class=\"poster-wrap\" href=\"./" + movie.file + "\" aria-label=\"" + escapeHtml(movie.title) + "\">",
      "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "<span class=\"poster-shade\"></span>",
      "<span class=\"score-pill\">" + movie.score + "</span>",
      "</a>",
      "<div class=\"card-body\">",
      "<div class=\"meta-row\"><a href=\"./category-" + movie.categorySlug + ".html\">" + escapeHtml(movie.categoryName) + "</a><span>" + escapeHtml(movie.year) + "</span></div>",
      "<h2><a href=\"./" + movie.file + "\">" + escapeHtml(movie.title) + "</a></h2>",
      "<p>" + escapeHtml(movie.description) + "</p>",
      "<div class=\"tag-row\">" + tags + "</div>",
      "</div>",
      "</article>"
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

  function setupSearchPage() {
    var input = document.getElementById("search-input");
    var results = document.getElementById("search-results");
    var title = document.getElementById("search-title");
    if (!input || !results || !Array.isArray(window.MOVIE_INDEX)) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function render() {
      var query = input.value.trim().toLowerCase();
      if (!query) {
        results.innerHTML = "";
        if (title) {
          title.querySelector("p").textContent = "影片结果会显示在这里。";
        }
        return;
      }
      var words = query.split(/\s+/).filter(Boolean);
      var list = window.MOVIE_INDEX.filter(function (movie) {
        var text = movie.searchText.toLowerCase();
        return words.every(function (word) {
          return text.indexOf(word) !== -1;
        });
      }).slice(0, 96);
      results.innerHTML = list.map(createSearchCard).join("");
      if (title) {
        title.querySelector("p").textContent = list.length ? "已匹配到相关影片。" : "未找到相关影片。";
      }
    }

    input.addEventListener("input", render);
    render();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearchPage();
  });

  window.setupMoviePlayer = function (mediaUrl) {
    var video = document.getElementById("movie-video");
    var layer = document.getElementById("play-layer");
    if (!video || !layer || !mediaUrl) {
      return;
    }
    var prepared = false;
    var player = null;

    function prepare() {
      if (prepared) {
        return;
      }
      prepared = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = mediaUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        player = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        player.loadSource(mediaUrl);
        player.attachMedia(video);
        player.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal && player) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              player.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              player.recoverMediaError();
            } else {
              player.destroy();
              player = null;
            }
          }
        });
      } else {
        video.src = mediaUrl;
      }
    }

    function play() {
      prepare();
      layer.classList.add("is-hidden");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          layer.classList.remove("is-hidden");
        });
      }
    }

    layer.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      layer.classList.add("is-hidden");
    });
  };
})();
