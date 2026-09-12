/**
 * GOOGLE MAPS GEOSPATIAL INTEGRATION - DISDIKPORA KULON PROGO
 * Provides Google Maps roadmap visualization with 12 Kapanewon boundary polygons & highlight effects.
 */

const KAPANAEWON_GEOJSON = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { "id": "samigaluh", "name": "Samigaluh", "zone": "Utara (Menoreh)", "color": "#1e3a8a" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[110.10, -7.60], [110.22, -7.60], [110.20, -7.68], [110.10, -7.68], [110.10, -7.60]]]
      }
    },
    {
      "type": "Feature",
      "properties": { "id": "kalibawang", "name": "Kalibawang", "zone": "Utara (Timur)", "color": "#0284c7" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[110.22, -7.60], [110.28, -7.60], [110.26, -7.68], [110.20, -7.68], [110.22, -7.60]]]
      }
    },
    {
      "type": "Feature",
      "properties": { "id": "girimulyo", "name": "Girimulyo", "zone": "Utara (Menoreh)", "color": "#0369a1" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[110.08, -7.68], [110.18, -7.68], [110.18, -7.75], [110.08, -7.75], [110.08, -7.68]]]
      }
    },
    {
      "type": "Feature",
      "properties": { "id": "nanggulan", "name": "Nanggulan", "zone": "Tengah (Timur)", "color": "#0284c7" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[110.18, -7.68], [110.26, -7.68], [110.26, -7.75], [110.18, -7.75], [110.18, -7.68]]]
      }
    },
    {
      "type": "Feature",
      "properties": { "id": "kokap", "name": "Kokap", "zone": "Barat (Sermo)", "color": "#0f766e" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[110.04, -7.75], [110.14, -7.75], [110.14, -7.82], [110.04, -7.82], [110.04, -7.75]]]
      }
    },
    {
      "type": "Feature",
      "properties": { "id": "pengasih", "name": "Pengasih", "zone": "Tengah (Pusat)", "color": "#d97706" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[110.14, -7.75], [110.20, -7.75], [110.20, -7.82], [110.14, -7.82], [110.14, -7.75]]]
      }
    },
    {
      "type": "Feature",
      "properties": { "id": "sentolo", "name": "Sentolo", "zone": "Tengah (Timur)", "color": "#2563eb" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[110.20, -7.75], [110.28, -7.75], [110.28, -7.84], [110.20, -7.84], [110.20, -7.75]]]
      }
    },
    {
      "type": "Feature",
      "properties": { "id": "temon", "name": "Temon", "zone": "Selatan (YIA)", "color": "#4d7c0f" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[110.02, -7.82], [110.12, -7.82], [110.12, -7.90], [110.02, -7.90], [110.02, -7.82]]]
      }
    },
    {
      "type": "Feature",
      "properties": { "id": "wates", "name": "Wates", "zone": "Tengah (Ibu Kota)", "color": "#b45309" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[110.12, -7.82], [110.18, -7.82], [110.18, -7.90], [110.12, -7.90], [110.12, -7.82]]]
      }
    },
    {
      "type": "Feature",
      "properties": { "id": "panjatan", "name": "Panjatan", "zone": "Selatan (Tengah)", "color": "#15803d" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[110.18, -7.84], [110.24, -7.84], [110.24, -7.92], [110.18, -7.92], [110.18, -7.84]]]
      }
    },
    {
      "type": "Feature",
      "properties": { "id": "lendah", "name": "Lendah", "zone": "Selatan (Timur)", "color": "#6d28d9" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[110.24, -7.84], [110.30, -7.84], [110.30, -7.92], [110.24, -7.92], [110.24, -7.84]]]
      }
    },
    {
      "type": "Feature",
      "properties": { "id": "galur", "name": "Galur", "zone": "Selatan (Ujung)", "color": "#0369a1" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[110.20, -7.90], [110.28, -7.90], [110.28, -7.98], [110.20, -7.98], [110.20, -7.90]]]
      }
    }
  ]
};

window.initGoogleMapComponent = function() {
  const container = document.getElementById("googleMap");
  if (!container) return;

  const kulonProgoCenter = [-7.825, 110.150];

  if (typeof L !== 'undefined') {
    // Clear container if already initialized
    if (container._leaflet_id) {
      container._leaflet_id = null;
      container.innerHTML = "";
    }

    const map = L.map('googleMap', {
      center: kulonProgoCenter,
      zoom: 11,
      zoomControl: true,
      scrollWheelZoom: false
    });

    // Add Google Maps Roadmap Tile Layer
    L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 19,
      attribution: 'Map data &copy; <a href="https://maps.google.com" target="_blank">Google Maps Platform</a>'
    }).addTo(map);

    // Render 12 Kapanewon GeoJSON Polygons with crisp borders & highlights
    const geoJsonLayer = L.geoJSON(KAPANAEWON_GEOJSON, {
      style: function(feature) {
        return {
          fillColor: feature.properties.color || '#2563eb',
          weight: 3, // Crisp highlight border line
          opacity: 1,
          color: '#0f2b48', // Navy Government Border Line
          fillOpacity: 0.45
        };
      },
      onEachFeature: function(feature, layer) {
        const props = feature.properties;
        
        // Popup Info Window
        const popupContent = `
          <div style="font-family: Inter, sans-serif; padding: 4px;">
            <span style="font-size: 10px; font-weight: 800; color: #d97706; text-transform: uppercase;">KAPANAEWON KULON PROGO</span>
            <h4 style="font-size: 14px; font-weight: 900; color: #0f2b48; margin: 2px 0;">${props.name}</h4>
            <p style="font-size: 11px; color: #475569; margin-bottom: 6px;">Zona: <b>${props.zone}</b></p>
            <button onclick="if(window.app) window.app.filterByKapanewon('${props.id}')" style="background: #0f2b48; color: #ffffff; border: none; padding: 5px 12px; font-size: 10px; font-weight: 700; border-radius: 4px; cursor: pointer;">
              🔍 Filter Data ${props.name}
            </button>
          </div>
        `;
        layer.bindPopup(popupContent);

        // Hover Highlight Events
        layer.on({
          mouseover: function(e) {
            const targetLayer = e.target;
            targetLayer.setStyle({
              weight: 5,
              color: '#d97706', // Gold Highlight Line
              fillColor: '#fde047', // Bright Gold Highlight Fill
              fillOpacity: 0.75
            });
            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
              targetLayer.bringToFront();
            }
          },
          mouseout: function(e) {
            geoJsonLayer.resetStyle(e.target);
          },
          click: function(e) {
            map.fitBounds(e.target.getBounds(), { padding: [20, 20] });
            if (window.app && typeof window.app.filterByKapanewon === 'function') {
              window.app.filterByKapanewon(props.id);
            }
          }
        });
      }
    }).addTo(map);
  }
};

document.addEventListener("DOMContentLoaded", function() {
  setTimeout(() => {
    if (typeof window.initGoogleMapComponent === 'function') {
      window.initGoogleMapComponent();
    }
  }, 300);
});
