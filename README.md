# LeloFlix-Netflix

LeloFlix-Netflix is a web application designed to emulate a movie Browse experience, similar to Netflix. Users can browse a catalog of movies, view details for each movie, manage a list of favorite movies, and sign up or log in to their accounts. The project also includes basic admin functionality for managing movie data.

This project was initially developed as part of an academic activity ("template-diw-20251-semana-12") and has been expanded to include these features.

## Features

* **User Authentication:** Users can sign up for a new account and log in. User sessions are managed via `sessionStorage`.
* **Movie Browse:** Display a catalog of movies on the main page (`index.html`) with a featured movie and carousels for different categories.
* **Movie Details:** View detailed information about a movie, including summary, actors, creators, year, rating, duration, and filming locations displayed on an interactive map (Mapbox GL JS).
* **Search Functionality:** Users can search for movies.
* **Favorites:** Logged-in users can add movies to their personal favorites list and view them on a dedicated page (`favoritos.html`). Favorites are stored in `localStorage`.
* **Genre Page:** A page to (conceptually) browse movies by genre (`generos.html`).
* **Admin Movie Management (CRUD):** Admin users can add, update, and delete movie entries via the `criar.html` page. Admin status is determined by a flag in the user's data.
* **Responsive Design:** Styled with CSS for different screen sizes, including a mobile-friendly navigation menu.

## Tech Stack

* **Frontend:** HTML, CSS, JavaScript
    * **Mapping:** Mapbox GL JS (for filming locations)
    * **Styling:** Bootstrap (used on admin/search pages), Font Awesome (for icons)
* **Backend (Mock API):** JSON Server
* **Package Management:** npm

## Project Structure

    leloflix-netflix/
    ├── db/
    │   └── db.json         # JSON file acting as the database for JSON Server
    ├── public/             # Contains all frontend static assets
    │   ├── assets/
    │   │   ├── css/        # Stylesheets for different pages
    │   │   ├── imgs/       # Image assets
    │   │   └── scripts/    # JavaScript files for frontend logic
    │   │       ├── app.js  # Core application logic (movies, favorites, search, map)
    │   │       ├── crud.js # CRUD operations for movies (admin)
    │   │       └── login.js# User authentication and session handling
    │   ├── criar.html      # Admin page for movie CRUD operations
    │   ├── detalhes.html   # Movie details page
    │   ├── favoritos.html  # User's favorite movies page
    │   ├── generos.html    # Movie genres page
    │   ├── index.html      # Main landing page with movie listings
    │   ├── lista.html      # (Appears to be a static "My List" page, functionality mainly in favoritos.html)
    │   ├── login.html      # User login page
    │   ├── search.html     # Page for movie search (seems to be more of a contact search template based on content)
    │   └── signup.html     # User registration page
    ├── index.js            # Node.js script to start JSON Server with custom setup (if used instead of package.json script)
    ├── package.json        # Project metadata and dependencies
    ├── package-lock.json   # Exact versions of dependencies
    └── README.md           # This file

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd leloflix-netflix
    ```

2.  **Install dependencies:**
    Make sure you have Node.js and npm installed.
    ```bash
    npm install
    ```

3.  **Run the application:**
    This command starts the JSON Server, which will serve the `db/db.json` file as a REST API and also serve the static files from the `public` directory.
    ```bash
    npm start
    ```
    By default, JSON Server will run on `http://localhost:3000`. The `package.json` script is `json-server --watch ./db/db.json`. `json-server` serves the `./public` directory automatically if it exists.
    Alternatively, you can run the custom server configuration:
    ```bash
    node index.js
    ```
    This also starts the server on `http://localhost:3000`.

4.  Open your browser and navigate to `http://localhost:3000` to see the application.

## API (JSON Server)

The application uses `json-server` to simulate a REST API based on the `db/db.json` file.

### Main Resources:

* **`/usuarios`**: Manages user data.
    * `GET /usuarios`: Retrieves all users.
    * `POST /usuarios`: Registers a new user.
* **`/filmes`**: Manages movie data.
    * `GET /filmes`: Retrieves all movies.
    * `GET /filmes/{id}`: Retrieves a specific movie by its ID.
    * `POST /filmes`: Adds a new movie (admin).
    * `PUT /filmes/{id}`: Updates an existing movie (admin).
    * `DELETE /filmes/{id}`: Deletes a movie (admin).
* **`/favoritos`**: (Implicitly managed through application logic by linking `userId` and `filmId`, though not directly a primary API endpoint for the frontend favorites which uses localStorage. `db.json` has a `favoritos` array schema).

### Data Schema (`db/db.json`)

* **`usuarios`**:
    * `id` (string, UUID)
    * `login` (string)
    * `senha` (string) - *Note: Passwords are stored in plain text.*
    * `nome` (string)
    * `email` (string)
    * `admin` (boolean)
* **`filmes`**:
    * `id` (number)
    * `titulo` (string)
    * `genero` (array of strings or string)
    * `ano` (string)
    * `resumo` (string)
    * `avaliacao` (string)
    * `imagemdesktop` (string, path to image)
    * `imagemmobile` (string, path to image)
    * `trailer` (string, URL)
    * `atores` (array of strings)
    * `criadores` (array of strings)
    * `duracao` (string)
    * `filming_locations` (array of objects):
        * `name` (string)
        * `latitude` (array: [longitude, latitude])
* **`favoritos`**:
    * `userId` (string, links to `usuarios.id`)
    * `filmId` (number, links to `filmes.id`)

## Frontend Overview

* **`index.html`**: The main landing page. Displays a featured movie and carousels of movie categories. Requires login.
* **`login.html` / `signup.html`**: Handle user authentication.
* **`detalhes.html`**: Shows detailed information for a selected movie, including an interactive map of filming locations using Mapbox.
* **`favoritos.html`**: Displays a list of movies the logged-in user has marked as favorite.
* **`generos.html`**: A static page listing movie genres.
* **`criar.html`**: An admin interface for Creating, Reading, Updating, and Deleting movies.
* **`app.js`**: Contains the core client-side JavaScript for fetching and displaying movies, handling user interactions like search and favorites, and managing the movie details page including the Mapbox map integration.
* **`login.js`**: Manages user login, registration, and session persistence using `sessionStorage`.
* **`crud.js`**: Provides helper functions for interacting with the `/filmes` API endpoint for CRUD operations, used by `criar.html`.

## Potential Future Improvements

* Secure password storage (e.g., hashing) instead of plain text.
* Dynamic filtering and display of movies on the `generos.html` page.
* More robust error handling and user feedback.
* Implementation of the "Add to Watchlist" feature.
* Pagination for large lists of movies.
* Refine search functionality (e.g., `search.html` currently seems like a placeholder or different template).