/* ============================================================
   PodcastPlus — CLEAN MERGED APP.JS
   - Player engine
   - Unified navigation
   - Search + Discover
   - GPS country suggestions
   - QR code scanner
============================================================ */

/* ============================================================
   PLAYER ENGINE
============================================================ */
class AppPlayer {
    constructor() {
        this.audio = document.getElementById("audio");
        this.seek = document.getElementById("seek");
        this.btnPlay = document.getElementById("btnPlay");
        this.miniPlay = document.getElementById("miniPlay");
        this.btnPrev = document.getElementById("btnPrev");
        this.btnNext = document.getElementById("btnNext");
        this.btnRepeat = document.getElementById("btnRepeat");
        this.btnShuffle = document.getElementById("btnShuffle");
        this.timeNow = document.getElementById("timeNow");
        this.timeTotal = document.getElementById("timeTotal");

        this.queue = [];
        this.currentIndex = -1;
        this.repeat = false;
        this.shuffle = false;

        this.bindEvents();
    }

    bindEvents() {
        if (this.btnPlay) this.btnPlay.addEventListener("click", () => this.togglePlay());
        if (this.miniPlay) this.miniPlay.addEventListener("click", () => this.togglePlay());

        if (this.seek) {
            this.seek.addEventListener("input", () => {
                if (this.audio.duration) {
                    this.audio.currentTime = (this.seek.value / 100) * this.audio.duration;
                }
            });
        }

        this.audio.addEventListener("timeupdate", () => this.updateTime());
        this.audio.addEventListener("loadedmetadata", () => this.updateTime());
        this.audio.addEventListener("ended", () => this.handleEnded());

        if (this.btnPrev) this.btnPrev.addEventListener("click", () => this.prevEpisode());
        if (this.btnNext) this.btnNext.addEventListener("click", () => this.nextEpisode());

        if (this.btnRepeat) {
            this.btnRepeat.addEventListener("click", () => {
                this.repeat = !this.repeat;
                this.btnRepeat.style.color = this.repeat ? "#00ffcc" : "";
            });
        }

        if (this.btnShuffle) {
            this.btnShuffle.addEventListener("click", () => {
                this.shuffle = !this.shuffle;
                this.btnShuffle.style.color = this.shuffle ? "#00ffcc" : "";
            });
        }
    }

    playEpisode(ep) {
        if (!ep || !ep.audio) return alert("This episode has no playable audio.");

        document.getElementById("nowTitle").textContent = ep.title;
        document.getElementById("nowPodcast").textContent = ep.description || "";
        document.getElementById("miniTitle").textContent = ep.title;

        const art = ep.artwork || "assets/icons/podcast-placeholder.svg";
        document.getElementById("art").src = art;
        document.getElementById("miniArt").src = art;

        this.audio.src = ep.audio;
        this.audio.load();
        this.audio.play().then(() => this.setPlayState(true));

        if (this.currentIndex === -1) {
            this.queue.push(ep);
            this.currentIndex = 0;
        } else {
            this.queue[this.currentIndex] = ep;
        }

        this.renderQueue();
    }

    handleEnded() {
        if (this.repeat) {
            this.audio.currentTime = 0;
            this.audio.play();
            return;
        }
        this.nextEpisode();
    }

    renderQueue() {
        const list = document.getElementById("queueList");
        list.innerHTML = "";

        this.queue.forEach((ep, i) => {
            const div = document.createElement("div");
            div.className = "queue-item";
            div.textContent = ep.title;
            if (i === this.currentIndex) div.style.color = "#00ffcc";

            div.addEventListener("click", () => {
                this.currentIndex = i;
                this.playEpisode(ep);
            });

            list.appendChild(div);
        });
    }

    togglePlay() {
        if (this.audio.paused) {
            this.audio.play();
            this.setPlayState(true);
        } else {
            this.audio.pause();
            this.setPlayState(false);
        }
    }

    setPlayState(playing) {
        if (this.btnPlay) this.btnPlay.textContent = playing ? "⏸" : "▶";
        if (this.miniPlay) this.miniPlay.textContent = playing ? "⏸" : "▶";
    }

    nextEpisode() {
        if (!this.queue.length) return;

        if (this.shuffle) {
            this.currentIndex = Math.floor(Math.random() * this.queue.length);
        } else if (this.currentIndex < this.queue.length - 1) {
            this.currentIndex++;
        } else return;

        this.playEpisode(this.queue[this.currentIndex]);
    }

