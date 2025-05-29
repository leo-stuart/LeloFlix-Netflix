// Global variables
let allFilmes = [];
let userFavorites = {};

// Initialize user favorites from localStorage
function initializeUserFavorites() {
    try {
        const currentUser = usuarioCorrente.login;
        if (currentUser) {
            userFavorites = JSON.parse(localStorage.getItem(`favorites_${currentUser}`)) || {};
            console.log('User favorites initialized:', userFavorites);
        }
    } catch (error) {
        console.error('Error initializing user favorites:', error);
        userFavorites = {};
    }
}

// Save user favorites to localStorage
function saveUserFavorites() {
    try {
        const currentUser = usuarioCorrente.login;
        if (currentUser) {
            localStorage.setItem(`favorites_${currentUser}`, JSON.stringify(userFavorites));
            console.log('User favorites saved:', userFavorites);
        }
    } catch (error) {
        console.error('Error saving user favorites:', error);
    }
}

// Favorites functionality
function isFavorite(movieId) {
    try {
        return userFavorites[movieId.toString()] === true;
    } catch (error) {
        console.error('Error checking favorite status:', error);
        return false;
    }
}

function toggleFavorite(movieId, buttonElement) {
    try {
        const currentUser = usuarioCorrente.login;
        if (!currentUser) {
            showFeedback('Por favor, faça login para adicionar favoritos');
            return;
        }

        const movieIdStr = movieId.toString();
        const heartIcon = buttonElement.querySelector('i');
        
        if (userFavorites[movieIdStr]) {
            // Remove from favorites
            delete userFavorites[movieIdStr];
            heartIcon.className = 'fa fa-heart-o';
            buttonElement.style.color = '#fff';
        } else {
            // Add to favorites
            userFavorites[movieIdStr] = true;
            heartIcon.className = 'fa fa-heart';
            buttonElement.style.color = '#e50914';
        }
        
        // Save to localStorage
        saveUserFavorites();
        
        // Show feedback
        showFeedback(userFavorites[movieIdStr] ? 'Adicionado aos favoritos!' : 'Removido dos favoritos!');
    } catch (error) {
        console.error('Error toggling favorite:', error);
        showFeedback('Erro ao atualizar favoritos');
    }
}

function showFeedback(message) {
    try {
        // Create and show feedback notification
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e50914;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 1000;
            font-size: 14px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            transition: opacity 0.3s;
        `;
        feedback.textContent = message;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.style.opacity = '0';
            setTimeout(() => feedback.remove(), 300);
        }, 2000);
    } catch (error) {
        console.error('Error showing feedback:', error);
    }
}

function createMovieCard(filme, isFavorite = false) {
    try {
        const heartClass = isFavorite ? 'fa fa-heart' : 'fa fa-heart-o';
        const heartColor = isFavorite ? 'color: #e50914;' : '';
        
        return `
            <div class="miniBoxFilme" onclick="redirectToFilm('${filme.id}')">
                <picture>
                    <source srcset="${filme.imagemdesktop}" media="(max-width: 600px)">
                    <img src="${filme.imagemdesktop}" alt="filme thumbnail" class="maior-thumbnail">
                </picture>
                <div class="boxFilme">
                    <div class="likeAdd">
                        <button onclick="event.stopPropagation(); toggleFavorite('${filme.id}', this)" 
                                aria-label="Toggle favorite" style="${heartColor}">
                            <i class="${heartClass}" aria-hidden="true"></i>
                        </button>
                        <button onclick="event.stopPropagation(); addToWatchlist('${filme.id}')" 
                                aria-label="Add to watchlist">
                            <i class="fa fa-plus" aria-hidden="true"></i>
                        </button>
                    </div>
                    <article class="filmeSpecs">
                        <h2>${filme.titulo}</h2>
                        <div>
                            <h3 class="genero">${Array.isArray(filme.genero) ? filme.genero[0] : filme.genero}</h3>
                            <h3>${filme.ano}</h3>
                        </div>
                    </article>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error creating movie card:', error);
        return '';
    }
}

