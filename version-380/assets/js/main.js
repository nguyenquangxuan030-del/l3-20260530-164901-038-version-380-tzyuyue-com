(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var menuButton = document.querySelector(".menu-toggle");
        var mobileNav = document.querySelector(".mobile-nav");
        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                var open = mobileNav.classList.toggle("open");
                menuButton.setAttribute("aria-expanded", open ? "true" : "false");
                menuButton.textContent = open ? "×" : "☰";
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var current = 0;

        function setSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                setSlide(i);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                setSlide(current + 1);
            }, 5200);
        }

        document.querySelectorAll(".catalog-toolbar").forEach(function (toolbar) {
            var input = toolbar.querySelector(".search-input");
            var chips = Array.prototype.slice.call(toolbar.querySelectorAll(".filter-chip"));
            var section = toolbar.closest("section") || document;
            var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card"));
            var empty = section.querySelector(".no-result");
            var activeFilter = "";

            function applyFilter() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var shown = 0;
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-tags") || "",
                        card.getAttribute("data-year") || "",
                        card.getAttribute("data-region") || "",
                        card.getAttribute("data-type") || ""
                    ].join(" ").toLowerCase();
                    var matchesText = !query || haystack.indexOf(query) !== -1;
                    var matchesFilter = !activeFilter || haystack.indexOf(activeFilter.toLowerCase()) !== -1;
                    var visible = matchesText && matchesFilter;
                    card.hidden = !visible;
                    if (visible) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.hidden = shown !== 0;
                }
            }

            if (input) {
                input.addEventListener("input", applyFilter);
            }

            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    chips.forEach(function (item) {
                        item.classList.remove("active");
                    });
                    chip.classList.add("active");
                    activeFilter = chip.getAttribute("data-filter") || "";
                    applyFilter();
                });
            });
        });

        var backTop = document.querySelector(".back-top");
        if (backTop) {
            window.addEventListener("scroll", function () {
                backTop.classList.toggle("show", window.scrollY > 360);
            });
            backTop.addEventListener("click", function () {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        }
    });
})();
