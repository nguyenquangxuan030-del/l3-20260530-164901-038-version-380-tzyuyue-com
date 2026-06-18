function setupMoviePlayer(streamUrl) {
    var video = document.querySelector('[data-player-video]');
    var cover = document.querySelector('[data-player-cover]');
    var started = false;
    var hls = null;

    if (!video || !cover || !streamUrl) {
        return;
    }

    function load() {
        if (started) {
            video.play().catch(function () {});
            return;
        }
        started = true;
        cover.classList.add('is-hidden');
        if (window.Hls && window.Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal && hls) {
                    hls.destroy();
                    hls = null;
                    video.src = streamUrl;
                    video.play().catch(function () {});
                }
            });
        } else {
            video.src = streamUrl;
            video.play().catch(function () {});
        }
    }

    cover.addEventListener('click', load);
    video.addEventListener('click', function () {
        if (!started) {
            load();
        }
    });
}
