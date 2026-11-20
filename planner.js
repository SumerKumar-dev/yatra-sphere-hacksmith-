/**
 * Yatra Sphere — Multi-Step AI Smart Trip Planner (Rule-Based Demo Engine)
 * Pure Vanilla JavaScript (ES6+) — No frameworks, external libraries, or exposed API keys.
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  if (!document.body.classList.contains('page-planner')) return;

  const SAVED_TRIPS_KEY = 'yatraSphere_savedTrips';
  const CATALOG = Array.isArray(window.YATRA_DESTINATIONS) ? window.YATRA_DESTINATIONS : [];

  // =========================================================================
  // 1. DOM References
  // =========================================================================
  const wizardCard = document.getElementById('planner-wizard-card');
  const form = document.getElementById('smart-planner-form');
  const stepTabs = document.querySelectorAll('.wizard-step-tab');
  const stepPanels = document.querySelectorAll('.wizard-panel');
  const nextBtns = document.querySelectorAll('[data-next-step]');
  const prevBtns = document.querySelectorAll('[data-prev-step]');
  const gotoStepBtns = document.querySelectorAll('[data-goto-step]');

  const originInput = document.getElementById('trip-origin');
  const destSelect = document.getElementById('trip-destination');
  const startDateInput = document.getElementById('trip-start-date');
  const daysInput = document.getElementById('trip-days');
  const travelersInput = document.getElementById('trip-travelers');
  const budgetInput = document.getElementById('trip-budget');
  const presetBtns = document.querySelectorAll('[data-budget-preset]');
  const reviewBox = document.getElementById('wizard-review-box');

  const step1Error = document.getElementById('step-1-error');
  const step2Error = document.getElementById('step-2-error');
  const step3Error = document.getElementById('step-3-error');

  const workspace = document.getElementById('itinerary-workspace');
  const itineraryTitle = document.getElementById('itinerary-title');
  const itinerarySubtitle = document.getElementById('itinerary-subtitle');
  const costSummaryStrip = document.getElementById('cost-summary-strip');
  const daysListEl = document.getElementById('itinerary-days-list');

  const editWizardBtn = document.getElementById('edit-wizard-btn');
  const regenerateBtn = document.getElementById('regenerate-itinerary-btn');
  const saveTripBtn = document.getElementById('save-trip-btn');
  const downloadDocBtn = document.getElementById('download-doc-btn');
  const printBtn = document.getElementById('print-itinerary-btn');

  const openSavedTripsBtn = document.getElementById('open-saved-trips-btn');
  const savedTripsCountEl = document.getElementById('saved-trips-count');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const toastEl = document.getElementById('toast');

  let currentStep = 1;
  let variantSeed = 0;
  let activeItinerary = null;
  let toastTimer = null;

  // =========================================================================
  // 2. Utility Helpers
  // =========================================================================
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

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.hidden = true;
    }, 3600);
  }

  function addDaysToDate(dateStr, offsetDays) {
    const parts = String(dateStr).split('-').map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return `Day ${offsetDays + 1}`;
    const d = new Date(parts[0], parts[1] - 1, parts[2] + offsetDays);
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  function getSelectedTravelType() {
    const checked = document.querySelector('input[name="travelType"]:checked');
    return checked ? checked.value : 'Friends';
  }

  function getSelectedInterests() {
    return Array.from(document.querySelectorAll('input[name="interests"]:checked')).map(
      (el) => el.value
    );
  }

  // =========================================================================
  // 3. Initialize Form Controls & URL Prefill
  // =========================================================================
  function populateDestinations() {
    if (!destSelect) return;
    destSelect.innerHTML = CATALOG.map(
      (dest) =>
        `<option value="${escapeHtml(dest.name)}">${escapeHtml(dest.name)} (${escapeHtml(dest.stateRegion)} · ${escapeHtml(dest.category)})</option>`
    ).join('');

    const params = new URLSearchParams(window.location.search);
    const requestedDest = params.get('dest');
    if (requestedDest) {
      const match = CATALOG.find(
        (d) =>
          d.name.toLowerCase() === requestedDest.toLowerCase() ||
          d.id.toLowerCase() === requestedDest.toLowerCase()
      );
      if (match) {
        destSelect.value = match.name;
      }
    }
  }

  function setDefaultStartDate() {
    if (!startDateInput) return;
    const future = new Date();
    future.setDate(future.getDate() + 14);
    const yyyy = future.getFullYear();
    const mm = String(future.getMonth() + 1).padStart(2, '0');
    const dd = String(future.getDate()).padStart(2, '0');
    startDateInput.value = `${yyyy}-${mm}-${dd}`;
  }

  function computeSuggestedBudget(tier) {
    const dest = CATALOG.find((d) => d.name === destSelect.value) || CATALOG[0];
    const basePerPerson = dest ? dest.estimatedBudget : 15000;
    const days = Math.max(1, Math.min(10, Number(daysInput.value) || 4));
    const travelers = Math.max(1, Math.min(12, Number(travelersInput.value) || 2));
    const dayRatio = days / 4;
    const tierFactor = tier === 'budget' ? 0.78 : tier === 'comfort' ? 1.38 : 1.05;
    const raw = basePerPerson * dayRatio * travelers * tierFactor;
    return Math.max(3000, Math.round(raw / 500) * 500);
  }

  populateDestinations();
  setDefaultStartDate();
  if (budgetInput) {
    budgetInput.value = String(computeSuggestedBudget('balanced'));
  }

  // Support deep-linking directly from Dashboard "Open in Planner" (?tripId=...)
  const requestedTripId = new URLSearchParams(window.location.search).get('tripId');
  if (requestedTripId) {
    const savedList = getSavedTrips();
    const foundTrip = savedList.find((t) => t.id === requestedTripId);
    if (foundTrip) {
      activeItinerary = JSON.parse(JSON.stringify(foundTrip));
      if (originInput && foundTrip.config) originInput.value = foundTrip.config.origin || 'New Delhi';
      if (destSelect && foundTrip.config) destSelect.value = foundTrip.config.destination || '';
      if (startDateInput && foundTrip.config) startDateInput.value = foundTrip.config.startDate || '';
      if (daysInput && foundTrip.config) daysInput.value = String(foundTrip.config.days || 4);
      if (travelersInput && foundTrip.config) travelersInput.value = String(foundTrip.config.travelers || 2);
      if (budgetInput && foundTrip.config) budgetInput.value = String(foundTrip.config.budget || 32000);
      renderItineraryWorkspace();
    }
  }

  presetBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tier = btn.dataset.budgetPreset || 'balanced';
      if (budgetInput) {
        budgetInput.value = String(computeSuggestedBudget(tier));
        showToast(`Applied ${tier} INR budget estimate for your group.`);
      }
    });
  });

  // Auto-adjust travelers to 1 if Solo is selected (user can still override afterward)
  document.querySelectorAll('input[name="travelType"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      if (radio.value === 'Solo' && travelersInput && Number(travelersInput.value) > 1) {
        travelersInput.value = '1';
      } else if (radio.value !== 'Solo' && travelersInput && Number(travelersInput.value) === 1) {
        travelersInput.value = '2';
      }
      updateReviewSummary();
    });
  });

  // =========================================================================
  // 4. Multi-Step Wizard Navigation & Validation
  // =========================================================================
  function showStepError(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.hidden = !msg;
  }

  function validateStep(stepNumber) {
    if (stepNumber === 1) {
      const origin = originInput ? originInput.value.trim() : '';
      const dest = destSelect ? destSelect.value : '';
      const startDate = startDateInput ? startDateInput.value : '';
      const days = Number(daysInput ? daysInput.value : 0);

      if (!origin) {
        showStepError(step1Error, 'Please enter a starting location.');
        if (originInput) originInput.focus();
        return false;
      }
      if (!dest) {
        showStepError(step1Error, 'Please choose a destination.');
        return false;
      }
      if (!startDate) {
        showStepError(step1Error, 'Please select a travel start date.');
        if (startDateInput) startDateInput.focus();
        return false;
      }
      if (Number.isNaN(days) || days < 1 || days > 10) {
        showStepError(step1Error, 'Number of days must be between 1 and 10.');
        if (daysInput) daysInput.focus();
        return false;
      }
      showStepError(step1Error, '');
      return true;
    }

    if (stepNumber === 2) {
      const travelers = Number(travelersInput ? travelersInput.value : 0);
      const budget = Number(budgetInput ? budgetInput.value : 0);

      if (Number.isNaN(travelers) || travelers < 1 || travelers > 12) {
        showStepError(step2Error, 'Number of travellers must be between 1 and 12.');
        if (travelersInput) travelersInput.focus();
        return false;
      }
      if (Number.isNaN(budget) || budget < 3000) {
        showStepError(step2Error, 'Total budget must be at least ₹3,000 INR.');
        if (budgetInput) budgetInput.focus();
        return false;
      }
      showStepError(step2Error, '');
      return true;
    }

    if (stepNumber === 3) {
      const interests = getSelectedInterests();
      if (interests.length === 0) {
        showStepError(step3Error, 'Select at least one travel interest to tailor your itinerary.');
        return false;
      }
      showStepError(step3Error, '');
      return true;
    }

    return true;
  }

  function updateReviewSummary() {
    if (!reviewBox) return;
    const origin = originInput ? originInput.value.trim() || 'Not specified' : '';
    const dest = destSelect ? destSelect.value : '';
    const startDate = startDateInput ? addDaysToDate(startDateInput.value, 0) : '';
    const days = Number(daysInput ? daysInput.value : 4);
    const travelers = Number(travelersInput ? travelersInput.value : 2);
    const budget = Number(budgetInput ? budgetInput.value : 0);
    const travelType = getSelectedTravelType();
    const interests = getSelectedInterests();

    reviewBox.innerHTML = `
      <h3 class="review-box-title">Trip Brief Summary</h3>
      <div class="review-grid">
        <div><span>Route</span><strong>${escapeHtml(origin)} &rarr; ${escapeHtml(dest)}</strong></div>
        <div><span>Schedule</span><strong>${escapeHtml(startDate)} (${days} Day${days === 1 ? '' : 's'})</strong></div>
        <div><span>Group</span><strong>${travelers} Traveller${travelers === 1 ? '' : 's'} &middot; ${escapeHtml(travelType)}</strong></div>
        <div><span>Target Budget</span><strong>${formatINR(budget)} total (${formatINR(budget / Math.max(1, travelers))}/person)</strong></div>
      </div>
      <p class="review-interests"><strong>Interests:</strong> ${interests.length ? escapeHtml(interests.join(', ')) : 'None selected yet'}</p>
    `;
  }

  function goToStep(targetStep) {
    currentStep = targetStep;
    stepPanels.forEach((panel) => {
      panel.hidden = Number(panel.dataset.stepPanel) !== targetStep;
    });
    stepTabs.forEach((tab) => {
      const num = Number(tab.dataset.stepIndicator);
      tab.classList.toggle('active', num === targetStep);
      tab.classList.toggle('completed', num < targetStep);
      const btn = tab.querySelector('.step-tab-btn');
      if (btn) {
        if (num === targetStep) btn.setAttribute('aria-current', 'step');
        else btn.removeAttribute('aria-current');
      }
    });
    if (targetStep === 3) {
      updateReviewSummary();
    }
  }

  nextBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = Number(btn.dataset.nextStep);
      if (validateStep(currentStep)) {
        goToStep(next);
      }
    });
  });

  prevBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const prev = Number(btn.dataset.prevStep);
      goToStep(prev);
    });
  });

  gotoStepBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = Number(btn.dataset.gotoStep);
      if (target < currentStep) {
        goToStep(target);
      } else if (target === currentStep + 1 && validateStep(currentStep)) {
        goToStep(target);
      } else if (target === 3 && validateStep(1) && validateStep(2)) {
        goToStep(3);
      }
    });
  });

  document.querySelectorAll('input[name="interests"]').forEach((cb) => {
    cb.addEventListener('change', updateReviewSummary);
  });

  // =========================================================================
  // 5. Rule-Based Personalized Day-Wise Itinerary Generator
  // =========================================================================
  function getInterestFlavor(interests, dest, dayIdx, seed) {
    const pick = interests[(dayIdx + seed) % interests.length] || dest.category;
    const flavors = {
      Adventure: {
        morning: 'Guided outdoor trail, ridge hike, or river-based adventure excursion',
        afternoon: 'Scenic viewpoint circuit and panoramic terrain exploration',
        evening: 'Warm recovery dinner and route briefing for the next leg',
        tip: 'Carry a light windproof layer, refillable water bottle, and sturdy walking shoes.'
      },
      Nature: {
        morning: 'Early botanical walk along misty viewpoints and quiet natural trails',
        afternoon: 'Unrushed lakeside, forest, or valley overlook picnic pause',
        evening: 'Golden-hour sunset watching from a calm waterfront or meadow',
        tip: 'Start outdoor nature stops around 7:00 AM for soft light and thinner crowds.'
      },
      Historical: {
        morning: 'Guided heritage walk through landmark monuments and architectural courtyards',
        afternoon: 'Museum archives, stepwells, or artisan workshops in the old quarter',
        evening: 'Illuminated monument view and regional storytelling dinner',
        tip: 'Check monument photography rules and arrive right at opening hours.'
      },
      Beaches: {
        morning: 'Quiet shoreline walk, coastal swim, or gentle morning paddle',
        afternoon: 'Shaded coastal cafe lunch and headland cliff exploration',
        evening: 'Sunset shoreline stroll followed by fresh coastal specialties',
        tip: 'Keep reef-safe sunscreen, sunglasses, and breathable cotton layers handy.'
      },
      Food: {
        morning: 'Authentic regional breakfast stop at a trusted local eatery',
        afternoon: 'Traditional afternoon thali or estate lunch featuring seasonal produce',
        evening: 'Curated local culinary walk sampling signature sweets and street classics',
        tip: 'Ask your stay host for freshly prepared regional specialties rather than generic menus.'
      },
      Shopping: {
        morning: 'Explore local craft cooperatives and heritage studio lanes',
        afternoon: 'Handloom, spice, or pottery workshop browse with fixed-price artisans',
        evening: 'Twilight bazaar walk for souvenirs, teas, and handcrafted keepsakes',
        tip: 'Carry a reusable tote bag and look for verified state handicraft emporiums.'
      }
    };
    return { interest: pick, copy: flavors[pick] || flavors.Nature };
  }

  function getTravelTypePacing(travelType) {
    if (travelType === 'Solo') {
      return {
        paceNote: 'Solo-friendly flexible pacing with walkable neighborhoods and scenic cafes.',
        stayNote: 'Boutique guesthouse or verified homestay in a central walkable zone'
      };
    }
    if (travelType === 'Family') {
      return {
        paceNote: 'Comfortable family pacing with relaxed transit buffers and accessible stops.',
        stayNote: 'Spacious family suite or quiet resort with dedicated cab transfers'
      };
    }
    return {
      paceNote: 'Group-friendly pacing balancing active viewpoints with lively evening dining.',
      stayNote: 'Shared chalet, boutique rooms, or central heritage stay'
    };
  }

  function generateRuleBasedItinerary(config, seed) {
    const dest = CATALOG.find((d) => d.name === config.destination) || CATALOG[0];
    const attractions = dest.touristAttractions;
    const foods = dest.localFood;
    const nearby = dest.nearbyAttractions;
    const pacing = getTravelTypePacing(config.travelType);

    const daysCount = config.days;
    const targetDailyTotal = Math.round(config.budget / daysCount);
    const generatedDays = [];

    for (let i = 0; i < daysCount; i += 1) {
      const dayNumber = i + 1;
      const dateLabel = addDaysToDate(config.startDate, i);
      const isFirstDay = i === 0;
      const isLastDay = i === daysCount - 1 && daysCount > 1;

      const primarySpot = attractions[(i + seed) % attractions.length];
      const secondarySpot = attractions[(i + 1 + seed) % attractions.length];
      const foodPick = foods[(i + seed) % foods.length];
      const nearbyPick = nearby[(i + seed) % nearby.length];
      const flavor = getInterestFlavor(config.interests, dest, i, seed);

      let morning;
      let afternoon;
      let evening;
      let suggestedList;
      let dayTitle;
      let expenseWeight = 1.0;

      if (isFirstDay) {
        dayTitle = `Arrival in ${dest.name} & First Impressions`;
        morning = `Depart from ${config.origin} and arrive in ${dest.name}; check in to your ${pacing.stayNote.toLowerCase()} and refresh.`;
        afternoon = `Begin with ${primarySpot.name} (${primarySpot.note}) paired with ${foodPick.name} for lunch.`;
        evening = `${flavor.copy.evening}; enjoy a relaxed orientation stroll matching your ${config.travelType.toLowerCase()} pace.`;
        suggestedList = [primarySpot.name, `${foodPick.name} tasting`, `${dest.name} Central Walk`];
        expenseWeight = 1.15;
      } else if (isLastDay) {
        dayTitle = `${nearbyPick.name} & Departure to ${config.origin}`;
        morning = `Early visit to ${secondarySpot.name} (${secondarySpot.note}) before packing.`;
        afternoon = config.interests.includes('Shopping')
          ? `Pick up local crafts and regional specialties, then enjoy a farewell meal featuring ${foodPick.name}.`
          : `Short excursion toward ${nearbyPick.name} (${nearbyPick.distance}) and unhurried lunch featuring ${foodPick.name}.`;
        evening = `Begin return journey back toward ${config.origin} with comfortable buffer time.`;
        suggestedList = [secondarySpot.name, nearbyPick.name, 'Local craft & food market'];
        expenseWeight = 0.85;
      } else if (i % 2 === 1 && nearby.length > 0) {
        dayTitle = `${flavor.interest} Focus: ${nearbyPick.name}`;
        morning = `${flavor.copy.morning} heading out toward ${nearbyPick.name} (${nearbyPick.distance}).`;
        afternoon = `Explore ${primarySpot.name} and break for ${foodPick.name} (${foodPick.note}).`;
        evening = `${flavor.copy.evening} back in ${dest.name}.`;
        suggestedList = [nearbyPick.name, primarySpot.name, secondarySpot.name];
        expenseWeight = 1.1;
      } else {
        dayTitle = `${dest.name} Landmarks & ${flavor.interest} Trail`;
        morning = `Explore ${primarySpot.name} at opening light, followed by ${flavor.copy.morning.toLowerCase()}.`;
        afternoon = `Visit ${secondarySpot.name} (${secondarySpot.note}) and enjoy ${foodPick.name}.`;
        evening = `${flavor.copy.evening} with time for ${config.interests.includes('Shopping') ? 'artisan market browsing' : 'scenic twilight views'}.`;
        suggestedList = [primarySpot.name, secondarySpot.name, `${foodPick.name} stop`];
        expenseWeight = 0.95;
      }

      const estimatedDayExpense = Math.max(
        1000,
        Math.round((targetDailyTotal * expenseWeight) / 100) * 100
      );

      const travelTip = `${flavor.copy.tip} (${dest.bestTimeToVisit} note: ${dest.seasonalNote})`;

      generatedDays.push({
        dayNumber,
        dateLabel,
        dayTitle,
        morning,
        afternoon,
        evening,
        suggestedAttractions: suggestedList,
        estimatedExpense: estimatedDayExpense,
        travelTip
      });
    }

    return {
      id: `trip_${Date.now()}`,
      createdAt: new Date().toISOString(),
      variant: seed + 1,
      config: { ...config },
      destinationMeta: {
        stateRegion: dest.stateRegion,
        category: dest.category,
        bestTimeToVisit: dest.bestTimeToVisit,
        baselinePerPerson: dest.estimatedBudget
      },
      pacingNote: pacing.paceNote,
      days: generatedDays
    };
  }

  // =========================================================================
  // 6. Render Itinerary Workspace, Cost Summary & Inline Day Editing
  // =========================================================================
  function calculateTotalCost(itinerary) {
    return itinerary.days.reduce((sum, d) => sum + (Number(d.estimatedExpense) || 0), 0);
  }

  function renderCostSummary() {
    if (!costSummaryStrip || !activeItinerary) return;
    const totalEstimated = calculateTotalCost(activeItinerary);
    const { budget, travelers, days } = activeItinerary.config;
    const perTraveler = Math.round(totalEstimated / Math.max(1, travelers));
    const perDay = Math.round(totalEstimated / Math.max(1, days));
    const delta = budget - totalEstimated;
    const alignmentText =
      delta >= 0
        ? `${formatINR(delta)} within target budget`
        : `${formatINR(Math.abs(delta))} above target budget`;

    costSummaryStrip.innerHTML = `
      <div class="cost-metric">
        <span class="cost-label">Estimated Total Trip Cost</span>
        <strong class="cost-value">${formatINR(totalEstimated)}</strong>
        <span class="cost-sub">Demo rule-based sum across ${days} day${days === 1 ? '' : 's'}</span>
      </div>
      <div class="cost-metric">
        <span class="cost-label">Cost Per Traveller</span>
        <strong class="cost-value">${formatINR(perTraveler)}</strong>
        <span class="cost-sub">For ${travelers} traveller${travelers === 1 ? '' : 's'} (${escapeHtml(activeItinerary.config.travelType)})</span>
      </div>
      <div class="cost-metric">
        <span class="cost-label">Average Daily Spend</span>
        <strong class="cost-value">${formatINR(perDay)}</strong>
        <span class="cost-sub">Stay, meals, local transit &amp; activities</span>
      </div>
      <div class="cost-metric">
        <span class="cost-label">Target Budget Comparison</span>
        <strong class="cost-value">${formatINR(budget)}</strong>
        <span class="cost-sub">${escapeHtml(alignmentText)}</span>
      </div>
    `;
  }

  function renderDayCard(day, isEditing = false) {
    if (isEditing) {
      return `
        <article class="itinerary-day-card editing" data-day-number="${day.dayNumber}">
          <div class="day-card-header">
            <div>
              <p class="day-date-kicker">Day ${day.dayNumber} &middot; ${escapeHtml(day.dateLabel)}</p>
              <h3 class="day-card-title">Editing Day ${day.dayNumber}</h3>
            </div>
            <div class="day-card-actions no-print">
              <button type="button" class="btn-card-action" data-cancel-day="${day.dayNumber}">Cancel</button>
              <button type="button" class="btn btn-primary btn-sm" data-save-day="${day.dayNumber}">Save Changes</button>
            </div>
          </div>

          <div class="day-edit-grid">
            <div class="form-field">
              <label for="edit-title-${day.dayNumber}">Day Heading</label>
              <input type="text" id="edit-title-${day.dayNumber}" value="${escapeHtml(day.dayTitle)}" />
            </div>
            <div class="form-field">
              <label for="edit-expense-${day.dayNumber}">Estimated Expenses (INR &#8377;)</label>
              <input type="number" id="edit-expense-${day.dayNumber}" min="0" step="100" value="${Number(day.estimatedExpense)}" />
            </div>
            <div class="form-field field-full">
              <label for="edit-morning-${day.dayNumber}">Morning Activities</label>
              <textarea id="edit-morning-${day.dayNumber}" rows="2">${escapeHtml(day.morning)}</textarea>
            </div>
            <div class="form-field field-full">
              <label for="edit-afternoon-${day.dayNumber}">Afternoon Activities</label>
              <textarea id="edit-afternoon-${day.dayNumber}" rows="2">${escapeHtml(day.afternoon)}</textarea>
            </div>
            <div class="form-field field-full">
              <label for="edit-evening-${day.dayNumber}">Evening Activities</label>
              <textarea id="edit-evening-${day.dayNumber}" rows="2">${escapeHtml(day.evening)}</textarea>
            </div>
            <div class="form-field field-full">
              <label for="edit-attractions-${day.dayNumber}">Suggested Attractions (comma-separated)</label>
              <input type="text" id="edit-attractions-${day.dayNumber}" value="${escapeHtml(day.suggestedAttractions.join(', '))}" />
            </div>
            <div class="form-field field-full">
              <label for="edit-tip-${day.dayNumber}">Travel Tip</label>
              <textarea id="edit-tip-${day.dayNumber}" rows="2">${escapeHtml(day.travelTip)}</textarea>
            </div>
          </div>
        </article>
      `;
    }

    return `
      <article class="itinerary-day-card" data-day-number="${day.dayNumber}">
        <div class="day-card-header">
          <div>
            <p class="day-date-kicker">Day ${day.dayNumber} &middot; ${escapeHtml(day.dateLabel)}</p>
            <h3 class="day-card-title">${escapeHtml(day.dayTitle)}</h3>
          </div>
          <div class="day-card-right">
            <span class="day-expense-readout">Est. ${formatINR(day.estimatedExpense)}</span>
            <button type="button" class="btn-card-action no-print" data-edit-day="${day.dayNumber}">Edit Day</button>
          </div>
        </div>

        <div class="day-slots-grid">
          <div class="day-slot">
            <h4>Morning Activities</h4>
            <p>${escapeHtml(day.morning)}</p>
          </div>
          <div class="day-slot">
            <h4>Afternoon Activities</h4>
            <p>${escapeHtml(day.afternoon)}</p>
          </div>
          <div class="day-slot">
            <h4>Evening Activities</h4>
            <p>${escapeHtml(day.evening)}</p>
          </div>
        </div>

        <div class="day-meta-footer">
          <div class="day-meta-block">
            <strong>Suggested Attractions:</strong>
            <span>${escapeHtml(day.suggestedAttractions.join(' · '))}</span>
          </div>
          <div class="day-meta-block">
            <strong>Travel Tip:</strong>
            <span>${escapeHtml(day.travelTip)}</span>
          </div>
        </div>
      </article>
    `;
  }

  function renderItineraryWorkspace() {
    if (!workspace || !activeItinerary) return;
    const cfg = activeItinerary.config;

    if (itineraryTitle) {
      itineraryTitle.textContent = `${cfg.origin} to ${cfg.destination} (${cfg.days}-Day Itinerary)`;
    }
    if (itinerarySubtitle) {
      itinerarySubtitle.textContent =
        `Starting ${addDaysToDate(cfg.startDate, 0)} · ${cfg.travelers} Traveller${cfg.travelers === 1 ? '' : 's'} (${cfg.travelType}) · Interests: ${cfg.interests.join(', ')} · Demo Variant #${activeItinerary.variant}`;
    }

    const gmapsLink = document.getElementById('planner-gmaps-link');
    if (gmapsLink) {
      gmapsLink.href =
        'index.html?origin=' +
        encodeURIComponent(cfg.origin) +
        '&dest=' +
        encodeURIComponent(cfg.destination) +
        '#route-planner';
    }

    renderCostSummary();

    if (daysListEl) {
      daysListEl.innerHTML = activeItinerary.days.map((d) => renderDayCard(d, false)).join('');
    }

    workspace.hidden = false;
  }

  // Handle Form Submission -> Generate Itinerary
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!validateStep(1)) {
        goToStep(1);
        return;
      }
      if (!validateStep(2)) {
        goToStep(2);
        return;
      }
      if (!validateStep(3)) {
        goToStep(3);
        return;
      }

      const config = {
        origin: originInput.value.trim(),
        destination: destSelect.value,
        startDate: startDateInput.value,
        days: Number(daysInput.value),
        travelers: Number(travelersInput.value),
        budget: Number(budgetInput.value),
        travelType: getSelectedTravelType(),
        interests: getSelectedInterests()
      };

      variantSeed = 0;
      activeItinerary = generateRuleBasedItinerary(config, variantSeed);
      renderItineraryWorkspace();
      workspace.scrollIntoView({ behavior: 'smooth', block: 'start' });
      showToast(`Generated ${config.days}-day demo itinerary for ${config.destination}.`);
    });
  }

  // Inline Edit, Save & Cancel Day Handlers
  if (daysListEl) {
    daysListEl.addEventListener('click', (event) => {
      if (!activeItinerary) return;

      const editBtn = event.target.closest('[data-edit-day]');
      if (editBtn) {
        const dayNum = Number(editBtn.dataset.editDay);
        const dayObj = activeItinerary.days.find((d) => d.dayNumber === dayNum);
        const cardEl = editBtn.closest('.itinerary-day-card');
        if (dayObj && cardEl) {
          cardEl.outerHTML = renderDayCard(dayObj, true);
        }
        return;
      }

      const cancelBtn = event.target.closest('[data-cancel-day]');
      if (cancelBtn) {
        const dayNum = Number(cancelBtn.dataset.cancelDay);
        const dayObj = activeItinerary.days.find((d) => d.dayNumber === dayNum);
        const cardEl = cancelBtn.closest('.itinerary-day-card');
        if (dayObj && cardEl) {
          cardEl.outerHTML = renderDayCard(dayObj, false);
        }
        return;
      }

      const saveDayBtn = event.target.closest('[data-save-day]');
      if (saveDayBtn) {
        const dayNum = Number(saveDayBtn.dataset.saveDay);
        const dayObj = activeItinerary.days.find((d) => d.dayNumber === dayNum);
        const cardEl = saveDayBtn.closest('.itinerary-day-card');
        if (!dayObj || !cardEl) return;

        const titleEl = document.getElementById(`edit-title-${dayNum}`);
        const expenseEl = document.getElementById(`edit-expense-${dayNum}`);
        const morningEl = document.getElementById(`edit-morning-${dayNum}`);
        const afternoonEl = document.getElementById(`edit-afternoon-${dayNum}`);
        const eveningEl = document.getElementById(`edit-evening-${dayNum}`);
        const attrEl = document.getElementById(`edit-attractions-${dayNum}`);
        const tipEl = document.getElementById(`edit-tip-${dayNum}`);

        dayObj.dayTitle = titleEl && titleEl.value.trim() ? titleEl.value.trim() : dayObj.dayTitle;
        dayObj.estimatedExpense = Math.max(0, Number(expenseEl ? expenseEl.value : dayObj.estimatedExpense) || 0);
        dayObj.morning = morningEl ? morningEl.value.trim() : dayObj.morning;
        dayObj.afternoon = afternoonEl ? afternoonEl.value.trim() : dayObj.afternoon;
        dayObj.evening = eveningEl ? eveningEl.value.trim() : dayObj.evening;
        dayObj.suggestedAttractions = attrEl
          ? attrEl.value
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : dayObj.suggestedAttractions;
        dayObj.travelTip = tipEl ? tipEl.value.trim() : dayObj.travelTip;

        cardEl.outerHTML = renderDayCard(dayObj, false);
        renderCostSummary();
        showToast(`Saved edits for Day ${dayNum} and updated total trip cost.`);
      }
    });
  }

  // Modify Inputs & Regenerate Itinerary
  if (editWizardBtn) {
    editWizardBtn.addEventListener('click', () => {
      if (wizardCard) {
        wizardCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      goToStep(1);
    });
  }

  if (regenerateBtn) {
    regenerateBtn.addEventListener('click', () => {
      if (!activeItinerary) return;
      variantSeed += 1;
      activeItinerary = generateRuleBasedItinerary(activeItinerary.config, variantSeed);
      renderItineraryWorkspace();
      showToast(`Regenerated itinerary variation #${activeItinerary.variant} for ${activeItinerary.config.destination}.`);
    });
  }

  // =========================================================================
  // 7. Save Trip to localStorage & Saved Trips Modal
  // =========================================================================
  function getSavedTrips() {
    try {
      const raw = localStorage.getItem(SAVED_TRIPS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_err) {
      return [];
    }
  }

  function setSavedTrips(trips) {
    try {
      localStorage.setItem(SAVED_TRIPS_KEY, JSON.stringify(trips));
    } catch (_err) {
      // Ignore storage error gracefully
    }
    if (savedTripsCountEl) {
      savedTripsCountEl.textContent = String(trips.length);
    }
  }

  if (savedTripsCountEl) {
    savedTripsCountEl.textContent = String(getSavedTrips().length);
  }

  if (saveTripBtn) {
    saveTripBtn.addEventListener('click', () => {
      if (!activeItinerary) return;
      const trips = getSavedTrips();
      const existingIdx = trips.findIndex((t) => t.id === activeItinerary.id);
      const snapshot = JSON.parse(JSON.stringify(activeItinerary));
      if (window.YatraAccountStore && window.YatraAccountStore.auth) {
        const res = window.YatraAccountStore.auth.getSession();
        if (res && res.data && res.data.session && res.data.session.user) {
          snapshot.userId = res.data.session.user.id;
        }
      }
      if (!snapshot.title && snapshot.config) {
        snapshot.title = `${snapshot.config.origin} → ${snapshot.config.destination}`;
      }
      if (window.YatraAccountStore && window.YatraAccountStore.trips) {
        window.YatraAccountStore.trips.saveTrip(snapshot);
        const updatedList = window.YatraAccountStore.trips.listTrips().data || [];
        if (savedTripsCountEl) savedTripsCountEl.textContent = String(updatedList.length);
      } else {
        if (existingIdx >= 0) {
          trips[existingIdx] = snapshot;
        } else {
          trips.unshift(snapshot);
        }
        setSavedTrips(trips);
      }
      const isSupa = Boolean(window.YatraAccountStore && window.YatraAccountStore.isSupabaseSession && window.YatraAccountStore.isSupabaseSession());
      showToast(
        isSupa
          ? `Saved "${activeItinerary.config.destination}" itinerary & budget to Supabase.`
          : `Saved "${activeItinerary.config.destination}" itinerary to your browser.`
      );
    });
  }

  function openSavedTripsModal() {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    const trips = getSavedTrips();
    modalTitle.textContent = `Saved Trips (${trips.length})`;

    if (trips.length === 0) {
      modalBody.innerHTML = `
        <p class="modal-text">
          You have not saved any planned trips yet. Generate an itinerary and click <strong>Save Trip</strong> to keep it in your browser.
        </p>
      `;
    } else {
      const listHtml = trips
        .map((trip) => {
          const total = calculateTotalCost(trip);
          return `
            <div class="wishlist-item">
              <div>
                <h3 class="wishlist-item-title">${escapeHtml(trip.config.origin)} &rarr; ${escapeHtml(trip.config.destination)}</h3>
                <p class="wishlist-item-meta">
                  ${trip.config.days} Days &middot; ${trip.config.travelers} Traveller(s) (${escapeHtml(trip.config.travelType)}) &middot; Est. ${formatINR(total)}
                </p>
              </div>
              <div class="wishlist-item-actions">
                <button type="button" class="btn-card-action" data-load-trip="${escapeHtml(trip.id)}">Load</button>
                <button type="button" class="btn-link" data-delete-trip="${escapeHtml(trip.id)}">Delete</button>
              </div>
            </div>
          `;
        })
        .join('');

      modalBody.innerHTML = `
        <p class="modal-notice">Saved itineraries are persisted locally in <code>localStorage</code>.</p>
        <div class="wishlist-modal-list">${listHtml}</div>
      `;

      modalBody.querySelectorAll('[data-load-trip]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const found = trips.find((t) => t.id === btn.dataset.loadTrip);
          if (!found) return;
          activeItinerary = JSON.parse(JSON.stringify(found));
          // Sync form inputs to loaded trip
          if (originInput) originInput.value = found.config.origin;
          if (destSelect) destSelect.value = found.config.destination;
          if (startDateInput) startDateInput.value = found.config.startDate;
          if (daysInput) daysInput.value = String(found.config.days);
          if (travelersInput) travelersInput.value = String(found.config.travelers);
          if (budgetInput) budgetInput.value = String(found.config.budget);
          renderItineraryWorkspace();
          modalBackdrop.hidden = true;
          document.body.style.overflow = '';
          workspace.scrollIntoView({ behavior: 'smooth', block: 'start' });
          showToast(`Loaded saved ${found.config.destination} itinerary.`);
        });
      });

      modalBody.querySelectorAll('[data-delete-trip]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const remaining = trips.filter((t) => t.id !== btn.dataset.deleteTrip);
          setSavedTrips(remaining);
          openSavedTripsModal();
          showToast('Deleted saved trip.');
        });
      });
    }

    modalBackdrop.hidden = false;
    document.body.style.overflow = 'hidden';
    if (modalCloseBtn) modalCloseBtn.focus();
  }

  if (openSavedTripsBtn) {
    openSavedTripsBtn.addEventListener('click', openSavedTripsModal);
  }

  // =========================================================================
  // 8. Printable Document Download & Native Print
  // =========================================================================
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      if (!activeItinerary) return;
      window.print();
    });
  }

  if (downloadDocBtn) {
    downloadDocBtn.addEventListener('click', () => {
      if (!activeItinerary) return;
      const cfg = activeItinerary.config;
      const total = calculateTotalCost(activeItinerary);
      const perPerson = Math.round(total / Math.max(1, cfg.travelers));

      const daysMarkup = activeItinerary.days
        .map(
          (d) => `
          <section class="day">
            <div class="day-head">
              <h2>Day ${d.dayNumber}: ${escapeHtml(d.dayTitle)}</h2>
              <span>${escapeHtml(d.dateLabel)} &middot; Est. ${formatINR(d.estimatedExpense)}</span>
            </div>
            <p><strong>Morning:</strong> ${escapeHtml(d.morning)}</p>
            <p><strong>Afternoon:</strong> ${escapeHtml(d.afternoon)}</p>
            <p><strong>Evening:</strong> ${escapeHtml(d.evening)}</p>
            <p><strong>Suggested Attractions:</strong> ${escapeHtml(d.suggestedAttractions.join(', '))}</p>
            <p class="tip"><strong>Travel Tip:</strong> ${escapeHtml(d.travelTip)}</p>
          </section>
        `
        )
        .join('');

      const printableHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Yatra Sphere Itinerary — ${escapeHtml(cfg.destination)}</title>
  <style>
    body { font-family: Georgia, serif; color: #0b1c2e; max-width: 820px; margin: 40px auto; padding: 0 24px; line-height: 1.6; }
    header { border-bottom: 2px solid #0d7377; padding-bottom: 16px; margin-bottom: 24px; }
    .brand { font-family: Arial, sans-serif; font-size: 12px; letter-spacing: 0.12em; color: #0d7377; font-weight: 700; }
    h1 { margin: 6px 0 8px; font-size: 28px; }
    .meta { font-family: Arial, sans-serif; font-size: 14px; color: #3e5266; margin: 0; }
    .notice { background: #e3f5f6; padding: 10px 14px; border-radius: 6px; font-family: Arial, sans-serif; font-size: 13px; margin: 16px 0; }
    .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 20px 0 28px; font-family: Arial, sans-serif; }
    .summary div { border: 1px solid #dce5ee; padding: 12px; border-radius: 6px; }
    .summary span { display: block; font-size: 11px; color: #5b7083; }
    .summary strong { font-size: 18px; color: #081b2e; }
    .day { border: 1px solid #dce5ee; border-radius: 8px; padding: 18px; margin-bottom: 16px; page-break-inside: avoid; }
    .day-head { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid #eff4f8; padding-bottom: 8px; margin-bottom: 10px; }
    .day-head h2 { margin: 0; font-size: 19px; }
    .day-head span { font-family: Arial, sans-serif; font-size: 13px; color: #047857; font-weight: 700; }
    .tip { color: #3e5266; font-size: 14px; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <header>
    <div class="brand">YATRA SPHERE &middot; EXPLORE MORE. EXPERIENCE BEYOND.</div>
    <h1>${escapeHtml(cfg.origin)} to ${escapeHtml(cfg.destination)} (${cfg.days}-Day Itinerary)</h1>
    <p class="meta">Start Date: ${escapeHtml(addDaysToDate(cfg.startDate, 0))} &middot; ${cfg.travelers} Traveller(s) (${escapeHtml(cfg.travelType)}) &middot; Interests: ${escapeHtml(cfg.interests.join(', '))}</p>
  </header>
  <div class="notice"><strong>Demo-Generated Rule-Based Itinerary:</strong> All estimated expenses and schedules are illustrative planning guides generated in Yatra Sphere demo mode.</div>
  <div class="summary">
    <div><span>Estimated Total Trip Cost</span><strong>${formatINR(total)}</strong></div>
    <div><span>Per Traveller Estimate</span><strong>${formatINR(perPerson)}</strong></div>
    <div><span>Target Budget</span><strong>${formatINR(cfg.budget)}</strong></div>
  </div>
  ${daysMarkup}
</body>
</html>`;

      const blob = new Blob([printableHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `Yatra-Sphere-${cfg.destination.replace(/\s+/g, '-')}-Itinerary.html`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast(`Downloaded printable itinerary document for ${cfg.destination}.`);
    });
  }
});
