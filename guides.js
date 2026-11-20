/**
 * Yatra Sphere — Guides, Hidden Gems, Travel Safety, Sustainable Tourism & Reviews
 * Pure Vanilla JavaScript (ES6+) — No frameworks or external JS libraries.
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  if (!document.body.classList.contains('page-guides')) return;

  const DESTINATIONS = Array.isArray(window.YATRA_DESTINATIONS) ? window.YATRA_DESTINATIONS : [];
  const HIDDEN_GEMS = Array.isArray(window.YATRA_HIDDEN_GEMS) ? window.YATRA_HIDDEN_GEMS : [];
  const DEMO_REVIEWS = Array.isArray(window.YATRA_DEMO_REVIEWS) ? window.YATRA_DEMO_REVIEWS : [];

  const SAFETY_DOCS_KEY = 'yatraSphere_safetyDocs';
  const ECO_PLEDGE_KEY = 'yatraSphere_ecoPledge';
  const REVIEWS_KEY = 'yatraSphere_reviews';

  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const toastEl = document.getElementById('toast');
  let toastTimer = null;

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatInr(num) {
    return '₹' + Math.round(Number(num) || 0).toLocaleString('en-IN');
  }

  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.hidden = true;
    }, 3400);
  }

  function openGemModal(title, html) {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.textContent = title;
    modalBody.innerHTML = html;
    modalBackdrop.hidden = false;
    document.body.style.overflow = 'hidden';
    if (modalCloseBtn) modalCloseBtn.focus();
  }

  function readStorageJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed;
    } catch (_err) {
      return fallback;
    }
  }

  function writeStorageJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (_err) {
      // Ignore quota errors gracefully
    }
  }

  // =========================================================================
  // 1. Module Tab Switching (?tab=gems|safety|sustainable|reviews)
  // =========================================================================
  const tabBtns = document.querySelectorAll('[data-guides-tab]');
  const panels = {
    gems: document.getElementById('guides-panel-gems'),
    safety: document.getElementById('guides-panel-safety'),
    sustainable: document.getElementById('guides-panel-sustainable'),
    reviews: document.getElementById('guides-panel-reviews')
  };

  function switchGuidesTab(tabName, pushHistory = true) {
    const validTab = panels[tabName] ? tabName : 'gems';
    tabBtns.forEach((btn) => {
      const active = btn.dataset.guidesTab === validTab;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', String(active));
    });
    Object.keys(panels).forEach((key) => {
      if (panels[key]) panels[key].hidden = key !== validTab;
    });

    if (pushHistory && window.location.protocol !== 'file:') {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', validTab);
        window.history.pushState({ tab: validTab }, '', url.toString());
      } catch (_err) {
        // Ignore history push errors
      }
    }
  }

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      switchGuidesTab(btn.dataset.guidesTab, true);
    });
  });

  window.addEventListener('popstate', () => {
    const params = new URLSearchParams(window.location.search);
    switchGuidesTab(params.get('tab') || 'gems', false);
  });

  // =========================================================================
  // 2. Hidden Gems Explorer
  // =========================================================================
  const gemsGrid = document.getElementById('gems-grid');
  const gemsSearchInput = document.getElementById('gems-search-input');
  const gemsZoneBtns = document.querySelectorAll('[data-gem-zone]');
  const gemsBudgetSelect = document.getElementById('gems-budget-select');
  const gemsResultsSummary = document.getElementById('gems-results-summary');
  const gemsEmptyState = document.getElementById('gems-empty-state');
  const gemsResetBtn = document.getElementById('gems-reset-btn');

  const gemsState = {
    query: '',
    zone: 'all',
    budget: 'all'
  };

  function getFilteredGems() {
    const q = gemsState.query.trim().toLowerCase();
    return HIDDEN_GEMS.filter((gem) => {
      const zoneOk = gemsState.zone === 'all' || gem.zone === gemsState.zone;
      let budgetOk = true;
      if (gemsState.budget === 'low') budgetOk = gem.budgetMax <= 12500;
      if (gemsState.budget === 'mid') budgetOk = gem.budgetMax > 12500;

      const blob = [
        gem.name,
        gem.stateRegion,
        gem.zone,
        gem.category,
        gem.summary,
        gem.offbeatAttractions.join(' '),
        gem.localExperiences.join(' ')
      ]
        .join(' ')
        .toLowerCase();

      const queryOk = q === '' || blob.includes(q);
      return zoneOk && budgetOk && queryOk;
    });
  }

  function renderGems() {
    if (!gemsGrid) return;
    const list = getFilteredGems();

    if (gemsResultsSummary) {
      gemsResultsSummary.textContent =
        list.length === HIDDEN_GEMS.length
          ? `Showing all ${HIDDEN_GEMS.length} offbeat Indian destinations`
          : `Showing ${list.length} of ${HIDDEN_GEMS.length} hidden gems`;
    }

    if (gemsEmptyState) gemsEmptyState.hidden = list.length > 0;

    gemsGrid.innerHTML = list
      .map(
        (gem) => `
        <article class="destination-card gem-card">
          <div class="card-media">
            <div class="media-fallback" aria-hidden="true"><span>${escapeHtml(gem.name)}</span></div>
            <img
              src="${escapeHtml(gem.image)}"
              alt="${escapeHtml(gem.alt)}"
              loading="lazy"
              decoding="async"
              referrerpolicy="no-referrer"
            />
          </div>
          <div class="card-body">
            <p class="card-meta">
              <span>${escapeHtml(gem.stateRegion)}</span>
              <span aria-hidden="true">&middot;</span>
              <span>${escapeHtml(gem.category)}</span>
              <span aria-hidden="true">&middot;</span>
              <span>${escapeHtml(gem.bestTime)}</span>
            </p>
            <h3 class="card-title">${escapeHtml(gem.name)}</h3>
            <p class="card-desc">${escapeHtml(gem.summary)}</p>

            <div class="gem-highlights-mini">
              <p><strong>Offbeat Highlight:</strong> ${escapeHtml(gem.offbeatAttractions[0])}</p>
              <p><strong>Local Experience:</strong> ${escapeHtml(gem.localExperiences[0])}</p>
            </div>

            <div class="card-footer">
              <span class="card-stat">${escapeHtml(gem.duration)} &middot; Est. ${formatInr(gem.budgetMin)}–${formatInr(gem.budgetMax)}</span>
              <div class="card-actions-group">
                <button type="button" class="btn-card-action" data-open-gem="${escapeHtml(gem.id)}">View Gem Guide</button>
              </div>
            </div>
          </div>
        </article>
      `
      )
      .join('');

    gemsGrid.querySelectorAll('[data-open-gem]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const gem = HIDDEN_GEMS.find((g) => g.id === btn.dataset.openGem);
        if (!gem) return;
        openGemModal(
          `${gem.name} — Hidden Gem Guide`,
          `
            <p class="modal-meta">${escapeHtml(gem.stateRegion)} &middot; ${escapeHtml(gem.zone)} &middot; Best: ${escapeHtml(gem.bestTime)}</p>
            <p class="modal-notice">
              <strong>Budget-Friendly Estimate (${escapeHtml(gem.duration)}):</strong> ${formatInr(gem.budgetMin)} – ${formatInr(gem.budgetMax)} / traveler (${escapeHtml(gem.budgetNote)}).
            </p>
            <p class="modal-text">${escapeHtml(gem.summary)}</p>

            <h3 class="modal-section-title">Offbeat Attractions</h3>
            <ul class="modal-list">${gem.offbeatAttractions.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>

            <h3 class="modal-section-title">Authentic Local Experiences</h3>
            <ul class="modal-list">${gem.localExperiences.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>

            <h3 class="modal-section-title">Budget-Saving Transit Tip</h3>
            <p class="modal-text">${escapeHtml(gem.budgetTip)}</p>

            <h3 class="modal-section-title">Permits &amp; Local Note</h3>
            <p class="modal-text">${escapeHtml(gem.permitNote)}</p>

            <div class="modal-actions-row">
              <a href="planner.html" class="btn btn-primary">Build Custom Route in Planner &rarr;</a>
              <button type="button" class="btn-card-action" id="modal-gem-reviews-btn">Check Reviews Tab</button>
            </div>
          `
        );
        const revBtn = document.getElementById('modal-gem-reviews-btn');
        if (revBtn) {
          revBtn.addEventListener('click', () => {
            if (modalBackdrop) modalBackdrop.hidden = true;
            document.body.style.overflow = '';
            switchGuidesTab('reviews', true);
            const revFilter = document.getElementById('reviews-filter-dest');
            if (revFilter) {
              const matchingOpt = Array.from(revFilter.options).find((o) => o.value === gem.name);
              if (matchingOpt) {
                revFilter.value = gem.name;
                renderReviews();
              }
            }
          });
        }
      });
    });
  }

  if (gemsSearchInput) {
    gemsSearchInput.addEventListener('input', (e) => {
      gemsState.query = e.target.value;
      renderGems();
    });
  }

  gemsZoneBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      gemsState.zone = btn.dataset.gemZone || 'all';
      gemsZoneBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      renderGems();
    });
  });

  if (gemsBudgetSelect) {
    gemsBudgetSelect.addEventListener('change', (e) => {
      gemsState.budget = e.target.value;
      renderGems();
    });
  }

  if (gemsResetBtn) {
    gemsResetBtn.addEventListener('click', () => {
      gemsState.query = '';
      gemsState.zone = 'all';
      gemsState.budget = 'all';
      if (gemsSearchInput) gemsSearchInput.value = '';
      if (gemsBudgetSelect) gemsBudgetSelect.value = 'all';
      gemsZoneBtns.forEach((b) => {
        const active = b.dataset.gemZone === 'all';
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      renderGems();
    });
  }

  renderGems();

  // =========================================================================
  // 3. Travel Safety & Emergency Module
  // =========================================================================
  const NATIONAL_HELPLINES = [
    { number: '112', title: 'All-in-One Emergency (ERSS)', note: 'Pan-India unified Police, Fire, Ambulance & disaster dispatch (works without SIM credit).' },
    { number: '1363', title: 'Incredible India Tourist Helpline', note: '24×7 multilingual helpline (12 languages) run by Ministry of Tourism for traveler support.' },
    { number: '108', title: 'Emergency Ambulance', note: 'State medical emergency response and trauma transport across major Indian states.' },
    { number: '100', title: 'Police Control Room', note: 'Direct local police dispatch across cities, highways, and rural jurisdictions.' },
    { number: '1091', title: 'Women Helpline', note: 'Dedicated 24-hour assistance for women travelers in distress.' },
    { number: '139', title: 'Indian Railways Helpline', note: 'On-board security, medical emergency on trains, and live PNR/platform inquiries.' },
    { number: '1070', title: 'State Disaster Management', note: 'Flood, landslide, highway closure, and cyclone relief coordination desk.' },
    { number: '101', title: 'Fire & Rescue Service', note: 'Immediate fire, structural hazard, and local rescue dispatch.' }
  ];

  const VERIFIED_SAFETY_HUBS = [
    {
      id: 'manali',
      name: 'Manali & Kullu Valley, HP',
      lat: 32.2396,
      lng: 77.1887,
      authority: 'Kullu District Disaster & Tourist Helpdesk',
      helpline: '112 / 1077 (HP District Emergency)',
      advisory: 'Check Atal Tunnel & Rohtang BRO weather bulletins before dawn starts; carry BSNL or Jio coverage for upper Lahaul.'
    },
    {
      id: 'ladakh',
      name: 'Leh & Ladakh',
      lat: 34.1526,
      lng: 77.5771,
      authority: 'UT Ladakh Police & SNM Hospital Leh',
      helpline: '112 / 1077 (Leh Emergency Control)',
      advisory: 'Mandatory 48-hour acclimatization in Leh (3,500m) before crossing Khardung La or Chang La. Postpaid SIM required.'
    },
    {
      id: 'kashmir',
      name: 'Srinagar & Gulmarg, J&K',
      lat: 34.0837,
      lng: 74.7973,
      authority: 'J&K Tourist Police (TRC Srinagar)',
      helpline: '112 / 1363 (Tourist Assistance)',
      advisory: 'Verify NH-44 Ramban–Banihal traffic advisories during rain or snow; use postpaid mobile networks.'
    },
    {
      id: 'goa',
      name: 'Panaji & South Goa',
      lat: 15.2993,
      lng: 74.124,
      authority: 'Goa Tourist Police & Drishti Lifesaving',
      helpline: '112 / 1363',
      advisory: 'Swim strictly inside red-and-yellow lifeguarded beach flags; avoid rocky headlands during high tide.'
    },
    {
      id: 'jaipur',
      name: 'Jaipur, Rajasthan',
      lat: 26.9124,
      lng: 75.7873,
      authority: 'Rajasthan Tourist Assistance Force',
      helpline: '112 / 1363',
      advisory: 'Use prepaid/metered rickshaws or verified ride apps; keep hydrated during April–June afternoon fort climbs.'
    },
    {
      id: 'kerala',
      name: 'Kochi & Alleppey, Kerala',
      lat: 9.4981,
      lng: 76.3388,
      authority: 'Kerala Tourism Police & Coastal Vigil',
      helpline: '112 / 1077',
      advisory: 'Verify life-jackets on every backwater vessel and heed IMD orange/red monsoon alerts in Idukki hills.'
    },
    {
      id: 'meghalaya',
      name: 'Shillong & Cherrapunji, Meghalaya',
      lat: 25.5788,
      lng: 91.8933,
      authority: 'Meghalaya Tourist Helpline & Police',
      helpline: '112 / 1363',
      advisory: 'Carry rain gear and gripped trekking shoes; avoid descending steep canyon stairs after 3 PM in dense fog.'
    },
    {
      id: 'ziro',
      name: 'Ziro Valley, Arunachal Pradesh',
      lat: 27.5449,
      lng: 93.8197,
      authority: 'Lower Subansiri District Helpdesk (Hapoli)',
      helpline: '112 / 1077',
      advisory: 'Carry printed and digital copies of Arunachal e-ILP + government photo ID at Banderdewa / Gumto checkgates.'
    }
  ];

  const DEFAULT_SAFETY_DOCS = [
    { id: 'doc-1', label: 'Original Government Photo ID (Aadhaar / Passport / Driving Licence)', done: false },
    { id: 'doc-2', label: 'Regional Entry Permits (e-ILP for Arunachal/Mizoram/Nagaland or Ladakh Restricted Permits)', done: false },
    { id: 'doc-3', label: 'Offline Downloaded Tickets, Hotel Bookings & Offline Maps', done: false },
    { id: 'doc-4', label: 'Travel & Emergency Medical Insurance Policy Copy (Digital + Print)', done: false },
    { id: 'doc-5', label: 'Emergency Contact Card + Blood Group & Allergy Note in Wallet', done: false },
    { id: 'doc-6', label: 'Prescribed Medicines, ORS Hydration Sachets & Basic First-Aid Kit', done: false },
    { id: 'doc-7', label: 'Emergency Cash Reserve (ATMs can be sparse in high mountain valleys)', done: false }
  ];

  const WEATHER_PRECAUTIONS = {
    mountains: [
      { title: 'Acute Mountain Sickness (AMS)', body: 'Ascend gradually above 2,800m (Spiti, Ladakh, North Sikkim). Rest 24–48 hours on arrival, drink 3–4L water daily, and descend immediately if severe headache, dizziness, or breathlessness persists.' },
      { title: 'Black Ice & Early Dusk Roads', body: 'Mountain passes close or freeze quickly after 4:00 PM. Schedule long inter-valley drives for early morning departures and avoid night mountain driving.' },
      { title: 'Layered Thermal Gear', body: 'Pack moisture-wicking base layers, fleece mid-layer, windproof shell, UV sunglasses (high-altitude glare), and SPF 50+ sunscreen even in winter.' }
    ],
    monsoon: [
      { title: 'Flash Floods & Landslide Zones', body: 'Check state PWD/IMD advisories before entering Western Ghats ghats, Himachal valleys, or Meghalaya gorges during June–September heavy rain.' },
      { title: 'Waterfalls & Slippery Stone Steps', body: 'Moss-covered canyon stairs (such as Nongriat or Sahyadri trails) require high-grip trekking footwear; avoid wading into swift river pools after sudden upstream rain.' },
      { title: 'Waterproof Tech Protection', body: 'Keep phones, power banks, paper permits, and spare woollens inside sealed dry-bags or Ziploc sleeves.' }
    ],
    coastal: [
      { title: 'Rip Currents & Surf Flags', body: 'Never enter waters marked with red flags or unguarded rocky coves. Swim parallel to shore if caught in a rip current rather than fighting straight back.' },
      { title: 'Cyclone & Marine Bulletins', body: 'Between May–June and October–December along the Bay of Bengal (Andamans, Odisha, Tamil Nadu), monitor IMD marine advisories before booking ferries.' },
      { title: 'Sunstroke & Hydration', body: 'Carry wide-brim hats, electrolyte sachets, and reef-safe sunscreen for midday beach walks or kayaking.' }
    ],
    plains: [
      { title: 'Peak Heat Scheduling', body: 'Across Rajasthan, Agra, and Central India between April–June, schedule outdoor fort walks for 6:30–10:30 AM and rest indoors midday.' },
      { title: 'Heat Exhaustion Prevention', body: 'Wear loose breathable cotton/linen, keep Oral Rehydration Salts (ORS) handy, and stay shaded during heatwave alerts.' },
      { title: 'Winter Fog Transit Buffers', body: 'Across North Indian plains (Delhi–Jaipur–Varanasi–Amritsar) in December–January, build a 2–3 hour buffer around early morning trains and flights.' }
    ]
  };

  const GENERAL_PRECAUTIONS = [
    { title: 'Share Live Route Check-Ins', note: 'Share your daily driver details, homestay address, and expected arrival window with a trusted family contact—especially on solo trips or low-signal mountain roads.' },
    { title: 'Verified Transport & Meter Discipline', note: 'Prefer official railway/state bus counters, airport prepaid taxi booths, or app-based cabs; agree on full round-trip mountain taxi tariffs before departure.' },
    { title: 'Digital Payments + Backup Cash', note: 'UPI works widely across cities and towns, yet remote hill hamlets, forest checkposts, and village ferries often run cash-only due to intermittent mobile data.' },
    { title: 'Safe Food & Water Habits', note: 'Refill from boiled/filtered homestay dispensers or sealed sources, eat freshly cooked hot street dishes with high turnover, and carry personal motion-sickness tablets for winding ghats.' }
  ];

  // Render helplines
  const helplinesGrid = document.getElementById('safety-helplines-grid');
  if (helplinesGrid) {
    helplinesGrid.innerHTML = NATIONAL_HELPLINES.map(
      (h) => `
      <article class="helpline-card">
        <div class="helpline-top">
          <a href="tel:${escapeHtml(h.number)}" class="helpline-number">${escapeHtml(h.number)}</a>
          <button type="button" class="btn-link" data-copy-number="${escapeHtml(h.number)}">Copy</button>
        </div>
        <h4 class="helpline-title">${escapeHtml(h.title)}</h4>
        <p class="helpline-note">${escapeHtml(h.note)}</p>
      </article>
    `
    ).join('');

    helplinesGrid.querySelectorAll('[data-copy-number]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const num = btn.dataset.copyNumber;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(num).then(
            () => showToast(`Copied helpline ${num} to clipboard.`),
            () => showToast(`Helpline number: ${num}`)
          );
        } else {
          showToast(`Helpline number: ${num}`);
        }
      });
    });
  }

  // Hub Directory & Live OpenStreetMap Overpass Query
  const safetyHubSelect = document.getElementById('safety-hub-select');
  const safetyHubDirectory = document.getElementById('safety-hub-directory');
  const safetyOsmHubBtn = document.getElementById('safety-osm-hub-btn');
  const safetyOsmGpsBtn = document.getElementById('safety-osm-gps-btn');
  const safetyOsmStatus = document.getElementById('safety-osm-status');
  const safetyOsmResults = document.getElementById('safety-osm-results');

  function renderSelectedSafetyHub() {
    if (!safetyHubSelect || !safetyHubDirectory) return;
    const hub = VERIFIED_SAFETY_HUBS.find((h) => h.id === safetyHubSelect.value) || VERIFIED_SAFETY_HUBS[0];
    safetyHubDirectory.innerHTML = `
      <p class="safety-hub-kicker">Verified Static Hub Reference &middot; ${escapeHtml(hub.name)}</p>
      <p class="safety-hub-line"><strong>Control Desk:</strong> ${escapeHtml(hub.authority)}</p>
      <p class="safety-hub-line"><strong>Emergency Numbers:</strong> ${escapeHtml(hub.helpline)}</p>
      <p class="safety-hub-advisory">${escapeHtml(hub.advisory)}</p>
    `;
  }

  if (safetyHubSelect) {
    safetyHubSelect.innerHTML = VERIFIED_SAFETY_HUBS.map(
      (hub) => `<option value="${escapeHtml(hub.id)}">${escapeHtml(hub.name)}</option>`
    ).join('');
    safetyHubSelect.addEventListener('change', renderSelectedSafetyHub);
    renderSelectedSafetyHub();
  }

  function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  async function queryOverpassEmergency(lat, lng, label) {
    if (!safetyOsmStatus || !safetyOsmResults) return;
    safetyOsmStatus.textContent = `Querying OpenStreetMap for hospitals and police stations near ${label}...`;
    safetyOsmResults.innerHTML = '';

    const query = `[out:json][timeout:12];(node["amenity"~"hospital|clinic|police"](around:10000,${lat},${lng});way["amenity"~"hospital|clinic|police"](around:10000,${lat},${lng}););out center 16;`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 11000);
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: 'data=' + encodeURIComponent(query),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error('Overpass HTTP ' + res.status);
      const json = await res.json();
      const elements = Array.isArray(json.elements) ? json.elements : [];

      const named = elements
        .map((el) => {
          const tags = el.tags || {};
          const elLat = el.lat || (el.center && el.center.lat);
          const elLng = el.lon || (el.center && el.center.lon);
          const dist = elLat && elLng ? haversineKm(lat, lng, elLat, elLng) : 99;
          return {
            name: tags.name || tags['name:en'] || '',
            type: tags.amenity || 'service',
            phone: tags.phone || tags['contact:phone'] || '',
            dist,
            lat: elLat,
            lng: elLng
          };
        })
        .filter((item) => item.name)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 6);

      if (named.length === 0) {
        safetyOsmStatus.innerHTML = `No named facilities returned within 10 km on OpenStreetMap for ${escapeHtml(label)}. Dial <strong>112</strong> or check <a href="https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=13/${lat}/${lng}" target="_blank" rel="noopener noreferrer">OpenStreetMap directly</a>.`;
        return;
      }

      safetyOsmStatus.innerHTML = `Showing ${named.length} mapped emergency services near ${escapeHtml(label)} (source: OpenStreetMap Overpass API).`;
      safetyOsmResults.innerHTML = named
        .map(
          (item) => `
          <div class="osm-service-row">
            <div>
              <strong>${escapeHtml(item.name)}</strong>
              <p class="osm-service-meta">${escapeHtml(item.type.toUpperCase())} &middot; ~${item.dist.toFixed(1)} km away${item.phone ? ' · ' + escapeHtml(item.phone) : ''}</p>
            </div>
            ${
              item.lat && item.lng
                ? `<a class="btn-link" href="https://www.openstreetmap.org/?mlat=${item.lat}&mlon=${item.lng}#map=16/${item.lat}/${item.lng}" target="_blank" rel="noopener noreferrer">Map &rarr;</a>`
                : ''
            }
          </div>
        `
        )
        .join('');
    } catch (_err) {
      safetyOsmStatus.innerHTML = `Live OpenStreetMap lookup is temporarily unreachable in this environment. In an emergency always dial <strong>112</strong>, or <a href="https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=13/${lat}/${lng}" target="_blank" rel="noopener noreferrer">open OpenStreetMap around ${escapeHtml(label)}</a>.`;
    }
  }

  if (safetyOsmHubBtn && safetyHubSelect) {
    safetyOsmHubBtn.addEventListener('click', () => {
      const hub = VERIFIED_SAFETY_HUBS.find((h) => h.id === safetyHubSelect.value) || VERIFIED_SAFETY_HUBS[0];
      queryOverpassEmergency(hub.lat, hub.lng, hub.name);
    });
  }

  if (safetyOsmGpsBtn) {
    safetyOsmGpsBtn.addEventListener('click', () => {
      if (!navigator.geolocation) {
        if (safetyOsmStatus) {
          safetyOsmStatus.textContent = 'Geolocation is not supported by your browser. Please choose a destination hub above.';
        }
        return;
      }
      if (safetyOsmStatus) safetyOsmStatus.textContent = 'Requesting your approximate location...';
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          queryOverpassEmergency(pos.coords.latitude, pos.coords.longitude, 'your current location');
        },
        () => {
          if (safetyOsmStatus) {
            safetyOsmStatus.textContent = 'Location permission declined or unavailable. Select a destination hub above instead.';
          }
        },
        { enableHighAccuracy: false, timeout: 8000 }
      );
    });
  }

  // Document Checklist
  const safetyDocForm = document.getElementById('safety-doc-form');
  const safetyDocInput = document.getElementById('safety-doc-input');
  const safetyDocsList = document.getElementById('safety-docs-list');
  const safetyDocsProgress = document.getElementById('safety-docs-progress');
  const safetyDocsResetBtn = document.getElementById('safety-docs-reset-btn');

  function getSafetyDocs() {
    const saved = readStorageJson(SAFETY_DOCS_KEY, null);
    return Array.isArray(saved) && saved.length > 0 ? saved : DEFAULT_SAFETY_DOCS.map((d) => ({ ...d }));
  }

  function renderSafetyDocs() {
    if (!safetyDocsList) return;
    const docs = getSafetyDocs();
    const readyCount = docs.filter((d) => d.done).length;
    if (safetyDocsProgress) {
      safetyDocsProgress.textContent = `${readyCount} of ${docs.length} ready`;
    }

    safetyDocsList.innerHTML = docs
      .map(
        (doc) => `
        <div class="safety-doc-item${doc.done ? ' packed' : ''}">
          <label class="checklist-check-label">
            <input type="checkbox" data-doc-toggle="${escapeHtml(doc.id)}" ${doc.done ? 'checked' : ''} />
            <span class="checklist-item-text">${escapeHtml(doc.label)}</span>
          </label>
          <button type="button" class="btn-link checklist-remove-btn" data-doc-remove="${escapeHtml(doc.id)}" aria-label="Remove document">&times;</button>
        </div>
      `
      )
      .join('');

    safetyDocsList.querySelectorAll('[data-doc-toggle]').forEach((cb) => {
      cb.addEventListener('change', () => {
        const list = getSafetyDocs();
        const item = list.find((d) => d.id === cb.dataset.docToggle);
        if (item) {
          item.done = cb.checked;
          writeStorageJson(SAFETY_DOCS_KEY, list);
          renderSafetyDocs();
        }
      });
    });

    safetyDocsList.querySelectorAll('[data-doc-remove]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const list = getSafetyDocs().filter((d) => d.id !== btn.dataset.docRemove);
        writeStorageJson(SAFETY_DOCS_KEY, list);
        renderSafetyDocs();
      });
    });
  }

  if (safetyDocForm && safetyDocInput) {
    safetyDocForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = safetyDocInput.value.trim();
      if (!val) return;
      const list = getSafetyDocs();
      list.unshift({ id: 'doc-' + Date.now(), label: val, done: false });
      writeStorageJson(SAFETY_DOCS_KEY, list);
      safetyDocInput.value = '';
      renderSafetyDocs();
      showToast('Added item to travel document checklist.');
    });
  }

  if (safetyDocsResetBtn) {
    safetyDocsResetBtn.addEventListener('click', () => {
      writeStorageJson(SAFETY_DOCS_KEY, DEFAULT_SAFETY_DOCS.map((d) => ({ ...d })));
      renderSafetyDocs();
      showToast('Document checklist restored to defaults.');
    });
  }

  renderSafetyDocs();

  // Weather & General Precautions
  const weatherPrecautionBtns = document.querySelectorAll('[data-weather-precaution]');
  const safetyWeatherGrid = document.getElementById('safety-weather-grid');
  const safetyGeneralGrid = document.getElementById('safety-general-grid');

  function renderWeatherPrecautions(mode) {
    if (!safetyWeatherGrid) return;
    const items = WEATHER_PRECAUTIONS[mode] || WEATHER_PRECAUTIONS.mountains;
    safetyWeatherGrid.innerHTML = items
      .map(
        (item) => `
        <article class="precaution-card">
          <h4>${escapeHtml(item.title)}</h4>
          <p>${escapeHtml(item.body)}</p>
        </article>
      `
      )
      .join('');
  }

  weatherPrecautionBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.weatherPrecaution || 'mountains';
      weatherPrecautionBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      renderWeatherPrecautions(mode);
    });
  });
  renderWeatherPrecautions('mountains');

  if (safetyGeneralGrid) {
    safetyGeneralGrid.innerHTML = GENERAL_PRECAUTIONS.map(
      (p) => `
      <article class="precaution-card">
        <h4>${escapeHtml(p.title)}</h4>
        <p>${escapeHtml(p.note)}</p>
      </article>
    `
    ).join('');
  }

  // =========================================================================
  // 4. Sustainable Tourism Module
  // =========================================================================
  const ECO_DESTINATIONS = [
    {
      name: 'Mawlynnong & Sohra, Meghalaya',
      region: 'Khasi Hills',
      image: 'src/assets/images/dest_meghalaya_1795160234524.jpg',
      alt: 'Misty emerald valley ridges and waterfalls in Meghalaya',
      focus: 'Zero-Plastic Villages & Living Root Trails',
      summary: 'Bamboo waste bins, village-owned homestays, and multi-generation bio-engineered root bridges maintained by Khasi stewards.',
      lowImpactTip: 'Use Guwahati–Shillong shared vehicles and stay inside village-managed homestays.'
    },
    {
      name: 'Spiti Valley, Himachal Pradesh',
      region: 'Trans-Himalaya',
      image: 'src/assets/images/gem_spiti_kaza_1795167627867.jpg',
      alt: 'Key Monastery above the turquoise Spiti River in Himachal Pradesh',
      focus: 'Solar-Heated Mud Homestays & Refill Stations',
      summary: 'High-altitude villages run passive solar mud-brick homestays and community filtered water stations to eliminate single-use PET bottles.',
      lowImpactTip: 'Bring a stainless-steel filter bottle and travel via HRTC public buses along the Kinnaur highway.'
    },
    {
      name: 'Majuli River Island, Assam',
      region: 'Brahmaputra Basin',
      image: 'src/assets/images/gem_majuli_island_1795167628311.jpg',
      alt: 'Traditional wooden river boat on calm Brahmaputra waters in Majuli',
      focus: 'Bamboo Architecture & Artisan Guilds',
      summary: 'Explore Assam’s river island by bicycle while supporting satra mask-makers, organic handloom weavers, and stilt-home families.',
      lowImpactTip: 'Rent a bicycle in Garamur and cross on public passenger ferries from Nimati Ghat.'
    },
    {
      name: 'Coorg (Kodagu), Karnataka',
      region: 'Western Ghats',
      image: 'src/assets/images/dest_coorg_1795160769915.jpg',
      alt: 'Shade-grown coffee plantations in Coorg Western Ghats',
      focus: 'Shade-Grown Agroforestry & Bird Corridors',
      summary: 'Coffee grown beneath native silver oak and wild fig canopies preserves Western Ghats hornbill and elephant corridors.',
      lowImpactTip: 'Choose small family coffee-estate homestays with rainwater harvesting over sprawling concrete resorts.'
    },
    {
      name: 'Kaziranga & Manas Fringe, Assam',
      region: 'Brahmaputra Floodplains',
      image: 'src/assets/images/dest_kaziranga_1795160770089.jpg',
      alt: 'Tall elephant grass and wetlands at sunrise in Kaziranga National Park',
      focus: 'Regulated Wildlife Buffers & Village Eco-Lodges',
      summary: 'Support community-owned eco-camps employing local naturalists and weavers from Karbi and Mishing villages.',
      lowImpactTip: 'Keep strict silence inside safari zones, stay on designated jeep tracks, and never use flash photography.'
    },
    {
      name: 'Ziro Valley, Arunachal Pradesh',
      region: 'Eastern Himalayas',
      image: 'src/assets/images/gem_ziro_valley_1795167627729.jpg',
      alt: 'Terraced paddy fields and misty pine hills in Ziro Valley',
      focus: 'UNESCO-Tentative Apatani Agro-Ecology',
      summary: 'Apatani farmers cultivate wet rice alongside fish without chemical inputs using gravity-fed bamboo irrigation channels.',
      lowImpactTip: 'Walk or cycle village trails and purchase woven shawls directly from family looms.'
    }
  ];

  const LOCAL_RECOMMENDATIONS = [
    { title: 'Book Family-Owned Homestays', body: 'Direct homestays keep 80%+ of lodging spend inside local households and serve seasonal regional produce instead of flown-in buffets.' },
    { title: 'Hire Certified Local Trail Guides', body: 'In places like Meghalaya, Coorg, and Spiti, hiring village-registered guides funds forest conservation and keeps trails safe.' },
    { title: 'Choose Rail, Ferries & Shared Sumos', body: 'Overnight trains, state buses, and shared mountain vehicles drastically lower per-passenger emissions while connecting you to regional life.' },
    { title: 'Support Living Craft Cooperatives', body: 'Look for fair-wage artisan studios—Athangudi tile makers, Majuli mask artisans, Jaipur block-printers, and Kashmiri papier-mâché workshops.' }
  ];

  const DEFAULT_ECO_PLEDGE = [
    { id: 'eco-1', text: 'Carry a reusable steel/insulated water bottle and use filtered homestay refills instead of buying single-use plastic bottles.', done: false },
    { id: 'eco-2', text: 'Pack out every wrapper, battery, and non-biodegradable item from mountains, beaches, and forest sanctuaries.', done: false },
    { id: 'eco-3', text: 'Prioritize trains, public ferries, bicycles, or shared mountain vehicles whenever route timing allows.', done: false },
    { id: 'eco-4', text: 'Book locally owned homestays and dine at neighbourhood family kitchens to keep tourism revenue local.', done: false },
    { id: 'eco-5', text: 'Follow wildlife & sacred grove rules: maintain safe distance, avoid loud speakers, and ask before photographing residents.', done: false }
  ];

  const ecoDestGrid = document.getElementById('eco-dest-grid');
  if (ecoDestGrid) {
    ecoDestGrid.innerHTML = ECO_DESTINATIONS.map(
      (eco) => `
      <article class="destination-card">
        <div class="card-media">
          <div class="media-fallback" aria-hidden="true"><span>${escapeHtml(eco.name)}</span></div>
          <img src="${escapeHtml(eco.image)}" alt="${escapeHtml(eco.alt)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" />
        </div>
        <div class="card-body">
          <p class="card-meta"><span>${escapeHtml(eco.region)}</span> <span aria-hidden="true">&middot;</span> <span>${escapeHtml(eco.focus)}</span></p>
          <h4 class="card-title">${escapeHtml(eco.name)}</h4>
          <p class="card-desc">${escapeHtml(eco.summary)}</p>
          <p class="eco-tip-line"><strong>Low-Impact Tip:</strong> ${escapeHtml(eco.lowImpactTip)}</p>
        </div>
      </article>
    `
    ).join('');
  }

  const ecoLocalList = document.getElementById('eco-local-list');
  if (ecoLocalList) {
    ecoLocalList.innerHTML = LOCAL_RECOMMENDATIONS.map(
      (rec, idx) => `
      <div class="eco-local-item">
        <h4>0${idx + 1}. ${escapeHtml(rec.title)}</h4>
        <p>${escapeHtml(rec.body)}</p>
      </div>
    `
    ).join('');
  }

  const ecoPledgeList = document.getElementById('eco-pledge-list');
  const ecoPledgeCount = document.getElementById('eco-pledge-count');

  function getEcoPledge() {
    const saved = readStorageJson(ECO_PLEDGE_KEY, null);
    return Array.isArray(saved) && saved.length > 0 ? saved : DEFAULT_ECO_PLEDGE.map((e) => ({ ...e }));
  }

  function renderEcoPledge() {
    if (!ecoPledgeList) return;
    const items = getEcoPledge();
    const checked = items.filter((i) => i.done).length;
    if (ecoPledgeCount) ecoPledgeCount.textContent = `${checked} of ${items.length} pledged`;

    ecoPledgeList.innerHTML = items
      .map(
        (item) => `
        <div class="safety-doc-item${item.done ? ' packed' : ''}">
          <label class="checklist-check-label">
            <input type="checkbox" data-eco-toggle="${escapeHtml(item.id)}" ${item.done ? 'checked' : ''} />
            <span class="checklist-item-text">${escapeHtml(item.text)}</span>
          </label>
        </div>
      `
      )
      .join('');

    ecoPledgeList.querySelectorAll('[data-eco-toggle]').forEach((cb) => {
      cb.addEventListener('change', () => {
        const list = getEcoPledge();
        const found = list.find((i) => i.id === cb.dataset.ecoToggle);
        if (found) {
          found.done = cb.checked;
          writeStorageJson(ECO_PLEDGE_KEY, list);
          renderEcoPledge();
          if (cb.checked) showToast('Responsible travel commitment saved.');
        }
      });
    });
  }
  renderEcoPledge();

  // =========================================================================
  // 5. Reviews & Ratings Module
  // =========================================================================
  const reviewsSummaryCard = document.getElementById('reviews-summary-card');
  const reviewsFilterDest = document.getElementById('reviews-filter-dest');
  const reviewsFilterRating = document.getElementById('reviews-filter-rating');
  const reviewsSortSelect = document.getElementById('reviews-sort-select');
  const reviewsFeed = document.getElementById('reviews-feed');
  const reviewsEmptyState = document.getElementById('reviews-empty-state');
  const reviewsResetBtn = document.getElementById('reviews-reset-btn');

  const reviewForm = document.getElementById('review-submit-form');
  const reviewFormError = document.getElementById('review-form-error');
  const reviewDestSelect = document.getElementById('review-dest-select');
  const reviewAuthorInput = document.getElementById('review-author-input');
  const reviewTripTypeSelect = document.getElementById('review-triptype-select');
  const reviewStarBtns = document.querySelectorAll('[data-star-value]');
  const starPickerText = document.getElementById('star-picker-text');
  const reviewTitleInput = document.getElementById('review-title-input');
  const reviewCommentInput = document.getElementById('review-comment-input');
  const reviewEcoInput = document.getElementById('review-eco-input');

  let selectedStarValue = 5;
  const STAR_LABELS = {
    1: '1 / 5 Needs Care',
    2: '2 / 5 Fair',
    3: '3 / 5 Good',
    4: '4 / 5 Very Good',
    5: '5 / 5 Excellent'
  };

  let supabaseReviews = [];

  function findDestinationIdByName(name) {
    const clean = String(name || '').trim().toLowerCase();
    const matched = DESTINATIONS.find((d) => d.name.toLowerCase() === clean);
    return matched ? matched.id : null;
  }

  function findDestinationNameById(id) {
    const matched = DESTINATIONS.find((d) => d.id === id);
    return matched ? matched.name : id;
  }

  async function loadSupabaseReviews() {
    const supa = window.YatraSupabase;
    if (!supa || !supa.rest) return;
    const res = await supa.rest.select('reviews', 'select=*&order=created_at.desc');
    if (Array.isArray(res.data)) {
      const currentSess = supa.auth ? supa.auth.getSession() : null;
      const currentUid = currentSess && currentSess.user ? currentSess.user.id : null;
      supabaseReviews = res.data.map((r) => ({
        id: r.id,
        userId: r.user_id,
        destination: findDestinationNameById(r.destination_id),
        author: r.reviewer_name || 'Verified Traveler',
        tripType: r.trip_type || 'Friends',
        rating: Number(r.rating) || 5,
        title: r.review_title || 'Traveler Review',
        comment: r.review_text || '',
        ecoTip: r.eco_tip || '',
        date: String(r.created_at || '').slice(0, 10),
        source: 'supabase',
        isOwner: Boolean(currentUid && r.user_id === currentUid)
      }));
      renderReviews();
    }
  }

  function getUserReviews() {
    const saved = readStorageJson(REVIEWS_KEY, []);
    return Array.isArray(saved) ? saved : [];
  }

  function getAllReviews() {
    return [...supabaseReviews, ...getUserReviews(), ...DEMO_REVIEWS];
  }

  function populateReviewDestinationSelects() {
    const allNames = Array.from(
      new Set([
        ...DESTINATIONS.map((d) => d.name),
        ...HIDDEN_GEMS.map((g) => g.name)
      ])
    ).sort((a, b) => a.localeCompare(b));

    if (reviewsFilterDest) {
      reviewsFilterDest.innerHTML =
        '<option value="all">All Destinations</option>' +
        allNames.map((n) => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join('');
    }
    if (reviewDestSelect) {
      reviewDestSelect.innerHTML = allNames
        .map((n) => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`)
        .join('');
    }

    if (reviewAuthorInput && window.YatraAccountStore && window.YatraAccountStore.auth) {
      const sess = window.YatraAccountStore.auth.getSession();
      if (sess && sess.data && sess.data.session && sess.data.session.user && !reviewAuthorInput.value) {
        reviewAuthorInput.value = sess.data.session.user.name || '';
      }
    }
  }

  function renderStarString(rating) {
    const rounded = Math.max(1, Math.min(5, Math.round(Number(rating) || 5)));
    return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
  }

  function setStarPicker(val) {
    selectedStarValue = Math.max(1, Math.min(5, Number(val) || 5));
    reviewStarBtns.forEach((btn) => {
      const btnVal = Number(btn.dataset.starValue);
      btn.classList.toggle('active', btnVal <= selectedStarValue);
      btn.setAttribute('aria-checked', String(btnVal === selectedStarValue));
    });
    if (starPickerText) {
      starPickerText.textContent = STAR_LABELS[selectedStarValue] || `${selectedStarValue} / 5`;
    }
  }

  reviewStarBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      setStarPicker(btn.dataset.starValue);
    });
  });

  function renderReviews() {
    const all = getAllReviews();

    const activeDest = reviewsFilterDest ? reviewsFilterDest.value : 'all';
    const summaryPool = activeDest === 'all' ? all : all.filter((r) => r.destination === activeDest);

    if (reviewsSummaryCard) {
      const total = summaryPool.length;
      const avg = total > 0 ? summaryPool.reduce((acc, r) => acc + Number(r.rating || 0), 0) / total : 0;
      const dist = [5, 4, 3, 2, 1].map((star) => {
        const count = summaryPool.filter((r) => Number(r.rating) === star).length;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return { star, count, pct };
      });

      reviewsSummaryCard.innerHTML = `
        <div class="reviews-summary-grid">
          <div class="reviews-score-box">
            <p class="reviews-score-kicker">${escapeHtml(activeDest === 'all' ? 'Overall Platform Rating' : activeDest + ' Rating')}</p>
            <div class="reviews-score-number">${total > 0 ? avg.toFixed(1) : '—'} <span class="reviews-score-denom">/ 5.0</span></div>
            <p class="reviews-stars-display" aria-label="Average rating">${total > 0 ? renderStarString(avg) : '☆☆☆☆☆'}</p>
            <p class="reviews-score-sub">${total} review${total === 1 ? '' : 's'} (${supabaseReviews.length} Supabase, ${getUserReviews().length} local, ${DEMO_REVIEWS.length} sample)</p>
          </div>
          <div class="reviews-bars-col">
            ${dist
              .map(
                (row) => `
              <div class="rating-bar-row">
                <span class="rating-bar-label">${row.star} ★</span>
                <div class="rating-bar-track" aria-hidden="true">
                  <div class="rating-bar-fill" style="width: ${row.pct}%;"></div>
                </div>
                <span class="rating-bar-count">${row.count}</span>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `;
    }

    const minRating = reviewsFilterRating ? Number(reviewsFilterRating.value) : 0;
    const sortBy = reviewsSortSelect ? reviewsSortSelect.value : 'newest';

    const filtered = all.filter((r) => {
      const destOk = activeDest === 'all' || r.destination === activeDest;
      const ratingOk = Number(r.rating) >= minRating;
      return destOk && ratingOk;
    });

    if (sortBy === 'highest') {
      filtered.sort((a, b) => Number(b.rating) - Number(a.rating) || String(b.date).localeCompare(String(a.date)));
    } else if (sortBy === 'lowest') {
      filtered.sort((a, b) => Number(a.rating) - Number(b.rating) || String(b.date).localeCompare(String(a.date)));
    } else {
      filtered.sort((a, b) => String(b.date).localeCompare(String(a.date)));
    }

    if (reviewsEmptyState) reviewsEmptyState.hidden = filtered.length > 0;
    if (!reviewsFeed) return;

    reviewsFeed.innerHTML = filtered
      .map(
        (rev) => {
          const sourceBadge =
            rev.source === 'supabase'
              ? 'Verified Account Review'
              : rev.source === 'user'
                ? 'Saved Locally in Browser'
                : 'Demonstration Review (Sample Data)';
          const canDelete = rev.source === 'user' || (rev.source === 'supabase' && rev.isOwner);
          return `
        <article class="review-card">
          <div class="review-card-top">
            <div>
              <p class="review-card-meta">
                <span>${escapeHtml(rev.destination)}</span>
                <span aria-hidden="true">&middot;</span>
                <span>${escapeHtml(rev.tripType)}</span>
                <span aria-hidden="true">&middot;</span>
                <span>${escapeHtml(rev.date)}</span>
                <span aria-hidden="true">&middot;</span>
                <span>${sourceBadge}</span>
              </p>
              <h4 class="review-card-title">${escapeHtml(rev.title)}</h4>
            </div>
            <div class="review-card-stars" aria-label="${Number(rev.rating)} out of 5 stars">
              ${renderStarString(rev.rating)}
            </div>
          </div>
          <p class="review-card-body">${escapeHtml(rev.comment)}</p>
          ${
            rev.ecoTip
              ? `<p class="review-eco-note"><strong>Responsible Tip:</strong> ${escapeHtml(rev.ecoTip)}</p>`
              : ''
          }
          <div class="review-card-footer">
            <span class="review-author-name">— ${escapeHtml(rev.author)}</span>
            ${
              canDelete
                ? `<button type="button" class="btn-link" data-delete-review="${escapeHtml(rev.id)}" data-review-source="${escapeHtml(rev.source)}">Delete Review</button>`
                : ''
            }
          </div>
        </article>
      `;
        }
      )
      .join('');

    reviewsFeed.querySelectorAll('[data-delete-review]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const revId = btn.dataset.deleteReview;
        const src = btn.dataset.reviewSource;
        if (src === 'supabase' && window.YatraSupabase && window.YatraSupabase.isAuthenticated()) {
          const delRes = await window.YatraSupabase.rest.remove('reviews', `id=eq.${encodeURIComponent(revId)}`);
          if (!delRes.error) {
            supabaseReviews = supabaseReviews.filter((r) => r.id !== revId);
            renderReviews();
            showToast('Deleted your review from Supabase.');
            return;
          }
        }
        const next = getUserReviews().filter((r) => r.id !== revId);
        writeStorageJson(REVIEWS_KEY, next);
        renderReviews();
        showToast('Removed your local review.');
      });
    });
  }

  if (reviewsFilterDest) reviewsFilterDest.addEventListener('change', renderReviews);
  if (reviewsFilterRating) reviewsFilterRating.addEventListener('change', renderReviews);
  if (reviewsSortSelect) reviewsSortSelect.addEventListener('change', renderReviews);
  if (reviewsResetBtn) {
    reviewsResetBtn.addEventListener('click', () => {
      if (reviewsFilterDest) reviewsFilterDest.value = 'all';
      if (reviewsFilterRating) reviewsFilterRating.value = '0';
      if (reviewsSortSelect) reviewsSortSelect.value = 'newest';
      renderReviews();
    });
  }

  if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (reviewFormError) {
        reviewFormError.hidden = true;
        reviewFormError.textContent = '';
      }

      const destination = reviewDestSelect ? reviewDestSelect.value : 'Kashmir';
      const author = reviewAuthorInput ? reviewAuthorInput.value.trim() : '';
      const tripType = reviewTripTypeSelect ? reviewTripTypeSelect.value : 'Solo';
      const title = reviewTitleInput ? reviewTitleInput.value.trim() : '';
      const comment = reviewCommentInput ? reviewCommentInput.value.trim() : '';
      const ecoTip = reviewEcoInput ? reviewEcoInput.value.trim() : '';

      if (author.length < 2) {
        if (reviewFormError) {
          reviewFormError.textContent = 'Please enter your name (at least 2 characters).';
          reviewFormError.hidden = false;
        }
        return;
      }
      if (title.length < 4) {
        if (reviewFormError) {
          reviewFormError.textContent = 'Please enter a short review headline (at least 4 characters).';
          reviewFormError.hidden = false;
        }
        return;
      }
      if (comment.length < 15) {
        if (reviewFormError) {
          reviewFormError.textContent = 'Please share a helpful review of at least 15 characters.';
          reviewFormError.hidden = false;
        }
        return;
      }

      const supa = window.YatraSupabase;
      const destId = findDestinationIdByName(destination);

      if (supa && supa.isAuthenticated() && destId) {
        const sess = supa.auth.getSession();
        const insertRes = await supa.rest.insert('reviews', [
          {
            user_id: sess.user.id,
            destination_id: destId,
            reviewer_name: author,
            trip_type: tripType,
            review_title: title,
            eco_tip: ecoTip,
            rating: selectedStarValue,
            review_text: comment
          }
        ]);

        if (!insertRes.error && Array.isArray(insertRes.data) && insertRes.data[0]) {
          await loadSupabaseReviews();
          if (reviewTitleInput) reviewTitleInput.value = '';
          if (reviewCommentInput) reviewCommentInput.value = '';
          if (reviewEcoInput) reviewEcoInput.value = '';
          setStarPicker(5);
          if (reviewsFilterDest && reviewsFilterDest.value !== 'all' && reviewsFilterDest.value !== destination) {
            reviewsFilterDest.value = destination;
          }
          renderReviews();
          showToast(`Published your ${selectedStarValue}-star review for ${destination} to Supabase.`);
          return;
        }
      }

      const newReview = {
        id: 'user-rev-' + Date.now(),
        destination,
        author,
        tripType,
        rating: selectedStarValue,
        title,
        comment,
        ecoTip,
        date: new Date().toISOString().slice(0, 10),
        source: 'user'
      };

      const existing = getUserReviews();
      existing.unshift(newReview);
      writeStorageJson(REVIEWS_KEY, existing);

      if (reviewTitleInput) reviewTitleInput.value = '';
      if (reviewCommentInput) reviewCommentInput.value = '';
      if (reviewEcoInput) reviewEcoInput.value = '';
      setStarPicker(5);

      if (reviewsFilterDest && reviewsFilterDest.value !== 'all' && reviewsFilterDest.value !== destination) {
        reviewsFilterDest.value = destination;
      }
      renderReviews();
      showToast(`Published your ${newReview.rating}-star review for ${destination} locally.`);
    });
  }

  populateReviewDestinationSelects();

  const initParams = new URLSearchParams(window.location.search);
  const initTab = initParams.get('tab') || 'gems';
  const initDest = initParams.get('dest');
  switchGuidesTab(initTab, false);

  if (initDest) {
    if (reviewsFilterDest) {
      const opt = Array.from(reviewsFilterDest.options).find(
        (o) => o.value.toLowerCase() === initDest.toLowerCase()
      );
      if (opt) reviewsFilterDest.value = opt.value;
    }
    if (reviewDestSelect) {
      const opt2 = Array.from(reviewDestSelect.options).find(
        (o) => o.value.toLowerCase() === initDest.toLowerCase()
      );
      if (opt2) reviewDestSelect.value = opt2.value;
    }
  }

  renderReviews();
  loadSupabaseReviews();
});
