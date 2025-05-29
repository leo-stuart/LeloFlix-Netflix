// Page detail functions
let params = new URLSearchParams(document.location.search);
let pageId = parseInt(params.get("id"));

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
    })
    .catch(error => {
      console.error('Error fetching movie details:', error);
      // Handle error gracefully
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
  // Note: You'll need to fetch the movie data here or store it globally
  // This assumes you have access to the filmes data
  const link = filmes.flat().find(t => t.id == id);
  if (link && link.trailer) {
    window.open(link.trailer, "_blank");
  }
}

// MAIN.HTML
function addToFavorite() {
  console.log("Added to list");
}

document.addEventListener("DOMContentLoaded", function () {
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

fetch('/filmes')
  .then(res => {
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  })
  .then(data => {
    const filmes = data;
    const rowFilme = document.getElementById('row-filme');
    
    if (!rowFilme) {
      console.error('Element with id "row-filme" not found');
      return;
    }

    filmes.forEach(filme => {
      rowFilme.innerHTML += `
        <div class="miniBoxFilme" onclick="redirectToFilm('${filme.id}')">
          <picture>
            <source srcset="${filme.imagemdesktop}" media="(max-width: 600px)">
            <img src="${filme.imagemdesktop}" alt="filme thumbnail" class="maior-thumbnail">
          </picture>
          <div class="boxFilme">
            <div class="likeAdd">
              <button aria-label="Add to favorites"><i class="fa fa-heart-o" aria-hidden="true"></i></button>
              <button aria-label="Add to watchlist"><i class="fa fa-plus" aria-hidden="true"></i></button>
            </div>
            <article class="filmeSpecs">
              <h2>${filme.titulo}</h2>
              <div>
                <h3 class="genero">${filme.genero[0]}</h3>
                <h3>${filme.ano}</h3>
              </div>
            </article>
          </div>
        </div>
      `;
    });
  })
  .catch(error => {
    console.error('Error fetching movies:', error);
  });

// MAPA

let map;

// Função que carrega os dados de unidades da PUC Minas
window.onload = () => {
  if (pageId) {
    montarMapa(pageId);
  }
}

function montarMapa(pageId) {
  // Set Mapbox Access Token
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

      // Get the first filming location for map center
      // Note: filming_locations[0].latitude should be [longitude, latitude]
      const firstLocation = filme.filming_locations[0];
      const mapCenter = firstLocation.latitude; // This should be [lng, lat] format

      // Validate coordinates format
      if (!Array.isArray(mapCenter) || mapCenter.length !== 2) {
        console.error('Invalid coordinates format. Expected [longitude, latitude]');
        return;
      }

      // Initialize map
      map = new mapboxgl.Map({
        container: 'map', // Map container ID
        style: 'mapbox://styles/mapbox/streets-v12', // Map style
        center: mapCenter, // [longitude, latitude]
        zoom: 6 // Initial zoom level (reduced to show multiple locations)
      });

      // Add navigation controls
      map.addControl(new mapboxgl.NavigationControl());

      // Create bounds to fit all markers
      const bounds = new mapboxgl.LngLatBounds();

      // Add markers for each filming location
      filme.filming_locations.forEach((location, index) => {
        const coordinates = location.latitude; // Should be [lng, lat]
        
        // Validate coordinates
        if (!Array.isArray(coordinates) || coordinates.length !== 2) {
          console.warn(`Invalid coordinates for location ${index}:`, coordinates);
          return;
        }

        // Create popup
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

        // Create and add marker
        const marker = new mapboxgl.Marker({ 
          color: "#ff0000",
          scale: 0.8
        })
        .setLngLat(coordinates)
        .setPopup(popup)
        .addTo(map);

        // Extend bounds to include this marker
        bounds.extend(coordinates);
      });

      // Fit map to show all markers
      if (filme.filming_locations.length > 1) {
        map.fitBounds(bounds, {
          padding: 50,
          maxZoom: 10
        });
      }

      // Handle map load event
      map.on('load', () => {
        console.log('Map loaded successfully');
      });

      // Handle map errors
      map.on('error', (e) => {
        console.error('Map error:', e.error);
      });

    })
    .catch(error => {
      console.error('Error loading movie data for map:', error);
      
      // Show error message in map container
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