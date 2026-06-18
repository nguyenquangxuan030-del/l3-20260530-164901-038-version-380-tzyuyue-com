(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupNavigation() {
        var toggle = document.querySelector(".nav-toggle");
        if (!toggle) {
            return;
        }

        toggle.addEventListener("click", function () {
            document.body.classList.toggle("menu-open");
        });
    }

    function setupImageFallbacks() {
        var images = document.querySelectorAll("img");
        images.forEach(function (image) {
            image.addEventListener("error", function () {
                var holder = image.closest(".poster-wrap, .rank-thumb, .detail-poster, .related-thumb");
                if (holder) {
                    holder.classList.add("poster-missing");
                }
                image.style.opacity = "0";
            }, { once: true });
        });
    }

    function setupHeroSlider() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (slides.length <= 1) {
            return;
        }

        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
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

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        var hero = document.querySelector(".hero");
        if (hero) {
            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
        }

        show(0);
        start();
    }

    function setupListTools() {
        var panels = document.querySelectorAll("[data-list-tools]");
        panels.forEach(function (panel) {
            var section = panel.closest("section") || document;
            var list = section.querySelector("[data-card-list]") || section.querySelector(".rank-list");
            var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card, .rank-item"));
            var input = panel.querySelector("[data-search-input]");
            var select = panel.querySelector("[data-sort-select]");
            var count = panel.querySelector("[data-result-count]");

            if (!list || cards.length === 0) {
                return;
            }

            cards.forEach(function (card, order) {
                card.dataset.defaultOrder = String(order);
            });

            function apply() {
                var keyword = normalize(input ? input.value : "");
                var visibleCount = 0;

                cards.forEach(function (card) {
                    var searchable = normalize(card.dataset.search || card.textContent);
                    var visible = !keyword || searchable.indexOf(keyword) !== -1;
                    card.dataset.hidden = visible ? "false" : "true";
                    if (visible) {
                        visibleCount += 1;
                    }
                });

                if (count) {
                    count.textContent = String(visibleCount);
                }
            }

            function sortCards() {
                var value = select ? select.value : "default";
                var sorted = cards.slice();

                sorted.sort(function (a, b) {
                    if (value === "year-desc") {
                        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                    }
                    if (value === "views-desc") {
                        return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
                    }
                    if (value === "title-asc") {
                        return normalize(a.dataset.title).localeCompare(normalize(b.dataset.title), "zh-CN");
                    }
                    return Number(a.dataset.defaultOrder || 0) - Number(b.dataset.defaultOrder || 0);
                });

                sorted.forEach(function (card) {
                    list.appendChild(card);
                });
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            if (select) {
                select.addEventListener("change", function () {
                    sortCards();
                    apply();
                });
            }

            apply();
        });
    }

    ready(function () {
        setupNavigation();
        setupImageFallbacks();
        setupHeroSlider();
        setupListTools();
    });
})();
