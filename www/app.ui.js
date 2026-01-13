// app.ui.js — polished frontend UI glue
// Works with: index.html (ids: btnMic, q, btnSearch, btnRefresh, themeSwitch, nav-btns, views)
// Depends on: performSearch(q), initUI() provided by app.rss.js

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const navBtns = Array.from(document.querySelectorAll('.nav-btn'));
  const views = Array.from(document.querySelectorAll('.view'));
  const themeSwitch = document.getElementById('themeSwitch');
  const qInput = document.getElementById('q');
  const btnSearch = document.getElementById('btnSearch');
  const btnRefresh = document.getElementById('btnRefresh');
  const btnMic = document.getElementById('btnMic');

  // Safe no-op guards
  function safe(el, name) { if (!el) console.warn(`${name} not found`); return !!el; }
  safe(qInput, '#q'); safe(btnSearch, '#btnSearch'); safe(btnRefresh, '#btnRefresh'); safe(themeSwitch, '#themeSwitch');

  /** NAVIGATION **/
  if (navBtns.length && views.length) {
    navBtns.forEach(b => b.addEventListener('click', () => {
      navBtns.forEach(nb => nb.classList.remove('active'));
      b.classList.add('active');
      const view = b.dataset.view;
      views.forEach(v => v.classList.toggle('active', v.id === view));
    }));
  }

  /** THEME SWITCH **/
  if (themeSwitch) {
    themeSwitch.addEventListener('click', () => {
      const pressed = themeSwitch.getAttribute('aria-pressed') === 'true';
      themeSwitch.setAttribute('aria-pressed', String(!pressed));
      themeSwitch.textContent = pressed ? 'Dark' : 'Light';
      document.documentElement.classList.toggle('light-mode', !pressed);
    });
  }

  /** SEARCH BUTTON + ENTER KEY **/
  function doSearch(q) {
    if (!q) return;
    try {
      // performSearch is provided by app.rss.js
      performSearch(q);
    } catch (e) {
      console.warn('performSearch not available', e);
    }
    // switch to search view if present
    navBtns.forEach(nb => nb.classList.toggle('active', nb.dataset.view === 'search'));
    views.forEach(v => v.classList.toggle('active', v.id === 'search'));
  }

  if (btnSearch && qInput) {
    btnSearch.addEventListener('click', () => {
      const q = qInput.value.trim();
      if (!q) return;
      doSearch(q.toLowerCase());
    });

    // Enter key on search input
    qInput.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        const q = qInput.value.trim();
        if (!q) return;
        doSearch(q.toLowerCase());
      }
    });
  }

  /** REFRESH DISCOVER **/
  if (btnRefresh) {
    btnRefresh.addEventListener('click', () => {
      try { initUI(); } catch (e) { console.warn('initUI not available', e); }
    });
  }

  /* ----------------------------------------------------------
     VOICE SEARCH — Web Speech API (uses btnMic id)
     - Matches the HTML which uses id="btnMic"
     - Friendly fallbacks and logging
  ---------------------------------------------------------- */
  (function setupVoice() {
    if (!btnMic) return; // nothing to do

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Not supported: make button visibly disabled
      btnMic.setAttribute('aria-hidden', 'true');
      btnMic.style.opacity = '0.35';
      btnMic.style.cursor = 'not-allowed';
      btnMic.title = 'Voice search not supported in this browser';
      return;
    }

    const mic = new SpeechRecognition();
    mic.lang = 'en-US';
    mic.interimResults = false;
    mic.continuous = false;

    let listening = false;

    function setListeningState(state) {
      listening = !!state;
      if (listening) {
        btnMic.classList.add('listening');
        btnMic.textContent = '●';
        btnMic.style.color = 'red';
      } else {
        btnMic.classList.remove('listening');
        btnMic.textContent = '🎙️';
        btnMic.style.color = '';
      }
    }

    btnMic.addEventListener('click', () => {
      if (listening) {
        try { mic.stop(); } catch (e) { /* ignore */ }
        setListeningState(false);
        return;
      }

      try {
        mic.start();
        setListeningState(true);
        // Some browsers require user gesture which we have (click)
      } catch (err) {
        console.error('SpeechRecognition start failed', err);
        setListeningState(false);
      }
    });

    mic.onresult = (ev) => {
      const text = ev.results[0] && ev.results[0][0] && ev.results[0][0].transcript ? ev.results[0][0].transcript : '';
      if (text) {
        qInput.value = text;
        // trigger search
        doSearch(text.toLowerCase());
      }
      setListeningState(false);
    };

    mic.onerror = (ev) => {
      console.warn('SpeechRecognition error', ev.error);
      setListeningState(false);
    };

    mic.onend = () => {
      setListeningState(false);
    };
  })();

  /** INITIAL HOME LOAD **/
  try { initUI(); } catch (e) { console.warn('initUI not available on load', e); }

});
document.addEventListener("DOMContentLoaded", () => {

  const navBtns = document.querySelectorAll(".nav-btn");
  const views = document.querySelectorAll(".view");

  function showView(id) {
    views.forEach(v => v.classList.remove("active"));
    document.getElementById(id).classList.add("active");

    navBtns.forEach(b => b.classList.remove("active"));
    [...navBtns].find(b => b.dataset.view === id)?.classList.add("active");
  }

  navBtns.forEach(btn => {
    btn.addEventListener("click", () => showView(btn.dataset.view));
  });

  /* ============================================================
     EPISODES LOADING — 2 COLUMNS UNLIMITED ROWS
  ============================================================ */

  window.loadEpisodes = function(episodes) {
    const grid = document.getElementById("episodeGrid");
    grid.innerHTML = "";

    episodes.forEach(ep => {
      const card = document.createElement("div");
      card.className = "episode-card";

      card.innerHTML = `
        <img src="${ep.artwork}">
        <h3>${ep.title}</h3>
        <p>${ep.podcast}</p>
      `;

      card.addEventListener("click", () => {
        window.appPlayer.playEpisode(ep);
      });

      grid.appendChild(card);
    });

    showView("episodes");
  };
});


