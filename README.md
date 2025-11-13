# 🎬 MovieScope – Movie Info Search App
**Live Demo:**  
👉 [Click here to open the app](https://nellirishitha.github.io/MovieScope/)  

##  Project Overview
**MovieScope** is a movie information and recommendation web app that uses the **OMDb (Open Movie Database) API** to fetch real-time movie data.  
Users can:
-  Search movies by title or year  
-  View poster, genre, director, and IMDb rating  
-  Save movies to a personal **watchlist** (stored in local storage)  
-  Get **recommended movies** based on the search  
-  Access it directly on **GitHub Pages**

---

##  Learning Focus
- Using and understanding APIs  
- Asynchronous JavaScript (`fetch` and `async/await`)  
- Handling JSON data  
- Designing an interactive front-end interface  
- Saving data with Local Storage  
- Hosting projects with GitHub Pages  

---

##  Tech Stack
- **Frontend:** HTML, CSS, JavaScript  
- **API Used:** [OMDb API](https://www.omdbapi.com/)  
- **Hosting:** GitHub Pages  

---

## API Details

###  API Used
**OMDb API** — Open Movie Database  
Base URL:  
https://www.omdbapi.com/

###  Example API Call (GET Request)
```javascript
fetch(`https://www.omdbapi.com/?t=Inception&apikey=YOUR_API_KEY`)
  .then(response => response.json())
  .then(data => console.log(data));

```
### **Parameters:**

t → movie title

y → year (optional)

apikey → your personal OMDb API key

Response example:
{
  "Title": "Inception",
  "Year": "2010",
  "Genre": "Action, Adventure, Sci-Fi",
  "Director": "Christopher Nolan",
  "imdbRating": "8.8",
  "Poster": "https://m.media-amazon.com/images/....jpg"
}

### **Features**
- Search movies by title/year using the OMDb API  
- Displays poster, genre, director, and IMDb rating  
- Save favorite movies to watchlist (stored in localStorage)  
- Get movie recommendations based on genre

### **Conclusion**

This project demonstrates:

Practical API integration using JavaScript

Handling asynchronous web data

Building dynamic and user-friendly UI

Saving and managing local data

Deploying web projects using GitHub Pages
