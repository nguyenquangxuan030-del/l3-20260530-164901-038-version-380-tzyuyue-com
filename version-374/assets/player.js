(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function loadHlsScript() {
        return new Promise(function (resolve, reject) {
            if (window.Hls) {
                resolve(window.Hls);
                return;
            }

            var script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js";
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = function () {
                reject(new Error("HLS 脚本加载失败"));
            };
            document.head.appendChild(script);
        });
    }

    function setupPlayer(shell) {
        var video = shell.querySelector("video");
        var button = shell.querySelector(".play-overlay");
        var message = document.querySelector("[data-player-message]");
        var source = shell.dataset.source || (button && button.dataset.source) || "";

        if (!video || !button || !source) {
            return;
        }

        function setMessage(text) {
            if (message) {
                message.textContent = text;
            }
        }

        function playVideo() {
            shell.classList.add("is-playing");
            setMessage("正在加载播放源...");

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.play().catch(function () {
                    setMessage("已载入播放源，请点击播放器开始播放。");
                });
                return;
            }

            loadHlsScript().then(function (Hls) {
                if (Hls && Hls.isSupported()) {
                    var hls = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(Hls.Events.MANIFEST_PARSED, function () {
                        setMessage("播放源已载入。");
                        video.play().catch(function () {
                            setMessage("播放源已载入，请点击播放器开始播放。");
                        });
                    });
                    hls.on(Hls.Events.ERROR, function (_, data) {
                        if (data && data.fatal) {
                            setMessage("播放源暂时无法播放，可刷新页面后重试。");
                            hls.destroy();
                        }
                    });
                } else {
                    video.src = source;
                    setMessage("当前浏览器不支持 HLS 自动解析，已尝试直接载入播放源。");
                }
            }).catch(function () {
                video.src = source;
                setMessage("HLS 组件未加载，已尝试使用浏览器原生能力播放。");
            });
        }

        button.addEventListener("click", playVideo);
    }

    ready(function () {
        document.querySelectorAll(".video-shell").forEach(setupPlayer);
    });
})();
