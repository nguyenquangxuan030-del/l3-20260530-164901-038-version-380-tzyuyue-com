(function () {
    const toggle = document.querySelector('.mobile-toggle');
    const panel = document.querySelector('.mobile-panel');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            const open = panel.classList.toggle('open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    const carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
        const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
        const dots = Array.from(carousel.querySelectorAll('.hero-dot'));
        const prev = carousel.querySelector('.hero-arrow.prev');
        const next = carousel.querySelector('.hero-arrow.next');
        let current = 0;
        let timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = setInterval(function () {
                show(current + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    const filterInput = document.querySelector('.page-filter-input');

    if (filterInput) {
        const cards = Array.from(document.querySelectorAll('.filter-list [data-title]'));
        const empty = document.querySelector('.empty-result');

        filterInput.addEventListener('input', function () {
            const keyword = filterInput.value.trim().toLowerCase();
            let visible = 0;

            cards.forEach(function (card) {
                const value = [
                    card.dataset.title,
                    card.dataset.tags,
                    card.dataset.year,
                    card.dataset.region
                ].join(' ').toLowerCase();
                const matched = !keyword || value.includes(keyword);
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        });
    }

    const player = document.getElementById('movie-player');
    const playerButton = document.querySelector('.player-trigger');

    if (player && playerButton && typeof currentVideoSource !== 'undefined') {
        let hlsInstance = null;
        let loaded = false;

        function beginPlayback() {
            playerButton.classList.add('is-hidden');

            if (!loaded) {
                if (player.canPlayType('application/vnd.apple.mpegurl')) {
                    player.src = currentVideoSource;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hlsInstance.loadSource(currentVideoSource);
                    hlsInstance.attachMedia(player);
                } else {
                    player.src = currentVideoSource;
                }

                loaded = true;
            }

            const promise = player.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        playerButton.addEventListener('click', beginPlayback);
        player.addEventListener('click', function () {
            if (!loaded) {
                beginPlayback();
            }
        });
        player.addEventListener('play', function () {
            playerButton.classList.add('is-hidden');
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    const searchResults = document.getElementById('search-results');
    const searchStatus = document.getElementById('search-status');
    const searchPageForm = document.querySelector('.search-page-form');

    if (searchResults && searchStatus && typeof siteSearchData !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const keyword = (params.get('q') || '').trim();
        const input = searchPageForm ? searchPageForm.querySelector('input[name="q"]') : null;

        if (input) {
            input.value = keyword;
        }

        function createCard(item) {
            const tags = item.tags.slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');

            return '<a class="movie-card" href="' + item.url + '">' +
                '<div class="poster-wrap">' +
                    '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                    '<div class="poster-gradient"></div>' +
                    '<span class="poster-tag">' + escapeHtml(item.type) + '</span>' +
                '</div>' +
                '<div class="card-body">' +
                    '<div class="card-kicker"><span>' + escapeHtml(item.category) + '</span><span>' + escapeHtml(item.year) + '</span></div>' +
                    '<h3>' + escapeHtml(item.title) + '</h3>' +
                    '<p>' + escapeHtml(item.desc) + '</p>' +
                    '<div class="tag-list">' + tags + '</div>' +
                '</div>' +
            '</a>';
        }

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        if (!keyword) {
            searchStatus.textContent = '请输入关键词开始搜索。';
            searchResults.innerHTML = '';
        } else {
            const lower = keyword.toLowerCase();
            const matches = siteSearchData.filter(function (item) {
                return [
                    item.title,
                    item.category,
                    item.region,
                    item.type,
                    item.year,
                    item.genre,
                    item.tags.join(' '),
                    item.desc
                ].join(' ').toLowerCase().includes(lower);
            }).slice(0, 120);

            searchStatus.textContent = '关键词“' + keyword + '”找到 ' + matches.length + ' 条结果。';
            searchResults.innerHTML = matches.map(createCard).join('');
        }
    }
})();
