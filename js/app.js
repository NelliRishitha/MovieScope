// ====== CONFIG ======
const apiKey = "5837528"; // <<< REPLACE this with your OMDb API key
const BASE = "https://www.omdbapi.com/";

// ====== DOM ======
const movieInput = document.getElementById("movieInput");
const searchBtn = document.getElementById("searchBtn");
const movieInfo = document.getElementById("movieInfo");
const recommendList = document.getElementById("recommendList");
const watchlistItems = document.getElementById("watchlistItems");

// ====== WATCHLIST ======
let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
function saveWatchlist() {
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
}
function renderWatchlist() {
  watchlistItems.innerHTML = "";
  if (!watchlist.length) {
    watchlistItems.innerHTML = "<p>Your watchlist is empty.</p>";
    return;
  }
  watchlist.forEach(m => {
    const p = document.createElement("p");
    p.textContent = `${m.Title} (${m.Year})`;
    watchlistItems.appendChild(p);
  });
}

// ====== UTIL ======
function showMessage(targetEl, html) {
  targetEl.innerHTML = `<div style="padding:12px;color:#ffd;">${html}</div>`;
}
function clearMessage(targetEl) {
  targetEl.innerHTML = "";
}

// ====== MAIN search logic ======
searchBtn.addEventListener("click", handleSearch);
movieInput.addEventListener("keydown", (e) => { if (e.key === "Enter") handleSearch(); });

async function handleSearch() {
  const q = movieInput.value.trim();
  if (!q) {
    alert("Please enter a movie title, year or IMDb ID (e.g. tt1375666).");
    return;
  }
  // check API key present
  if (!apiKey || apiKey === "YOUR_OMDB_API_KEY") {
    alert("You must replace YOUR_OMDB_API_KEY in js/app.js with your real OMDb API key.");
    return;
  }

  // Clear UI & show loading
  showMessage(movieInfo, "Searching...");
  recommendList.innerHTML = "";

  try {
    // If user provided an IMDb id (tt...)
    if (/^tt\d+$/i.test(q)) {
      console.log("Detected IMDb ID search:", q);
      const detail = await fetchById(q);
      if (detail) return displayMovieDetail(detail);
      else return showMessage(movieInfo, "Movie not found by IMDb ID.");
    }

    // If input is just a 4-digit year, show message
    if (/^\d{4}$/.test(q)) {
      // search by year: use s= with a common keyword (this is fuzzy). We'll alert user
      showMessage(movieInfo, "Please provide a title along with year for better results (e.g. \"Avatar 2009\").");
      return;
    }

    // Otherwise treat as title search: use 's=' to get matching list, then fetch details for first match
    console.log("Searching by title (s=):", q);
    const sUrl = `${BASE}?apikey=${encodeURIComponent(apiKey)}&s=${encodeURIComponent(q)}&type=movie`;
    const sResp = await fetch(sUrl);
    const sJson = await sResp.json();
    console.log("Search result:", sJson);

    if (sJson.Response === "False") {
      // sometimes search fails but an exact title with t= works; try t= fallback
      console.log("s= returned false, trying t= fallback for exact match");
      const tUrl = `${BASE}?apikey=${encodeURIComponent(apiKey)}&t=${encodeURIComponent(q)}&type=movie`;
      const tResp = await fetch(tUrl);
      const tJson = await tResp.json();
      console.log("t= result:", tJson);
      if (tJson.Response === "True") {
        return displayMovieDetail(tJson);
      } else {
        return showMessage(movieInfo, `No results for "${q}".`);
      }
    }

    // s= returned results; pick best candidate (first) and fetch full details by imdbID
    const first = sJson.Search[0];
    if (!first) {
      return showMessage(movieInfo, "No results found.");
    }
    const detail = await fetchById(first.imdbID);
    if (!detail) {
      return showMessage(movieInfo, "Unable to fetch movie details.");
    }
    return displayMovieDetail(detail);

  } catch (err) {
    console.error("Search error:", err);
    showMessage(movieInfo, "Network error. Check console for details.");
  }
}

