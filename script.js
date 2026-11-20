/**
 * Yatra Sphere — Homepage, Explore Destinations & Wishlist Logic
 * Pure Vanilla JavaScript (ES6+) — No frameworks or external libraries.
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const WISHLIST_STORAGE_KEY = 'yatraSphere_wishlist';
  const CATALOG = Array.isArray(window.YATRA_DESTINATIONS) ? window.YATRA_DESTINATIONS : [];

  // =========================================================================
  // 1. Sample Data for AI Trip Planner Preview (Honest Simulated Mode)
  // =========================================================================
  const SAMPLE_ITINERARIES = {
    Kashmir: {
      budget3: '₹14,200 / traveler (indicative sample)',
      budget5: '₹21,500 / traveler (indicative sample)',
      days3: [
        'Day 1: Arrive in Srinagar, afternoon Mughal Gardens walk & sunset shikara on Dal Lake.',
        'Day 2: Day excursion to Gulmarg meadows, alpine pine ridge & gondola viewpoint.',
        'Day 3: Old-city artisan craft trail, saffron market stop & evening departure.'
      ],
      days5: [
        'Day 1: Srinagar arrival, Nigeen lakeside stay & quiet evening shikara ride.',
        'Day 2: Full-day Gulmarg pine plateau & Kongdoori alpine ridge.',
        'Day 3: Scenic drive via Pampore saffron fields to Pahalgam valley.',
        'Day 4: Betaab Valley walk & Lidder riverside picnic before returning to Srinagar.',
        'Day 5: Hazratbal shoreline morning & local spice/shawl market before departure.'
      ]
    },
    Manali: {
      budget3: '₹10,500 / traveler (indicative sample)',
      budget5: '₹14,500 / traveler (indicative sample)',
      days3: [
        'Day 1: Arrive in Old Manali, cedar forest walk to Hadimba temple & riverside cafe evening.',
        'Day 2: Solang Valley mountain views & Atal Tunnel crossing to Sissu waterfall.',
        'Day 3: Naggar Castle heritage stop & Kullu valley departure.'
      ],
      days5: [
        'Day 1: Arrival in Manali & slow acclimation stroll along the Beas riverfront.',
        'Day 2: Old Manali trails, Manu temple ridge & local Himachali cuisine.',
        'Day 3: Atal Tunnel & Lahaul valley day excursion to Sissu lake.',
        'Day 4: Solang alpine meadow hike & Vashisht thermal springs.',
        'Day 5: Naggar art gallery visit & return transit.'
      ]
    },
    Goa: {
      budget3: '₹10,200 / traveler (indicative sample)',
      budget5: '₹13,000 / traveler (indicative sample)',
      days3: [
        'Day 1: Arrive in South Goa, sunset walk along Palolem cove.',
        'Day 2: Fontainhas Latin Quarter heritage walk & Reis Magos fort overlooking the bay.',
        'Day 3: Quiet morning swim at Agonda beach & spice farm lunch before departure.'
      ],
      days5: [
        'Day 1: South Goa coastal check-in & Agonda golden-hour shoreline.',
        'Day 2: Palolem kayaking cove & Butterfly Beach boat crossing.',
        'Day 3: Panjim Fontainhas colorful lanes & riverside heritage architecture.',
        'Day 4: Inland tropical spice plantation & Old Goa basilica circuit.',
        'Day 5: Morning coastal cafe stop & departure.'
      ]
    },
    Jaipur: {
      budget3: '₹9,800 / traveler (indicative sample)',
      budget5: '₹12,000 / traveler (indicative sample)',
      days3: [
        'Day 1: Morning Amber Fort ramparts & sunset overlooking Nahargarh ridge.',
        'Day 2: Hawa Mahal facade, City Palace courtyards & Jantar Mantar observatory.',
        'Day 3: Panna Meena stepwell & Johari bazaar textile studios.'
      ],
      days5: [
        'Day 1: Arrival & twilight reflection walk beside Jal Mahal.',
        'Day 2: Early sunrise at Amber Fort, Jaigarh battlements & Panna Meena stepwell.',
        'Day 3: Walled city heritage walk—Hawa Mahal, City Palace & Jantar Mantar.',
        'Day 4: Sanganer block-printing workshop & Albert Hall dusk view.',
        'Day 5: Quiet morning courtyard tea & onward journey.'
      ]
    },
    Kerala: {
      budget3: '₹12,800 / traveler (indicative sample)',
      budget5: '₹18,000 / traveler (indicative sample)',
      days3: [
        'Day 1: Fort Kochi coastal promenade, Chinese fishing nets & spice warehouses.',
        'Day 2: Alleppey backwater lagoon cruise on a traditional wooden kettuvallam.',
        'Day 3: Kumarakom bird sanctuary morning walk & departure.'
      ],
      days5: [
        'Day 1: Arrive in Kochi, explore Fort Kochi colonial lanes & waterfront.',
        'Day 2: Ascend into Munnar’s emerald tea hills & Eravikulam ridge.',
        'Day 3: Misty tea estate walk & cardamom spice valley trail.',
        'Day 4: Descend to Alleppey for an overnight backwater lagoon houseboat.',
        'Day 5: Sunrise canal village glimpses & return to Kochi.'
      ]
    },
    Meghalaya: {
      budget3: '₹13,900 / traveler (indicative sample)',
      budget5: '₹19,500 / traveler (indicative sample)',
      days3: [
        'Day 1: Shillong plateau arrival, Ward’s Lake & Laitlum Grand Canyon ridge.',
        'Day 2: Cherrapunji Nohkalikai Falls & Wei Sawdong terraced emerald pools.',
        'Day 3: Dawki Umngot crystal river & Mawlynnong village trail.'
      ],
      days5: [
        'Day 1: Drive from Guwahati to Shillong; sunset at Laitlum canyon ridge.',
        'Day 2: Cherrapunji limestone caves & Nohkalikai waterfall viewpoints.',
        'Day 3: Tyrna village descent to Nongriat double-decker living root bridge.',
        'Day 4: Dawki crystal river boating & Mawlynnong cleanest village walk.',
        'Day 5: Umiam Lake morning overlook & return transit.'
      ]
    }
  };

  // =========================================================================
  // 2. Shared UI & Utility References
  // =========================================================================
  const siteHeader = document.getElementById('site-header');
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  const navLinks = document.querySelectorAll('.desktop-nav .nav-link');

  const openAuthBtn = document.getElementById('open-auth-btn');
  const mobileAuthBtn = document.getElementById('mobile-auth-btn');
  const openWishlistBtn = document.getElementById('open-wishlist-btn');
  const wishlistCountBadge = document.getElementById('wishlist-count-badge');

  const socialBtns = document.querySelectorAll('[data-social]');
  const legalBtns = document.querySelectorAll('[data-legal]');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const toastEl = document.getElementById('toast');
  const currentYearEl = document.getElementById('current-year');

  let toastTimer = null;
  let lastFocusedEl = null;

  if (currentYearEl) {
    currentYearEl.textContent = String(new Date().getFullYear());
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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

  function openModal(title, htmlContent) {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    lastFocusedEl = document.activeElement;
    modalTitle.textContent = title;
    modalBody.innerHTML = htmlContent;
    modalBackdrop.hidden = false;
    document.body.style.overflow = 'hidden';
    modalCloseBtn.focus();
  }

  function closeModal() {
    if (!modalBackdrop) return;
    modalBackdrop.hidden = true;
    document.body.style.overflow = '';
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
      lastFocusedEl.focus();
    }
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (event) => {
      if (event.target === modalBackdrop) closeModal();
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (modalBackdrop && !modalBackdrop.hidden) closeModal();
      if (mobileDrawer && !mobileDrawer.hidden) setMobileMenu(false);
    }
  });

  // =========================================================================
  // 3. Sticky Header & Mobile Drawer
  // =========================================================================
  function setMobileMenu(isOpen) {
    if (!mobileToggle || !mobileDrawer) return;
    mobileToggle.setAttribute('aria-expanded', String(isOpen));
    mobileDrawer.hidden = !isOpen;
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      setMobileMenu(!isExpanded);
    });
  }

  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => setMobileMenu(false));
  });

  const isSubPage =
    document.body.classList.contains('page-explore') ||
    document.body.classList.contains('page-planner') ||
    document.body.classList.contains('page-assistant') ||
    document.body.classList.contains('page-tools') ||
    document.body.classList.contains('page-guides') ||
    document.body.classList.contains('page-auth') ||
    document.body.classList.contains('page-dashboard');

  if (siteHeader && !isSubPage) {
    window.addEventListener('scroll', () => {
      siteHeader.classList.toggle('scrolled', window.scrollY > 24);
    }, { passive: true });
  }

  // Zero-broken-image fallback handler (capture phase catches IMG load failures)
  document.addEventListener(
    'error',
    (event) => {
      const target = event.target;
      if (target && target.tagName === 'IMG') {
        target.classList.add('img-load-failed');
      }
    },
    true
  );

  // =========================================================================
  // 4. LocalStorage Wishlist Management (Shared Across Homepage & Explore)
  // =========================================================================
  function getWishlistIds() {
    try {
      const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_err) {
      return [];
    }
  }

  function saveWishlistIds(ids) {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(ids));
    } catch (_err) {
      // Ignore storage quota / private-mode restrictions gracefully
    }
  }

  function isWishlisted(destId) {
    return getWishlistIds().includes(destId);
  }

  function syncWishlistUI() {
    const savedIds = getWishlistIds();
    if (wishlistCountBadge) {
      wishlistCountBadge.textContent = String(savedIds.length);
    }

    document.querySelectorAll('[data-wishlist-id]').forEach((btn) => {
      const id = btn.dataset.wishlistId;
      const saved = savedIds.includes(id);
      btn.classList.toggle('saved', saved);
      btn.setAttribute('aria-pressed', String(saved));

      const labelSpan = btn.querySelector('[data-wishlist-label]');
      if (labelSpan) {
        labelSpan.textContent = saved ? 'Saved in Wishlist' : 'Save to Wishlist';
      }
    });
  }

  function toggleWishlist(destId) {
    if (!destId) return false;
    const dest = CATALOG.find((item) => item.id === destId);
    const destLabel = dest ? dest.name : destId;

    let added = false;
    if (window.YatraAccountStore && window.YatraAccountStore.wishlist) {
      added = window.YatraAccountStore.wishlist.toggleId(destId);
    } else {
      const savedIds = getWishlistIds();
      const index = savedIds.indexOf(destId);
      if (index >= 0) {
        savedIds.splice(index, 1);
        added = false;
      } else {
        savedIds.push(destId);
        added = true;
      }
      saveWishlistIds(savedIds);
    }

    syncWishlistUI();
    showToast(added ? `Saved ${destLabel} to your wishlist.` : `Removed ${destLabel} from your wishlist.`);
    return added;
  }

  function openWishlistModal() {
    const savedIds = getWishlistIds();
    const savedItems = savedIds
      .map((id) => CATALOG.find((dest) => dest.id === id))
      .filter(Boolean);

    if (savedItems.length === 0) {
      openModal(
        'Saved Wishlist (0)',
        `
          <p class="modal-text">
            Your wishlist is currently empty. Click the heart icon or "Save to Wishlist" on any destination to keep track of places you want to visit.
          </p>
          <a href="explore.html" class="btn btn-primary">Explore 16 Destinations</a>
        `
      );
      return;
    }

    const itemsHtml = savedItems
      .map(
        (dest) => `
          <div class="wishlist-item">
            <div class="wishlist-item-info">
              <img class="wishlist-thumb" src="${escapeHtml(dest.image)}" alt="${escapeHtml(dest.name)}" referrerpolicy="no-referrer" />
              <div>
                <h3 class="wishlist-item-title">${escapeHtml(dest.name)}</h3>
                <p class="wishlist-item-meta">${escapeHtml(dest.stateRegion)} &middot; ${escapeHtml(dest.recommendedDuration)} &middot; ${escapeHtml(dest.budgetLabel)}</p>
              </div>
            </div>
            <div class="wishlist-item-actions">
              <button type="button" class="btn-card-action" data-wishlist-open="${escapeHtml(dest.id)}">Details</button>
              <button type="button" class="btn-link" data-wishlist-remove="${escapeHtml(dest.id)}">Remove</button>
            </div>
          </div>
        `
      )
      .join('');

    openModal(
      `Saved Wishlist (${savedItems.length})`,
      `
        <p class="modal-notice">Saved locally in your browser via <code>localStorage</code> across visits.</p>
        <div class="wishlist-modal-list">${itemsHtml}</div>
        <div class="modal-actions-row">
          <a href="explore.html" class="btn btn-primary">Browse More Destinations</a>
          <button type="button" class="btn-link" id="clear-wishlist-btn">Clear Wishlist</button>
        </div>
      `
    );

    modalBody.querySelectorAll('[data-wishlist-open]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.wishlistOpen;
        closeModal();
        if (document.body.classList.contains('page-explore')) {
          renderDestinationDetail(id, true);
        } else {
          window.location.href = `explore.html?dest=${encodeURIComponent(id)}`;
        }
      });
    });

    modalBody.querySelectorAll('[data-wishlist-remove]').forEach((btn) => {
      btn.addEventListener('click', () => {
        toggleWishlist(btn.dataset.wishlistRemove);
        openWishlistModal();
      });
    });

    const clearBtn = document.getElementById('clear-wishlist-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        saveWishlistIds([]);
        syncWishlistUI();
        openWishlistModal();
        showToast('Cleared all saved destinations from your wishlist.');
      });
    }
  }

  if (openWishlistBtn) {
    openWishlistBtn.addEventListener('click', openWishlistModal);
  }

  // Delegate wishlist toggles on static homepage cards
  document.addEventListener('click', (event) => {
    const wishlistBtn = event.target.closest('[data-wishlist-id]');
    if (wishlistBtn) {
      event.stopPropagation();
      toggleWishlist(wishlistBtn.dataset.wishlistId);
    }
  });

  // =========================================================================
  // 5. Homepage Logic (index.html)
  // =========================================================================
  const heroSearchForm = document.getElementById('hero-search-form');
  const heroSearchInput = document.getElementById('hero-search-input');
  const heroStyleSelect = document.getElementById('hero-style-select');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const quickLinkBtns = document.querySelectorAll('.quick-link-btn');

  const homeFilterTabs = document.querySelectorAll('#destinations .filter-tab');
  const homeDestinationCards = document.querySelectorAll('#destinations-grid .destination-card');
  const searchStatusBar = document.getElementById('search-status-bar');
  const searchStatusText = document.getElementById('search-status-text');
  const resetFiltersBtn = document.getElementById('reset-filters-btn');
  const emptyResultsEl = document.getElementById('empty-results');
  const emptyResetBtn = document.getElementById('empty-reset-btn');
  const experienceFilterBtns = document.querySelectorAll('[data-experience-filter]');
  const openDestBtns = document.querySelectorAll('[data-open-destination]');

  const miniPlannerForm = document.getElementById('mini-planner-form');
  const plannerDestSelect = document.getElementById('planner-dest');
  const plannerDaysSelect = document.getElementById('planner-days');
  const plannerOutput = document.getElementById('planner-output');
  const launchPlannerBtn = document.getElementById('launch-planner-btn');

  let homeCategory = 'all';
  let homeQuery = '';

  if (!isSubPage) {
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if ((link.getAttribute('href') || '').startsWith('#')) {
          navLinks.forEach((item) => item.classList.remove('active'));
          link.classList.add('active');
        }
      });
    });

    if ('IntersectionObserver' in window) {
      const observedSections = document.querySelectorAll('main section[id]');
      const sectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const targetHref = `#${entry.target.id}`;
            navLinks.forEach((link) => {
              link.classList.toggle('active', link.getAttribute('href') === targetHref);
            });
          });
        },
        { rootMargin: '-35% 0px -55% 0px', threshold: 0 }
      );
      observedSections.forEach((section) => sectionObserver.observe(section));
    }
  }

  function applyHomeFilters() {
    if (homeDestinationCards.length === 0) return;
    let visibleCount = 0;
    const normalizedQuery = homeQuery.trim().toLowerCase();

    homeDestinationCards.forEach((card) => {
      const cardCategory = (card.dataset.category || '').toLowerCase();
      const cardKeywords = (card.dataset.keywords || '').toLowerCase();
      const cardName = (card.dataset.name || '').toLowerCase();
      const cardRegion = (card.dataset.region || '').toLowerCase();

      const matchesCategory =
        homeCategory === 'all' || cardCategory === homeCategory.toLowerCase();

      const matchesQuery =
        normalizedQuery === '' ||
        cardName.includes(normalizedQuery) ||
        cardRegion.includes(normalizedQuery) ||
        cardCategory.includes(normalizedQuery) ||
        cardKeywords.includes(normalizedQuery);

      const isVisible = matchesCategory && matchesQuery;
      card.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    homeFilterTabs.forEach((tab) => {
      const isActive = tab.dataset.filter === homeCategory;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });

    if (heroStyleSelect) heroStyleSelect.value = homeCategory;
    if (searchClearBtn && heroSearchInput) {
      searchClearBtn.hidden = heroSearchInput.value.trim().length === 0;
    }

    const hasActiveFilter = homeCategory !== 'all' || normalizedQuery !== '';
    if (searchStatusBar && searchStatusText) {
      if (hasActiveFilter) {
        const parts = [];
        if (normalizedQuery) parts.push(`search "${homeQuery.trim()}"`);
        if (homeCategory !== 'all') parts.push(`style "${homeCategory}"`);
        searchStatusText.textContent = `Showing ${visibleCount} popular destination${visibleCount === 1 ? '' : 's'} for ${parts.join(' and ')}.`;
        searchStatusBar.hidden = false;
      } else {
        searchStatusBar.hidden = true;
      }
    }

    if (emptyResultsEl) {
      emptyResultsEl.hidden = visibleCount > 0;
    }
  }

  function resetHomeFilters() {
    homeCategory = 'all';
    homeQuery = '';
    if (heroSearchInput) heroSearchInput.value = '';
    if (heroStyleSelect) heroStyleSelect.value = 'all';
    applyHomeFilters();
  }

  if (heroSearchInput) {
    heroSearchInput.addEventListener('input', (event) => {
      homeQuery = event.target.value;
      applyHomeFilters();
    });
  }

  if (searchClearBtn && heroSearchInput) {
    searchClearBtn.addEventListener('click', () => {
      heroSearchInput.value = '';
      homeQuery = '';
      applyHomeFilters();
      heroSearchInput.focus();
    });
  }

  if (heroStyleSelect) {
    heroStyleSelect.addEventListener('change', (event) => {
      homeCategory = event.target.value;
      applyHomeFilters();
    });
  }

  if (heroSearchForm) {
    heroSearchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      homeQuery = heroSearchInput ? heroSearchInput.value : '';
      homeCategory = heroStyleSelect ? heroStyleSelect.value : 'all';
      applyHomeFilters();
      const destinationsEl = document.getElementById('destinations');
      if (destinationsEl) {
        destinationsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  quickLinkBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const term = btn.dataset.quickSearch || '';
      if (heroSearchInput) heroSearchInput.value = term;
      homeQuery = term;
      homeCategory = 'all';
      applyHomeFilters();
      const destinationsEl = document.getElementById('destinations');
      if (destinationsEl) {
        destinationsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  homeFilterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      homeCategory = tab.dataset.filter || 'all';
      applyHomeFilters();
    });
  });

  experienceFilterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      homeCategory = btn.dataset.experienceFilter || 'all';
      homeQuery = '';
      if (heroSearchInput) heroSearchInput.value = '';
      applyHomeFilters();
      const destinationsEl = document.getElementById('destinations');
      if (destinationsEl) {
        destinationsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', resetHomeFilters);
  if (emptyResetBtn) emptyResetBtn.addEventListener('click', resetHomeFilters);

  // Rich Route Guide Modal on Homepage using shared CATALOG
  openDestBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const destName = btn.dataset.openDestination;
      const dest = CATALOG.find((item) => item.name.toLowerCase() === String(destName).toLowerCase());
      if (!dest) return;

      const attractionsHtml = dest.touristAttractions
        .map((a) => `<li><strong>${escapeHtml(a.name)}:</strong> ${escapeHtml(a.note)}</li>`)
        .join('');
      const foodHtml = dest.localFood
        .map((f) => `<li><strong>${escapeHtml(f.name)}:</strong> ${escapeHtml(f.note)}</li>`)
        .join('');
      const nearbyHtml = dest.nearbyAttractions
        .map((n) => `<li>${escapeHtml(n.name)} (${escapeHtml(n.distance)})</li>`)
        .join('');

      openModal(
        `${dest.name} Route Guide`,
        `
          <p class="modal-meta">${escapeHtml(dest.stateRegion)} &middot; ${escapeHtml(dest.category)} &middot; Best: ${escapeHtml(dest.bestTimeToVisit)}</p>
          <p class="modal-notice">
            <strong>Indicative Guide:</strong> Duration ${escapeHtml(dest.recommendedDuration)} &middot; Est. budget from ${escapeHtml(dest.budgetLabel)} (${escapeHtml(dest.budgetBreakdown)}).
          </p>
          <p class="modal-text">${escapeHtml(dest.overview)}</p>
          <h3 class="modal-section-title">Popular Tourist Attractions</h3>
          <ul class="modal-list">${attractionsHtml}</ul>
          <h3 class="modal-section-title">Local Food Recommendations</h3>
          <ul class="modal-list">${foodHtml}</ul>
          <h3 class="modal-section-title">Nearby Attractions</h3>
          <ul class="modal-list">${nearbyHtml}</ul>
          <div class="modal-actions-row">
            <a href="explore.html?dest=${encodeURIComponent(dest.id)}" class="btn btn-primary">Open Full Destination View &rarr;</a>
            <button type="button" class="btn-card-action" id="modal-prefill-planner">Preview in Trip Planner</button>
          </div>
        `
      );

      const prefillBtn = document.getElementById('modal-prefill-planner');
      if (prefillBtn) {
        prefillBtn.addEventListener('click', () => {
          if (plannerDestSelect) plannerDestSelect.value = dest.name;
          renderSampleItinerary(dest.name, plannerDaysSelect ? plannerDaysSelect.value : '5');
          closeModal();
          const plannerSection = document.getElementById('ai-planner');
          if (plannerSection) {
            plannerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          showToast(`Loaded sample ${dest.name} outline in the Trip Planner preview.`);
        });
      }
    });
  });

  // AI Trip Planner Sample Preview
  function renderSampleItinerary(destination, days) {
    if (!plannerOutput) return;
    const data = SAMPLE_ITINERARIES[destination] || SAMPLE_ITINERARIES.Kashmir;
    const isThreeDays = String(days) === '3';
    const dayItems = isThreeDays ? data.days3 : data.days5;
    const budgetLabel = isThreeDays ? data.budget3 : data.budget5;

    plannerOutput.innerHTML = `
      <div class="planner-output-header">
        <h3 class="planner-output-title">${escapeHtml(destination)} &middot; ${escapeHtml(days)}-Day Sample Outline</h3>
        <span class="planner-output-budget">${escapeHtml(budgetLabel)}</span>
      </div>
      <ol class="planner-day-list">
        ${dayItems.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}
      </ol>
      <p class="planner-disclaimer">
        Simulated sample preview for homepage demonstration. Full personalized AI generation will connect in a later phase.
      </p>
    `;
  }

  if (miniPlannerForm) {
    miniPlannerForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const dest = plannerDestSelect ? plannerDestSelect.value : 'Kashmir';
      const days = plannerDaysSelect ? plannerDaysSelect.value : '5';
      renderSampleItinerary(dest, days);
      showToast(`Updated sample ${days}-day outline for ${dest}.`);
    });
  }

  if (launchPlannerBtn) {
    launchPlannerBtn.addEventListener('click', () => {
      const dest = plannerDestSelect ? plannerDestSelect.value : 'Kashmir';
      const days = plannerDaysSelect ? plannerDaysSelect.value : '5';
      renderSampleItinerary(dest, days);
      if (plannerDestSelect) plannerDestSelect.focus();
      showToast('Interactive planner preview ready — choose any destination and duration.');
    });
  }

  if (plannerOutput) {
    const params = new URLSearchParams(window.location.search);
    const planDest = params.get('plan');
    if (planDest && SAMPLE_ITINERARIES[planDest] && plannerDestSelect) {
      plannerDestSelect.value = planDest;
      renderSampleItinerary(planDest, '5');
    } else {
      renderSampleItinerary('Kashmir', '5');
    }
  }

  // =========================================================================
  // 6. Explore Destinations Page & Dynamic Detail View (explore.html)
  // =========================================================================
  const exploreCatalogView = document.getElementById('explore-catalog-view');
  const exploreGrid = document.getElementById('explore-grid');
  const exploreSearchInput = document.getElementById('explore-search-input');
  const exploreClearBtn = document.getElementById('explore-clear-btn');
  const exploreBudgetSelect = document.getElementById('explore-budget-select');
  const exploreSortSelect = document.getElementById('explore-sort-select');
  const exploreCategoryTabs = document.querySelectorAll('[data-explore-category]');
  const exploreResultsSummary = document.getElementById('explore-results-summary');
  const exploreResetBtn = document.getElementById('explore-reset-btn');
  const exploreEmptyState = document.getElementById('explore-empty-state');
  const exploreEmptyResetBtn = document.getElementById('explore-empty-reset-btn');
  const detailViewSection = document.getElementById('destination-detail-view');

  const exploreState = {
    query: '',
    category: 'all',
    budget: 'all',
    sort: 'recommended'
  };

  function matchesBudgetTier(budgetValue, tier) {
    if (tier === 'budget-low') return budgetValue < 12000;
    if (tier === 'budget-mid') return budgetValue >= 12000 && budgetValue <= 18000;
    if (tier === 'budget-high') return budgetValue > 18000;
    return true;
  }

  function getFilteredExploreList() {
    const query = exploreState.query.trim().toLowerCase();

    const filtered = CATALOG.filter((dest) => {
      const catMatch =
        exploreState.category === 'all' ||
        dest.category.toLowerCase() === exploreState.category.toLowerCase() ||
        (Array.isArray(dest.secondaryCategories) &&
          dest.secondaryCategories.some(
            (c) => c.toLowerCase() === exploreState.category.toLowerCase()
          ));

      const budgetMatch = matchesBudgetTier(dest.estimatedBudget, exploreState.budget);

      const searchableBlob = [
        dest.name,
        dest.stateRegion,
        dest.category,
        dest.summary,
        dest.bestTimeToVisit,
        dest.keywords,
        dest.touristAttractions.map((a) => a.name).join(' '),
        dest.localFood.map((f) => f.name).join(' '),
        dest.nearbyAttractions.map((n) => n.name).join(' ')
      ]
        .join(' ')
        .toLowerCase();

      const queryMatch = query === '' || searchableBlob.includes(query);
      return catMatch && budgetMatch && queryMatch;
    });

    if (exploreState.sort === 'budget-asc') {
      filtered.sort((a, b) => a.estimatedBudget - b.estimatedBudget);
    } else if (exploreState.sort === 'budget-desc') {
      filtered.sort((a, b) => b.estimatedBudget - a.estimatedBudget);
    } else if (exploreState.sort === 'name-asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }

  function buildExploreCardHtml(dest) {
    const saved = isWishlisted(dest.id);
    return `
      <article class="destination-card">
        <div class="card-media">
          <div class="media-fallback" aria-hidden="true"><span>${escapeHtml(dest.name)}</span></div>
          <img
            src="${escapeHtml(dest.image)}"
            alt="${escapeHtml(dest.alt)}"
            loading="lazy"
            decoding="async"
            referrerpolicy="no-referrer"
          />
        </div>
        <div class="card-body">
          <p class="card-meta">
            <span>${escapeHtml(dest.stateRegion)}</span>
            <span aria-hidden="true">&middot;</span>
            <span>${escapeHtml(dest.category)}</span>
            <span aria-hidden="true">&middot;</span>
            <span>${escapeHtml(dest.bestTimeToVisit)}</span>
          </p>
          <h2 class="card-title">${escapeHtml(dest.name)}</h2>
          <p class="card-desc">${escapeHtml(dest.summary)}</p>
          <div class="card-footer">
            <span class="card-stat">${escapeHtml(dest.recommendedDuration)} &middot; Est. ${escapeHtml(dest.budgetLabel)}</span>
            <div class="card-actions-group">
              <button
                type="button"
                class="btn-wishlist-toggle${saved ? ' saved' : ''}"
                data-wishlist-id="${escapeHtml(dest.id)}"
                aria-pressed="${String(saved)}"
                aria-label="Save ${escapeHtml(dest.name)} to wishlist"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
              <button type="button" class="btn-card-action" data-view-detail="${escapeHtml(dest.id)}">
                Explore Details
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function renderExploreGrid() {
    if (!exploreGrid) return;
    const list = getFilteredExploreList();

    exploreGrid.innerHTML = list.map(buildExploreCardHtml).join('');
    syncWishlistUI();

    if (exploreClearBtn && exploreSearchInput) {
      exploreClearBtn.hidden = exploreSearchInput.value.trim().length === 0;
    }

    const hasFilters =
      exploreState.query.trim() !== '' ||
      exploreState.category !== 'all' ||
      exploreState.budget !== 'all';

    if (exploreResultsSummary) {
      if (hasFilters) {
        exploreResultsSummary.textContent = `Showing ${list.length} of ${CATALOG.length} destinations`;
      } else {
        exploreResultsSummary.textContent = `Showing all ${CATALOG.length} Indian destinations`;
      }
    }

    if (exploreResetBtn) exploreResetBtn.hidden = !hasFilters;
    if (exploreEmptyState) exploreEmptyState.hidden = list.length > 0;

    exploreCategoryTabs.forEach((tab) => {
      const isActive = tab.dataset.exploreCategory === exploreState.category;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });
  }

  function showExploreCatalog(pushHistory = true) {
    if (!exploreCatalogView || !detailViewSection) return;
    detailViewSection.hidden = true;
    detailViewSection.innerHTML = '';
    exploreCatalogView.hidden = false;
    document.title = 'Explore Destinations — Yatra Sphere';

    if (pushHistory && window.location.protocol !== 'file:') {
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('dest');
        window.history.pushState({ view: 'catalog' }, '', url.toString());
      } catch (_err) {
        // Ignore URL push issues
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderDestinationDetail(destId, pushHistory = true) {
    if (!exploreCatalogView || !detailViewSection) return;
    const dest = CATALOG.find((item) => item.id === destId);
    if (!dest) {
      showExploreCatalog(false);
      return;
    }

    const saved = isWishlisted(dest.id);
    const plannerHref = `planner.html?dest=${encodeURIComponent(dest.name)}`;

    const relatedDestinations = CATALOG.filter(
      (item) => item.id !== dest.id && item.category === dest.category
    )
      .concat(CATALOG.filter((item) => item.id !== dest.id && item.category !== dest.category))
      .slice(0, 3);

    detailViewSection.innerHTML = `
      <div class="detail-topbar">
        <div class="container detail-topbar-inner">
          <button type="button" class="btn-back-explore" id="detail-back-btn">
            &larr; Back to All Destinations
          </button>
          <p class="detail-breadcrumb">
            Explore &middot; ${escapeHtml(dest.category)} &middot; ${escapeHtml(dest.name)}
          </p>
        </div>
      </div>

      <div class="detail-hero">
        <img
          src="${escapeHtml(dest.image)}"
          alt="${escapeHtml(dest.alt)}"
          class="detail-hero-img"
          referrerpolicy="no-referrer"
        />
        <div class="detail-hero-scrim" aria-hidden="true"></div>
        <div class="container detail-hero-content">
          <div>
            <p class="hero-tagline">${escapeHtml(dest.stateRegion)} &middot; ${escapeHtml(dest.category)}</p>
            <h1 class="detail-title">${escapeHtml(dest.name)}</h1>
            <p class="explore-page-subtitle">${escapeHtml(dest.summary)}</p>
          </div>
          <div class="detail-hero-actions">
            <button
              type="button"
              class="btn btn-secondary${saved ? ' saved' : ''}"
              data-wishlist-id="${escapeHtml(dest.id)}"
              aria-pressed="${String(saved)}"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span data-wishlist-label>${saved ? 'Saved in Wishlist' : 'Save to Wishlist'}</span>
            </button>
            <a href="${plannerHref}" class="btn btn-emerald">Plan This Trip &rarr;</a>
          </div>
        </div>
      </div>

      <div class="container">
        <div class="detail-facts-strip">
          <div class="detail-fact-card">
            <p class="detail-fact-label">Estimated Budget</p>
            <p class="detail-fact-value">${escapeHtml(dest.budgetLabel)} / traveler</p>
            <p class="detail-fact-sub">${escapeHtml(dest.budgetBreakdown)}</p>
          </div>
          <div class="detail-fact-card">
            <p class="detail-fact-label">Recommended Duration</p>
            <p class="detail-fact-value">${escapeHtml(dest.recommendedDuration)}</p>
            <p class="detail-fact-sub">Balanced route pacing</p>
          </div>
          <div class="detail-fact-card">
            <p class="detail-fact-label">Best Time to Visit</p>
            <p class="detail-fact-value">${escapeHtml(dest.bestTimeToVisit)}</p>
            <p class="detail-fact-sub">Ideal weather &amp; access</p>
          </div>
          <div class="detail-fact-card">
            <p class="detail-fact-label">Region &amp; Category</p>
            <p class="detail-fact-value">${escapeHtml(dest.stateRegion)}</p>
            <p class="detail-fact-sub">${escapeHtml(dest.category)}${dest.secondaryCategories && dest.secondaryCategories.length ? ' · ' + escapeHtml(dest.secondaryCategories.join(' · ')) : ''}</p>
          </div>
        </div>

        <div class="detail-layout">
          <div class="detail-main-col">
            <article class="detail-panel">
              <h2 class="detail-panel-title">Destination Overview &amp; Seasonal Timing</h2>
              <p class="detail-prose">${escapeHtml(dest.overview)}</p>
              <p class="detail-prose" style="margin-top: 14px;">
                <strong>Seasonal Note:</strong> ${escapeHtml(dest.seasonalNote)}
              </p>
            </article>

            <article class="detail-panel">
              <h2 class="detail-panel-title">Popular Tourist Attractions</h2>
              <div class="detail-items-grid">
                ${dest.touristAttractions
                  .map(
                    (spot) => `
                      <div class="detail-subitem">
                        <h4>${escapeHtml(spot.name)}</h4>
                        <p>${escapeHtml(spot.note)}</p>
                      </div>
                    `
                  )
                  .join('')}
              </div>
            </article>
          </div>

          <aside class="detail-side-col">
            <article class="detail-panel">
              <h2 class="detail-panel-title">Local Food Recommendations</h2>
              <ul class="detail-list-stack">
                ${dest.localFood
                  .map(
                    (dish) => `
                      <li>
                        <strong>${escapeHtml(dish.name)}</strong>
                        <span>${escapeHtml(dish.note)}</span>
                      </li>
                    `
                  )
                  .join('')}
              </ul>
            </article>

            <article class="detail-panel">
              <h2 class="detail-panel-title">Nearby Attractions</h2>
              <ul class="detail-list-stack">
                ${dest.nearbyAttractions
                  .map(
                    (nearby) => `
                      <li>
                        <strong>${escapeHtml(nearby.name)}</strong>
                        <span>${escapeHtml(nearby.distance)}</span>
                      </li>
                    `
                  )
                  .join('')}
              </ul>
            </article>

            <article class="detail-panel">
              <h2 class="detail-panel-title">Traveler Reviews &amp; Safety</h2>
              ${(() => {
                const demoRevs = Array.isArray(window.YATRA_DEMO_REVIEWS) ? window.YATRA_DEMO_REVIEWS : [];
                let localRevs = [];
                try {
                  const raw = localStorage.getItem('yatraSphere_reviews');
                  localRevs = raw ? JSON.parse(raw) : [];
                } catch (_err) {
                  localRevs = [];
                }
                const matching = [...(Array.isArray(localRevs) ? localRevs : []), ...demoRevs].filter(
                  (r) => String(r.destination).toLowerCase() === dest.name.toLowerCase()
                );
                const avg =
                  matching.length > 0
                    ? (matching.reduce((s, r) => s + Number(r.rating || 0), 0) / matching.length).toFixed(1)
                    : '—';
                return `
                  <p class="detail-prose">
                    <strong>${matching.length > 0 ? avg + ' / 5.0 ★' : 'Be the first to review'}</strong>
                    ${matching.length > 0 ? `(${matching.length} demo/local review${matching.length === 1 ? '' : 's'})` : ''}
                  </p>
                  <div class="detail-quick-links">
                    <a href="guides.html?tab=reviews&dest=${encodeURIComponent(dest.name)}" class="btn-card-action">Read &amp; Write Reviews</a>
                    <a href="guides.html?tab=safety" class="btn-link">Safety &amp; Helplines &rarr;</a>
                  </div>
                `;
              })()}
            </article>
          </aside>
        </div>

        <div class="related-section">
          <h2 class="related-heading">Continue Exploring Similar Regions</h2>
          <div class="destinations-grid">
            ${relatedDestinations.map(buildExploreCardHtml).join('')}
          </div>
        </div>
      </div>
    `;

    exploreCatalogView.hidden = true;
    detailViewSection.hidden = false;
    document.title = `${dest.name} Travel Guide — Yatra Sphere`;
    syncWishlistUI();

    if (pushHistory && window.location.protocol !== 'file:') {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('dest', dest.id);
        window.history.pushState({ view: 'detail', destId: dest.id }, '', url.toString());
      } catch (_err) {
        // Ignore URL push issues
      }
    }

    const backBtn = document.getElementById('detail-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => showExploreCatalog(true));
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (document.body.classList.contains('page-explore') && exploreGrid) {
    // Wire Explore controls
    if (exploreSearchInput) {
      exploreSearchInput.addEventListener('input', (event) => {
        exploreState.query = event.target.value;
        renderExploreGrid();
      });
    }

    if (exploreClearBtn && exploreSearchInput) {
      exploreClearBtn.addEventListener('click', () => {
        exploreSearchInput.value = '';
        exploreState.query = '';
        renderExploreGrid();
        exploreSearchInput.focus();
      });
    }

    if (exploreBudgetSelect) {
      exploreBudgetSelect.addEventListener('change', (event) => {
        exploreState.budget = event.target.value;
        renderExploreGrid();
      });
    }

    if (exploreSortSelect) {
      exploreSortSelect.addEventListener('change', (event) => {
        exploreState.sort = event.target.value;
        renderExploreGrid();
      });
    }

    exploreCategoryTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        exploreState.category = tab.dataset.exploreCategory || 'all';
        renderExploreGrid();
      });
    });

    function resetExploreAll() {
      exploreState.query = '';
      exploreState.category = 'all';
      exploreState.budget = 'all';
      exploreState.sort = 'recommended';
      if (exploreSearchInput) exploreSearchInput.value = '';
      if (exploreBudgetSelect) exploreBudgetSelect.value = 'all';
      if (exploreSortSelect) exploreSortSelect.value = 'recommended';
      renderExploreGrid();
    }

    if (exploreResetBtn) exploreResetBtn.addEventListener('click', resetExploreAll);
    if (exploreEmptyResetBtn) exploreEmptyResetBtn.addEventListener('click', resetExploreAll);

    // Delegate "Explore Details" clicks in catalog & related cards
    document.addEventListener('click', (event) => {
      const detailBtn = event.target.closest('[data-view-detail]');
      if (detailBtn) {
        renderDestinationDetail(detailBtn.dataset.viewDetail, true);
      }
    });

    window.addEventListener('popstate', () => {
      const params = new URLSearchParams(window.location.search);
      const destParam = params.get('dest');
      if (destParam) {
        renderDestinationDetail(destParam, false);
      } else {
        showExploreCatalog(false);
      }
    });

    // Initial load: check URL query parameters (?category= or ?dest=)
    const initParams = new URLSearchParams(window.location.search);
    const initCat = initParams.get('category');
    const initDest = initParams.get('dest');
    if (initCat) {
      exploreState.category = initCat;
    }

    renderExploreGrid();
    if (initDest) {
      renderDestinationDetail(initDest, false);
    }
  }

  // Initial wishlist sync across page
  syncWishlistUI();

  // =========================================================================
  // 7. Session-Aware Account Navigation & Footer Modals
  // =========================================================================
  function getActiveDemoSession() {
    if (window.YatraAccountStore && window.YatraAccountStore.auth) {
      const res = window.YatraAccountStore.auth.getSession();
      return res && res.data ? res.data.session : null;
    }
    return null;
  }

  function updateHeaderAuthButtons() {
    const session = getActiveDemoSession();
    const tFn = window.YatraI18n && typeof window.YatraI18n.t === 'function' ? window.YatraI18n.t : null;
    const accountWord = tFn ? tFn('auth.account') : 'Account';
    const loginLabel = tFn ? tFn('auth.loginSignup') : 'Login / Sign Up';

    const label =
      session && session.user
        ? `${accountWord} · ${session.user.name.split(/\s+/)[0] || 'Dashboard'}`
        : loginLabel;

    if (openAuthBtn) openAuthBtn.textContent = label;
    if (mobileAuthBtn) mobileAuthBtn.textContent = label;
  }

  function handleHeaderAuthClick() {
    setMobileMenu(false);
    const session = getActiveDemoSession();
    window.location.href = session && session.user ? 'dashboard.html' : 'login.html';
  }

  updateHeaderAuthButtons();
  document.addEventListener('yatra:langchange', updateHeaderAuthButtons);
  document.addEventListener('yatra:supabase-sync', () => {
    syncWishlistUI();
    updateHeaderAuthButtons();
  });
  if (openAuthBtn) openAuthBtn.addEventListener('click', handleHeaderAuthClick);
  if (mobileAuthBtn) mobileAuthBtn.addEventListener('click', handleHeaderAuthClick);

  socialBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const network = btn.dataset.social || 'Social';
      showToast(`Yatra Sphere ${network} profile link is a homepage placeholder.`);
    });
  });

  legalBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.legal;
      if (type === 'privacy') {
        openModal(
          'Privacy Policy (Foundation Notice)',
          '<p class="modal-text">Yatra Sphere runs locally in your browser. Saved wishlist destinations are stored only in your browser’s localStorage and are never transmitted to external servers.</p>'
        );
      } else if (type === 'terms') {
        openModal(
          'Terms of Use (Foundation Notice)',
          '<p class="modal-text">Destination highlights, sample itinerary outlines, and indicative budgets shown on Yatra Sphere are informational guides only and do not constitute live travel bookings or commercial offers.</p>'
        );
      } else {
        openModal(
          'Demo Data Notice',
          '<p class="modal-text">All traveler stories, indicative budget figures, and sample itineraries are clearly labelled illustrative examples while backend trip-planning services are yet to be connected.</p>'
        );
      }
    });
  });
});
