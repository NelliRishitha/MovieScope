// Mock localStorage for Jest
global.localStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = value.toString();
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  }
};

require('jest-fetch-mock').enableMocks();

const { escapeHtml, addToWatchlist, getWatchlist, removeFromWatchlist, fetchMovieById } =
  require("../js/utils.js");

beforeEach(() => {
  fetch.resetMocks();
  localStorage.clear();
});


test("escapeHtml works", () => {
  expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
});

test("watchlist add + get + remove works", () => {
  addToWatchlist("123");
  addToWatchlist("456");
  expect(getWatchlist()).toEqual(["123", "456"]);

  removeFromWatchlist("123");
  expect(getWatchlist()).toEqual(["456"]);
});

test("fetchMovieById works", async () => {
  fetch.mockResponseOnce(JSON.stringify({ Title: "Inception", Response: "True" }));

  const data = await fetchMovieById("123");

  expect(data.Title).toBe("Inception");
});
