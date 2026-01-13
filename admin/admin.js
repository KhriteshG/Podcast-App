// admin/admin.js
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const podcastForm = document.getElementById('podcastForm');
  const episodeForm = document.getElementById('episodeForm');
  const podcastSelect = document.getElementById('podcastSelect');
  const podcastList = document.getElementById('podcastList');
  const logoutBtn = document.getElementById('logoutBtn');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = new FormData(loginForm);
      try {
        const res = await fetch('../api/admin_login.php', { method: 'POST', body: f });
        const j = await res.json();
        if (res.ok && j.success) {
          location.reload();
        } else {
          document.getElementById('loginMsg').textContent = j.error || 'Login failed';
        }
      } catch (err) {
        document.getElementById('loginMsg').textContent = 'Network error';
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await fetch('../api/admin_logout.php', { method: 'POST' });
      location.reload();
    });
  }

  async function loadPodcasts() {
    try {
      const res = await fetch('../api/list_podcasts_admin.php');
      if (!res.ok) throw new Error('Not authorized or error');
      const data = await res.json();
      podcastList.innerHTML = '';
      podcastSelect.innerHTML = '';
      data.forEach(p => {
        const div = document.createElement('div');
        div.innerHTML = `<strong>${escapeHtml(p.Title)}</strong> — ${escapeHtml(p.Description || '')}`;
        podcastList.appendChild(div);
        const opt = document.createElement('option');
        opt.value = p.PodcastID;
        opt.textContent = p.Title;
        podcastSelect.appendChild(opt);
      });
      if (data.length === 0) podcastList.textContent = 'No podcasts yet.';
    } catch (e) {
      podcastList.textContent = 'Unable to load podcasts (not authorized or server error).';
    }
  }

  if (podcastForm) {
    podcastForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(podcastForm);
      document.getElementById('podcastMsg').textContent = 'Creating…';
      try {
        const res = await fetch('../api/create_podcast.php', { method: 'POST', body: fd });
        const j = await res.json();
        if (res.ok && j.success) {
          document.getElementById('podcastMsg').textContent = 'Created.';
          podcastForm.reset();
          await loadPodcasts();
        } else {
          document.getElementById('podcastMsg').textContent = j.error || 'Create failed';
        }
      } catch (err) {
        document.getElementById('podcastMsg').textContent = 'Network error';
      }
    });
  }

  if (episodeForm) {
    episodeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(episodeForm);
      document.getElementById('episodeMsg').textContent = 'Uploading…';
      try {
        const res = await fetch('../api/create_episode.php', { method: 'POST', body: fd });
        const j = await res.json();
        if (res.ok && j.success) {
          document.getElementById('episodeMsg').textContent = 'Episode created.';
          episodeForm.reset();
        } else {
          document.getElementById('episodeMsg').textContent = j.error || 'Create failed';
        }
      } catch (err) {
        document.getElementById('episodeMsg').textContent = 'Network error';
      }
    });
  }

  // helper
  function escapeHtml(s){ return (s||'').toString().replace(/[&<>"']/g, (m)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }

  loadPodcasts();
});