// ====== helper fetch functions ======
async function fetchById(imdbID) {
  try {
    const url = `${BASE}?apikey=${encodeURIComponent(apiKey)}&i=${encodeURIComponent(imdbID)}&plot=full`;
    const r = await fetch(url);
    const j = await r.json();
    console.log("fetchById:", j);
    if (j.Response === "True") return j;
    // show server-provided error if any
    if (j.Error) showMessage(movieInfo, `API: ${j.Error}`);
    return null;
  } catch (e) {
    console.error("fetchById error:", e);
    return null;
  }
}

// ====== Display details and recommendations ======
function displayMovieDetail(data) {
  clearMessage(movieInfo);
  movieInfo.innerHTML = `
    <img src="${data.Poster && data.Poster !== "N/A" ? data.Poster : 'https://via.placeholder.com/250x360?text=No+Poster'}" alt="${escapeHtml(data.Title)}" style="width:260px;border-radius:8px;">
    <h2 style="margin:10px 0">${escapeHtml(data.Title)} <small style="color:#cbd5e1">(${escapeHtml(data.Year)})</small></h2>
    <p><strong>Genre:</strong> ${escapeHtml(data.Genre || "—")}</p>
    <p><strong>Director:</strong> ${escapeHtml(data.Director || "—")}</p>
    <p><strong>IMDb Rating:</strong> ${escapeHtml(data.imdbRating || "—")}</p>
    <p style="max-width:560px;margin:8px auto;color:#cbd5e1">${escapeHtml(data.Plot && data.Plot !== "N/A" ? data.Plot : "")}</p>
    <button id="addToWatchBtn" style="padding:8px 12px;border-radius:6px;background:#22c55e;border:none;cursor:pointer">Add to Watchlist</button>
  `;

  document.getElementById("addToWatchBtn").addEventListener("click", () => {
    if (!watchlist.find(m => m.imdbID === data.imdbID)) {
      watchlist.unshift({ imdbID: data.imdbID, Title: data.Title, Year: data.Year });
      saveWatchlist();
      renderWatchlist();
      alert(`${data.Title} added to watchlist.`);
    } else {
      alert("This movie is already in your watchlist.");
    }
  });

  // build recommendations using first genre
  buildRecommendations(data);
  // scroll to movie detail
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function buildRecommendations(data) {
  recommendList.innerHTML = "<p style='color:#cbd5e1'>Loading recommendations...</p>";
  const genre = (data.Genre || "").split(",")[0]?.trim();
  if (!genre) {
    recommendList.innerHTML = "<p>No recommendations available.</p>";
    return;
  }

  try {
    // use s=genre to get candidates
    const url = `${BASE}?apikey=${encodeURIComponent(apiKey)}&s=${encodeURIComponent(genre)}&type=movie`;
    const resp = await fetch(url);
    const j = await resp.json();
    console.log("Recommendations search:", j);

    if (j.Response === "False" || !j.Search) {
      recommendList.innerHTML = "<p>No recommendations found.</p>";
      return;
    }

    // display up to 6 recommendations (exclude the current movie)
    recommendList.innerHTML = "";
    const picks = j.Search.filter(x => x.imdbID !== data.imdbID).slice(0, 6);
    picks.forEach(p => {
      const card = document.createElement("div");
      card.className = "movie-card";
      card.style.cursor = "pointer";
      card.innerHTML = `
        <img src="${p.Poster && p.Poster !== "N/A" ? p.Poster : 'https://via.placeholder.com/150x220?text=No+Poster'}" alt="${escapeHtml(p.Title)}" style="width:100%;border-radius:6px;">
        <h3 style="font-size:14px;margin:8px 0 0">${escapeHtml(p.Title)}</h3>
        <small style="color:#cbd5e1">${escapeHtml(p.Year)}</small>
      `;
      // click to open recommended movie detail (fetch by imdbID)
      card.addEventListener("click", async () => {
        const detail = await fetchById(p.imdbID);
        if (detail) displayMovieDetail(detail);
      });
      recommendList.appendChild(card);
    });

  } catch (err) {
    console.error("Recommendations error:", err);
    recommendList.innerHTML = "<p>Error loading recommendations.</p>";
  }
}

// escape helper
function escapeHtml(s){ return String(s||"").replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

// init
renderWatchlist();
