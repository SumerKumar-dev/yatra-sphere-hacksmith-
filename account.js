/**
 * Yatra Sphere — Login, Signup, User Dashboard, My Trips, Travel Checklist & Profile Logic
 * Pure Vanilla JavaScript (ES6+) — No frameworks or external libraries.
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const Store = window.YatraAccountStore;
  const CATALOG = Array.isArray(window.YATRA_DESTINATIONS) ? window.YATRA_DESTINATIONS : [];
  if (!Store) return;

  const isAuthPage = document.body.classList.contains('page-auth');
  const isDashboardPage = document.body.classList.contains('page-dashboard');
  if (!isAuthPage && !isDashboardPage) return;

  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const toastEl = document.getElementById('toast');
  let toastTimer = null;

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

  function openAccountModal(title, html) {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.textContent = title;
    modalBody.innerHTML = html;
    modalBackdrop.hidden = false;
    document.body.style.overflow = 'hidden';
    if (modalCloseBtn) modalCloseBtn.focus();
  }

  function closeAccountModal() {
    if (!modalBackdrop) return;
    modalBackdrop.hidden = true;
    document.body.style.overflow = '';
  }

  function setFieldError(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.hidden = !msg;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
  }

  function computeTripCost(trip) {
    if (trip && Array.isArray(trip.days) && trip.days.length > 0) {
      return trip.days.reduce((sum, d) => sum + (Number(d.estimatedExpense) || 0), 0);
    }
    return Number(trip && trip.config && trip.config.budget) || 0;
  }

  function syncGlobalHeaderAuthButton() {
    const { data } = Store.auth.getSession();
    const session = data && data.session;
    const desktopBtn = document.getElementById('open-auth-btn');
    const mobileBtn = document.getElementById('mobile-auth-btn');

    if (session && session.user) {
      const firstName = session.user.name.split(/\s+/)[0] || 'Account';
      if (desktopBtn) desktopBtn.textContent = `Account · ${firstName}`;
      if (mobileBtn) mobileBtn.textContent = `Account · ${firstName}`;
    } else {
      if (desktopBtn) desktopBtn.textContent = 'Login / Sign Up';
      if (mobileBtn) mobileBtn.textContent = 'Login / Sign Up';
    }
  }

  // =========================================================================
  // 1. Password Visibility Toggles (Login & Signup)
  // =========================================================================
  document.querySelectorAll('[data-toggle-password]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const inputId = btn.dataset.togglePassword;
      const input = document.getElementById(inputId);
      if (!input) return;

      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      btn.setAttribute('aria-pressed', String(isHidden));
      btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
      const labelEl = btn.querySelector('.password-toggle-text');
      if (labelEl) labelEl.textContent = isHidden ? 'Hide' : 'Show';
    });
  });

  // =========================================================================
  // 2. LOGIN & SIGNUP PAGES
  // =========================================================================
  if (isAuthPage) {
    const sessionBanner = document.getElementById('auth-already-signed-in');
    const sessionText = document.getElementById('auth-session-text');
    const quickLogoutBtn = document.getElementById('auth-quick-logout-btn');

    function refreshAuthBanner() {
      const { data } = Store.auth.getSession();
      const session = data && data.session;
      if (session && session.user && sessionBanner && sessionText) {
        sessionText.textContent = `Currently signed in as ${session.user.name} (${session.user.email}).`;
        sessionBanner.hidden = false;
      } else if (sessionBanner) {
        sessionBanner.hidden = true;
      }
      syncGlobalHeaderAuthButton();
    }

    refreshAuthBanner();

    if (quickLogoutBtn) {
      quickLogoutBtn.addEventListener('click', () => {
        Store.auth.signOut();
        refreshAuthBanner();
        showToast('Signed out of your local demo session.');
      });
    }

    // Login Form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      const emailInput = document.getElementById('login-email');
      const passwordInput = document.getElementById('login-password');
      const emailErr = document.getElementById('login-email-error');
      const passwordErr = document.getElementById('login-password-error');
      const formErr = document.getElementById('login-form-error');
      const demoBtn = document.getElementById('demo-traveler-login-btn');

      loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        setFieldError(emailErr, '');
        setFieldError(passwordErr, '');
        setFieldError(formErr, '');

        const email = emailInput ? emailInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value : '';
        let valid = true;

        if (!isValidEmail(email)) {
          setFieldError(emailErr, 'Enter a valid email address.');
          if (emailInput) emailInput.focus();
          valid = false;
        }
        if (!password) {
          setFieldError(passwordErr, 'Enter your password.');
          if (valid && passwordInput) passwordInput.focus();
          valid = false;
        }
        if (!valid) return;

        const res = await Store.auth.signInWithPassword({ email, password });
        if (res.error) {
          setFieldError(formErr, res.error.message);
          return;
        }

        window.location.href = 'dashboard.html';
      });

      if (demoBtn) {
        demoBtn.addEventListener('click', async () => {
          await Store.auth.signInDemoTraveler();
          window.location.href = 'dashboard.html';
        });
      }
    }

    // Signup Form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
      const nameInput = document.getElementById('signup-name');
      const emailInput = document.getElementById('signup-email');
      const cityInput = document.getElementById('signup-city');
      const passwordInput = document.getElementById('signup-password');
      const confirmInput = document.getElementById('signup-confirm-password');

      const nameErr = document.getElementById('signup-name-error');
      const emailErr = document.getElementById('signup-email-error');
      const passwordErr = document.getElementById('signup-password-error');
      const confirmErr = document.getElementById('signup-confirm-error');
      const formErr = document.getElementById('signup-form-error');

      signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        setFieldError(nameErr, '');
        setFieldError(emailErr, '');
        setFieldError(passwordErr, '');
        setFieldError(confirmErr, '');
        setFieldError(formErr, '');

        const name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const homeCity = cityInput ? cityInput.value.trim() : 'New Delhi';
        const password = passwordInput ? passwordInput.value : '';
        const confirmPassword = confirmInput ? confirmInput.value : '';

        let valid = true;
        let firstInvalid = null;

        if (name.length < 2) {
          setFieldError(nameErr, 'Please enter your full name (at least 2 characters).');
          firstInvalid = firstInvalid || nameInput;
          valid = false;
        }
        if (!isValidEmail(email)) {
          setFieldError(emailErr, 'Please enter a valid email address.');
          firstInvalid = firstInvalid || emailInput;
          valid = false;
        }
        if (password.length < 8) {
          setFieldError(passwordErr, 'Password must be at least 8 characters long.');
          firstInvalid = firstInvalid || passwordInput;
          valid = false;
        }
        if (confirmPassword !== password || !confirmPassword) {
          setFieldError(confirmErr, 'Passwords do not match.');
          firstInvalid = firstInvalid || confirmInput;
          valid = false;
        }

        if (!valid) {
          if (firstInvalid) firstInvalid.focus();
          return;
        }

        const res = await Store.auth.signUp({ name, email, password, homeCity });
        if (res.error) {
          setFieldError(formErr, res.error.message);
          return;
        }

        if (res.data && res.data.needsEmailConfirmation) {
          setFieldError(
            formErr,
            `Account created for ${res.data.email}. Check your inbox to confirm your email address, then sign in on Login.`
          );
          if (formErr) {
            formErr.style.background = '#ecfdf5';
            formErr.style.borderColor = '#10b981';
            formErr.style.color = '#065f46';
          }
          return;
        }

        window.location.href = 'dashboard.html';
      });
    }
    return;
  }

  // =========================================================================
  // 3. USER DASHBOARD, MY TRIPS, CHECKLIST & PROFILE (dashboard.html)
  // =========================================================================
  const authGateEl = document.getElementById('dashboard-auth-gate');
  const workspaceEl = document.getElementById('dashboard-workspace');
  const gateDemoBtn = document.getElementById('gate-demo-signin-btn');

  const dashTabBtns = document.querySelectorAll('[data-dash-tab]');
  const dashPanels = {
    overview: document.getElementById('dash-panel-overview'),
    trips: document.getElementById('dash-panel-trips'),
    checklist: document.getElementById('dash-panel-checklist'),
    profile: document.getElementById('dash-panel-profile')
  };

  const dashState = {
    activeTab: 'overview',
    user: null,
    tripFilter: 'all',
    tripQuery: '',
    checklistStatus: 'all',
    checklistCategory: 'all',
    checklistItems: [],
    checklistLastSavedAt: null
  };

  function getGreetingPrefix() {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  }

  function getInitials(name) {
    const parts = String(name || 'YS')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (parts[0] || 'YS').slice(0, 2).toUpperCase();
  }

  function switchDashTab(tabName) {
    if (!dashPanels[tabName]) tabName = 'overview';
    dashState.activeTab = tabName;

    dashTabBtns.forEach((btn) => {
      const isActive = btn.dataset.dashTab === tabName;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });

    Object.keys(dashPanels).forEach((key) => {
      if (dashPanels[key]) dashPanels[key].hidden = key !== tabName;
    });

    if (window.location.protocol !== 'file:') {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', tabName);
        window.history.replaceState({}, '', url.toString());
      } catch (_err) {
        // Ignore URL update error
      }
    }
  }

  dashTabBtns.forEach((btn) => {
    btn.addEventListener('click', () => switchDashTab(btn.dataset.dashTab));
  });

  document.addEventListener('click', (event) => {
    const jumpBtn = event.target.closest('[data-jump-tab]');
    if (jumpBtn) {
      switchDashTab(jumpBtn.dataset.jumpTab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  function renderAvatarNode(el, user) {
    if (!el || !user) return;
    if (user.profileImage) {
      el.innerHTML = `<img src="${escapeHtml(user.profileImage)}" alt="${escapeHtml(user.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" />`;
    } else {
      el.textContent = getInitials(user.name);
    }
  }

  function renderSidebarAndHeader() {
    const user = dashState.user;
    if (!user) return;
    const avatarEl = document.getElementById('sidebar-user-avatar');
    const profilePreviewEl = document.getElementById('profile-avatar-preview');
    const nameEl = document.getElementById('sidebar-user-name');
    const emailEl = document.getElementById('sidebar-user-email');
    const bannerSub = document.getElementById('dashboard-banner-subtitle');
    const modeBanner = document.getElementById('dashboard-backend-banner');

    renderAvatarNode(avatarEl, user);
    renderAvatarNode(profilePreviewEl, user);
    if (nameEl) nameEl.textContent = user.name;
    if (emailEl) emailEl.textContent = user.email;
    if (bannerSub) {
      const modeTag = Store.isSupabaseSession && Store.isSupabaseSession() ? 'Supabase Synced' : 'Local Demo';
      bannerSub.textContent = `Signed in as ${user.name} (${modeTag}) · ${user.homeCity || 'India'} · ${user.preferredTravelType || 'Friends'} pace`;
    }
    if (modeBanner) {
      const isLiveSupa = Boolean(Store.isSupabaseSession && Store.isSupabaseSession());
      modeBanner.innerHTML = isLiveSupa
        ? '<strong>Live Supabase Session Connected:</strong> Profile, Trips, Intermediate Stops, Itineraries, Budgets, Wishlists, Checklists &amp; Profile Images (<code>profile-images</code>) are syncing with Supabase.'
        : '<strong>Frontend Demo Session (localStorage):</strong> Exploring in local demo mode. Sign up or log in with an email account to sync live with Supabase Postgres &amp; Storage.';
    }
    syncGlobalHeaderAuthButton();
  }

  // -------------------------------------------------------------------------
  // Dashboard Overview Rendering
  // -------------------------------------------------------------------------
  function renderOverview() {
    const user = dashState.user;
    if (!user) return;

    const { data: allTrips } = Store.trips.listTrips();
    const { data: wishlistIds } = Store.wishlist.listIds();
    const upcomingTrips = allTrips.filter((t) => t.status === 'upcoming');
    const previousTrips = allTrips.filter((t) => t.status === 'completed');

    const welcomeHeading = document.getElementById('dash-welcome-heading');
    const welcomeSub = document.getElementById('dash-welcome-sub');
    if (welcomeHeading) {
      welcomeHeading.textContent = `${getGreetingPrefix()}, ${user.name}`;
    }
    if (welcomeSub) {
      welcomeSub.textContent = `You have ${upcomingTrips.length} upcoming trip${upcomingTrips.length === 1 ? '' : 's'}, ${allTrips.length} saved itinerar${allTrips.length === 1 ? 'y' : 'ies'}, and ${wishlistIds.length} wishlist destination${wishlistIds.length === 1 ? '' : 's'}.`;
    }

    // 4-Column KPI Strip
    const kpiGrid = document.getElementById('dash-kpi-grid');
    if (kpiGrid) {
      const packedCount = dashState.checklistItems.filter((i) => i.completed).length;
      const totalItems = dashState.checklistItems.length;
      kpiGrid.innerHTML = `
        <article class="dash-kpi-card">
          <span class="dash-kpi-label">Upcoming Trips</span>
          <strong class="dash-kpi-value">${upcomingTrips.length}</strong>
          <span class="dash-kpi-sub">Active planned departures</span>
        </article>
        <article class="dash-kpi-card">
          <span class="dash-kpi-label">Saved Itineraries</span>
          <strong class="dash-kpi-value">${allTrips.length}</strong>
          <span class="dash-kpi-sub">Synced with Trip Planner</span>
        </article>
        <article class="dash-kpi-card">
          <span class="dash-kpi-label">Previous Trips</span>
          <strong class="dash-kpi-value">${previousTrips.length}</strong>
          <span class="dash-kpi-sub">Completed journeys</span>
        </article>
        <article class="dash-kpi-card">
          <span class="dash-kpi-label">Packing Progress</span>
          <strong class="dash-kpi-value">${packedCount}/${totalItems}</strong>
          <span class="dash-kpi-sub">${wishlistIds.length} destination${wishlistIds.length === 1 ? '' : 's'} wishlisted</span>
        </article>
      `;
    }

    // Profile Snapshot
    const profileSummaryEl = document.getElementById('overview-profile-summary');
    if (profileSummaryEl) {
      const memberDate = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
        : '2026';
      profileSummaryEl.innerHTML = `
        <div class="profile-kv"><span>Traveler Name</span><strong>${escapeHtml(user.name)}</strong></div>
        <div class="profile-kv"><span>Email</span><strong>${escapeHtml(user.email)}</strong></div>
        <div class="profile-kv"><span>Home City</span><strong>${escapeHtml(user.homeCity || 'New Delhi')}</strong></div>
        <div class="profile-kv"><span>Preferred Style</span><strong>${escapeHtml(user.preferredTravelType || 'Friends')} · Demo Member (${escapeHtml(memberDate)})</strong></div>
      `;
    }

    // Upcoming Trips Cards
    const upcomingEl = document.getElementById('overview-upcoming-list');
    if (upcomingEl) {
      if (upcomingTrips.length === 0) {
        upcomingEl.innerHTML = `
          <div class="dash-empty-inline">
            <p>No upcoming trips scheduled yet. Generate a route in the AI Smart Trip Planner or add one in My Trips.</p>
            <a href="planner.html" class="btn-card-action">Plan Upcoming Trip</a>
          </div>
        `;
      } else {
        upcomingEl.innerHTML = upcomingTrips
          .slice(0, 4)
          .map((t) => buildCompactTripCardHtml(t))
          .join('');
      }
    }

    // Saved Itineraries Table
    const savedListEl = document.getElementById('overview-saved-list');
    if (savedListEl) {
      if (allTrips.length === 0) {
        savedListEl.innerHTML = `
          <div class="dash-empty-inline">
            <p>No saved itineraries found in your browser yet.</p>
            <a href="planner.html" class="btn-card-action">Build Your First Itinerary</a>
          </div>
        `;
      } else {
        savedListEl.innerHTML = `
          <table class="dash-itineraries-table" aria-label="Saved itineraries summary">
            <thead>
              <tr>
                <th>Route &amp; Title</th>
                <th>Start Date</th>
                <th>Duration</th>
                <th>Est. Cost</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${allTrips
                .map((trip) => {
                  const total = computeTripCost(trip);
                  const statusLabel = trip.status === 'completed' ? 'Previous' : 'Upcoming';
                  return `
                    <tr>
                      <td>
                        <strong>${escapeHtml(trip.title)}</strong>
                        <span class="table-sub-text">${escapeHtml(trip.config.origin)} &rarr; ${escapeHtml(trip.config.destination)}</span>
                      </td>
                      <td class="num-cell">${escapeHtml(Store.formatDateLabel(trip.config.startDate, 0))}</td>
                      <td class="num-cell">${trip.config.days} Days &middot; ${trip.config.travelers} pax</td>
                      <td class="num-cell">${formatINR(total)}</td>
                      <td><span class="status-text-${trip.status}">${statusLabel}</span></td>
                      <td>
                        <div class="table-action-links">
                          <button type="button" class="btn-link" data-view-trip="${escapeHtml(trip.id)}">View</button>
                          <a href="planner.html?tripId=${encodeURIComponent(trip.id)}" class="btn-link">Planner</a>
                        </div>
                      </td>
                    </tr>
                  `;
                })
                .join('')}
            </tbody>
          </table>
        `;
      }
    }

    // Previous Trips Cards
    const previousEl = document.getElementById('overview-previous-list');
    if (previousEl) {
      if (previousTrips.length === 0) {
        previousEl.innerHTML = `
          <div class="dash-empty-inline">
            <p>No previous trips logged yet. Mark a finished itinerary as Completed inside My Trips to build your travel history.</p>
          </div>
        `;
      } else {
        previousEl.innerHTML = previousTrips
          .slice(0, 4)
          .map((t) => buildCompactTripCardHtml(t))
          .join('');
      }
    }

    // Wishlist Grid
    const wishlistGridEl = document.getElementById('overview-wishlist-grid');
    if (wishlistGridEl) {
      const savedDests = wishlistIds
        .map((id) => CATALOG.find((d) => d.id === id))
        .filter(Boolean);

      if (savedDests.length === 0) {
        wishlistGridEl.innerHTML = `
          <div class="dash-empty-inline">
            <p>Your destination wishlist is currently empty. Save destinations from the Homepage or Explore catalog.</p>
            <a href="explore.html" class="btn-card-action">Explore 16 Destinations</a>
          </div>
        `;
      } else {
        wishlistGridEl.innerHTML = savedDests
          .map(
            (dest) => `
            <article class="dash-wishlist-card">
              <div class="dash-wish-media">
                <img src="${escapeHtml(dest.image)}" alt="${escapeHtml(dest.name)}" loading="lazy" referrerpolicy="no-referrer" />
              </div>
              <div class="dash-wish-body">
                <p class="stay-card-kicker">${escapeHtml(dest.stateRegion)} &middot; ${escapeHtml(dest.category)}</p>
                <h4 class="dash-wish-title">${escapeHtml(dest.name)}</h4>
                <p class="dash-wish-meta">${escapeHtml(dest.recommendedDuration)} &middot; Est. ${escapeHtml(dest.budgetLabel)}</p>
                <div class="dash-wish-actions">
                  <a href="explore.html?dest=${encodeURIComponent(dest.id)}" class="btn-link">Guide</a>
                  <a href="planner.html?dest=${encodeURIComponent(dest.name)}" class="btn-link">Plan</a>
                  <button type="button" class="btn-link" data-dash-remove-wish="${escapeHtml(dest.id)}">Remove</button>
                </div>
              </div>
            </article>
          `
          )
          .join('');
      }
    }
  }

  function buildCompactTripCardHtml(trip) {
    const total = computeTripCost(trip);
    const statusLabel = trip.status === 'completed' ? 'Previous Trip' : 'Upcoming Trip';
    return `
      <article class="dash-trip-card">
        <p class="stay-card-kicker">${escapeHtml(statusLabel)} &middot; ${escapeHtml(trip.config.travelType)}</p>
        <h4 class="dash-trip-title">${escapeHtml(trip.title)}</h4>
        <p class="dash-trip-meta">
          ${escapeHtml(Store.formatDateLabel(trip.config.startDate, 0))} &middot; ${trip.config.days} Days &middot; ${trip.config.travelers} Traveller(s)
        </p>
        <p class="dash-trip-cost">Est. Total: <strong>${formatINR(total)}</strong></p>
        <div class="dash-trip-actions">
          <button type="button" class="btn-card-action btn-sm" data-view-trip="${escapeHtml(trip.id)}">View Itinerary</button>
          <button type="button" class="btn-link" data-edit-trip="${escapeHtml(trip.id)}">Edit</button>
        </div>
      </article>
    `;
  }

  // -------------------------------------------------------------------------
  // My Trips View (View, Add, Edit, Delete)
  // -------------------------------------------------------------------------
  const myTripsListEl = document.getElementById('my-trips-list');
  const myTripsEmptyEl = document.getElementById('my-trips-empty');
  const tripFilterBtns = document.querySelectorAll('[data-trip-filter]');
  const tripsSearchInput = document.getElementById('trips-search-input');

  function renderMyTrips() {
    if (!myTripsListEl) return;
    const { data: allTrips } = Store.trips.listTrips();
    const query = dashState.tripQuery.trim().toLowerCase();

    const filtered = allTrips.filter((trip) => {
      if (dashState.tripFilter !== 'all' && trip.status !== dashState.tripFilter) return false;
      if (query) {
        const blob = `${trip.title} ${trip.config.origin} ${trip.config.destination} ${trip.notes || ''}`.toLowerCase();
        if (!blob.includes(query)) return false;
      }
      return true;
    });

    myTripsListEl.innerHTML = filtered
      .map((trip) => {
        const total = computeTripCost(trip);
        const statusLabel = trip.status === 'completed' ? 'Previous' : 'Upcoming';
        const stopsList = Array.isArray(trip.stops)
          ? trip.stops.map((s) => (typeof s === 'string' ? s : s.stopName || s.stop_name || '')).filter(Boolean)
          : [];
        const dynamicMapsUrl =
          window.YatraSupabase && typeof window.YatraSupabase.buildGoogleMapsDirectionsUrl === 'function'
            ? window.YatraSupabase.buildGoogleMapsDirectionsUrl(trip, trip.stops || [])
            : '';
        return `
          <article class="my-trip-row-card">
            <div class="my-trip-main">
              <p class="stay-card-kicker">${escapeHtml(statusLabel)} &middot; ${escapeHtml(trip.config.origin)} &rarr; ${escapeHtml(trip.config.destination)}${trip.config.travelMode ? ` &middot; ${escapeHtml(trip.config.travelMode)}` : ''}</p>
              <h3 class="my-trip-title">${escapeHtml(trip.title)}</h3>
              <p class="my-trip-meta">
                <span>Starts: <strong>${escapeHtml(Store.formatDateLabel(trip.config.startDate, 0))}</strong></span>
                <span aria-hidden="true">&middot;</span>
                <span>${trip.config.days} Day${trip.config.days === 1 ? '' : 's'}</span>
                <span aria-hidden="true">&middot;</span>
                <span>${trip.config.travelers} Traveller${trip.config.travelers === 1 ? '' : 's'} (${escapeHtml(trip.config.travelType || 'Friends')})</span>
                <span aria-hidden="true">&middot;</span>
                <span>Est. <strong>${formatINR(total)}</strong></span>
              </p>
              ${stopsList.length > 0 ? `<p class="my-trip-notes"><strong>Stops:</strong> ${escapeHtml(stopsList.join(' → '))}</p>` : ''}
              ${trip.notes ? `<p class="my-trip-notes">${escapeHtml(trip.notes)}</p>` : ''}
            </div>

            <div class="my-trip-actions">
              <button type="button" class="btn btn-primary btn-sm" data-view-trip="${escapeHtml(trip.id)}">View Itinerary</button>
              ${dynamicMapsUrl ? `<a href="${escapeHtml(dynamicMapsUrl)}" target="_blank" rel="noopener noreferrer" class="btn-card-action btn-sm">Google Maps &nearr;</a>` : ''}
              <button type="button" class="btn-card-action btn-sm" data-edit-trip="${escapeHtml(trip.id)}">Edit Details</button>
              <a href="planner.html?tripId=${encodeURIComponent(trip.id)}" class="btn-card-action btn-sm">Open in Planner</a>
              <button type="button" class="btn-link trip-delete-btn" data-delete-trip="${escapeHtml(trip.id)}">Delete</button>
            </div>
          </article>
        `;
      })
      .join('');

    if (myTripsEmptyEl) myTripsEmptyEl.hidden = filtered.length > 0;
  }

  function openViewItineraryModal(tripId) {
    const { data: allTrips } = Store.trips.listTrips();
    const trip = allTrips.find((t) => t.id === tripId);
    if (!trip) return;
    const total = computeTripCost(trip);
    const daysHtml = (trip.days || [])
      .map(
        (d) => `
        <div class="modal-day-block">
          <div class="modal-day-head">
            <strong>Day ${d.dayNumber}: ${escapeHtml(d.dayTitle)}</strong>
            <span>${escapeHtml(d.dateLabel || '')} &middot; Est. ${formatINR(d.estimatedExpense)}</span>
          </div>
          <p><strong>Morning:</strong> ${escapeHtml(d.morning)}</p>
          <p><strong>Afternoon:</strong> ${escapeHtml(d.afternoon)}</p>
          <p><strong>Evening:</strong> ${escapeHtml(d.evening)}</p>
          ${d.travelTip ? `<p class="modal-day-tip"><strong>Tip:</strong> ${escapeHtml(d.travelTip)}</p>` : ''}
        </div>
      `
      )
      .join('');

    openAccountModal(
      trip.title,
      `
        <p class="modal-meta">
          ${escapeHtml(trip.config.origin)} &rarr; ${escapeHtml(trip.config.destination)} &middot; ${trip.config.days} Days &middot; ${trip.config.travelers} Traveller(s) (${escapeHtml(trip.config.travelType)}) &middot; Est. Total ${formatINR(total)}
        </p>
        ${trip.notes ? `<p class="modal-notice"><strong>Trip Notes:</strong> ${escapeHtml(trip.notes)}</p>` : ''}
        <div class="modal-days-scroll">
          ${daysHtml || '<p class="modal-text">No day-by-day schedule entries yet. Open in the AI Smart Trip Planner to generate detailed activities.</p>'}
        </div>
        <div class="modal-actions-row">
          <a href="planner.html?tripId=${encodeURIComponent(trip.id)}" class="btn btn-primary">Edit Full Schedule in Planner &rarr;</a>
          <button type="button" class="btn-card-action" id="modal-edit-trip-btn">Edit Trip Details</button>
        </div>
      `
    );

    const editBtn = document.getElementById('modal-edit-trip-btn');
    if (editBtn) {
      editBtn.addEventListener('click', () => openEditOrAddTripModal(trip));
    }
  }

  function openEditOrAddTripModal(existingTrip = null) {
    const isEdit = Boolean(existingTrip);
    const destOptions = CATALOG.map((d) => {
      const selected = existingTrip && existingTrip.config.destination === d.name ? 'selected' : '';
      return `<option value="${escapeHtml(d.name)}" ${selected}>${escapeHtml(d.name)} (${escapeHtml(d.stateRegion)})</option>`;
    }).join('');

    const defaultDate = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
    const titleVal = existingTrip ? existingTrip.title : '';
    const originVal = existingTrip ? existingTrip.config.origin : dashState.user.homeCity || 'New Delhi';
    const startVal = existingTrip ? existingTrip.config.startDate : defaultDate;
    const daysVal = existingTrip ? existingTrip.config.days : 4;
    const travelersVal = existingTrip ? existingTrip.config.travelers : 2;
    const budgetVal = existingTrip ? existingTrip.config.budget : 28000;
    const typeVal = existingTrip ? existingTrip.config.travelType : 'Friends';
    const statusVal = existingTrip ? existingTrip.status : 'upcoming';
    const notesVal = existingTrip ? existingTrip.notes || '' : '';

    openAccountModal(
      isEdit ? 'Edit Trip Details' : 'Add New Trip',
      `
        <form id="modal-trip-form" class="modal-form">
          <div class="modal-field">
            <label for="mtrip-title">Trip Title</label>
            <input type="text" id="mtrip-title" value="${escapeHtml(titleVal)}" placeholder="e.g. Autumn Escape to Manali" required />
          </div>
          <div class="wizard-fields-grid">
            <div class="modal-field">
              <label for="mtrip-origin">Starting City</label>
              <input type="text" id="mtrip-origin" value="${escapeHtml(originVal)}" required />
            </div>
            <div class="modal-field">
              <label for="mtrip-dest">Destination</label>
              <select id="mtrip-dest">${destOptions}</select>
            </div>
            <div class="modal-field">
              <label for="mtrip-date">Start Date</label>
              <input type="date" id="mtrip-date" value="${escapeHtml(startVal)}" required />
            </div>
            <div class="modal-field">
              <label for="mtrip-days">Days (1–10)</label>
              <input type="number" id="mtrip-days" min="1" max="10" value="${Number(daysVal)}" required />
            </div>
            <div class="modal-field">
              <label for="mtrip-travelers">Travellers (1–12)</label>
              <input type="number" id="mtrip-travelers" min="1" max="12" value="${Number(travelersVal)}" required />
            </div>
            <div class="modal-field">
              <label for="mtrip-budget">Target Budget (INR)</label>
              <input type="number" id="mtrip-budget" min="3000" step="500" value="${Number(budgetVal)}" required />
            </div>
            <div class="modal-field">
              <label for="mtrip-type">Travel Style</label>
              <select id="mtrip-type">
                <option value="Solo" ${typeVal === 'Solo' ? 'selected' : ''}>Solo</option>
                <option value="Friends" ${typeVal === 'Friends' ? 'selected' : ''}>Friends</option>
                <option value="Family" ${typeVal === 'Family' ? 'selected' : ''}>Family</option>
              </select>
            </div>
            <div class="modal-field">
              <label for="mtrip-status">Trip Status</label>
              <select id="mtrip-status">
                <option value="upcoming" ${statusVal === 'upcoming' ? 'selected' : ''}>Upcoming</option>
                <option value="completed" ${statusVal === 'completed' ? 'selected' : ''}>Previous / Completed</option>
              </select>
            </div>
          </div>
          <div class="modal-field">
            <label for="mtrip-notes">Personal Notes</label>
            <textarea id="mtrip-notes" rows="2" placeholder="Flight preferences, stay neighborhood, or special reminders...">${escapeHtml(notesVal)}</textarea>
          </div>
          <div class="modal-actions-row">
            <button type="submit" class="btn btn-primary">${isEdit ? 'Save Trip Changes' : 'Save New Trip'}</button>
            <button type="button" class="btn-card-action" id="mtrip-cancel-btn">Cancel</button>
          </div>
        </form>
      `
    );

    const cancelBtn = document.getElementById('mtrip-cancel-btn');
    if (cancelBtn) cancelBtn.addEventListener('click', closeAccountModal);

    const tripForm = document.getElementById('modal-trip-form');
    if (tripForm) {
      tripForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const title = document.getElementById('mtrip-title').value.trim();
        const origin = document.getElementById('mtrip-origin').value.trim();
        const destination = document.getElementById('mtrip-dest').value;
        const startDate = document.getElementById('mtrip-date').value;
        const days = Math.max(1, Math.min(10, Number(document.getElementById('mtrip-days').value) || 3));
        const travelers = Math.max(1, Math.min(12, Number(document.getElementById('mtrip-travelers').value) || 2));
        const budget = Math.max(3000, Number(document.getElementById('mtrip-budget').value) || 15000);
        const travelType = document.getElementById('mtrip-type').value;
        const status = document.getElementById('mtrip-status').value;
        const notes = document.getElementById('mtrip-notes').value.trim();

        if (isEdit) {
          Store.trips.updateTripDetails(existingTrip.id, {
            title,
            origin,
            destination,
            startDate,
            days,
            travelers,
            budget,
            travelType,
            status,
            notes
          });
          showToast(`Updated trip details for ${destination}.`);
        } else {
          const destObj = CATALOG.find((d) => d.name === destination) || CATALOG[0];
          const perDayBudget = Math.round(budget / days);
          const daysList = [];
          for (let i = 0; i < days; i += 1) {
            const spot = destObj && destObj.touristAttractions[i % destObj.touristAttractions.length];
            const dish = destObj && destObj.localFood[i % destObj.localFood.length];
            daysList.push({
              dayNumber: i + 1,
              dateLabel: Store.formatDateLabel(startDate, i),
              dayTitle: i === 0 ? `Arrival in ${destination}` : `${destination} Day ${i + 1}`,
              morning: spot ? `Explore ${spot.name} (${spot.note}).` : `Morning exploration in ${destination}.`,
              afternoon: dish ? `Enjoy regional ${dish.name} and local sights.` : `Afternoon neighborhood walk.`,
              evening: `Relaxed evening sunset stop and dinner.`,
              suggestedAttractions: spot ? [spot.name] : [destination],
              estimatedExpense: perDayBudget,
              travelTip: destObj ? destObj.seasonalNote : 'Carry weather-appropriate layers.'
            });
          }

          Store.trips.saveTrip({
            id: `trip_${Date.now()}`,
            userId: dashState.user.id,
            title: title || `${origin} → ${destination}`,
            status,
            notes,
            createdAt: new Date().toISOString(),
            variant: 1,
            config: {
              origin,
              destination,
              startDate,
              days,
              travelers,
              budget,
              travelType,
              interests: ['Nature', 'Food']
            },
            destinationMeta: destObj
              ? {
                  stateRegion: destObj.stateRegion,
                  category: destObj.category,
                  bestTimeToVisit: destObj.bestTimeToVisit,
                  baselinePerPerson: destObj.estimatedBudget
                }
              : {},
            days: daysList
          });
          showToast(`Added "${title || destination}" to My Trips.`);
        }

        closeAccountModal();
        refreshAllDashboardViews();
      });
    }
  }

  function openDeleteTripConfirmation(tripId) {
    const { data: allTrips } = Store.trips.listTrips();
    const trip = allTrips.find((t) => t.id === tripId);
    if (!trip) return;

    openAccountModal(
      'Delete Saved Trip?',
      `
        <p class="modal-text">
          Are you sure you want to remove <strong>${escapeHtml(trip.title)}</strong> (${escapeHtml(trip.config.origin)} &rarr; ${escapeHtml(trip.config.destination)}) from your saved trips?
        </p>
        <div class="modal-actions-row">
          <button type="button" class="btn btn-primary" id="confirm-delete-trip-btn">Delete Trip</button>
          <button type="button" class="btn-card-action" id="cancel-delete-trip-btn">Cancel</button>
        </div>
      `
    );

    const confirmBtn = document.getElementById('confirm-delete-trip-btn');
    const cancelBtn = document.getElementById('cancel-delete-trip-btn');
    if (cancelBtn) cancelBtn.addEventListener('click', closeAccountModal);
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        Store.trips.deleteTrip(tripId);
        closeAccountModal();
        refreshAllDashboardViews();
        showToast('Removed trip from My Trips.');
      });
    }
  }

  tripFilterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      dashState.tripFilter = btn.dataset.tripFilter || 'all';
      tripFilterBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-selected', String(active));
      });
      renderMyTrips();
    });
  });

  if (tripsSearchInput) {
    tripsSearchInput.addEventListener('input', () => {
      dashState.tripQuery = tripsSearchInput.value;
      renderMyTrips();
    });
  }

  const openAddTripBtn = document.getElementById('open-add-trip-btn');
  const emptyAddTripBtn = document.getElementById('empty-add-trip-btn');
  const seedSamplesBtn = document.getElementById('seed-sample-trips-btn');
  if (openAddTripBtn) openAddTripBtn.addEventListener('click', () => openEditOrAddTripModal(null));
  if (emptyAddTripBtn) emptyAddTripBtn.addEventListener('click', () => openEditOrAddTripModal(null));
  if (seedSamplesBtn) {
    seedSamplesBtn.addEventListener('click', () => {
      Store.trips.seedSampleTrips(dashState.user.id);
      refreshAllDashboardViews();
      showToast('Loaded sample upcoming and previous trips.');
    });
  }

  // -------------------------------------------------------------------------
  // Travel Checklist View
  // -------------------------------------------------------------------------
  const checklistAddForm = document.getElementById('checklist-add-form');
  const checklistItemInput = document.getElementById('checklist-item-input');
  const checklistCategorySelect = document.getElementById('checklist-category-select');
  const checklistTripSelect = document.getElementById('checklist-trip-select');
  const checklistListEl = document.getElementById('checklist-items-list');
  const checklistEmptyEl = document.getElementById('checklist-empty-state');
  const checklistProgressText = document.getElementById('checklist-progress-text');
  const checklistProgressBar = document.getElementById('checklist-progress-bar');
  const checklistLastSavedEl = document.getElementById('checklist-last-saved');
  const saveChecklistBtn = document.getElementById('save-checklist-btn');
  const clearCompletedChecklistBtn = document.getElementById('clear-completed-checklist-btn');
  const checklistStatusBtns = document.querySelectorAll('[data-checklist-status]');
  const checklistFilterCategory = document.getElementById('checklist-filter-category');

  function syncChecklistTripOptions() {
    if (!checklistTripSelect) return;
    const { data: allTrips } = Store.trips.listTrips();
    const options = ['<option value="General Travel">General Travel</option>'].concat(
      allTrips.map((t) => `<option value="${escapeHtml(t.config.destination)}">${escapeHtml(t.config.destination)} Trip</option>`)
    );
    checklistTripSelect.innerHTML = options.join('');
  }

  function persistChecklistProgress(showMessage = false) {
    if (!dashState.user) return;
    const { data } = Store.checklist.saveChecklist(dashState.user.id, dashState.checklistItems);
    dashState.checklistLastSavedAt = data ? data.lastSavedAt : new Date().toISOString();
    renderChecklist();
    renderOverview();
    if (showMessage) {
      showToast('Saved travel checklist progress in your browser.');
    }
  }

  function renderChecklist() {
    if (!checklistListEl) return;
    const total = dashState.checklistItems.length;
    const done = dashState.checklistItems.filter((i) => i.completed).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    if (checklistProgressText) {
      checklistProgressText.textContent = `${done} of ${total} items packed (${pct}%)`;
    }
    if (checklistProgressBar) {
      checklistProgressBar.style.width = `${pct}%`;
    }
    if (checklistLastSavedEl) {
      if (dashState.checklistLastSavedAt) {
        const tStr = new Date(dashState.checklistLastSavedAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        });
        checklistLastSavedEl.textContent = `Saved locally at ${tStr}`;
      } else {
        checklistLastSavedEl.textContent = 'Changes sync to localStorage';
      }
    }

    const filtered = dashState.checklistItems.filter((item) => {
      if (dashState.checklistStatus === 'pending' && item.completed) return false;
      if (dashState.checklistStatus === 'done' && !item.completed) return false;
      if (dashState.checklistCategory !== 'all' && item.category !== dashState.checklistCategory) return false;
      return true;
    });

    checklistListEl.innerHTML = filtered
      .map(
        (item) => `
        <div class="checklist-row ${item.completed ? 'is-completed' : ''}">
          <label class="checklist-row-label">
            <input type="checkbox" data-toggle-checklist="${escapeHtml(item.id)}" ${item.completed ? 'checked' : ''} />
            <span class="checklist-item-text">${escapeHtml(item.label)}</span>
          </label>
          <div class="checklist-row-meta">
            <span class="checklist-item-cat">${escapeHtml(item.category)} &middot; ${escapeHtml(item.tripLabel || 'General Travel')}</span>
            <button type="button" class="checklist-remove-btn" data-remove-checklist="${escapeHtml(item.id)}" aria-label="Remove ${escapeHtml(item.label)}">
              Remove
            </button>
          </div>
        </div>
      `
      )
      .join('');

    if (checklistEmptyEl) checklistEmptyEl.hidden = filtered.length > 0;
  }

  if (checklistAddForm) {
    checklistAddForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const label = checklistItemInput ? checklistItemInput.value.trim() : '';
      if (!label) {
        if (checklistItemInput) checklistItemInput.focus();
        showToast('Enter a packing item name before adding.');
        return;
      }
      const category = checklistCategorySelect ? checklistCategorySelect.value : 'Essentials';
      const tripLabel = checklistTripSelect ? checklistTripSelect.value : 'General Travel';

      dashState.checklistItems.unshift({
        id: `chk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        label,
        category,
        tripLabel,
        completed: false,
        createdAt: new Date().toISOString()
      });
      if (checklistItemInput) checklistItemInput.value = '';
      persistChecklistProgress(false);
      showToast(`Added "${label}" to your travel checklist.`);
    });
  }

  if (checklistListEl) {
    checklistListEl.addEventListener('change', (event) => {
      const cb = event.target.closest('[data-toggle-checklist]');
      if (!cb) return;
      const item = dashState.checklistItems.find((i) => i.id === cb.dataset.toggleChecklist);
      if (item) {
        item.completed = cb.checked;
        persistChecklistProgress(false);
      }
    });

    checklistListEl.addEventListener('click', (event) => {
      const rmBtn = event.target.closest('[data-remove-checklist]');
      if (!rmBtn) return;
      dashState.checklistItems = dashState.checklistItems.filter(
        (i) => i.id !== rmBtn.dataset.removeChecklist
      );
      persistChecklistProgress(false);
      showToast('Removed item from checklist.');
    });
  }

  document.querySelectorAll('[data-checklist-preset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const presetKey = btn.dataset.checklistPreset;
      const tripLabel = checklistTripSelect ? checklistTripSelect.value : 'General Travel';
      const presetItems = Store.checklist.getPresetItems(presetKey, tripLabel);
      const existingLabels = new Set(dashState.checklistItems.map((i) => i.label.toLowerCase()));
      const additions = presetItems.filter((p) => !existingLabels.has(p.label.toLowerCase()));

      if (additions.length === 0) {
        showToast('All items from this preset are already in your checklist.');
        return;
      }
      dashState.checklistItems = [...additions, ...dashState.checklistItems];
      persistChecklistProgress(false);
      showToast(`Added ${additions.length} ${presetKey} packing items.`);
    });
  });

  if (saveChecklistBtn) {
    saveChecklistBtn.addEventListener('click', () => persistChecklistProgress(true));
  }

  if (clearCompletedChecklistBtn) {
    clearCompletedChecklistBtn.addEventListener('click', () => {
      const before = dashState.checklistItems.length;
      dashState.checklistItems = dashState.checklistItems.filter((i) => !i.completed);
      const removed = before - dashState.checklistItems.length;
      persistChecklistProgress(false);
      showToast(removed > 0 ? `Removed ${removed} packed item(s).` : 'No packed items to clear.');
    });
  }

  checklistStatusBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      dashState.checklistStatus = btn.dataset.checklistStatus || 'all';
      checklistStatusBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-selected', String(active));
      });
      renderChecklist();
    });
  });

  if (checklistFilterCategory) {
    checklistFilterCategory.addEventListener('change', () => {
      dashState.checklistCategory = checklistFilterCategory.value;
      renderChecklist();
    });
  }

  // -------------------------------------------------------------------------
  // Profile & Logout View
  // -------------------------------------------------------------------------
  const profileForm = document.getElementById('profile-edit-form');
  const profileNameInput = document.getElementById('profile-name');
  const profileEmailInput = document.getElementById('profile-email');
  const profileCityInput = document.getElementById('profile-city');
  const profilePhoneInput = document.getElementById('profile-phone');
  const profileTravelTypeSelect = document.getElementById('profile-travel-type');
  const profileDietaryInput = document.getElementById('profile-dietary');
  const profileBioInput = document.getElementById('profile-bio');
  const profileFormError = document.getElementById('profile-form-error');
  const profileSaveStatus = document.getElementById('profile-save-status');

  function populateProfileForm() {
    const user = dashState.user;
    if (!user) return;
    if (profileNameInput) profileNameInput.value = user.name || '';
    if (profileEmailInput) profileEmailInput.value = user.email || '';
    if (profileCityInput) profileCityInput.value = user.homeCity || '';
    if (profilePhoneInput) profilePhoneInput.value = user.phone || '';
    if (profileTravelTypeSelect) profileTravelTypeSelect.value = user.preferredTravelType || 'Friends';
    if (profileDietaryInput) profileDietaryInput.value = user.dietaryNotes || '';
    if (profileBioInput) profileBioInput.value = user.bio || '';
  }

  const profileAvatarInput = document.getElementById('profile-avatar-file');

  if (profileAvatarInput) {
    profileAvatarInput.addEventListener('change', async (event) => {
      const file = event.target.files && event.target.files[0];
      if (!file || !dashState.user) return;
      setFieldError(profileFormError, '');
      if (profileSaveStatus) profileSaveStatus.textContent = 'Uploading avatar...';

      const res = await Store.profile.uploadAvatar(dashState.user.id, file);
      if (res.error) {
        if (profileSaveStatus) profileSaveStatus.textContent = '';
        setFieldError(profileFormError, res.error.message);
        return;
      }

      dashState.user.profileImage = res.data.publicUrl;
      renderSidebarAndHeader();
      if (profileSaveStatus) profileSaveStatus.textContent = 'Avatar uploaded to Supabase Storage.';
      showToast('Updated profile picture in Supabase Storage.');
    });
  }

  if (profileForm) {
    profileForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!dashState.user) return;
      setFieldError(profileFormError, '');
      if (profileSaveStatus) profileSaveStatus.textContent = '';

      const res = Store.profile.updateProfile(dashState.user.id, {
        name: profileNameInput ? profileNameInput.value : '',
        email: profileEmailInput ? profileEmailInput.value : '',
        homeCity: profileCityInput ? profileCityInput.value : '',
        phone: profilePhoneInput ? profilePhoneInput.value : '',
        preferredTravelType: profileTravelTypeSelect ? profileTravelTypeSelect.value : 'Friends',
        dietaryNotes: profileDietaryInput ? profileDietaryInput.value : '',
        bio: profileBioInput ? profileBioInput.value : ''
      });

      if (res.error) {
        setFieldError(profileFormError, res.error.message);
        return;
      }

      dashState.user = res.data;
      renderSidebarAndHeader();
      renderOverview();
      if (profileSaveStatus) {
        profileSaveStatus.textContent =
          Store.isSupabaseSession && Store.isSupabaseSession()
            ? 'Profile synced to Supabase.'
            : 'Profile saved locally.';
      }
      showToast('Updated personal profile information.');
    });
  }

  function handleLogout() {
    Store.auth.signOut();
    dashState.user = null;
    syncGlobalHeaderAuthButton();
    bootDashboard();
    showToast('Logged out of your Yatra Sphere session.');
  }

  ['sidebar-logout-btn', 'profile-logout-btn', 'profile-logout-secondary-btn'].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', handleLogout);
  });

  // Delegated Trip & Wishlist actions across Overview & My Trips
  document.addEventListener('click', (event) => {
    const viewBtn = event.target.closest('[data-view-trip]');
    if (viewBtn) {
      openViewItineraryModal(viewBtn.dataset.viewTrip);
      return;
    }

    const editBtn = event.target.closest('[data-edit-trip]');
    if (editBtn) {
      const { data: allTrips } = Store.trips.listTrips();
      const found = allTrips.find((t) => t.id === editBtn.dataset.editTrip);
      if (found) openEditOrAddTripModal(found);
      return;
    }

    const delBtn = event.target.closest('[data-delete-trip]');
    if (delBtn) {
      openDeleteTripConfirmation(delBtn.dataset.deleteTrip);
      return;
    }

    const removeWishBtn = event.target.closest('[data-dash-remove-wish]');
    if (removeWishBtn) {
      Store.wishlist.removeId(removeWishBtn.dataset.dashRemoveWish);
      renderOverview();
      showToast('Removed destination from your wishlist.');
    }
  });

  function refreshAllDashboardViews() {
    if (!dashState.user) return;
    const { data: chkRecord } = Store.checklist.getChecklist(dashState.user.id);
    dashState.checklistItems = chkRecord ? chkRecord.items : [];
    dashState.checklistLastSavedAt = chkRecord ? chkRecord.lastSavedAt : null;

    renderSidebarAndHeader();
    syncChecklistTripOptions();
    renderOverview();
    renderMyTrips();
    renderChecklist();
    populateProfileForm();
  }

  function bootDashboard() {
    const { data } = Store.auth.getSession();
    const session = data && data.session;
    syncGlobalHeaderAuthButton();

    if (!session || !session.user) {
      if (authGateEl) authGateEl.hidden = false;
      if (workspaceEl) workspaceEl.hidden = true;
      return;
    }

    dashState.user = session.user;
    if (authGateEl) authGateEl.hidden = true;
    if (workspaceEl) workspaceEl.hidden = false;

    const params = new URLSearchParams(window.location.search);
    const reqTab = params.get('tab');
    if (reqTab && dashPanels[reqTab]) {
      dashState.activeTab = reqTab;
    }

    refreshAllDashboardViews();
    switchDashTab(dashState.activeTab);
  }

  if (gateDemoBtn) {
    gateDemoBtn.addEventListener('click', async () => {
      await Store.auth.signInDemoTraveler();
      bootDashboard();
      showToast('Signed into Demo Traveler session (Aarav Mehta).');
    });
  }

  document.addEventListener('yatra:supabase-sync', () => {
    if (isDashboardPage) {
      bootDashboard();
    } else if (isAuthPage) {
      syncGlobalHeaderAuthButton();
    }
  });

  bootDashboard();
});
