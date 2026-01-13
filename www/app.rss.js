/* app.rss.js
   Client-side iTunes discovery + RSS fetch & parser
*/

// Prevent duplicate declaration errors even if file loads twice
const CORS_PROXY = "http://localhost/podcastplus/www/proxy.php?url=";
// Set to "" if you do NOT want to use a proxy

function log(...args) { console.log("[app.rss]", ...args); }

function stripHtml(html) {
  if (!html) return "";
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return (doc.body.textContent || "").trim();
  } catch {
    return html.replace(/<[^>]*>/g, "").trim();
  }
}

function parsePubDate(s) {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

async function fetchWithProxy(url, opts = {}) {
  const isLocal = url.startsWith(location.origin) ||
                  url.startsWith(window.location.protocol + "//" + window.location.host);

  const target = (!isLocal && CORS_PROXY)
    ? CORS_PROXY + encodeURIComponent(url)
    : url;

  const res = await fetch(target, opts);
  if (!res.ok) throw new Error("Fetch failed: " + res.status);
  return res.text();
}

function parseRssXml(xmlText) {
  const parser = new DOMParser();
  let doc = parser.parseFromString(xmlText, "application/xml");

  if (doc.querySelector("parsererror")) {
    const idx = xmlText.indexOf("<?xml");
    if (idx > -1) {
      const cleaned = xmlText.slice(idx);
      doc = parser.parseFromString(cleaned, "application/xml");
      if (!doc.querySelector("parsererror")) {
        return parseRssXmlFromDoc(doc);
      }
    }
    throw new Error("Invalid RSS/Atom XML");
  }
  return parseRssXmlFromDoc(doc);
}

function parseRssXmlFromDoc(doc) {
  const channel = doc.querySelector("channel");
  let feedTitle = "", feedDesc = "", feedImage = "";

  if (channel) {
    feedTitle = channel.querySelector("title")?.textContent?.trim() || "";
    feedDesc = channel.querySelector("description, itunes\\:summary")?.textContent?.trim() || "";

    const img1 = channel.querySelector("image > url");
    const img2 = channel.querySelector("itunes\\:image");

    feedImage = img1?.textContent?.trim() || img2?.getAttribute("href") || "";
  } else {
    feedTitle = doc.querySelector("feed > title")?.textContent?.trim() || "";
    feedDesc = doc.querySelector("feed > subtitle")?.textContent?.trim() || "";
    feedImage = doc.querySelector("feed > logo, feed > icon")?.textContent?.trim() || "";
  }

  const items = [...doc.querySelectorAll("item, entry")];
  const episodes = items.map(item => {
    const title = item.querySelector("title")?.textContent?.trim() || "Untitled";
    let description = item.querySelector("itunes\\:summary, description, content\\:encoded")?.textContent || "";
    description = stripHtml(description) || stripHtml(item.textContent || "");

    let audio = null;
    const enclosure = item.querySelector("enclosure");
    if (enclosure) audio = enclosure.getAttribute("url");

    if (!audio) {
      const media = item.querySelector("media\\:content");
      if (media) audio = media.getAttribute("url");
    }

    if (!audio) {
      const link = item.querySelector("link[rel='enclosure'], link[type^='audio/']");
      if (link) audio = link.getAttribute("href");
    }

    if (!audio) {
      const text = item.textContent;
      const match = text?.match(/https?:\/\/\S+\.(mp3|m4a|aac|ogg|webm)/i);
      if (match) audio = match[0];
    }

    const pubDate = parsePubDate(item.querySelector("pubDate, published, updated")?.textContent);

    const guid = item.querySelector("guid")?.textContent?.trim() || (title + pubDate);

    const duration = item.querySelector("itunes\\:duration")?.textContent?.trim() || "";

    return { id: guid, title, description, audio, pubDate, duration };
  });

  return { title: feedTitle, description: feedDesc, image: feedImage, episodes };
}

/* UI Helpers */

function createEpisodeCard(ep, feedMeta = {}) {
  const el = document.createElement("div");
  el.className = "card";
  el.tabIndex = 0;

  const img = feedMeta.image || "assets/icons/podcast-placeholder.svg";
  const desc = (ep.description || "").slice(0, 140) + ((ep.description || "").length > 140 ? "…" : "");

  el.innerHTML = `
    <img src="${img}" />
    <h3>${ep.title}</h3>
    <p>${desc || ""}</p>
  `;

  el.addEventListener("click", () => {
    if (!ep.audio) return alert("No playable audio for this episode.");

    window.appPlayer.playEpisode({
      id: ep.id,
      title: ep.title,
      description: ep.description,
      audio: ep.audio,
      artwork: img
    });
  });

  return el;
}

function createPodcastCardFromItunes(p, loadFunc) {
  const el = document.createElement("div");
  el.className = "card";
  el.tabIndex = 0;

  const artwork = p.artworkUrl600 || p.artworkUrl100 || "assets/icons/podcast-placeholder.svg";

  el.innerHTML = `
    <img src="${artwork}" />
    <h3>${p.collectionName}</h3>
    <p>${p.artistName}</p>
    <button class="btn-load">Load Episodes</button>
  `;

  el.querySelector(".btn-load").addEventListener("click", async e => {
    e.stopPropagation();
    if (!p.feedUrl) return alert("No RSS feed available.");

    el.querySelector(".btn-load").textContent = "Loading…";
    await loadFunc(p.feedUrl, { title: p.collectionName, artwork });
    el.querySelector(".btn-load").textContent = "Load Episodes";
  });

  return el;
}

/* Core: Discover + Search + RSS load */

async function initUI() {
  const grid = document.getElementById("discoverGrid");
  grid.innerHTML = "Loading top podcasts…";

  try {
    const url = `https://itunes.apple.com/search?term=news&media=podcast&entity=podcast&limit=20`;
    const res = await fetch(url);
    const json = await res.json();

    grid.innerHTML = "";
    json.results.forEach(p => grid.appendChild(
      createPodcastCardFromItunes(p, loadFeedIntoGridFromItunesMeta)
    ));

  } catch (err) {
    grid.innerHTML = "<p style='color:red'>Failed to load Discover.</p>";
  }
}

async function performSearch(q) {
  const grid = document.getElementById("searchGrid");
  grid.innerHTML = "";

  if (!q) return grid.innerHTML = "<p>Enter search terms.</p>";

  grid.innerHTML = `Searching for '${q}'…`;

  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=podcast&entity=podcast&limit=25`;
    const res = await fetch(url);
    const json = await res.json();

    grid.innerHTML = "";

    json.results.forEach(p => grid.appendChild(
      createPodcastCardFromItunes(p, loadFeedIntoGridFromItunesMeta)
    ));

  } catch {
    grid.innerHTML = "<p style='color:red'>Search failed.</p>";
  }
}

async function loadFeedIntoGridFromItunesMeta(feedUrl, meta) {
  return loadFeedIntoGrid(feedUrl, meta, "discoverGrid");
}

async function loadFeedIntoGrid(feedUrl, meta = {}, gridId = "discoverGrid") {
  const grid = document.getElementById(gridId);
  grid.innerHTML = "Loading episodes…";

  try {
    const xmlText = await fetchWithProxy(feedUrl);
    const feed = parseRssXml(xmlText);

    feed.title = feed.title || meta.title;
    feed.image = feed.image || meta.artwork;

    grid.innerHTML = `
      <div style="display:flex;gap:12px;align-items:center;margin-bottom:12px">
        <img src="${feed.image}" style="width:80px;height:80px;border-radius:8px;object-fit:cover;">
        <div>
          <h2>${feed.title}</h2>
          <p>${feed.description?.slice(0, 200) || ""}</p>
        </div>
      </div>
      <div id="episodeList" class="grid"></div>
    `;

    const list = document.getElementById("episodeList");

    feed.episodes.slice(0, 50).forEach(ep =>
      list.appendChild(createEpisodeCard(ep, feed))
    );

  } catch (err) {
    grid.innerHTML = "<p style='color:red'>Failed to load RSS feed.</p>";
  }
}

/* Export to global */
window.performSearch = performSearch;
window.initUI = initUI;
window.loadFeedIntoGrid = loadFeedIntoGrid;

document.addEventListener("DOMContentLoaded", () => {
  try { initUI(); } catch {}
});

