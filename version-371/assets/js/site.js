(function() {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function() {
            mobileNav.hidden = !mobileNav.hidden;
        });
    }

    var hero = document.querySelector("[data-hero]");
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function setHero(index) {
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

        if (hero) {
            hero.style.setProperty("--hero-image", "url('" + slides[current].getAttribute("data-hero-image") + "')");
        }
    }

    dots.forEach(function(dot, index) {
        dot.addEventListener("click", function() {
            setHero(index);
        });
    });

    if (slides.length) {
        setHero(0);
        window.setInterval(function() {
            setHero(current + 1);
        }, 5600);
    }

    var base = document.body.getAttribute("data-base") || "./";
    var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
    var searchPanel = document.querySelector("[data-search-panel]");

    function normalizeText(value) {
        return String(value || "").trim().toLowerCase();
    }

    function imagePath(item) {
        return base + item.image + ".jpg";
    }

    function resultUrl(item) {
        return base + item.url;
    }

    function renderSearch(query) {
        if (!searchPanel) {
            return;
        }

        var q = normalizeText(query);

        if (!q) {
            searchPanel.hidden = true;
            searchPanel.innerHTML = "";
            return;
        }

        var list = (window.SEARCH_INDEX || []).filter(function(item) {
            return normalizeText(item.title + " " + item.year + " " + item.type + " " + item.genre + " " + item.region).indexOf(q) !== -1;
        }).slice(0, 12);

        if (!list.length) {
            searchPanel.innerHTML = '<div class="search-result"><span></span><span><strong>暂无匹配内容</strong><span>换一个关键词继续查找</span></span></div>';
            searchPanel.hidden = false;
            return;
        }

        searchPanel.innerHTML = list.map(function(item) {
            return '<a class="search-result" href="' + resultUrl(item) + '">' +
                '<img src="' + imagePath(item) + '" alt="' + item.title.replace(/"/g, "&quot;") + '">' +
                '<span><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.type + ' · ' + item.genre + '</span></span>' +
                '</a>';
        }).join("");

        searchPanel.hidden = false;
    }

    searchInputs.forEach(function(input) {
        input.addEventListener("input", function() {
            renderSearch(input.value);
            searchInputs.forEach(function(other) {
                if (other !== input) {
                    other.value = input.value;
                }
            });
        });

        input.addEventListener("focus", function() {
            if (input.value) {
                renderSearch(input.value);
            }
        });
    });

    document.addEventListener("click", function(event) {
        if (!searchPanel) {
            return;
        }

        var insideSearch = event.target.closest(".header-search") || event.target.closest(".mobile-search");

        if (!insideSearch) {
            searchPanel.hidden = true;
        }
    });

    var filterInput = document.querySelector("[data-grid-filter]");
    var filterYear = document.querySelector("[data-year-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

    function applyGridFilter() {
        var text = normalizeText(filterInput ? filterInput.value : "");
        var year = filterYear ? filterYear.value : "";

        cards.forEach(function(card) {
            var haystack = normalizeText(card.getAttribute("data-title") + " " + card.getAttribute("data-genre") + " " + card.getAttribute("data-region"));
            var okText = !text || haystack.indexOf(text) !== -1;
            var okYear = !year || card.getAttribute("data-year") === year;
            card.hidden = !(okText && okYear);
        });
    }

    if (filterInput) {
        filterInput.addEventListener("input", applyGridFilter);
    }

    if (filterYear) {
        filterYear.addEventListener("change", applyGridFilter);
    }
})();
