/**
 * Yatra Sphere — Google Maps Trip Route Planner
 * Pure Vanilla JavaScript (ES6+) — Official URL-based Google Maps integration
 * supporting Origin, Intermediate Stops (waypoints), Destination, Travel Modes,
 * Participants, Travel Date, Round Trips, Swap, Copy & Validation.
 */

'use strict';

(function (global) {
  const MAX_INTERMEDIATE_STOPS = 8;

  function getTodayIsoLocal() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function formatDisplayDate(isoDate) {
    if (!isoDate) return 'Not selected';
    const parts = String(isoDate).split('-');
    if (parts.length !== 3) return isoDate;
    const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (Number.isNaN(dateObj.getTime())) return isoDate;
    return dateObj.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  function normalizeWaypoints(waypoints) {
    if (!Array.isArray(waypoints)) return [];
    return waypoints
      .map((s) => String(s || '').trim())
      .filter(Boolean);
  }

  function buildDirectionsUrl(origin, destination, travelMode, waypoints) {
    let url =
      'https://www.google.com/maps/dir/?api=1' +
      '&origin=' + encodeURIComponent(String(origin || '').trim()) +
      '&destination=' + encodeURIComponent(String(destination || '').trim());

    const cleanStops = normalizeWaypoints(waypoints);
    if (cleanStops.length > 0) {
      url += '&waypoints=' + encodeURIComponent(cleanStops.join('|'));
    }

    url += '&travelmode=' + encodeURIComponent(travelMode || 'driving');
    return url;
  }

  function buildLocationSearchUrl(location) {
    return (
      'https://www.google.com/maps/search/?api=1' +
      '&query=' + encodeURIComponent(String(location || '').trim())
    );
  }

  function safeOpenGoogleMaps(url) {
    const win = global.open(url, '_blank', 'noopener,noreferrer');
    if (win) {
      try {
        win.opener = null;
      } catch (_err) {
        // Cross-origin opener assignment may throw in some browsers
      }
    }
    return Boolean(win);
  }

  const MODE_LABELS = {
    driving: 'Driving',
    walking: 'Walking',
    bicycling: 'Cycling',
    transit: 'Transit'
  };

  function initRoutePlanner() {
    const form = document.getElementById('rp-form');
    if (!form) return;

    const originInput = document.getElementById('rp-origin');
    const destInput = document.getElementById('rp-destination');
    const dateInput = document.getElementById('rp-date');
    const totalInput = document.getElementById('rp-total-participants');
    const adultsInput = document.getElementById('rp-adults');
    const childrenInput = document.getElementById('rp-children');

    const totalDecBtn = document.getElementById('rp-total-dec');
    const totalIncBtn = document.getElementById('rp-total-inc');
    const adultsDecBtn = document.getElementById('rp-adults-dec');
    const adultsIncBtn = document.getElementById('rp-adults-inc');
    const childrenDecBtn = document.getElementById('rp-children-dec');
    const childrenIncBtn = document.getElementById('rp-children-inc');

    // Intermediate stops controls
    const addStopBtn = document.getElementById('rp-add-stop-btn');
    const stopsListEl = document.getElementById('rp-stops-list');
    const stopsCountEl = document.getElementById('rp-stops-count');

    const swapBtn = document.getElementById('rp-swap-btn');
    const resetBtn = document.getElementById('rp-reset-btn');
    const copyBtn = document.getElementById('rp-copy-btn');
    const openOriginBtn = document.getElementById('rp-open-origin-btn');
    const openDestBtn = document.getElementById('rp-open-dest-btn');
    const openRouteBtn = document.getElementById('rp-open-route-btn');
    const openReturnBtn = document.getElementById('rp-open-return-btn');
    const saveRouteBtn = document.getElementById('rp-save-route-btn');

    const errorBanner = document.getElementById('rp-error-banner');
    const membersBadgeEl = document.getElementById('rp-members-readout');
    const destSuggestionsList = document.getElementById('rp-dest-suggestions');

    // Summary DOM Elements
    const sumHeadlineEl = document.getElementById('rp-sum-headline');
    const sumOriginEl = document.getElementById('rp-sum-origin');
    const sumStopsEl = document.getElementById('rp-sum-stops');
    const sumDestEl = document.getElementById('rp-sum-dest');
    const sumParticipantsEl = document.getElementById('rp-sum-participants');
    const sumDateEl = document.getElementById('rp-sum-date');
    const sumModeEl = document.getElementById('rp-sum-mode');
    const sumTripTypeEl = document.getElementById('rp-sum-trip-type');
    const sumPrefEl = document.getElementById('rp-sum-preference');
    const returnCardEl = document.getElementById('rp-return-card');
    const returnOriginEl = document.getElementById('rp-return-origin');
    const returnDestEl = document.getElementById('rp-return-dest');
    const directLinksBox = document.getElementById('rp-direct-links-box');
    const directOutboundLink = document.getElementById('rp-direct-outbound-link');
    const directReturnLink = document.getElementById('rp-direct-return-link');

    const toastEl = document.getElementById('toast');
    let toastTimer = null;

    // Stateful array of intermediate stops
    let intermediateStops = [];

    function notify(msg) {
      if (!toastEl) return;
      toastEl.textContent = msg;
      toastEl.hidden = false;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toastEl.hidden = true;
      }, 3400);
    }

    function escapeHtml(str) {
      return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function showError(msg, focusEl) {
      if (errorBanner) {
        errorBanner.textContent = msg;
        errorBanner.hidden = false;
      }
      if (focusEl && typeof focusEl.focus === 'function') {
        focusEl.focus();
      }
    }

    function clearError() {
      if (errorBanner) {
        errorBanner.textContent = '';
        errorBanner.hidden = true;
      }
    }

    // Populate destination datalist suggestions dynamically from destinations-data.js
    if (destSuggestionsList) {
      const destinations = Array.isArray(global.YATRA_DESTINATIONS) ? global.YATRA_DESTINATIONS : [];
      const gems = Array.isArray(global.YATRA_HIDDEN_GEMS) ? global.YATRA_HIDDEN_GEMS : [];
      const landmarks = [
        'New Delhi',
        'Mumbai',
        'Goa',
        'Agra',
        'Manali, Himachal Pradesh',
        'Jaipur, Rajasthan',
        'Patna, Bihar',
        'Taj Mahal, Agra',
        'Dal Lake, Srinagar',
        'Amber Fort, Jaipur',
        'India Gate, New Delhi',
        'Calangute Beach, Goa',
        'Marine Drive, Mumbai'
      ];
      const names = Array.from(
        new Set([
          ...destinations.map((d) => d.name),
          ...gems.map((g) => g.name),
          ...landmarks
        ])
      );
      destSuggestionsList.innerHTML = names
        .map((item) => `<option value="${escapeHtml(item)}"></option>`)
        .join('');
    }

    // Enforce min today on date picker
    const todayIso = getTodayIsoLocal();
    if (dateInput) {
      dateInput.min = todayIso;
      if (!dateInput.value || dateInput.value < todayIso) {
        dateInput.value = todayIso;
      }
    }

    // =========================================================================
    // Intermediate Stops / Waypoints Management
    // =========================================================================
    function renderStopsList() {
      if (stopsCountEl) {
        stopsCountEl.textContent =
          intermediateStops.length === 0
            ? 'Direct route (0 stops)'
            : `${intermediateStops.length} stop${intermediateStops.length === 1 ? '' : 's'} added`;
      }
      if (addStopBtn) {
        addStopBtn.disabled = intermediateStops.length >= MAX_INTERMEDIATE_STOPS;
      }
      if (!stopsListEl) return;

      if (intermediateStops.length === 0) {
        stopsListEl.innerHTML =
          '<p class="rp-stops-empty">No intermediate stops added yet. Click <strong>+ Add Stop</strong> to include stopovers along your route.</p>';
        return;
      }

      stopsListEl.innerHTML = intermediateStops
        .map(
          (stopVal, idx) => `
          <div class="rp-stop-row" data-stop-index="${idx}">
            <span class="rp-stop-badge">Stop ${idx + 1}</span>
            <label for="rp-stop-input-${idx}" class="sr-only">Intermediate stop ${idx + 1}</label>
            <input
              type="text"
              id="rp-stop-input-${idx}"
              class="rp-stop-input"
              list="rp-dest-suggestions"
              value="${escapeHtml(stopVal)}"
              data-stop-input="${idx}"
              placeholder="Enter stopover city, landmark, or address..."
              autocomplete="off"
            />
            <div class="rp-stop-actions">
              <button
                type="button"
                class="rp-stop-move-btn"
                data-stop-up="${idx}"
                aria-label="Move stop ${idx + 1} up"
                title="Move Up"
                ${idx === 0 ? 'disabled' : ''}
              >&uarr;</button>
              <button
                type="button"
                class="rp-stop-move-btn"
                data-stop-down="${idx}"
                aria-label="Move stop ${idx + 1} down"
                title="Move Down"
                ${idx === intermediateStops.length - 1 ? 'disabled' : ''}
              >&darr;</button>
              <button
                type="button"
                class="rp-stop-remove-btn"
                data-stop-remove="${idx}"
                aria-label="Remove stop ${idx + 1}"
                title="Remove Stop"
              >&times;</button>
            </div>
          </div>
        `
        )
        .join('');

      stopsListEl.querySelectorAll('[data-stop-input]').forEach((inputEl) => {
        inputEl.addEventListener('input', (e) => {
          const idx = Number(e.target.dataset.stopInput);
          intermediateStops[idx] = e.target.value;
          clearError();
          updateSummary();
        });
      });

      stopsListEl.querySelectorAll('[data-stop-up]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.dataset.stopUp);
          if (idx <= 0) return;
          const tmp = intermediateStops[idx - 1];
          intermediateStops[idx - 1] = intermediateStops[idx];
          intermediateStops[idx] = tmp;
          renderStopsList();
          updateSummary();
        });
      });

      stopsListEl.querySelectorAll('[data-stop-down]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.dataset.stopDown);
          if (idx >= intermediateStops.length - 1) return;
          const tmp = intermediateStops[idx + 1];
          intermediateStops[idx + 1] = intermediateStops[idx];
          intermediateStops[idx] = tmp;
          renderStopsList();
          updateSummary();
        });
      });

      stopsListEl.querySelectorAll('[data-stop-remove]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.dataset.stopRemove);
          intermediateStops.splice(idx, 1);
          clearError();
          renderStopsList();
          updateSummary();
        });
      });
    }

    if (addStopBtn) {
      addStopBtn.addEventListener('click', () => {
        if (intermediateStops.length >= MAX_INTERMEDIATE_STOPS) {
          showError(`You can add up to ${MAX_INTERMEDIATE_STOPS} intermediate stops per Google Maps route.`, addStopBtn);
          return;
        }
        intermediateStops.push('');
        clearError();
        renderStopsList();
        updateSummary();
        const newInput = document.getElementById(`rp-stop-input-${intermediateStops.length - 1}`);
        if (newInput) newInput.focus();
      });
    }

    function getSelectedRadio(name, fallback) {
      const checked = form.querySelector(`input[name="${name}"]:checked`);
      return checked ? checked.value : fallback;
    }

    function parseStrictInt(inputEl) {
      if (!inputEl) return NaN;
      const raw = String(inputEl.value).trim();
      if (!/^\d+$/.test(raw)) return NaN;
      return Number(raw);
    }

    function syncFromAdultsOrChildren() {
      const adults = parseStrictInt(adultsInput);
      const children = parseStrictInt(childrenInput);
      if (!Number.isNaN(adults) && adults >= 1 && !Number.isNaN(children) && children >= 0) {
        if (totalInput) totalInput.value = String(adults + children);
      }
      updateSummary();
    }

    function syncFromTotal() {
      const total = parseStrictInt(totalInput);
      if (Number.isNaN(total) || total < 1) {
        updateSummary();
        return;
      }
      let children = parseStrictInt(childrenInput);
      if (Number.isNaN(children) || children < 0) children = 0;
      if (children >= total) {
        children = Math.max(0, total - 1);
        if (childrenInput) childrenInput.value = String(children);
      }
      const adults = Math.max(1, total - children);
      if (adultsInput) adultsInput.value = String(adults);
      updateSummary();
    }

    function validateParticipants() {
      const total = parseStrictInt(totalInput);
      const adults = parseStrictInt(adultsInput);
      const children = parseStrictInt(childrenInput);

      if (Number.isNaN(total) || total < 1) {
        showError('Total participants must be a positive whole number (minimum 1).', totalInput);
        return null;
      }
      if (Number.isNaN(adults) || adults < 1) {
        showError('Number of adults must be a positive whole number (at least 1 adult).', adultsInput);
        return null;
      }
      if (Number.isNaN(children) || children < 0) {
        showError('Number of children must be 0 or a positive whole number.', childrenInput);
        return null;
      }
      if (adults + children !== total) {
        if (totalInput) totalInput.value = String(adults + children);
      }
      return {
        total: adults + children,
        adults,
        children
      };
    }

    function validateAllInputs() {
      clearError();
      const origin = originInput ? originInput.value.trim() : '';
      const destination = destInput ? destInput.value.trim() : '';

      if (!origin) {
        showError('Please enter your starting destination (city, station, or address).', originInput);
        return null;
      }
      if (!destination) {
        showError('Please enter your ending destination (city, attraction, or address).', destInput);
        return null;
      }

      // Validate added stopover rows so empty rows are caught clearly
      for (let i = 0; i < intermediateStops.length; i += 1) {
        if (!String(intermediateStops[i] || '').trim()) {
          const stopEl = document.getElementById(`rp-stop-input-${i}`);
          showError(`Please enter a location for Stop ${i + 1} or remove the empty stop.`, stopEl);
          return null;
        }
      }

      const cleanStops = normalizeWaypoints(intermediateStops);
      if (cleanStops.length === 0 && origin.toLowerCase() === destination.toLowerCase()) {
        showError('Starting destination and ending destination cannot be identical unless intermediate stops are added.', destInput);
        return null;
      }

      const participants = validateParticipants();
      if (!participants) return null;

      const currentToday = getTodayIsoLocal();
      const dateVal = dateInput ? dateInput.value : '';
      if (!dateVal) {
        showError('Please select a travel date.', dateInput);
        return null;
      }
      if (dateVal < currentToday) {
        showError('Travel date cannot be in the past. Please choose today or a future date.', dateInput);
        return null;
      }

      const travelMode = getSelectedRadio('rpTravelMode', 'driving');
      const tripType = getSelectedRadio('rpTripType', 'One Way');
      const preference = getSelectedRadio('rpPreference', 'Solo Trip');

      return {
        origin,
        destination,
        waypoints: cleanStops,
        participants,
        date: dateVal,
        travelMode,
        tripType,
        preference
      };
    }

    function updateSummary() {
      const origin = originInput ? originInput.value.trim() : '';
      const destination = destInput ? destInput.value.trim() : '';
      const cleanStops = normalizeWaypoints(intermediateStops);
      const travelMode = getSelectedRadio('rpTravelMode', 'driving');
      const tripType = getSelectedRadio('rpTripType', 'One Way');
      const preference = getSelectedRadio('rpPreference', 'Solo Trip');
      const dateVal = dateInput ? dateInput.value : '';

      const rawAdults = parseStrictInt(adultsInput);
      const rawChildren = parseStrictInt(childrenInput);
      const rawTotal = parseStrictInt(totalInput);

      const validAdults = !Number.isNaN(rawAdults) && rawAdults >= 1 ? rawAdults : null;
      const validChildren = !Number.isNaN(rawChildren) && rawChildren >= 0 ? rawChildren : null;
      const validTotal = !Number.isNaN(rawTotal) && rawTotal >= 1 ? rawTotal : null;

      if (membersBadgeEl) {
        membersBadgeEl.textContent =
          validAdults !== null && validChildren !== null
            ? `${validAdults + validChildren} Total Travelling Member${validAdults + validChildren === 1 ? '' : 's'} (${validAdults} Adult${validAdults === 1 ? '' : 's'}${validChildren > 0 ? ', ' + validChildren + (validChildren === 1 ? ' Child' : ' Children') : ''})`
            : 'Enter valid whole numbers (min 1)';
      }

      if (sumHeadlineEl) {
        const stopPart = cleanStops.length > 0 ? ` → ${cleanStops.join(' → ')}` : '';
        if (origin && destination) {
          sumHeadlineEl.textContent =
            tripType === 'Round Trip' && cleanStops.length === 0
              ? `${origin} ⇄ ${destination}`
              : `${origin}${stopPart} → ${destination}`;
        } else if (origin) {
          sumHeadlineEl.textContent = `${origin}${stopPart} → Select ending destination`;
        } else if (destination) {
          sumHeadlineEl.textContent = `Select start${stopPart} → ${destination}`;
        } else {
          sumHeadlineEl.textContent = 'Enter starting & ending destinations';
        }
      }

      if (sumOriginEl) sumOriginEl.textContent = origin || 'Not entered yet';
      if (sumStopsEl) {
        sumStopsEl.textContent = cleanStops.length > 0 ? cleanStops.join(' → ') : 'None (Direct route)';
      }
      if (sumDestEl) sumDestEl.textContent = destination || 'Not entered yet';

      if (sumParticipantsEl) {
        if (validTotal !== null && validAdults !== null && validChildren !== null) {
          const sumMembers = validAdults + validChildren;
          sumParticipantsEl.textContent = `${sumMembers} (${validAdults} Adult${validAdults === 1 ? '' : 's'}, ${validChildren} ${validChildren === 1 ? 'Child' : 'Children'})`;
        } else {
          sumParticipantsEl.textContent = 'Invalid participant count';
        }
      }

      if (sumDateEl) {
        const currentToday = getTodayIsoLocal();
        if (!dateVal) {
          sumDateEl.textContent = 'Not selected';
        } else if (dateVal < currentToday) {
          sumDateEl.textContent = `${formatDisplayDate(dateVal)} (Past date — please update)`;
        } else {
          sumDateEl.textContent = formatDisplayDate(dateVal);
        }
      }

      if (sumModeEl) {
        const label = MODE_LABELS[travelMode] || 'Driving';
        sumModeEl.textContent = `${label} (${travelMode})`;
      }
      if (sumTripTypeEl) sumTripTypeEl.textContent = tripType;
      if (sumPrefEl) sumPrefEl.textContent = preference;

      const isRoundTrip = tripType === 'Round Trip';
      if (returnCardEl) returnCardEl.hidden = !isRoundTrip;
      const reversedStops = [...cleanStops].reverse();
      if (returnOriginEl) {
        returnOriginEl.textContent =
          (destination || 'Ending Destination') +
          (reversedStops.length > 0 ? ` → ${reversedStops.join(' → ')}` : '');
      }
      if (returnDestEl) returnDestEl.textContent = origin || 'Starting Destination';

      if (directLinksBox && directOutboundLink && directReturnLink) {
        const canLink = Boolean(origin && destination && (cleanStops.length > 0 || origin.toLowerCase() !== destination.toLowerCase()));
        if (canLink) {
          directLinksBox.hidden = false;
          directOutboundLink.href = buildDirectionsUrl(origin, destination, travelMode, cleanStops);
          if (isRoundTrip) {
            directReturnLink.hidden = false;
            directReturnLink.href = buildDirectionsUrl(destination, origin, travelMode, reversedStops);
          } else {
            directReturnLink.hidden = true;
          }
        } else {
          directLinksBox.hidden = true;
        }
      }
    }

    // Participant +/- steppers
    if (totalDecBtn && totalInput) {
      totalDecBtn.addEventListener('click', () => {
        const current = parseStrictInt(totalInput) || 1;
        totalInput.value = String(Math.max(1, current - 1));
        syncFromTotal();
        clearError();
      });
    }
    if (totalIncBtn && totalInput) {
      totalIncBtn.addEventListener('click', () => {
        const current = parseStrictInt(totalInput) || 1;
        totalInput.value = String(current + 1);
        syncFromTotal();
        clearError();
      });
    }

    if (adultsDecBtn && adultsInput) {
      adultsDecBtn.addEventListener('click', () => {
        const current = parseStrictInt(adultsInput) || 1;
        adultsInput.value = String(Math.max(1, current - 1));
        syncFromAdultsOrChildren();
        clearError();
      });
    }
    if (adultsIncBtn && adultsInput) {
      adultsIncBtn.addEventListener('click', () => {
        const current = parseStrictInt(adultsInput) || 1;
        adultsInput.value = String(current + 1);
        syncFromAdultsOrChildren();
        clearError();
      });
    }

    if (childrenDecBtn && childrenInput) {
      childrenDecBtn.addEventListener('click', () => {
        const current = parseStrictInt(childrenInput);
        childrenInput.value = String(Math.max(0, (Number.isNaN(current) ? 0 : current) - 1));
        syncFromAdultsOrChildren();
        clearError();
      });
    }
    if (childrenIncBtn && childrenInput) {
      childrenIncBtn.addEventListener('click', () => {
        const current = parseStrictInt(childrenInput);
        childrenInput.value = String((Number.isNaN(current) ? 0 : current) + 1);
        syncFromAdultsOrChildren();
        clearError();
      });
    }

    if (totalInput) totalInput.addEventListener('input', syncFromTotal);
    if (adultsInput) adultsInput.addEventListener('input', syncFromAdultsOrChildren);
    if (childrenInput) childrenInput.addEventListener('input', syncFromAdultsOrChildren);

    [originInput, destInput, dateInput].forEach((el) => {
      if (!el) return;
      el.addEventListener('input', () => {
        clearError();
        updateSummary();
      });
      el.addEventListener('change', () => {
        clearError();
        updateSummary();
      });
    });

    form.querySelectorAll('input[type="radio"]').forEach((radio) => {
      radio.addEventListener('change', () => {
        clearError();
        updateSummary();
      });
    });

    // Quick route presets (supports 2 parts "Origin|Dest" or 3+ parts "Origin|Stop1|...|Dest")
    document.querySelectorAll('[data-rp-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const parts = String(btn.dataset.rpPreset || '').split('|').map((s) => s.trim()).filter(Boolean);
        if (parts.length >= 2) {
          if (originInput) originInput.value = parts[0];
          if (destInput) destInput.value = parts[parts.length - 1];
          intermediateStops = parts.length > 2 ? parts.slice(1, -1) : [];
          clearError();
          renderStopsList();
          updateSummary();
          notify(`Loaded route: ${parts.join(' → ')}`);
        }
      });
    });

    // Swap Locations (also reverses intermediate stops order cleanly)
    if (swapBtn) {
      swapBtn.addEventListener('click', () => {
        const a = originInput ? originInput.value : '';
        const b = destInput ? destInput.value : '';
        if (originInput) originInput.value = b;
        if (destInput) destInput.value = a;
        if (intermediateStops.length > 1) {
          intermediateStops.reverse();
          renderStopsList();
        }
        clearError();
        updateSummary();
        notify('Swapped starting and ending destinations.');
      });
    }

    // Reset Form
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (originInput) originInput.value = '';
        if (destInput) destInput.value = '';
        intermediateStops = [];
        renderStopsList();
        if (totalInput) totalInput.value = '1';
        if (adultsInput) adultsInput.value = '1';
        if (childrenInput) childrenInput.value = '0';
        if (dateInput) {
          const freshToday = getTodayIsoLocal();
          dateInput.min = freshToday;
          dateInput.value = freshToday;
        }
        const defaultMode = form.querySelector('input[name="rpTravelMode"][value="driving"]');
        if (defaultMode) defaultMode.checked = true;
        const defaultTripType = form.querySelector('input[name="rpTripType"][value="One Way"]');
        if (defaultTripType) defaultTripType.checked = true;
        const defaultPref = form.querySelector('input[name="rpPreference"][value="Solo Trip"]');
        if (defaultPref) defaultPref.checked = true;
        clearError();
        updateSummary();
        notify('Route planner form reset to defaults.');
      });
    }

    // Open Starting Destination in Google Maps
    if (openOriginBtn) {
      openOriginBtn.addEventListener('click', () => {
        clearError();
        const origin = originInput ? originInput.value.trim() : '';
        if (!origin) {
          showError('Please enter a starting destination first to view it in Google Maps.', originInput);
          return;
        }
        const url = buildLocationSearchUrl(origin);
        safeOpenGoogleMaps(url);
        notify(`Opened "${origin}" in Google Maps.`);
      });
    }

    // Open Ending Destination in Google Maps
    if (openDestBtn) {
      openDestBtn.addEventListener('click', () => {
        clearError();
        const dest = destInput ? destInput.value.trim() : '';
        if (!dest) {
          showError('Please enter an ending destination first to view it in Google Maps.', destInput);
          return;
        }
        const url = buildLocationSearchUrl(dest);
        safeOpenGoogleMaps(url);
        notify(`Opened "${dest}" in Google Maps.`);
      });
    }

    // Show Route on Google Maps
    function handleShowRoute() {
      const data = validateAllInputs();
      if (!data) return;
      const url = buildDirectionsUrl(data.origin, data.destination, data.travelMode, data.waypoints);
      const opened = safeOpenGoogleMaps(url);
      const routeChain = [data.origin, ...data.waypoints, data.destination].join(' → ');
      if (opened) {
        notify(`Showing ${MODE_LABELS[data.travelMode] || 'Driving'} route: ${routeChain}`);
      } else {
        notify('Popup blocked — use the direct Google Maps link shown in the Journey Summary card.');
      }
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleShowRoute();
    });

    if (openRouteBtn) {
      openRouteBtn.addEventListener('click', handleShowRoute);
    }

    const KNOWN_STOP_COORDS = {
      'new delhi': [28.6139, 77.209],
      delhi: [28.6139, 77.209],
      mumbai: [19.076, 72.8777],
      goa: [15.2993, 74.124],
      jaipur: [26.9124, 75.7873],
      agra: [27.1767, 78.0081],
      manali: [32.2432, 77.1892],
      chandigarh: [30.7333, 76.7794],
      shimla: [31.1048, 77.1734],
      srinagar: [34.0837, 74.7973],
      kashmir: [34.0837, 74.7973],
      gulmarg: [34.0484, 74.3805],
      leh: [34.1526, 77.5771],
      ladakh: [34.1526, 77.5771],
      rishikesh: [30.0869, 78.2676],
      varanasi: [25.3176, 82.9739],
      udaipur: [24.5854, 73.7125],
      amritsar: [31.634, 74.8723],
      hampi: [15.335, 76.46],
      coorg: [12.3375, 75.8069],
      shillong: [25.5788, 91.8933],
      meghalaya: [25.5788, 91.8933],
      kerala: [9.4981, 76.3388],
      kochi: [9.9312, 76.2673],
      bengaluru: [12.9716, 77.5946],
      hyderabad: [17.385, 78.4867],
      kolkata: [22.5726, 88.3639],
      chennai: [13.0827, 80.2707],
      patna: [25.5941, 85.1376]
    };

    function resolveStopCoords(stopName) {
      const lower = String(stopName || '').trim().toLowerCase();
      const key = Object.keys(KNOWN_STOP_COORDS).find((k) => lower === k || lower.includes(k));
      if (!key) return { latitude: null, longitude: null };
      return {
        latitude: KNOWN_STOP_COORDS[key][0],
        longitude: KNOWN_STOP_COORDS[key][1]
      };
    }

    if (saveRouteBtn) {
      saveRouteBtn.addEventListener('click', () => {
        const data = validateAllInputs();
        if (!data) return;

        const Store = global.YatraAccountStore;
        if (!Store || !Store.trips) {
          notify('Trip storage is unavailable right now.');
          return;
        }

        const sessRes = Store.auth ? Store.auth.getSession() : null;
        const userId =
          sessRes && sessRes.data && sessRes.data.session && sessRes.data.session.user
            ? sessRes.data.session.user.id
            : 'guest_local';

        const cleanTitle = `${data.origin} → ${data.destination} (${MODE_LABELS[data.travelMode] || 'Route'})`;
        const tripRecord = {
          id: `route_${Date.now()}`,
          userId,
          title: cleanTitle,
          status: 'upcoming',
          notes: `${data.tripType} · ${data.preference} · ${data.participants.adults} Adult(s), ${data.participants.children} Child(ren)`,
          createdAt: new Date().toISOString(),
          config: {
            origin: data.origin,
            destination: data.destination,
            startDate: data.date,
            days: data.tripType === 'Round Trip' ? 2 : 1,
            travelers: data.participants.total,
            budget: 15000,
            travelMode: data.travelMode,
            tripType: data.tripType,
            travelType: data.preference.replace(/\s*Trip$/i, '') || 'Solo',
            interests: ['Scenic Route']
          },
          stops: data.waypoints.map((stopName, idx) => {
            const coords = resolveStopCoords(stopName);
            return {
              stopName,
              stopOrder: idx + 1,
              latitude: coords.latitude,
              longitude: coords.longitude
            };
          }),
          days: []
        };

        Store.trips.saveTrip(tripRecord);
        const isSupa = Boolean(Store.isSupabaseSession && Store.isSupabaseSession());
        notify(
          isSupa
            ? `Saved route "${data.origin} → ${data.destination}" & ${data.waypoints.length} stop(s) to Supabase My Trips.`
            : `Saved route "${data.origin} → ${data.destination}" to My Trips (local browser). Sign in to sync with Supabase.`
        );
      });
    }

    // Open Return Route in Google Maps (Round Trip)
    if (openReturnBtn) {
      openReturnBtn.addEventListener('click', () => {
        const data = validateAllInputs();
        if (!data) return;
        const reversedStops = [...data.waypoints].reverse();
        const returnUrl = buildDirectionsUrl(data.destination, data.origin, data.travelMode, reversedStops);
        const opened = safeOpenGoogleMaps(returnUrl);
        if (opened) {
          notify(`Showing return route: ${[data.destination, ...reversedStops, data.origin].join(' → ')}`);
        } else {
          notify('Popup blocked — use the Return Route link in the Journey Summary card.');
        }
      });
    }

    // Copy Journey Details
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const data = validateAllInputs();
        if (!data) return;
        const outboundUrl = buildDirectionsUrl(data.origin, data.destination, data.travelMode, data.waypoints);
        const routeChain = [data.origin, ...data.waypoints, data.destination].join(' → ');
        const lines = [
          'Yatra Sphere — Trip Route Summary',
          `Route: ${routeChain}`,
          `Intermediate Stops: ${data.waypoints.length > 0 ? data.waypoints.join(', ') : 'None (Direct route)'}`,
          `Trip Type: ${data.tripType}`,
          `Preference: ${data.preference}`,
          `Travel Date: ${formatDisplayDate(data.date)}`,
          `Participants: ${data.participants.total} Total (${data.participants.adults} Adult${data.participants.adults === 1 ? '' : 's'}, ${data.participants.children} ${data.participants.children === 1 ? 'Child' : 'Children'})`,
          `Travel Mode: ${MODE_LABELS[data.travelMode] || 'Driving'}`,
          `Google Maps Directions: ${outboundUrl}`
        ];
        if (data.tripType === 'Round Trip') {
          const reversedStops = [...data.waypoints].reverse();
          const returnUrl = buildDirectionsUrl(data.destination, data.origin, data.travelMode, reversedStops);
          lines.push(`Return Route: ${[data.destination, ...reversedStops, data.origin].join(' → ')}`);
          lines.push(`Return Google Maps Directions: ${returnUrl}`);
        }
        const text = lines.join('\n');

        if (global.navigator && global.navigator.clipboard && global.navigator.clipboard.writeText) {
          global.navigator.clipboard.writeText(text).then(
            () => notify('Copied journey summary and Google Maps route link.'),
            () => notify('Journey summary ready — select the direct links to copy.')
          );
        } else {
          notify('Journey summary ready — select the direct links to copy.');
        }
      });
    }

    // Pre-fill from URL query parameters (?origin=...&dest=...&stops=...) if present
    const params = new URLSearchParams(global.location.search);
    const paramOrigin = params.get('origin');
    const paramDest = params.get('dest');
    const paramStops = params.get('stops');
    if (paramOrigin && originInput) originInput.value = paramOrigin;
    if (paramDest && destInput) destInput.value = paramDest;
    if (paramStops) {
      intermediateStops = paramStops.split('|').map((s) => s.trim()).filter(Boolean).slice(0, MAX_INTERMEDIATE_STOPS);
    }

    renderStopsList();
    updateSummary();
  }

  document.addEventListener('DOMContentLoaded', initRoutePlanner);

  global.YatraRoutePlanner = {
    buildDirectionsUrl,
    buildLocationSearchUrl
  };
})(window);
