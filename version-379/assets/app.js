(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function setQueryParam(form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input) {
                return;
            }
            var value = input.value.trim();
            if (!value) {
                event.preventDefault();
                input.focus();
                return;
            }
            event.preventDefault();
            window.location.href = form.getAttribute('action') + '?q=' + encodeURIComponent(value);
        });
    }

    function setupMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupSearchForms() {
        document.querySelectorAll('[data-search-form]').forEach(setQueryParam);
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
                dot.setAttribute('aria-current', dotIndex === index ? 'true' : 'false');
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                restart();
            });
        });
        show(0);
        restart();
    }

    function setupCardFilters() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-card-filter]'));
        inputs.forEach(function (input) {
            var target = document.querySelector(input.getAttribute('data-target')) || document;
            var cards = Array.prototype.slice.call(target.querySelectorAll('[data-card]'));
            var yearSelect = document.querySelector(input.getAttribute('data-year-select') || '');

            function apply() {
                var keyword = input.value.trim().toLowerCase();
                var selectedYear = yearSelect ? yearSelect.value : '';
                cards.forEach(function (card) {
                    var text = (card.getAttribute('data-text') || '').toLowerCase();
                    var year = card.getAttribute('data-year') || '';
                    var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
                    var yearMatch = !selectedYear || year === selectedYear;
                    card.style.display = keywordMatch && yearMatch ? '' : 'none';
                });
            }

            input.addEventListener('input', apply);
            if (yearSelect) {
                yearSelect.addEventListener('change', apply);
            }
        });
    }

    function setupSearchPage() {
        var mount = document.querySelector('[data-search-results]');
        var input = document.querySelector('[data-search-page-input]');
        if (!mount || !input || !window.MOVIE_SEARCH_DATA) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        input.value = query;

        function render(value) {
            var q = value.trim().toLowerCase();
            if (!q) {
                mount.innerHTML = '<div class="empty-result">输入片名、题材、地区或年份即可快速查找。</div>';
                return;
            }
            var results = window.MOVIE_SEARCH_DATA.filter(function (item) {
                return item.text.toLowerCase().indexOf(q) !== -1;
            }).slice(0, 120);
            if (!results.length) {
                mount.innerHTML = '<div class="empty-result">未找到相关影片，请尝试更换关键词。</div>';
                return;
            }
            mount.innerHTML = results.map(function (item) {
                return [
                    '<a class="movie-card group block bg-white rounded-xl overflow-hidden shadow-canyon hover:shadow-canyon-lg transition-all duration-300 hover:-translate-y-1" href="' + item.url + '">',
                    '    <span class="card-cover">',
                    '        <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
                    '        <span class="card-shade"></span>',
                    '        <span class="card-play">▶</span>',
                    '        <span class="card-badge">' + escapeHtml(item.type) + '</span>',
                    '    </span>',
                    '    <span class="card-content">',
                    '        <strong class="card-title">' + escapeHtml(item.title) + '</strong>',
                    '        <span class="card-desc">' + escapeHtml(item.oneLine) + '</span>',
                    '        <span class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + item.year + '</span><span>' + escapeHtml(item.category) + '</span></span>',
                    '    </span>',
                    '</a>'
                ].join('\n');
            }).join('\n');
        }

        function escapeHtml(value) {
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        input.addEventListener('input', function () {
            render(input.value);
        });
        render(query);
    }

    ready(function () {
        setupMenu();
        setupSearchForms();
        setupHero();
        setupCardFilters();
        setupSearchPage();
    });
})();
