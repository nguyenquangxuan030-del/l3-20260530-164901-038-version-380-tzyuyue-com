(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
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

  function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', root);
    var dots = selectAll('[data-hero-dot]', root);
    var previous = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (previous) {
      previous.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        start();
      });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    start();
  }

  function setupFilters() {
    selectAll('[data-filter-root]').forEach(function (root) {
      var input = root.querySelector('[data-filter-input]');
      var items = selectAll('[data-title]', root);
      var chips = selectAll('[data-filter-chip]', root);
      var status = root.querySelector('[data-filter-status]');
      var activeCategory = 'all';
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';

      function apply() {
        var value = (input ? input.value : '').trim().toLowerCase();
        var visible = 0;
        items.forEach(function (item) {
          var text = item.getAttribute('data-title') || '';
          var category = item.getAttribute('data-category') || '';
          var matchText = !value || text.indexOf(value) !== -1;
          var matchCategory = activeCategory === 'all' || category === activeCategory;
          var show = matchText && matchCategory;
          item.classList.toggle('is-hidden', !show);
          if (show) {
            visible += 1;
          }
        });
        if (status) {
          status.textContent = visible ? '已匹配相关影片' : '暂无匹配结果';
        }
      }

      if (input) {
        input.value = query;
        input.addEventListener('input', apply);
      }
      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          activeCategory = chip.getAttribute('data-filter-chip') || 'all';
          chips.forEach(function (item) {
            item.classList.toggle('is-active', item === chip);
          });
          apply();
        });
      });
      apply();
    });
  }

  function setupBackTop() {
    selectAll('[data-back-top]').forEach(function (button) {
      button.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  window.initMoviePlayer = function (playerId, streamUrl) {
    var root = document.getElementById(playerId);
    if (!root) {
      return;
    }
    var video = root.querySelector('video');
    var overlay = root.querySelector('[data-play]');
    var attached = false;
    var hls = null;

    function attach() {
      if (attached || !video) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        attached = true;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        attached = true;
        return;
      }
      video.src = streamUrl;
      attached = true;
    }

    function play() {
      attach();
      root.classList.add('is-playing');
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      root.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (!video.currentTime) {
        root.classList.remove('is-playing');
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupBackTop();
  });
})();
