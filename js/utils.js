// Escape HTML
function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Watchlist functions
function getWatchlist() {
  return JSON.parse(localStorage.getItem("watchlist") || "[]");
}

function addToWatchlist(id) {
  const list = getWatchlist();
  if (!list.includes(id)) {
    list.push(id);
    localStorage.setItem("watchlist", JSON.stringify(list));
  }
}

function removeFromWatchlist(id) {
  const list = getWatchlist().filter((x) => x !== id);
  localStorage.setItem("watchlist", JSON.stringify(list));
}

// Fetch movie
async function fetchMovieById(id) {
  const res = await fetch(`https://www.omdbapi.com/?apikey=fb09f133&i=${id}`);
  return res.json();
}

module.exports = {
  escapeHtml,
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist,
  fetchMovieById,
};