    prevEpisode() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.playEpisode(this.queue[this.currentIndex]);
        }
    }

    updateTime() {
        if (!this.audio.duration) return;

        const cur = this.audio.currentTime;
        const tot = this.audio.duration;

        this.timeNow.textContent = this.formatTime(cur);
        this.timeTotal.textContent = this.formatTime(tot);
        if (this.seek) this.seek.value = (cur / tot) * 100;
    }

    formatTime(sec) {
        sec = Math.floor(sec);
        return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
    }
}

window.appPlayer = new AppPlayer();

/* ============================================================
   UNIFIED VIEW SWITCHING (NO CONFLICTS)
============================================================ */
function switchView(id) {
    document.querySelectorAll(".view").forEach(v =>
        v.classList.toggle("active", v.id === id)
    );

    document.querySelectorAll(".nav-btn").forEach(b =>
        b.classList.toggle("active", b.dataset.view === id)
    );
}

document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const view = btn.dataset.view;
        switchView(view);

        if (view === "location") {
            document.getElementById("locationGrid").innerHTML = "Detecting your location…";
            getUserCountry().then(country => loadSuggestionsByCountry(country));
        }

        if (view === "camera") {
            startQrScanner();
        }
    });
});

/* ============================================================
   SEARCH
============================================================ */
document.getElementById("btnSearch")?.addEventListener("click", () => {
    const q = document.getElementById("q").value.trim();
    if (!q) return;
    switchView("search");
    performSearch(q);
});

document.getElementById("q")?.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        const q = e.target.value.trim();
        if (!q) return;
        switchView("search");
        performSearch(q);
    }
});

/* ============================================================
   GPS COUNTRY SUGGESTIONS
============================================================ */
async function getUserCountry() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(async pos => {
            const { latitude, longitude } = pos.coords;
            try {
                const res = await fetch(
                    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                );
                const json = await res.json();
                resolve(json.countryName || "Unknown");
            } catch {
                reject("Country lookup failed");
            }
        }, () => reject("GPS blocked"), { timeout: 10000 });
    });
}

async function loadSuggestionsByCountry(country) {
    const grid = document.getElementById("locationGrid");
    grid.innerHTML = `Loading podcasts for ${country}…`;

    try {
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(country)}&media=podcast&limit=12`;
        const res = await fetch(url);
        const data = await res.json();

        grid.innerHTML = "";
        data.results.forEach(pod => {
            const el = createPodcastCardFromItunes(pod, loadFeedIntoGridFromItunesMeta);
            grid.appendChild(el);
        });
    } catch {
        grid.innerHTML = "<p style='color:red'>Failed to load country suggestions.</p>";
    }
}

/* ============================================================
   FINAL QR SCANNER (no flash, guaranteed preview, mobile-safe)
============================================================ */

let qrStream = null;
let qrLoop = null;

async function startQrScanner() {
    const video = document.getElementById("qrPreview");
    const result = document.getElementById("qrResult");

    stopQrScanner();

    video.style.display = "block";
    result.textContent = "Starting camera…";

    try {
        qrStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: { ideal: "environment" },
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        });

        // Required on iOS/Android
        video.setAttribute("autoplay", "");
        video.setAttribute("muted", "");
        video.setAttribute("playsinline", "");

        video.srcObject = qrStream;

        await new Promise(res => video.onloadedmetadata = res);

        result.textContent = "Scanning for QR code…";

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        function scanFrame() {
            if (!video || video.readyState < 2) {
                qrLoop = requestAnimationFrame(scanFrame);
                return;
            }

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const img = ctx.getImageData(0, 0, canvas.width, canvas.height);

            const code = jsQR(img.data, canvas.width, canvas.height, {
                inversionAttempts: "dontInvert"
            });

            if (code) {
                result.textContent = "QR Detected: " + code.data;
                stopQrScanner();

                if (code.data.startsWith("http")) {
                    if (confirm("Open URL?\n" + code.data)) {
                        window.open(code.data, "_blank");
                    }
                }
                return;
            }

            qrLoop = requestAnimationFrame(scanFrame);
        }

        scanFrame();

    } catch (err) {
        result.textContent = "Camera error: " + err;
        console.error(err);
    }
}

function stopQrScanner() {
    if (qrLoop) cancelAnimationFrame(qrLoop);

    const video = document.getElementById("qrPreview");
    if (video) {
        video.srcObject = null;
        video.style.display = "none";
    }

    if (qrStream) {
        qrStream.getTracks().forEach(t => t.stop());
        qrStream = null;
    }

    const result = document.getElementById("qrResult");
    if (result) result.textContent = "";
}


document.getElementById("btnCameraStop")?.addEventListener("click", stopQrScanner);

/* ============================================================
   INITIAL DISCOVER LOAD
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    try { initUI(); } catch (e) { console.warn("initUI missing", e); }
});
