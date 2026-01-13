<?php
// admin/index.php
session_start();
$logged = isset($_SESSION['admin_username']);
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>PodcastPlus — Admin</title>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <link rel="stylesheet" href="styles.css" />
  <style>
    /* Minimal admin styles (keeps project style consistent) */
    body{font-family:Inter,system-ui,Arial; margin:20px; background:#f5f7fb;color:#0b1217}
    .card{background:#fff;border-radius:8px;padding:16px;box-shadow:0 6px 18px rgba(12,24,32,0.06);max-width:900px;margin:12px auto}
    .row{display:flex;gap:12px;align-items:center}
    label{display:block;margin-bottom:6px;font-weight:600}
    input[type=text], input[type=password], textarea, select{width:100%;padding:8px;border:1px solid #e3e8ee;border-radius:6px}
    button{padding:10px 14px;border-radius:8px;border:none;background:#00d084;color:#00221a;font-weight:700;cursor:pointer}
    .inline{display:inline-block}
    .small{font-size:13px;color:#6b7280}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  </style>
</head>
<body>
  <div class="card">
    <?php if (!$logged): ?>
      <h2>Admin login</h2>
      <form id="loginForm">
        <div style="max-width:400px">
          <label>Username</label>
          <input id="username" name="username" type="text" required />
          <label>Password</label>
          <input id="password" name="password" type="password" required />
          <div style="margin-top:12px">
            <button type="submit">Sign in</button>
          </div>
          <div id="loginMsg" class="small" style="margin-top:8px"></div>
        </div>
      </form>
    <?php else: ?>
      <div class="row" style="justify-content:space-between">
        <h2>Admin Dashboard</h2>
        <div>
          <span class="small">Signed in as <strong><?=htmlspecialchars($_SESSION['admin_username'])?></strong></span>
          <button id="logoutBtn" style="margin-left:12px;background:#ff6b6b;color:#fff">Log out</button>
        </div>
      </div>

      <hr style="margin:12px 0" />

      <div class="grid">
        <div>
          <h3>Create podcast</h3>
          <form id="podcastForm" enctype="multipart/form-data">
            <label>Title</label><input name="title" required />
            <label>Description</label><textarea name="description"></textarea>
            <label>Artwork (optional)</label><input type="file" name="artwork" accept="image/*" />
            <div style="margin-top:8px"><button type="submit">Create Podcast</button></div>
            <div id="podcastMsg" class="small" style="margin-top:8px"></div>
          </form>
        </div>

        <div>
          <h3>Create episode</h3>
          <form id="episodeForm" enctype="multipart/form-data">
            <label>Podcast</label>
            <select name="podcast_id" id="podcastSelect"></select>
            <label>Title</label><input name="title" required />
            <label>Description</label><textarea name="description"></textarea>
            <label>Audio file</label><input type="file" name="audio" accept="audio/*" required />
            <label>Duration (sec) — optional</label><input name="duration" />
            <div style="margin-top:8px"><button type="submit">Create Episode</button></div>
            <div id="episodeMsg" class="small" style="margin-top:8px"></div>
          </form>
        </div>
      </div>

      <hr style="margin:12px 0" />

      <h3>Existing podcasts</h3>
      <div id="podcastList" class="small">Loading…</div>
    <?php endif; ?>
  </div>

  <script src="../admin/admin.js"></script>
</body>
</html>