// Initialize the page
function initializePage() {
    try {
        console.log('Initializing page...');
        
        // Initialize user favorites
        initializeUserFavorites();
        
        // Initialize search
        initializeSearch();
        
        // Get search query from URL if it exists
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search');
        
        // Fetch and display movies
        console.log('Fetching movies...');
        fetch('http://localhost:3000/filmes')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                console.log('Movies fetched successfully:', data.length);
                allFilmes = data;
                const rowFilme = document.getElementById('row-filme');
                
                if (!rowFilme) {
                    console.error('Element with id "row-filme" not found');
                    return;
                }

                // Filter movies if there's a search query
                let moviesToDisplay = allFilmes;
                if (searchQuery) {
                    const searchTerm = searchQuery.toLowerCase();
                    moviesToDisplay = allFilmes.filter(filme => {
                        const title = (filme.titulo || '').toLowerCase();
                        return title.includes(searchTerm);
                    });
                    
                    // Update category title if searching
                    const categoria = document.querySelector('.categoria');
                    if (categoria) {
                        categoria.textContent = `Resultados para: "${searchQuery}" (${moviesToDisplay.length} filmes)`;
                    }
                }

                // Display movies
                rowFilme.innerHTML = ''; // Clear existing content
                moviesToDisplay.forEach(filme => {
                    const isFav = isFavorite(filme.id);
                    rowFilme.innerHTML += createMovieCard(filme, isFav);
                });
                console.log('Movies displayed successfully');
            })
            .catch(error => {
                console.error('Error fetching movies:', error);
                const rowFilme = document.getElementById('row-filme');
                if (rowFilme) {
                    rowFilme.innerHTML = `
                        <div style="text-align: center; padding: 40px; color: #fff;">
                            <h3>Erro ao carregar filmes</h3>
                            <p>Por favor, tente novamente mais tarde</p>
                        </div>
                    `;
                }
            });
    } catch (error) {
        console.error('Error initializing page:', error);
    }
}

// Page detail functions
let params = new URLSearchParams(document.location.search);
let pageId = parseInt(params.get("id"));

// Search functionality
function initializeSearch() {
    // Media search (header)
    const searchBtnMedia = document.getElementById('searchBtnMedia');
    const searchInputMedia = document.getElementById('searchInputMedia');
    const searchFormMedia = document.getElementById('searchFormMedia');
    
    // Sidebar search
    const searchBtnSidebar = document.getElementById('searchBtnSidebar');
    const searchInputSidebar = document.getElementById('searchInputSidebar');
    const searchFormSidebar = document.getElementById('searchFormSidebar');

    const handleSearch = (query) => {
        if (query) {
            window.location.href = `index.html?search=${encodeURIComponent(query)}`;
        }
    };

    if (searchFormMedia) {
        searchFormMedia.addEventListener('submit', (e) => {
            e.preventDefault();
            handleSearch(searchInputMedia.value.trim());
        });
    }

    if (searchBtnMedia && searchInputMedia) {
        searchBtnMedia.addEventListener('click', () => handleSearch(searchInputMedia.value.trim()));
        searchInputMedia.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch(searchInputMedia.value.trim());
            }
        });
    }

    if (searchFormSidebar) {
        searchFormSidebar.addEventListener('submit', (e) => {
            e.preventDefault();
            handleSearch(searchInputSidebar.value.trim());
        });
    }

    if (searchBtnSidebar && searchInputSidebar) {
        searchBtnSidebar.addEventListener('click', () => handleSearch(searchInputSidebar.value.trim()));
        searchInputSidebar.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch(searchInputSidebar.value.trim());
            }
        });
    }
}

