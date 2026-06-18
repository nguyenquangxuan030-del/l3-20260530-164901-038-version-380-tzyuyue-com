(function() {
  var menuButton = document.getElementById("menuToggle");
  var nav = document.getElementById("siteNav");

  if (menuButton && nav) {
    menuButton.addEventListener("click", function() {
      nav.classList.toggle("open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var prev = document.querySelector(".hero-prev");
  var next = document.querySelector(".hero-next");
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function(slide, i) {
      slide.classList.toggle("active", i === current);
    });

    dots.forEach(function(dot, i) {
      dot.classList.toggle("active", i === current);
    });
  }

  function restart() {
    if (!slides.length) {
      return;
    }

    window.clearInterval(timer);
    timer = window.setInterval(function() {
      showSlide(current + 1);
    }, 5200);
  }

  if (slides.length) {
    showSlide(0);
    restart();

    if (prev) {
      prev.addEventListener("click", function() {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        showSlide(current + 1);
        restart();
      });
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        showSlide(i);
        restart();
      });
    });
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function textOf(card) {
    return normalize([
      card.getAttribute("data-title"),
      card.getAttribute("data-year"),
      card.getAttribute("data-region"),
      card.getAttribute("data-type"),
      card.getAttribute("data-genre"),
      card.getAttribute("data-category"),
      card.textContent
    ].join(" "));
  }

  function setupFilters(root) {
    var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card"));
    if (!cards.length) {
      return;
    }

    var keyword = root.querySelector(".filter-keyword");
    var year = root.querySelector(".filter-year");
    var type = root.querySelector(".filter-type");
    var category = root.querySelector(".filter-category");
    var empty = root.querySelector(".empty-state");

    function apply() {
      var q = normalize(keyword && keyword.value);
      var y = normalize(year && year.value);
      var t = normalize(type && type.value);
      var c = normalize(category && category.value);
      var shown = 0;

      cards.forEach(function(card) {
        var matchKeyword = !q || textOf(card).indexOf(q) !== -1;
        var matchYear = !y || normalize(card.getAttribute("data-year")) === y;
        var matchType = !t || normalize(card.getAttribute("data-type")) === t;
        var matchCategory = !c || normalize(card.getAttribute("data-category")) === c;
        var visible = matchKeyword && matchYear && matchType && matchCategory;

        card.hidden = !visible;

        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.hidden = shown !== 0;
      }
    }

    [keyword, year, type, category].forEach(function(input) {
      if (input) {
        input.addEventListener("input", apply);
        input.addEventListener("change", apply);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");

    if (q && keyword) {
      keyword.value = q;
      apply();
    }
  }

  setupFilters(document);

  var heroSearch = document.querySelector(".hero-search");

  if (heroSearch) {
    heroSearch.addEventListener("submit", function(event) {
      var input = heroSearch.querySelector("input");
      var value = input ? input.value.trim() : "";

      if (value) {
        event.preventDefault();
        window.location.href = "search.html?q=" + encodeURIComponent(value);
      }
    });
  }
})();
