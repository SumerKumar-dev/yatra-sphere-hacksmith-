/**
 * Yatra Sphere — Travel Tools (Interactive Map, Weather Info, Stay Finder, Transport Planner)
 * Pure Vanilla JavaScript (ES6+) with browser fetch() for OpenStreetMap/OSRM & Open-Meteo APIs.
 * Illustrative stays and transit cost/time estimates are clearly labeled as demo data.
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  if (!document.body.classList.contains('page-tools')) return;

  const CATALOG = Array.isArray(window.YATRA_DESTINATIONS) ? window.YATRA_DESTINATIONS : [];

  // =========================================================================
  // 1. Geographic Coordinates & Regional Hub Metadata (All 16 Destinations + Origins)
  // =========================================================================
  const ORIGINS_GEO = {
    'New Delhi': { lat: 28.6139, lng: 77.209, airport: 'DEL (Delhi)', rail: 'New Delhi (NDLS)' },
    Mumbai: { lat: 19.076, lng: 72.8777, airport: 'BOM (Mumbai)', rail: 'Mumbai CSMT / LTT' },
    Bengaluru: { lat: 12.9716, lng: 77.5946, airport: 'BLR (Bengaluru)', rail: 'KSR Bengaluru (SBC)' },
    Chennai: { lat: 13.0827, lng: 80.2707, airport: 'MAA (Chennai)', rail: 'Chennai Central (MAS)' },
    Kolkata: { lat: 22.5726, lng: 88.3639, airport: 'CCU (Kolkata)', rail: 'Howrah / Sealdah' },
    Hyderabad: { lat: 17.385, lng: 78.4867, airport: 'HYD (Hyderabad)', rail: 'Secunderabad (SC)' },
    Pune: { lat: 18.5204, lng: 73.8567, airport: 'PNQ (Pune)', rail: 'Pune Jn (PUNE)' },
    Ahmedabad: { lat: 23.0225, lng: 72.5714, airport: 'AMD (Ahmedabad)', rail: 'Ahmedabad (ADI)' },
    Guwahati: { lat: 26.1445, lng: 91.7362, airport: 'GAU (Guwahati)', rail: 'Guwahati (GHY)' }
  };

  const DEST_GEO = {
    manali: {
      lat: 32.2432,
      lng: 77.1892,
      airport: 'Bhuntar (KUU · ~50 km)',
      rail: 'Chandigarh / Joginder Nagar + hill road',
      hillTerrain: true,
      spots: [
        { name: 'Hadimba Devi Temple', lat: 32.2484, lng: 77.1806, kind: 'Attraction' },
        { name: 'Solang Valley', lat: 32.3156, lng: 77.1578, kind: 'Attraction' },
        { name: 'Atal Tunnel South Portal', lat: 32.3642, lng: 77.133, kind: 'Nearby' },
        { name: 'Naggar Castle', lat: 32.1135, lng: 77.167, kind: 'Nearby' }
      ]
    },
    goa: {
      lat: 15.2993,
      lng: 74.124,
      airport: 'Dabolim (GOI) / Mopa (GOX)',
      rail: 'Madgaon (MAO) / Thivim',
      spots: [
        { name: 'Fontainhas Latin Quarter', lat: 15.4979, lng: 73.8303, kind: 'Attraction' },
        { name: 'Palolem Beach', lat: 15.01, lng: 74.0232, kind: 'Attraction' },
        { name: 'Basilica of Bom Jesus', lat: 15.5009, lng: 73.9116, kind: 'Attraction' },
        { name: 'Dudhsagar Waterfalls', lat: 15.3144, lng: 74.3143, kind: 'Nearby' }
      ]
    },
    jaipur: {
      lat: 26.9124,
      lng: 75.7873,
      airport: 'Jaipur (JAI)',
      rail: 'Jaipur Jn (JP)',
      spots: [
        { name: 'Amber Fort & Maota Lake', lat: 26.9855, lng: 75.8513, kind: 'Attraction' },
        { name: 'Hawa Mahal', lat: 26.9239, lng: 75.8267, kind: 'Attraction' },
        { name: 'Jantar Mantar', lat: 26.9248, lng: 75.8246, kind: 'Attraction' },
        { name: 'Abhaneri Stepwell', lat: 27.0073, lng: 76.6063, kind: 'Nearby' }
      ]
    },
    kashmir: {
      lat: 34.0837,
      lng: 74.7973,
      airport: 'Srinagar (SXR)',
      rail: 'Jammu Tawi / Katra + highway',
      hillTerrain: true,
      spots: [
        { name: 'Dal Lake Shikara Ghat', lat: 34.0937, lng: 74.864, kind: 'Attraction' },
        { name: 'Gulmarg Gondola Base', lat: 34.0484, lng: 74.3805, kind: 'Attraction' },
        { name: 'Pahalgam Betaab Valley', lat: 34.0161, lng: 75.315, kind: 'Nearby' },
        { name: 'Sonamarg Meadow', lat: 34.2996, lng: 75.2932, kind: 'Nearby' }
      ]
    },
    kerala: {
      lat: 9.4981,
      lng: 76.3388,
      airport: 'Kochi (COK)',
      rail: 'Alappuzha / Ernakulam',
      spots: [
        { name: 'Alleppey Backwaters', lat: 9.4981, lng: 76.3388, kind: 'Attraction' },
        { name: 'Fort Kochi Waterfront', lat: 9.9658, lng: 76.2421, kind: 'Attraction' },
        { name: 'Munnar Tea Estates', lat: 10.0889, lng: 77.0595, kind: 'Nearby' },
        { name: 'Kumarakom Sanctuary', lat: 9.6175, lng: 76.4301, kind: 'Nearby' }
      ]
    },
    meghalaya: {
      lat: 25.5788,
      lng: 91.8933,
      airport: 'Shillong (SHL) / Guwahati (GAU)',
      rail: 'Guwahati (GHY) + hill road',
      hillTerrain: true,
      spots: [
        { name: 'Ward’s Lake, Shillong', lat: 25.5747, lng: 91.8861, kind: 'Attraction' },
        { name: 'Nohkalikai Falls, Sohra', lat: 25.276, lng: 91.6869, kind: 'Attraction' },
        { name: 'Nongriat Root Bridge', lat: 25.2512, lng: 91.6716, kind: 'Nearby' },
        { name: 'Dawki Umngot River', lat: 25.1846, lng: 92.0176, kind: 'Nearby' }
      ]
    },
    varanasi: {
      lat: 25.3176,
      lng: 82.9739,
      airport: 'Varanasi (VNS)',
      rail: 'Varanasi Jn (BSB)',
      spots: [
        { name: 'Dashashwamedh Ghat', lat: 25.3069, lng: 83.0104, kind: 'Attraction' },
        { name: 'Assi Ghat', lat: 25.2896, lng: 83.0067, kind: 'Attraction' },
        { name: 'Sarnath Archaeological Site', lat: 25.3762, lng: 83.0227, kind: 'Nearby' }
      ]
    },
    rishikesh: {
      lat: 30.0869,
      lng: 78.2676,
      airport: 'Dehradun Jolly Grant (DED)',
      rail: 'Yog Nagari Rishikesh / Haridwar',
      spots: [
        { name: 'Lakshman Jhula Zone', lat: 30.1257, lng: 78.3292, kind: 'Attraction' },
        { name: 'Triveni Ghat', lat: 30.1033, lng: 78.2948, kind: 'Attraction' },
        { name: 'Devprayag Confluence', lat: 30.1459, lng: 78.5993, kind: 'Nearby' }
      ]
    },
    ladakh: {
      lat: 34.1526,
      lng: 77.5771,
      airport: 'Leh Kushok Bakula (IXL)',
      rail: 'No direct rail (via Jammu/Chandigarh road)',
      hillTerrain: true,
      noDirectRail: true,
      spots: [
        { name: 'Leh Palace & Shanti Stupa', lat: 34.165, lng: 77.5747, kind: 'Attraction' },
        { name: 'Pangong Tso Lake', lat: 33.7595, lng: 78.6674, kind: 'Nearby' },
        { name: 'Nubra Valley (Hunder)', lat: 34.5818, lng: 77.4847, kind: 'Nearby' }
      ]
    },
    hampi: {
      lat: 15.335,
      lng: 76.46,
      airport: 'Jindal Vijayanagar (VDY) / Hubli',
      rail: 'Hosapete Jn (HPT · 13 km)',
      spots: [
        { name: 'Virupaksha Temple', lat: 15.335, lng: 76.4586, kind: 'Attraction' },
        { name: 'Vittala Stone Chariot', lat: 15.3422, lng: 76.4754, kind: 'Attraction' },
        { name: 'Anegundi Heritage Village', lat: 15.3519, lng: 76.4914, kind: 'Nearby' }
      ]
    },
    andaman: {
      lat: 11.6234,
      lng: 92.7265,
      airport: 'Port Blair (IXZ)',
      rail: 'Sea-separated islands (Flight / Vessel only)',
      isIsland: true,
      spots: [
        { name: 'Cellular Jail, Port Blair', lat: 11.674, lng: 92.748, kind: 'Attraction' },
        { name: 'Radhanagar Beach (Havelock)', lat: 11.9845, lng: 92.9508, kind: 'Nearby' },
        { name: 'Neil Island Natural Bridge', lat: 11.838, lng: 93.0462, kind: 'Nearby' }
      ]
    },
    amritsar: {
      lat: 31.634,
      lng: 74.8723,
      airport: 'Amritsar (ATQ)',
      rail: 'Amritsar Jn (ASR)',
      spots: [
        { name: 'Sri Harmandir Sahib', lat: 31.62, lng: 74.8765, kind: 'Attraction' },
        { name: 'Jallianwala Bagh', lat: 31.6207, lng: 74.8801, kind: 'Attraction' },
        { name: 'Attari-Wagah Border', lat: 31.6047, lng: 74.5724, kind: 'Nearby' }
      ]
    },
    'jim-corbett': {
      lat: 29.53,
      lng: 78.7747,
      airport: 'Pantnagar (PGH · ~80 km)',
      rail: 'Ramnagar (RMR · ~15 km)',
      spots: [
        { name: 'Bijrani Safari Gate', lat: 29.4397, lng: 79.109, kind: 'Attraction' },
        { name: 'Garjiya Devi Temple', lat: 29.4864, lng: 79.1463, kind: 'Attraction' },
        { name: 'Nainital Lake', lat: 29.3803, lng: 79.4636, kind: 'Nearby' }
      ]
    },
    kaziranga: {
      lat: 26.5775,
      lng: 93.1711,
      airport: 'Jorhat (JRH) / Guwahati (GAU)',
      rail: 'Furkating / Guwahati + highway',
      spots: [
        { name: 'Kohora Central Range', lat: 26.591, lng: 93.4103, kind: 'Attraction' },
        { name: 'Bagori Western Range', lat: 26.5746, lng: 93.2994, kind: 'Attraction' },
        { name: 'Kakochang Waterfall', lat: 26.6126, lng: 93.4956, kind: 'Nearby' }
      ]
    },
    udaipur: {
      lat: 24.5854,
      lng: 73.7125,
      airport: 'Udaipur Maharana Pratap (UDR)',
      rail: 'Udaipur City (UDZ)',
      spots: [
        { name: 'City Palace & Lake Pichola', lat: 24.5764, lng: 73.6835, kind: 'Attraction' },
        { name: 'Sajjangarh Monsoon Palace', lat: 24.5936, lng: 73.6391, kind: 'Attraction' },
        { name: 'Kumbhalgarh Fort', lat: 25.1494, lng: 73.5868, kind: 'Nearby' }
      ]
    },
    coorg: {
      lat: 12.4244,
      lng: 75.7382,
      airport: 'Kannur (CNN) / Mysuru (MYQ)',
      rail: 'Mysuru Jn (MYS · ~115 km)',
      hillTerrain: true,
      spots: [
        { name: 'Madikeri Raja’s Seat', lat: 12.4163, lng: 75.7366, kind: 'Attraction' },
        { name: 'Abbey Falls', lat: 12.4567, lng: 75.7166, kind: 'Attraction' },
        { name: 'Dubare Elephant Camp', lat: 12.3712, lng: 75.9016, kind: 'Nearby' }
      ]
    }
  };

  // =========================================================================
  // 2. Illustrative Sample Stays Directory (48 Curated Demo Properties)
  // =========================================================================
  const STAY_TEMPLATES = [
    {
      suffix: 'Cedar Ridge Homestay',
      type: 'Homestay',
      priceFactor: 0.58,
      amenities: ['Wi-Fi', 'Breakfast', 'Scenic View', 'Family Friendly'],
      neighborhood: 'Quiet Village Quarter',
      note: 'Warm family-hosted rooms with home-cooked regional breakfast and valley overlook.'
    },
    {
      suffix: 'Horizon Boutique Hotel',
      type: 'Hotel',
      priceFactor: 0.92,
      amenities: ['Wi-Fi', 'Breakfast', 'Parking', 'Family Friendly'],
      neighborhood: 'Central Promenade',
      note: 'Walkable central rooms with 24-hour desk support and reliable transit access.'
    },
    {
      suffix: 'Nomad Base Hostel',
      type: 'Hostel',
      priceFactor: 0.28,
      amenities: ['Wi-Fi', 'Scenic View'],
      neighborhood: 'Old Town Cafe Lane',
      note: 'Clean social dorms and private pods tailored for solo travelers and backpackers.'
    },
    {
      suffix: 'Sanctuary Retreat & Resort',
      type: 'Resort',
      priceFactor: 1.65,
      amenities: ['Wi-Fi', 'Breakfast', 'Scenic View', 'Parking', 'Family Friendly'],
      neighborhood: 'Scenic Outskirts (3.5 km)',
      note: 'Spacious landscaped grounds ideal for unhurried family or leisure stays.'
    }
  ];

  const SPECIAL_STAYS = {
    jaipur: {
      name: 'Maota Courtyard Heritage Haveli',
      type: 'Heritage Stay',
      price: 4800,
      location: 'Old Walled City · 1.2 km from Hawa Mahal',
      amenities: ['Wi-Fi', 'Breakfast', 'Scenic View', 'Family Friendly'],
      note: 'Restored sandstone courtyard haveli with rooftop fort views.'
    },
    udaipur: {
      name: 'Pichola Ghat Heritage Haveli',
      type: 'Heritage Stay',
      price: 5400,
      location: 'Lal Ghat Waterfront · Walkable to City Palace',
      amenities: ['Wi-Fi', 'Breakfast', 'Scenic View', 'Family Friendly'],
      note: 'Lakeside jharokha balconies overlooking evening palace reflections.'
    },
    kerala: {
      name: 'Vembanad Wooden Kettuvallam Stay',
      type: 'Heritage Stay',
      price: 6800,
      location: 'Alleppey Finishing Point Jetty',
      amenities: ['Breakfast', 'Scenic View', 'Family Friendly'],
      note: 'Traditional eco-wooden backwater houseboat with freshly prepared Kerala meals.'
    },
    kashmir: {
      name: 'Nigeen Cedar Houseboat',
      type: 'Heritage Stay',
      price: 5600,
      location: 'Nigeen Lake Shore · Srinagar',
      amenities: ['Wi-Fi', 'Breakfast', 'Scenic View', 'Family Friendly'],
      note: 'Hand-carved walnut wood houseboat moored on tranquil Nigeen waters.'
    },
    goa: {
      name: 'Palolem Palm Cove Cottages',
      type: 'Resort',
      price: 4100,
      location: 'South Palolem Shore · 150 m to beach',
      amenities: ['Wi-Fi', 'Breakfast', 'Scenic View', 'Parking'],
      note: 'Timber garden cottages tucked under coconut palms near calm cove waters.'
    },
    andaman: {
      name: 'Swaraj Dweep Lagoon Eco Villas',
      type: 'Resort',
      price: 6400,
      location: 'Govind Nagar Coast, Havelock Island',
      amenities: ['Breakfast', 'Scenic View', 'Family Friendly'],
      note: 'Airy island cottages minutes from Radhanagar shoreline and dive jetties.'
    }
  };

  function buildStayCatalog() {
    const stays = [];
    CATALOG.forEach((dest) => {
      const baseNightly = Math.round(dest.estimatedBudget / 4.2 / 100) * 100;

      if (SPECIAL_STAYS[dest.id]) {
        const s = SPECIAL_STAYS[dest.id];
        stays.push({
          id: `stay_${dest.id}_special`,
          destId: dest.id,
          destName: dest.name,
          stateRegion: dest.stateRegion,
          name: s.name,
          type: s.type,
          pricePerNight: s.price,
          location: s.location,
          amenities: s.amenities,
          note: s.note
        });
      }

      STAY_TEMPLATES.forEach((tpl, idx) => {
        if (SPECIAL_STAYS[dest.id] && idx === 3) return; // keep ~4 per destination
        const nightly = Math.max(850, Math.round((baseNightly * tpl.priceFactor) / 100) * 100);
        stays.push({
          id: `stay_${dest.id}_${idx}`,
          destId: dest.id,
          destName: dest.name,
          stateRegion: dest.stateRegion,
          name: `${dest.name} ${tpl.suffix}`,
          type: tpl.type,
          pricePerNight: nightly,
          location: `${tpl.neighborhood} · ${dest.stateRegion}`,
          amenities: tpl.amenities,
          note: tpl.note
        });
      });
    });
    return stays;
  }

  const ALL_STAYS = buildStayCatalog();

  // =========================================================================
  // 3. Shared DOM & State
  // =========================================================================
  const originSelect = document.getElementById('tools-origin-select');
  const destSelect = document.getElementById('tools-destination-select');
  const openPlannerLink = document.getElementById('tools-open-planner-link');
  const tabBtns = document.querySelectorAll('[data-tools-tab]');
  const panels = {
    map: document.getElementById('tools-panel-map'),
    weather: document.getElementById('tools-panel-weather'),
    stays: document.getElementById('tools-panel-stays'),
    transport: document.getElementById('tools-panel-transport')
  };

  const state = {
    activeTab: 'map',
    origin: 'New Delhi',
    destId: CATALOG[0] ? CATALOG[0].id : 'manali',
    mapInstance: null,
    mapLayers: {
      destMarkers: [],
      spotMarkers: [],
      routeLine: null,
      originMarker: null
    },
    weatherCache: {}
  };

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatINR(amount) {
    return '₹' + Math.round(Number(amount) || 0).toLocaleString('en-IN');
  }

  function haversineKm(lat1, lng1, lat2, lng2) {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  function getSelectedDest() {
    return CATALOG.find((d) => d.id === state.destId) || CATALOG[0];
  }

  function populateDestinationsSelect() {
    if (!destSelect) return;
    destSelect.innerHTML = CATALOG.map(
      (d) => `<option value="${escapeHtml(d.id)}">${escapeHtml(d.name)} (${escapeHtml(d.stateRegion)})</option>`
    ).join('');
  }

  function syncPlannerHref() {
    const dest = getSelectedDest();
    if (openPlannerLink && dest) {
      openPlannerLink.href = `planner.html?dest=${encodeURIComponent(dest.name)}`;
    }
  }

  function syncUrlParams() {
    if (window.location.protocol === 'file:') return;
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', state.activeTab);
      url.searchParams.set('dest', state.destId);
      window.history.replaceState({}, '', url.toString());
    } catch (_err) {
      // Ignore URL update errors
    }
  }

  function switchToolsTab(tabName) {
    if (!panels[tabName]) tabName = 'map';
    state.activeTab = tabName;

    tabBtns.forEach((btn) => {
      const active = btn.dataset.toolsTab === tabName;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', String(active));
    });

    Object.keys(panels).forEach((key) => {
      if (panels[key]) panels[key].hidden = key !== tabName;
    });

    if (tabName === 'map' && state.mapInstance) {
      setTimeout(() => state.mapInstance.invalidateSize(), 60);
    }
    if (tabName === 'weather') {
      const dest = getSelectedDest();
      if (dest) {
        if (weatherCityInput) weatherCityInput.value = dest.name;
        if (state.weatherCache[dest.id]) {
          if (weatherStatusBanner) weatherStatusBanner.hidden = true;
          renderWeatherData(dest.name, dest.stateRegion, state.weatherCache[dest.id], dest);
        } else {
          fetchWeatherForDestination(dest);
        }
      }
    }
    syncUrlParams();
  }

  // =========================================================================
  // 4. MODULE A: INTERACTIVE TRAVEL MAP (Leaflet + OpenStreetMap + OSRM)
  // =========================================================================
  const mapEl = document.getElementById('yatra-leaflet-map');
  const mapFallbackBox = document.getElementById('map-fallback-box');
  const mapRouteStatus = document.getElementById('map-route-status');
  const mapRouteSummary = document.getElementById('map-route-summary');
  const mapSpotsList = document.getElementById('map-spots-list');
  const mapFitAllBtn = document.getElementById('map-fit-all-btn');
  const mapFitRouteBtn = document.getElementById('map-fit-route-btn');

  function initLeafletMap() {
    if (!mapEl) return;

    if (typeof window.L === 'undefined') {
      mapEl.hidden = true;
      if (mapFallbackBox) {
        mapFallbackBox.hidden = false;
        mapFallbackBox.innerHTML = `
          <h3>Interactive Map Tiles Unavailable Offline</h3>
          <p>Leaflet / OpenStreetMap tiles could not load in this browser session. You can still inspect coordinates, nearby attractions, and distance corridors in the side panel.</p>
        `;
      }
      updateMapSidePanel(null);
      return;
    }

    const L = window.L;
    state.mapInstance = L.map(mapEl, {
      center: [22.9734, 78.6569],
      zoom: 5,
      scrollWheelZoom: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(state.mapInstance);

    renderMapAllDestinations();
    updateActiveMapDestinationAndRoute();
  }

  function renderMapAllDestinations() {
    if (!state.mapInstance || typeof window.L === 'undefined') return;
    const L = window.L;

    state.mapLayers.destMarkers.forEach((m) => m.remove());
    state.mapLayers.destMarkers = [];

    CATALOG.forEach((dest) => {
      const geo = DEST_GEO[dest.id];
      if (!geo) return;
      const isSelected = dest.id === state.destId;

      const marker = L.circleMarker([geo.lat, geo.lng], {
        radius: isSelected ? 10 : 7,
        fillColor: isSelected ? '#0d7377' : '#081b2e',
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.95
      }).addTo(state.mapInstance);

      marker.bindPopup(`
        <div class="leaflet-yatra-popup">
          <strong>${escapeHtml(dest.name)}</strong><br/>
          <span>${escapeHtml(dest.stateRegion)} &middot; ${escapeHtml(dest.category)}</span><br/>
          <span>Est. ${escapeHtml(dest.budgetLabel)} &middot; ${escapeHtml(dest.bestTimeToVisit)}</span>
        </div>
      `);

      marker.on('click', () => {
        if (state.destId !== dest.id) {
          selectDestination(dest.id, false);
        }
      });

      state.mapLayers.destMarkers.push({ id: dest.id, marker, geo });
    });
  }

  function clearRouteAndSpotLayers() {
    state.mapLayers.spotMarkers.forEach((item) => item.marker.remove());
    state.mapLayers.spotMarkers = [];
    if (state.mapLayers.routeLine) {
      state.mapLayers.routeLine.remove();
      state.mapLayers.routeLine = null;
    }
    if (state.mapLayers.originMarker) {
      state.mapLayers.originMarker.remove();
      state.mapLayers.originMarker = null;
    }
  }

  function updateMapSidePanel(routeData) {
    const dest = getSelectedDest();
    const geo = DEST_GEO[dest.id];
    const originGeo = ORIGINS_GEO[state.origin];
    if (!dest || !geo || !originGeo) return;

    const directKm = Math.round(haversineKm(originGeo.lat, originGeo.lng, geo.lat, geo.lng));

    if (mapRouteSummary) {
      let routeLineHtml = `<p class="route-metric-line">Direct Corridor: <strong>~${directKm.toLocaleString('en-IN')} km</strong></p>`;
      if (routeData && routeData.type === 'osrm') {
        routeLineHtml = `
          <p class="route-metric-line">Road Distance (OSRM): <strong>~${routeData.distanceKm.toLocaleString('en-IN')} km</strong></p>
          <p class="route-metric-line">Est. Continuous Drive: <strong>~${routeData.durationText}</strong> (excl. breaks)</p>
        `;
      } else if (geo.isIsland) {
        routeLineHtml = `
          <p class="route-metric-line">Sea / Air Corridor: <strong>~${directKm.toLocaleString('en-IN')} km</strong></p>
          <p class="route-metric-line">Transit Note: <strong>Flight or passenger vessel required</strong></p>
        `;
      }

      mapRouteSummary.innerHTML = `
        <p class="map-route-kicker">${escapeHtml(state.origin)} &rarr; ${escapeHtml(dest.name)}</p>
        <h3 class="map-route-title">${escapeHtml(dest.name)}, ${escapeHtml(dest.stateRegion)}</h3>
        ${routeLineHtml}
        <p class="map-route-hubs">
          <strong>Nearest Airport:</strong> ${escapeHtml(geo.airport)}<br/>
          <strong>Rail Access:</strong> ${escapeHtml(geo.rail)}
        </p>
      `;
    }

    if (mapSpotsList) {
      const spotsHtml = (geo.spots || [])
        .map(
          (spot, idx) => `
          <button type="button" class="map-spot-btn" data-focus-spot="${idx}">
            <span class="map-spot-kind">${escapeHtml(spot.kind)}</span>
            <span class="map-spot-name">${escapeHtml(spot.name)}</span>
            <span class="map-spot-coords">${spot.lat.toFixed(2)}°N, ${spot.lng.toFixed(2)}°E</span>
          </button>
        `
        )
        .join('');
      mapSpotsList.innerHTML = spotsHtml;
    }
  }

  async function updateActiveMapDestinationAndRoute() {
    const dest = getSelectedDest();
    const geo = DEST_GEO[dest.id];
    const originGeo = ORIGINS_GEO[state.origin];
    if (!dest || !geo || !originGeo) return;

    renderMapAllDestinations();
    clearRouteAndSpotLayers();
    updateMapSidePanel(null);

    if (!state.mapInstance || typeof window.L === 'undefined') return;
    const L = window.L;

    // Origin marker
    state.mapLayers.originMarker = L.circleMarker([originGeo.lat, originGeo.lng], {
      radius: 7,
      fillColor: '#163a5f',
      color: '#ffffff',
      weight: 2,
      fillOpacity: 0.95
    })
      .addTo(state.mapInstance)
      .bindPopup(`<strong>Origin: ${escapeHtml(state.origin)}</strong>`);

    // Attraction & nearby spot markers
    (geo.spots || []).forEach((spot) => {
      const m = L.circleMarker([spot.lat, spot.lng], {
        radius: 6,
        fillColor: '#059669',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 0.95
      })
        .addTo(state.mapInstance)
        .bindPopup(`<strong>${escapeHtml(spot.name)}</strong><br/><span>${escapeHtml(spot.kind)} near ${escapeHtml(dest.name)}</span>`);

      state.mapLayers.spotMarkers.push({ spot, marker: m });
    });

    // Focus destination & nearby attractions cleanly
    const spotCoords = (geo.spots || []).map((s) => [s.lat, s.lng]);
    const destBounds = L.latLngBounds([[geo.lat, geo.lng], ...spotCoords]);
    state.mapInstance.fitBounds(destBounds.pad(0.28), { maxZoom: 11 });

    // Sea-separated destination (Andaman)
    if (geo.isIsland) {
      if (mapRouteStatus) {
        mapRouteStatus.textContent = 'Direct sea/air corridor shown (no overland road route)';
      }
      state.mapLayers.routeLine = L.polyline(
        [
          [originGeo.lat, originGeo.lng],
          [geo.lat, geo.lng]
        ],
        { color: '#0d7377', weight: 2.5, dashArray: '6 8', opacity: 0.8 }
      ).addTo(state.mapInstance);
      updateMapSidePanel({ type: 'corridor' });
      return;
    }

    // Fetch real road route geometry from public OSRM API
    if (mapRouteStatus) {
      mapRouteStatus.textContent = 'Fetching OpenStreetMap road route...';
    }

    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${originGeo.lng},${originGeo.lat};${geo.lng},${geo.lat}?overview=simplified&geometries=geojson`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordsLatLng = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        if (state.mapLayers.routeLine) state.mapLayers.routeLine.remove();
        state.mapLayers.routeLine = L.polyline(coordsLatLng, {
          color: '#0d7377',
          weight: 3.5,
          opacity: 0.85
        }).addTo(state.mapInstance);

        const distanceKm = Math.round(route.distance / 1000);
        const totalMins = Math.round(route.duration / 60);
        const hrs = Math.floor(totalMins / 60);
        const mins = totalMins % 60;
        const durationText = `${hrs}h ${mins}m`;

        if (mapRouteStatus) {
          mapRouteStatus.textContent = `OSRM Road Route: ~${distanceKm.toLocaleString('en-IN')} km (${durationText})`;
        }
        updateMapSidePanel({ type: 'osrm', distanceKm, durationText });
        return;
      }
      throw new Error('No OSRM route returned');
    } catch (_err) {
      // Graceful fallback to direct corridor line
      if (state.mapLayers.routeLine) state.mapLayers.routeLine.remove();
      state.mapLayers.routeLine = L.polyline(
        [
          [originGeo.lat, originGeo.lng],
          [geo.lat, geo.lng]
        ],
        { color: '#0d7377', weight: 2.5, dashArray: '6 6', opacity: 0.75 }
      ).addTo(state.mapInstance);

      if (mapRouteStatus) {
        mapRouteStatus.textContent = 'Indicative direct corridor shown (live OSRM routing unavailable)';
      }
    }
  }

  if (mapSpotsList) {
    mapSpotsList.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-focus-spot]');
      if (!btn || !state.mapInstance) return;
      const idx = Number(btn.dataset.focusSpot);
      const item = state.mapLayers.spotMarkers[idx];
      if (item) {
        state.mapInstance.setView([item.spot.lat, item.spot.lng], 12, { animate: true });
        item.marker.openPopup();
      }
    });
  }

  if (mapFitAllBtn) {
    mapFitAllBtn.addEventListener('click', () => {
      if (!state.mapInstance || typeof window.L === 'undefined') return;
      const coords = Object.values(DEST_GEO).map((g) => [g.lat, g.lng]);
      state.mapInstance.fitBounds(window.L.latLngBounds(coords).pad(0.1));
    });
  }

  if (mapFitRouteBtn) {
    mapFitRouteBtn.addEventListener('click', () => {
      if (!state.mapInstance || typeof window.L === 'undefined') return;
      const destGeo = DEST_GEO[state.destId];
      const originGeo = ORIGINS_GEO[state.origin];
      if (destGeo && originGeo) {
        state.mapInstance.fitBounds(
          window.L.latLngBounds([
            [originGeo.lat, originGeo.lng],
            [destGeo.lat, destGeo.lng]
          ]).pad(0.18)
        );
      }
    });
  }

  // =========================================================================
  // 5. MODULE B: WEATHER INFORMATION (Open-Meteo Live Fetch + Suggestions)
  // =========================================================================
  const weatherForm = document.getElementById('weather-search-form');
  const weatherCityInput = document.getElementById('weather-city-input');
  const weatherSyncDestBtn = document.getElementById('weather-sync-dest-btn');
  const weatherStatusBanner = document.getElementById('weather-status-banner');
  const weatherContentArea = document.getElementById('weather-content-area');

  function describeWmoCode(code) {
    if (code === 0) return { label: 'Clear Sky', icon: 'sun' };
    if (code === 1 || code === 2) return { label: 'Mostly Clear', icon: 'partly' };
    if (code === 3) return { label: 'Overcast', icon: 'cloud' };
    if (code === 45 || code === 48) return { label: 'Mist / Fog', icon: 'cloud' };
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return { label: 'Rain / Showers', icon: 'rain' };
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { label: 'Snowfall', icon: 'snow' };
    if (code >= 95) return { label: 'Thunderstorms', icon: 'storm' };
    return { label: 'Variable Conditions', icon: 'partly' };
  }

  function getWeatherIconSvg(iconType) {
    if (iconType === 'sun') {
      return '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
    }
    if (iconType === 'rain' || iconType === 'storm') {
      return '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 13v8"/><path d="M8 13v8"/><path d="M12 15v8"/><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/></svg>';
    }
    if (iconType === 'snow') {
      return '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"/><line x1="8" y1="16" x2="8.01" y2="16"/><line x1="8" y1="20" x2="8.01" y2="20"/><line x1="12" y1="18" x2="12.01" y2="18"/><line x1="12" y1="22" x2="12.01" y2="22"/><line x1="16" y1="16" x2="16.01" y2="16"/><line x1="16" y1="20" x2="16.01" y2="20"/></svg>';
    }
    return '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>';
  }

  function buildWeatherTravelSuggestions(tempC, maxRainProb, code, label) {
    const tips = [];
    if (maxRainProb >= 55 || (code >= 51 && code <= 82) || code >= 95) {
      tips.push('High rain probability: keep waterproof footwear, a breathable rain shell, and dry electronics pouches ready.');
      tips.push('Plan flexible indoor stops (museums, heritage courtyards, regional cafes) during afternoon showers.');
    } else {
      tips.push('Low rain risk expected: morning and late-afternoon outdoor sightseeing windows look favorable.');
    }

    if (tempC <= 10) {
      tips.push('Chilly temperatures: pack thermal base layers, a windproof jacket, and warm socks—especially for dawn viewpoints.');
    } else if (tempC >= 32) {
      tips.push('Warm daytime heat: schedule outdoor forts or trails between 6:30 AM and 10:30 AM, and carry hydration salts.');
    } else {
      tips.push(`Pleasant ${Math.round(tempC)}°C conditions in ${label}: breathable cotton layers plus a light evening pullover work well.`);
    }
    return tips;
  }

  function renderWeatherData(placeLabel, regionLabel, data, matchingCatalogDest) {
    if (!weatherContentArea) return;
    const current = data.current || {};
    const daily = data.daily || {};

    const tempC = Number(current.temperature_2m);
    const feelsC = Number(current.apparent_temperature);
    const humidity = Number(current.relative_humidity_2m);
    const wind = Number(current.wind_speed_10m);
    const currentPrecip = Number(current.precipitation || 0);
    const wmo = describeWmoCode(Number(current.weather_code));

    const maxRainProb = Array.isArray(daily.precipitation_probability_max)
      ? Math.max(...daily.precipitation_probability_max.slice(0, 3).map((n) => Number(n) || 0))
      : 0;

    const suggestions = buildWeatherTravelSuggestions(tempC, maxRainProb, Number(current.weather_code), placeLabel);

    const daysHtml = (daily.time || [])
      .slice(0, 7)
      .map((dateStr, idx) => {
        const d = new Date(dateStr + 'T00:00:00');
        const dayName = idx === 0 ? 'Today' : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
        const dayWmo = describeWmoCode(Number((daily.weather_code || [])[idx]));
        const tMax = Math.round(Number((daily.temperature_2m_max || [])[idx]));
        const tMin = Math.round(Number((daily.temperature_2m_min || [])[idx]));
        const rainProb = Math.round(Number((daily.precipitation_probability_max || [])[idx] || 0));
        const rainMm = Number((daily.precipitation_sum || [])[idx] || 0).toFixed(1);

        return `
          <article class="weather-day-card">
            <p class="weather-day-name">${escapeHtml(dayName)}</p>
            <div class="weather-day-icon">${getWeatherIconSvg(dayWmo.icon)}</div>
            <p class="weather-day-cond">${escapeHtml(dayWmo.label)}</p>
            <p class="weather-day-temps"><strong>${tMax}°</strong> / <span>${tMin}°C</span></p>
            <p class="weather-day-rain">Rain: ${rainProb}% (${rainMm} mm)</p>
          </article>
        `;
      })
      .join('');

    weatherContentArea.innerHTML = `
      <div class="weather-overview-grid">
        <article class="weather-current-card">
          <div class="weather-current-top">
            <div>
              <p class="weather-source-kicker">Live Open-Meteo Forecast &middot; ${escapeHtml(regionLabel)}</p>
              <h3 class="weather-city-title">${escapeHtml(placeLabel)}</h3>
              <p class="weather-condition-text">${escapeHtml(wmo.label)}</p>
            </div>
            <div class="weather-temp-display">
              <div class="weather-main-icon">${getWeatherIconSvg(wmo.icon)}</div>
              <span class="weather-temp-value">${Math.round(tempC)}°C</span>
            </div>
          </div>

          <div class="weather-metrics-strip">
            <div><span>Feels Like</span><strong>${Math.round(feelsC)}°C</strong></div>
            <div><span>Humidity</span><strong>${Math.round(humidity)}%</strong></div>
            <div><span>Wind</span><strong>${Math.round(wind)} km/h</strong></div>
            <div><span>Current Rain</span><strong>${currentPrecip.toFixed(1)} mm</strong></div>
          </div>
        </article>

        <article class="weather-advice-card">
          <p class="weather-source-kicker">Weather-Based Travel Suggestions</p>
          <h3 class="weather-advice-title">Packing &amp; Pacing Guidance</h3>
          <ul class="weather-advice-list">
            ${suggestions.map((tip) => `<li>${escapeHtml(tip)}</li>`).join('')}
          </ul>
          ${
            matchingCatalogDest
              ? `<p class="weather-seasonal-note"><strong>Seasonal Context (${escapeHtml(matchingCatalogDest.bestTimeToVisit)}):</strong> ${escapeHtml(matchingCatalogDest.seasonalNote)}</p>`
              : ''
          }
        </article>
      </div>

      <div class="weather-weekly-section">
        <h3 class="weather-weekly-heading">7-Day Forecast &amp; Rain Outlook</h3>
        <div class="weather-weekly-grid">
          ${daysHtml}
        </div>
      </div>
    `;
  }

  function renderWeatherOfflineFallback(placeLabel, matchingDest, errorMessage) {
    if (!weatherContentArea) return;
    weatherContentArea.innerHTML = `
      <div class="demo-mode-banner tools-demo-notice" role="alert">
        <strong>Live Weather API Unavailable:</strong> ${escapeHtml(errorMessage)}. Showing Yatra Sphere's seasonal reference guide instead of live temperatures.
      </div>
      <article class="weather-advice-card">
        <p class="weather-source-kicker">Seasonal Reference Guide (Offline Fallback)</p>
        <h3 class="weather-advice-title">${escapeHtml(placeLabel)}</h3>
        ${
          matchingDest
            ? `
              <p class="detail-prose"><strong>Best Time to Visit:</strong> ${escapeHtml(matchingDest.bestTimeToVisit)}</p>
              <p class="detail-prose" style="margin-top: 8px;">${escapeHtml(matchingDest.seasonalNote)}</p>
            `
            : '<p class="detail-prose">Check network connectivity and retry to fetch live temperature and 7-day rain forecasts via Open-Meteo.</p>'
        }
        <div style="margin-top: 14px;">
          <button type="button" class="btn btn-primary btn-sm" id="weather-retry-btn">Retry Live Forecast</button>
        </div>
      </article>
    `;

    const retryBtn = document.getElementById('weather-retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        if (matchingDest) fetchWeatherForDestination(matchingDest);
        else if (weatherCityInput && weatherCityInput.value.trim()) searchWeatherByCity(weatherCityInput.value.trim());
      });
    }
  }

  async function fetchWeatherByCoords(lat, lng, placeLabel, regionLabel, matchingDest = null) {
    if (!weatherContentArea) return;
    if (weatherStatusBanner) {
      weatherStatusBanner.textContent = `Fetching live 7-day weather & rain forecast for ${placeLabel}...`;
      weatherStatusBanner.hidden = false;
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lng)}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data || !data.current || !data.daily) throw new Error('Incomplete forecast payload');

      if (matchingDest) state.weatherCache[matchingDest.id] = data;
      if (weatherStatusBanner) weatherStatusBanner.hidden = true;
      renderWeatherData(placeLabel, regionLabel, data, matchingDest);
    } catch (err) {
      if (weatherStatusBanner) weatherStatusBanner.hidden = true;
      renderWeatherOfflineFallback(
        placeLabel,
        matchingDest,
        err && err.message ? err.message : 'Network error'
      );
    }
  }

  function fetchWeatherForDestination(dest) {
    const geo = DEST_GEO[dest.id];
    if (!geo) return;
    if (weatherCityInput) weatherCityInput.value = dest.name;
    fetchWeatherByCoords(geo.lat, geo.lng, dest.name, dest.stateRegion, dest);
  }

  async function searchWeatherByCity(cityQuery) {
    const clean = cityQuery.trim();
    if (!clean) return;

    // Check if matches one of our 16 catalog destinations directly
    const catalogMatch = CATALOG.find((d) => d.name.toLowerCase() === clean.toLowerCase());
    if (catalogMatch) {
      fetchWeatherForDestination(catalogMatch);
      return;
    }

    if (weatherStatusBanner) {
      weatherStatusBanner.textContent = `Looking up coordinates for "${clean}" via Open-Meteo Geocoding...`;
      weatherStatusBanner.hidden = false;
    }

    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(clean)}&count=1&language=en&format=json`;
      const res = await fetch(geoUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const geoData = await res.json();
      if (!geoData.results || geoData.results.length === 0) {
        if (weatherStatusBanner) {
          weatherStatusBanner.textContent = `No location found for "${clean}". Try another Indian or global city name.`;
          weatherStatusBanner.hidden = false;
        }
        return;
      }
      const loc = geoData.results[0];
      const regionStr = [loc.admin1, loc.country].filter(Boolean).join(', ');
      fetchWeatherByCoords(loc.latitude, loc.longitude, loc.name, regionStr, null);
    } catch (err) {
      if (weatherStatusBanner) weatherStatusBanner.hidden = true;
      renderWeatherOfflineFallback(clean, null, err && err.message ? err.message : 'Geocoding failed');
    }
  }

  if (weatherForm) {
    weatherForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (weatherCityInput && weatherCityInput.value.trim()) {
        searchWeatherByCity(weatherCityInput.value.trim());
      }
    });
  }

  if (weatherSyncDestBtn) {
    weatherSyncDestBtn.addEventListener('click', () => {
      const dest = getSelectedDest();
      if (dest) fetchWeatherForDestination(dest);
    });
  }

  // =========================================================================
  // 6. MODULE C: HOTEL AND STAY FINDER (Illustrative Demo Directory)
  // =========================================================================
  const staysScopeSelect = document.getElementById('stays-scope-select');
  const staysTypeSelect = document.getElementById('stays-type-select');
  const staysBudgetSelect = document.getElementById('stays-budget-select');
  const staysSortSelect = document.getElementById('stays-sort-select');
  const staysAmenityChecks = document.querySelectorAll('input[name="stayAmenity"]');
  const staysResetBtn = document.getElementById('stays-reset-btn');
  const staysEmptyResetBtn = document.getElementById('stays-empty-reset-btn');
  const staysResultsCount = document.getElementById('stays-results-count');
  const staysGrid = document.getElementById('stays-grid');
  const staysEmptyState = document.getElementById('stays-empty-state');

  function getSelectedAmenities() {
    return Array.from(staysAmenityChecks)
      .filter((cb) => cb.checked)
      .map((cb) => cb.value);
  }

  function renderStays() {
    if (!staysGrid) return;
    const scope = staysScopeSelect ? staysScopeSelect.value : 'selected';
    const typeFilter = staysTypeSelect ? staysTypeSelect.value : 'all';
    const budgetFilter = staysBudgetSelect ? staysBudgetSelect.value : 'all';
    const sortMode = staysSortSelect ? staysSortSelect.value : 'recommended';
    const reqAmenities = getSelectedAmenities();

    let filtered = ALL_STAYS.filter((stay) => {
      if (scope === 'selected' && stay.destId !== state.destId) return false;
      if (typeFilter !== 'all' && stay.type !== typeFilter) return false;
      if (budgetFilter === 'low' && stay.pricePerNight >= 2500) return false;
      if (budgetFilter === 'mid' && (stay.pricePerNight < 2500 || stay.pricePerNight > 6000)) return false;
      if (budgetFilter === 'high' && stay.pricePerNight <= 6000) return false;
      if (reqAmenities.some((a) => !stay.amenities.includes(a))) return false;
      return true;
    });

    if (sortMode === 'price-asc') {
      filtered.sort((a, b) => a.pricePerNight - b.pricePerNight);
    } else if (sortMode === 'price-desc') {
      filtered.sort((a, b) => b.pricePerNight - a.pricePerNight);
    }

    const hasCustomFilter =
      scope !== 'selected' ||
      typeFilter !== 'all' ||
      budgetFilter !== 'all' ||
      reqAmenities.length > 0;

    if (staysResetBtn) staysResetBtn.hidden = !hasCustomFilter;
    if (staysResultsCount) {
      const dest = getSelectedDest();
      const scopeLabel = scope === 'selected' && dest ? `in ${dest.name}` : 'across all 16 destinations';
      staysResultsCount.textContent = `Showing ${filtered.length} illustrative stay option${filtered.length === 1 ? '' : 's'} ${scopeLabel}`;
    }

    staysGrid.innerHTML = filtered
      .map(
        (stay) => `
        <article class="stay-card">
          <div class="stay-card-top">
            <p class="stay-card-kicker">${escapeHtml(stay.type)} &middot; ${escapeHtml(stay.destName)}</p>
            <h3 class="stay-card-title">${escapeHtml(stay.name)}</h3>
            <p class="stay-card-location">${escapeHtml(stay.location)}</p>
          </div>

          <p class="stay-card-desc">${escapeHtml(stay.note)}</p>

          <p class="stay-card-amenities">
            <strong>Amenities:</strong> ${escapeHtml(stay.amenities.join(' · '))}
          </p>

          <div class="stay-card-footer">
            <div>
              <span class="stay-price-value">${formatINR(stay.pricePerNight)}<small>/night</small></span>
              <span class="stay-price-note">Illustrative sample rate</span>
            </div>
            <a href="planner.html?dest=${encodeURIComponent(stay.destName)}" class="btn-card-action">
              Plan Trip
            </a>
          </div>
        </article>
      `
      )
      .join('');

    if (staysEmptyState) staysEmptyState.hidden = filtered.length > 0;
  }

  function resetStaysFilters() {
    if (staysScopeSelect) staysScopeSelect.value = 'selected';
    if (staysTypeSelect) staysTypeSelect.value = 'all';
    if (staysBudgetSelect) staysBudgetSelect.value = 'all';
    if (staysSortSelect) staysSortSelect.value = 'recommended';
    staysAmenityChecks.forEach((cb) => {
      cb.checked = false;
    });
    renderStays();
  }

  [staysScopeSelect, staysTypeSelect, staysBudgetSelect, staysSortSelect].forEach((el) => {
    if (el) el.addEventListener('change', renderStays);
  });
  staysAmenityChecks.forEach((cb) => cb.addEventListener('change', renderStays));
  if (staysResetBtn) staysResetBtn.addEventListener('click', resetStaysFilters);
  if (staysEmptyResetBtn) staysEmptyResetBtn.addEventListener('click', resetStaysFilters);

  // =========================================================================
  // 7. MODULE D: TRANSPORTATION PLANNER (Train, Bus, Flight, Cab Comparison)
  // =========================================================================
  const transportTravelersInput = document.getElementById('transport-travelers-input');
  const transportPrioritySelect = document.getElementById('transport-priority-select');
  const transportCorridorSummary = document.getElementById('transport-corridor-summary');
  const transportTableBody = document.getElementById('transport-table-body');
  const transportCardsGrid = document.getElementById('transport-cards-grid');

  function formatDurationHours(hoursFloat) {
    const totalMins = Math.max(45, Math.round(hoursFloat * 60));
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  function renderTransportPlanner() {
    if (!transportTableBody || !transportCardsGrid) return;
    const dest = getSelectedDest();
    const destGeo = DEST_GEO[dest.id];
    const originGeo = ORIGINS_GEO[state.origin];
    if (!dest || !destGeo || !originGeo) return;

    const travelers = Math.max(1, Math.min(12, Number(transportTravelersInput ? transportTravelersInput.value : 2) || 2));
    const priority = transportPrioritySelect ? transportPrioritySelect.value : 'balanced';
    const aerialKm = Math.round(haversineKm(originGeo.lat, originGeo.lng, destGeo.lat, destGeo.lng));
    const roadKm = destGeo.isIsland ? aerialKm : Math.round(aerialKm * (destGeo.hillTerrain ? 1.38 : 1.24));

    if (transportCorridorSummary) {
      transportCorridorSummary.innerHTML = `
        <span>Corridor Estimate</span>
        <strong>${escapeHtml(state.origin)} &rarr; ${escapeHtml(dest.name)} (~${roadKm.toLocaleString('en-IN')} km ${destGeo.isIsland ? 'air/sea' : 'surface'})</strong>
      `;
    }

    // Build 4 transport mode estimates honestly reflecting geography
    const flightCostPerPerson = Math.round((3400 + aerialKm * 3.1) / 100) * 100;
    const flightHours = Math.max(1.2, aerialKm / 680) + 1.5; // includes airport check-in/transfer

    const trainAvailable = !destGeo.isIsland && !destGeo.noDirectRail;
    const trainCostPerPerson = Math.round((650 + roadKm * 1.15) / 50) * 50;
    const trainHours = Math.max(3, roadKm / (destGeo.hillTerrain ? 44 : 58));

    const busAvailable = !destGeo.isIsland && roadKm <= 1650;
    const busCostPerPerson = Math.round((550 + roadKm * 1.45) / 50) * 50;
    const busHours = Math.max(3.5, roadKm / (destGeo.hillTerrain ? 36 : 48));

    const cabAvailable = !destGeo.isIsland && roadKm <= 1250;
    const cabsNeeded = Math.ceil(travelers / 4);
    const cabTotalCost = Math.round(((roadKm * 2 * 16 + 1200) * cabsNeeded) / 100) * 100; // round-trip km allowance or highway toll
    const cabPerPerson = Math.round(cabTotalCost / travelers / 50) * 50;
    const cabHours = Math.max(2.5, roadKm / (destGeo.hillTerrain ? 38 : 54));

    const modes = [
      {
        key: 'Flight',
        available: true,
        hub: `${originGeo.airport} → ${destGeo.airport}`,
        durationHours: flightHours,
        durationLabel: formatDurationHours(flightHours) + ' (incl. airport buffer)',
        perPerson: flightCostPerPerson,
        groupCost: flightCostPerPerson * travelers,
        bestFor: aerialKm > 550 ? 'Time-saving long-distance travel' : 'Quickest hop when fares align',
        notes: 'Fastest point-to-point corridor; includes last-mile transfer from nearest airport.'
      },
      {
        key: 'Train',
        available: trainAvailable,
        hub: trainAvailable ? `${originGeo.rail} → ${destGeo.rail}` : destGeo.rail,
        durationHours: trainHours,
        durationLabel: trainAvailable ? formatDurationHours(trainHours) : 'Unavailable',
        perPerson: trainCostPerPerson,
        groupCost: trainCostPerPerson * travelers,
        bestFor: 'Overnight sleeper comfort & lowest cost',
        notes: destGeo.noDirectRail
          ? 'No direct rail link to high-altitude Leh; travelers fly or drive from Jammu/Chandigarh.'
          : destGeo.isIsland
          ? 'Andaman is sea-separated; no rail network reaches the islands.'
          : 'Indicative 3AC / Chair Car rail estimate plus local station transfer.'
      },
      {
        key: 'Bus / Coach',
        available: busAvailable,
        hub: busAvailable ? `${state.origin} ISBT → ${dest.name} Stand` : 'Too far / sea-separated',
        durationHours: busHours,
        durationLabel: busAvailable ? formatDurationHours(busHours) : 'Not practical',
        perPerson: busCostPerPerson,
        groupCost: busCostPerPerson * travelers,
        bestFor: 'Flexible solo & budget travelers',
        notes: destGeo.isIsland
          ? 'Sea crossing required; use flights or passenger ships from Chennai/Kolkata.'
          : !busAvailable
          ? 'Over 1,650 km surface distance—rail or flight is strongly recommended.'
          : 'Indicative AC Volvo / semi-sleeper overnight or day coach estimate.'
      },
      {
        key: 'Private Cab',
        available: cabAvailable,
        hub: cabAvailable ? `Door-to-door (${cabsNeeded} sedan/SUV)` : 'Long haul / sea-separated',
        durationHours: cabHours,
        durationLabel: cabAvailable ? formatDurationHours(cabHours) : 'Not practical',
        perPerson: cabPerPerson,
        groupCost: cabTotalCost,
        bestFor: 'Families & groups of 3–4 splitting fare',
        notes: destGeo.isIsland
          ? 'Private cabs operate locally on the islands after arrival by air/sea.'
          : !cabAvailable
          ? 'Exceeds comfortable single-leg road range (~1,250 km); fly or take a train and hire a local cab.'
          : `Estimated per-km highway fare + tolls split across ${travelers} traveller(s).`
      }
    ];

    // Pick recommended mode based on priority
    const availableModes = modes.filter((m) => m.available);
    let recommendedKey = 'Flight';
    if (availableModes.length > 0) {
      if (priority === 'fastest') {
        recommendedKey = [...availableModes].sort((a, b) => a.durationHours - b.durationHours)[0].key;
      } else if (priority === 'budget') {
        recommendedKey = [...availableModes].sort((a, b) => a.perPerson - b.perPerson)[0].key;
      } else {
        // Balanced: prefer train/cab under 600km, train/flight over 600km
        if (roadKm <= 360 && cabAvailable && travelers >= 3) recommendedKey = 'Private Cab';
        else if (roadKm <= 750 && trainAvailable) recommendedKey = 'Train';
        else recommendedKey = 'Flight';
      }
    }

    transportTableBody.innerHTML = modes
      .map((m) => {
        const isRec = m.key === recommendedKey && m.available;
        return `
          <tr class="${isRec ? 'is-recommended-row' : ''} ${!m.available ? 'is-unavailable-row' : ''}">
            <td>
              <strong>${escapeHtml(m.key)}</strong>
              ${isRec ? '<span class="table-rec-note">Best Match</span>' : ''}
            </td>
            <td>${escapeHtml(m.hub)}</td>
            <td class="num-cell">${escapeHtml(m.durationLabel)}</td>
            <td class="num-cell">${m.available ? formatINR(m.perPerson) : '—'}</td>
            <td class="num-cell">${m.available ? formatINR(m.groupCost) : '—'}</td>
            <td>${escapeHtml(m.bestFor)}</td>
          </tr>
        `;
      })
      .join('');

    transportCardsGrid.innerHTML = modes
      .map((m) => {
        const isRec = m.key === recommendedKey && m.available;
        return `
          <article class="transport-mode-card ${isRec ? 'is-recommended' : ''} ${!m.available ? 'is-unavailable' : ''}">
            <div class="transport-card-head">
              <p class="transport-card-kicker">${isRec ? 'Recommended Match' : m.available ? 'Illustrative Option' : 'Corridor Note'}</p>
              <h3 class="transport-card-title">${escapeHtml(m.key)}</h3>
            </div>
            <p class="transport-card-hub">${escapeHtml(m.hub)}</p>
            <div class="transport-card-stats">
              <div>
                <span>Est. Duration</span>
                <strong>${escapeHtml(m.durationLabel)}</strong>
              </div>
              <div>
                <span>Est. / Person</span>
                <strong>${m.available ? formatINR(m.perPerson) : 'Unavailable'}</strong>
              </div>
              <div>
                <span>Total (${travelers})</span>
                <strong>${m.available ? formatINR(m.groupCost) : '—'}</strong>
              </div>
            </div>
            <p class="transport-card-note">${escapeHtml(m.notes)}</p>
          </article>
        `;
      })
      .join('');
  }

  if (transportTravelersInput) {
    transportTravelersInput.addEventListener('input', renderTransportPlanner);
  }
  if (transportPrioritySelect) {
    transportPrioritySelect.addEventListener('change', renderTransportPlanner);
  }

  // =========================================================================
  // 8. Global Route Synchronization & Boot
  // =========================================================================
  function selectDestination(destId, refreshMapView = true) {
    const match = CATALOG.find((d) => d.id === destId);
    if (!match) return;
    state.destId = match.id;
    if (destSelect) destSelect.value = match.id;
    syncPlannerHref();
    renderStays();
    renderTransportPlanner();
    if (refreshMapView || state.activeTab === 'map') {
      updateActiveMapDestinationAndRoute();
    }
    if (state.activeTab === 'weather') {
      fetchWeatherForDestination(match);
    }
    syncUrlParams();
  }

  populateDestinationsSelect();

  // Read URL params (?tab=weather&dest=goa)
  const params = new URLSearchParams(window.location.search);
  const reqDest = params.get('dest');
  if (reqDest) {
    const match = CATALOG.find(
      (d) => d.id.toLowerCase() === reqDest.toLowerCase() || d.name.toLowerCase() === reqDest.toLowerCase()
    );
    if (match) state.destId = match.id;
  }
  if (destSelect) destSelect.value = state.destId;

  const reqTab = params.get('tab');
  if (reqTab && panels[reqTab]) {
    state.activeTab = reqTab;
  }

  if (originSelect) {
    originSelect.addEventListener('change', () => {
      state.origin = originSelect.value;
      updateActiveMapDestinationAndRoute();
      renderTransportPlanner();
    });
  }

  if (destSelect) {
    destSelect.addEventListener('change', () => {
      selectDestination(destSelect.value, true);
    });
  }

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      switchToolsTab(btn.dataset.toolsTab);
    });
  });

  // Boot all modules
  syncPlannerHref();
  initLeafletMap();
  renderStays();
  renderTransportPlanner();
  switchToolsTab(state.activeTab);
});
