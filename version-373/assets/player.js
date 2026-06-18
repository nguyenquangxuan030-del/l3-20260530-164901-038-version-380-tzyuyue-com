(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    document.querySelectorAll("[data-player]").forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector(".play-overlay");
      var error = box.querySelector("[data-player-error]");
      var loaded = false;
      var hls = null;

      function fail(message) {
        if (error) {
          error.textContent = message;
        }
      }

      function load() {
        if (!video || loaded) {
          return;
        }
        var src = video.getAttribute("data-src");
        if (!src) {
          fail("播放暂时不可用");
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              fail("播放暂时不可用");
              hls.destroy();
            }
          });
        } else {
          fail("播放暂时不可用");
          return;
        }
        loaded = true;
      }

      function start() {
        load();
        if (!video || !loaded) {
          return;
        }
        video.setAttribute("controls", "controls");
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {
            fail("点击画面可继续播放");
          });
        }
      }

      if (button) {
        button.addEventListener("click", start);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            start();
          } else {
            video.pause();
          }
        });
        video.addEventListener("play", function () {
          box.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
          if (!video.ended) {
            box.classList.remove("is-playing");
          }
        });
      }

      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  });
})();