function performSearch(query) {
    if (!query.trim()) {
        displayAllMovies();
        return;
    }

    const searchTerm = query.toLowerCase();
    const filteredMovies = allFilmes.filter(filme => {
        // Safely check each property
        const title = (filme.titulo || '').toLowerCase();
        const genres = Array.isArray(filme.genero) ? filme.genero : [filme.genero || ''];
        const creators = (filme.criadores || '').toLowerCase();
        const actors = (filme.atores || '').toLowerCase();

        return title.includes(searchTerm) ||
               genres.some(g => (g || '').toLowerCase().includes(searchTerm)) ||
               creators.includes(searchTerm) ||
               actors.includes(searchTerm);
    });

    displaySearchResults(filteredMovies, query);
}

function displaySearchResults(movies, query) {
    const rowFilme = document.getElementById('row-filme');
    const categoria = document.querySelector('.categoria');
    
    if (!rowFilme) return;

    // Update category title
    if (categoria) {
        categoria.textContent = `Resultados para: "${query}" (${movies.length} filmes)`;
    }

    // Clear current movies
    rowFilme.innerHTML = '';

    if (movies.length === 0) {
        rowFilme.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #fff;">
                <h3>Nenhum filme encontrado</h3>
                <p>Tente buscar com outros termos</p>
            </div>
        `;
        return;
    }

    // Display filtered movies
    movies.forEach(filme => {
        const isFavorite = isFavorite(filme.id);
        rowFilme.innerHTML += createMovieCard(filme, isFavorite);
    });
}

function displayAllMovies() {
    const rowFilme = document.getElementById('row-filme');
    const categoria = document.querySelector('.categoria');
    
    if (!rowFilme) return;

    // Reset category title
    if (categoria) {
        categoria.textContent = 'Em alta';
    }

    // Clear and display all movies
    rowFilme.innerHTML = '';
    allFilmes.forEach(filme => {
        const isFavorite = isFavorite(filme.id);
        rowFilme.innerHTML += createMovieCard(filme, isFavorite);
    });
}

function addToWatchlist(movieId) {
    // Placeholder for watchlist functionality
    showFeedback('Adicionado à lista para assistir!');
}

// Page detail functions (existing code with favorites integration)
if (pageId) {
    fetch(`/filmes?id=${pageId}`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            const filme = data[0];
            
            if (!filme) {
                throw new Error('Movie not found');
            }

            // Update movie details
            document.getElementById('nome').innerHTML = `${filme.titulo}`;
            let avaliacao = document.getElementById('avaliacao');
            if (avaliacao) avaliacao.innerHTML = `${filme.avaliacao}`;
            document.getElementById('duracao').innerHTML = `${filme.duracao}`;
            document.getElementById('resumo').innerHTML = `${filme.resumo}`;
            document.getElementById('ano').innerHTML = `${filme.ano}`;
            document.getElementById('genero').innerHTML = `${filme.genero}`;
            document.getElementById('diretores').innerHTML = `${filme.criadores}`;
            document.getElementById('atores').innerHTML = `${filme.atores}`;
            document.getElementById('imagem').src = filme.imagemdesktop;

            // Update favorite button in detail page
            const favoriteBtn = document.getElementById('favoriteBtn');
            if (favoriteBtn) {
                const isFavorite = isFavorite(pageId);
                const heartIcon = favoriteBtn.querySelector('i');
                if (heartIcon) {
                    heartIcon.className = isFavorite ? 'fa fa-heart' : 'fa fa-heart-o';
                    favoriteBtn.style.color = isFavorite ? '#e50914' : '#fff';
                }
            }
        })
        .catch(error => {
            console.error('Error fetching movie details:', error);
            document.getElementById('nome').innerHTML = 'Error loading movie details';
        });

    const trailerButton = document.getElementById('Trailer');
    if (trailerButton) {
        trailerButton.addEventListener('click', () => {
            redirectToTrailer(pageId);
        });
    }
}

function redirectToFilm(id) {
    window.location.href = `detalhes.html?id=${id}`;
}

function redirectToTrailer(id) {
    const filme = allFilmes.find(t => t.id == id);
    if (filme && filme.trailer) {
        window.open(filme.trailer, "_blank");
    }
}

// Carousel functionality
document.addEventListener("DOMContentLoaded", function () {
    initializePage();
    
    const carousels = document.querySelectorAll(".netflix-carousel");

    carousels.forEach((carousel) => {
        const track = carousel.querySelector(".carousel-track");
        const btnLeft = carousel.querySelector(".carousel-btn.left");
        const btnRight = carousel.querySelector(".carousel-btn.right");

        if (btnLeft && btnRight) {
            btnLeft.addEventListener("click", () => {
                track.scrollBy({ left: -300, behavior: "smooth" });
            });

            btnRight.addEventListener("click", () => {
                track.scrollBy({ left: 300, behavior: "smooth" });
            });
        }
    });
});

// Featured movie favorite functionality
function addToList() {
    // Add featured movie to favorites (assuming it's movie ID 3 based on your HTML)
    const featuredMovieId = '3';
    const featuredBtn = document.querySelector('.container-destaque .botoes button:last-child');
    
    if (featuredBtn) {
        toggleFavorite(featuredMovieId, featuredBtn);
        // Update button icon
        const icon = featuredBtn.querySelector('i');
        if (icon) {
            const isFavorite = isFavorite(featuredMovieId);
            icon.className = isFavorite ? 'fa fa-heart' : 'fa fa-plus';
        }
    }
}

// MAPA functionality (existing code remains the same)
let map;

window.onload = () => {
    if (pageId) {
        montarMapa(pageId);
    }
}

function montarMapa(pageId) {
    mapboxgl.accessToken = 'pk.eyJ1Ijoicm9tbWVsY2FybmVpcm8tcHVjIiwiYSI6ImNsb3ZuMTBoejBsd2gyamwzeDZzcWl5b3oifQ.VPWc3qoyon8Z_-URfKpvKg';
    
    fetch(`/filmes?id=${pageId}`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            const filme = data[0];
            
            if (!filme || !filme.filming_locations || filme.filming_locations.length === 0) {
                console.error('No filming locations found for this movie');
                return;
            }

            const firstLocation = filme.filming_locations[0];
            const mapCenter = firstLocation.latitude;

            if (!Array.isArray(mapCenter) || mapCenter.length !== 2) {
                console.error('Invalid coordinates format. Expected [longitude, latitude]');
                return;
            }

            map = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/mapbox/streets-v12',
                center: mapCenter,
                zoom: 6
            });

            map.addControl(new mapboxgl.NavigationControl());

            const bounds = new mapboxgl.LngLatBounds();

            filme.filming_locations.forEach((location, index) => {
                const coordinates = location.latitude;
                
                if (!Array.isArray(coordinates) || coordinates.length !== 2) {
                    console.warn(`Invalid coordinates for location ${index}:`, coordinates);
                    return;
                }

                const popup = new mapboxgl.Popup({ 
                    offset: 25,
                    closeButton: true,
                    closeOnClick: false 
                }).setHTML(`
                    <div style="padding: 10px;">
                        <h3 style="margin: 0 0 10px 0; font-size: 16px;">${location.name}</h3>
                        <p style="margin: 0; font-size: 14px; color: #666;">Filming Location</p>
                    </div>
                `);

                const marker = new mapboxgl.Marker({ 
                    color: "#ff0000",
                    scale: 0.8
                })
                .setLngLat(coordinates)
                .setPopup(popup)
                .addTo(map);

                bounds.extend(coordinates);
            });

            if (filme.filming_locations.length > 1) {
                map.fitBounds(bounds, {
                    padding: 50,
                    maxZoom: 10
                });
            }

            map.on('load', () => {
                console.log('Map loaded successfully');
            });

            map.on('error', (e) => {
                console.error('Map error:', e.error);
            });

        })
        .catch(error => {
            console.error('Error loading movie data for map:', error);
            
            const mapContainer = document.getElementById('map');
            if (mapContainer) {
                mapContainer.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f5f5f5; color: #666;">
                        <p>Unable to load filming locations</p>
                    </div>
                `;
            }
        });
}