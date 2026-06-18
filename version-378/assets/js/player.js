(function () {
  window.initPlayer = function (streamUrl) {
    var video = document.getElementById("movieVideo");
    var shell = document.getElementById("videoShell");
    var start = document.getElementById("videoStart");
    var play = document.getElementById("togglePlay");
    var mute = document.getElementById("toggleMute");
    var full = document.getElementById("toggleFullscreen");
    var message = document.getElementById("playerMessage");
    var hls = null;

    if (!video || !streamUrl) {
      return;
    }

    function showMessage(text) {
      if (message) {
        message.textContent = text;
        message.hidden = false;
      }
    }

    function hideStart() {
      if (start) {
        start.classList.add("is-hidden");
      }
    }

    function updatePlayIcon() {
      if (play) {
        play.textContent = video.paused ? "▶" : "Ⅱ";
      }
      if (start) {
        start.classList.toggle("is-hidden", !video.paused);
      }
    }

    function begin() {
      hideStart();
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (start) {
            start.classList.remove("is-hidden");
          }
        });
      }
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          showMessage("播放暂时不可用");
          hls.destroy();
        }
      });
    } else {
      showMessage("当前环境暂不支持播放");
    }

    if (start) {
      start.addEventListener("click", function (event) {
        event.stopPropagation();
        begin();
      });
    }

    if (shell) {
      shell.addEventListener("click", function (event) {
        if (event.target.closest(".player-controls")) {
          return;
        }
        if (video.paused) {
          begin();
        } else {
          video.pause();
        }
      });
    }

    if (play) {
      play.addEventListener("click", function (event) {
        event.stopPropagation();
        if (video.paused) {
          begin();
        } else {
          video.pause();
        }
      });
    }

    if (mute) {
      mute.addEventListener("click", function (event) {
        event.stopPropagation();
        video.muted = !video.muted;
        mute.textContent = video.muted ? "🔇" : "🔊";
      });
    }

    if (full && shell) {
      full.addEventListener("click", function (event) {
        event.stopPropagation();
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (shell.requestFullscreen) {
          shell.requestFullscreen();
        }
      });
    }

    video.addEventListener("play", updatePlayIcon);
    video.addEventListener("pause", updatePlayIcon);
    video.addEventListener("ended", updatePlayIcon);
    updatePlayIcon();

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
