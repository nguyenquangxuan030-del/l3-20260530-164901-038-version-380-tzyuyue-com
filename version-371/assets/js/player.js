(function() {
    window.initMoviePlayer = function(source) {
        var video = document.getElementById("movie-player");
        var overlay = document.querySelector(".player-overlay");

        if (!video || !source) {
            return;
        }

        function attachSource() {
            if (video.getAttribute("data-ready") === "1") {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }

            video.setAttribute("data-ready", "1");
        }

        function startPlayback() {
            attachSource();

            if (overlay) {
                overlay.hidden = true;
            }

            video.controls = true;

            var playAction = video.play();

            if (playAction && playAction.catch) {
                playAction.catch(function() {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", startPlayback);
        }

        video.addEventListener("click", function() {
            if (video.getAttribute("data-ready") !== "1") {
                startPlayback();
            }
        });
    };
})();
