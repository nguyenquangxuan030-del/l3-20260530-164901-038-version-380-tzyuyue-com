(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (ch) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[ch];
    });
  }

  ready(function () {
    var data = window.MOVIES || [];
    var form = document.querySelector("[data-search-page-form]");
    var queryInput = document.querySelector("[data-search-query]");
    var categoryInput = document.querySelector("[data-search-category]");
    var typeInput = document.querySelector("[data-search-type]");
    var results = document.querySelector("[data-search-results]");
    if (!form || !results) {
      return;
    }

    var types = Array.from(new Set(data.map(function (item) {
      return item.type;
    }).filter(Boolean))).sort();
    types.forEach(function (type) {
      var option = document.createElement("option");
      option.value = type;
      option.textContent = type;
      typeInput.appendChild(option);
    });

    var params = new URLSearchParams(window.location.search);
    if (params.get("q")) {
      queryInput.value = params.get("q");
    }

    function card(item) {
      var tags = (item.tags || []).slice(0, 4).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");
      return "<article class=\"movie-card\">" +
        "<a class=\"poster\" href=\"" + escapeHtml(item.url) + "\">" +
        "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
        "<span class=\"poster-gradient\"></span><b class=\"quality-badge\">HD</b><span class=\"play-chip\">观看</span></a>" +
        "<div class=\"card-body\"><div class=\"meta-line\"><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.type) + "</span></div>" +
        "<h3><a href=\"" + escapeHtml(item.url) + "\">" + escapeHtml(item.title) + "</a></h3>" +
        "<p>" + escapeHtml(item.oneLine) + "</p><div class=\"tag-row\">" + tags + "</div></div></article>";
    }

    function render() {
      var q = queryInput.value.trim().toLowerCase();
      var category = categoryInput.value;
      var type = typeInput.value;
      var matched = data.filter(function (item) {
        var text = [item.title, item.region, item.year, item.type, item.genre, item.oneLine, (item.tags || []).join(" ")].join(" ").toLowerCase();
        if (q && text.indexOf(q) === -1) {
          return false;
        }
        if (category && item.category !== category) {
          return false;
        }
        if (type && item.type !== type) {
          return false;
        }
        return true;
      }).slice(0, 120);
      results.innerHTML = matched.map(card).join("");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      render();
    });

    [queryInput, categoryInput, typeInput].forEach(function (el) {
      el.addEventListener("input", render);
      el.addEventListener("change", render);
    });

    render();
  });
})();
