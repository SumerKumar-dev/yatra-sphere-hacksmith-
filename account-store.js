/**
 * Yatra Sphere — User Account, Trips, Wishlist & Checklist Store
 * Synchronizes with Supabase Auth, PostgreSQL (13 tables) & Storage ('profile-images')
 * via window.YatraSupabase while retaining localStorage fallback for offline & Demo Traveler mode.
 *
 * SECURITY NOTE: Plaintext passwords are NEVER stored in localStorage or frontend code.
 * Supabase Auth manages password credentials server-side; demo fallback uses salted SHA-256.
 */

'use strict';

(function attachYatraAccountStore(global) {
  const KEYS = {
    USERS: 'yatraSphere_demoUsers',
    SESSION: 'yatraSphere_demoSession',
    TRIPS: 'yatraSphere_savedTrips',
    WISHLIST: 'yatraSphere_wishlist',
    CHECKLIST: 'yatraSphere_checklists'
  };

  const SUPABASE_MIGRATION_SCHEMA = {
    provider: 'Supabase (vdnzfnqrbtbvmoksqgum) + localStorage fallback',
    tables: [
      'public.profiles',
      'public.destinations',
      'public.trips',
      'public.trip_stops',
      'public.itineraries',
      'public.budgets',
      'public.hotels',
      'public.transport_options',
      'public.weather_information',
      'public.wishlists',
      'public.reviews',
      'public.packing_checklists',
      'public.chat_history'
    ]
  };

  function safeReadJson(key, fallback) {
    try {
      const raw = global.localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed !== null && parsed !== undefined ? parsed : fallback;
    } catch (_err) {
      return fallback;
    }
  }

  function safeWriteJson(key, value) {
    try {
      global.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (_err) {
      return false;
    }
  }

  function getSupa() {
    return global.YatraSupabase || null;
  }

  function isSupabaseSession() {
    const supa = getSupa();
    return Boolean(supa && supa.isAuthenticated());
  }

  function emitSyncEvent(detail = {}) {
    if (typeof document !== 'undefined' && typeof CustomEvent !== 'undefined') {
      document.dispatchEvent(new CustomEvent('yatra:supabase-sync', { detail }));
    }
  }

  function generateId(prefix) {
    if (global.crypto && typeof global.crypto.randomUUID === 'function') {
      return `${prefix}_${global.crypto.randomUUID()}`;
    }
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  function generateSalt() {
    if (global.crypto && typeof global.crypto.getRandomValues === 'function') {
      const bytes = new Uint8Array(16);
      global.crypto.getRandomValues(bytes);
      return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    }
    return `${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`;
  }

  async function hashPassword(password, salt) {
    const input = `${salt}::yatra-sphere-demo::${password}`;
    if (global.crypto && global.crypto.subtle && typeof TextEncoder !== 'undefined') {
      const data = new TextEncoder().encode(input);
      const digest = await global.crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
    }
    let h1 = 0xdeadbeef;
    let h2 = 0x41c6ce57;
    for (let i = 0; i < input.length; i += 1) {
      const ch = input.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
  }

  function sanitizeUserForSession(user) {
    if (!user) return null;
    return {
      id: user.id,
      name: user.name || user.full_name || 'Traveler',
      email: user.email || '',
      homeCity: user.homeCity || user.home_city || 'New Delhi',
      phone: user.phone || '',
      profileImage: user.profileImage || user.profile_image || '',
      preferredTravelType: user.preferredTravelType || user.preferred_travel_type || 'Friends',
      dietaryNotes: user.dietaryNotes || user.dietary_notes || '',
      bio: user.bio || '',
      isDemoPreset: Boolean(user.isDemoPreset),
      authProvider: user.authProvider || (user.isDemoPreset ? 'demo-local' : 'local'),
      createdAt: user.createdAt || user.created_at || new Date().toISOString()
    };
  }

  function getUsers() {
    const list = safeReadJson(KEYS.USERS, []);
    return Array.isArray(list) ? list : [];
  }

  function setUsers(users) {
    safeWriteJson(KEYS.USERS, users);
  }

  function upsertCachedUser(userRecord) {
    const users = getUsers();
    const idx = users.findIndex((u) => u.id === userRecord.id || u.email === userRecord.email);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...userRecord };
    } else {
      users.push(userRecord);
    }
    setUsers(users);
  }

  function getCurrentSessionSync() {
    const session = safeReadJson(KEYS.SESSION, null);
    if (session && session.userId) {
      const users = getUsers();
      const user = users.find((u) => u.id === session.userId);
      if (user) {
        return {
          userId: user.id,
          signedInAt: session.signedInAt,
          authProvider: user.authProvider || (isSupabaseSession() ? 'supabase' : 'local'),
          user: sanitizeUserForSession(user)
        };
      }
    }

    const supa = getSupa();
    const supaSession = supa ? supa.auth.getSession() : null;
    if (supaSession && supaSession.user) {
      const meta = supaSession.user.user_metadata || {};
      const fallbackUser = sanitizeUserForSession({
        id: supaSession.user.id,
        name: meta.full_name || (supaSession.user.email || 'Traveler').split('@')[0],
        email: supaSession.user.email || '',
        homeCity: meta.home_city || 'New Delhi',
        phone: meta.phone || '',
        profileImage: meta.profile_image || '',
        preferredTravelType: meta.preferred_travel_type || 'Friends',
        authProvider: 'supabase',
        createdAt: supaSession.user.created_at
      });
      return {
        userId: fallbackUser.id,
        signedInAt: new Date().toISOString(),
        authProvider: 'supabase',
        user: fallbackUser
      };
    }

    return null;
  }

  function computeOffsetDate(offsetDays) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function formatDateLabel(dateStr, offsetDays) {
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

  function getTripEndDate(trip) {
    const startStr = trip && trip.config && trip.config.startDate;
    const days = Math.max(1, Number(trip && trip.config && trip.config.days) || 1);
    const parts = String(startStr || '').split('-').map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
    return new Date(parts[0], parts[1] - 1, parts[2] + days - 1);
  }

  function deriveTripStatus(trip) {
    if (trip && (trip.status === 'completed' || trip.status === 'upcoming')) {
      return trip.status;
    }
    const endDate = getTripEndDate(trip);
    if (!endDate) return 'upcoming';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return endDate < today ? 'completed' : 'upcoming';
  }

  function addDaysIso(startDateStr, daysOffset) {
    const parts = String(startDateStr || '').split('-').map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
    const d = new Date(parts[0], parts[1] - 1, parts[2] + daysOffset);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function computeCategoryBudgetSplit(totalBudget, days) {
    const total = Math.max(0, Number(totalBudget) || 0);
    const sumDays = Array.isArray(days) && days.length > 0
      ? days.reduce((s, d) => s + (Number(d.estimatedExpense) || 0), 0)
      : total;
    const base = sumDays > 0 ? sumDays : total;
    const transportation = Math.round(base * 0.25);
    const accommodation = Math.round(base * 0.35);
    const food = Math.round(base * 0.20);
    const activities = Math.round(base * 0.12);
    const miscellaneous = Math.max(0, base - (transportation + accommodation + food + activities));
    return {
      transportation_cost: transportation,
      accommodation_cost: accommodation,
      food_cost: food,
      activities_cost: activities,
      miscellaneous_cost: miscellaneous
    };
  }

  // =========================================================================
  // Supabase Sync Engine (Hydrate & Push without blocking UI)
  // =========================================================================
  async function syncTripChildrenToSupabase(tripSnapshot) {
    const supa = getSupa();
    if (!supa || !isSupabaseSession() || !tripSnapshot || !tripSnapshot.id) return;
    const sess = supa.auth.getSession();
    const userId = sess && sess.user && sess.user.id;
    if (!userId) return;

    const cfg = tripSnapshot.config || {};
    const daysCount = Math.max(1, Number(cfg.days) || 1);
    const startDate = cfg.startDate || computeOffsetDate(1);
    const returnDate = tripSnapshot.returnDate || addDaysIso(startDate, daysCount - 1);
    const totalBudget = Math.max(0, Number(cfg.budget) || 0);
    const status = deriveTripStatus(tripSnapshot);

    const tripRow = {
      id: tripSnapshot.id,
      user_id: userId,
      trip_name: tripSnapshot.title || `${cfg.origin || 'India'} → ${cfg.destination || 'Trip'}`,
      starting_location: String(cfg.origin || 'New Delhi'),
      ending_destination: String(cfg.destination || 'Manali'),
      travel_date: startDate,
      return_date: returnDate,
      number_of_days: daysCount,
      number_of_participants: Math.max(1, Number(cfg.travelers) || 1),
      travel_mode: ['driving', 'walking', 'bicycling', 'transit'].includes(cfg.travelMode)
        ? cfg.travelMode
        : 'driving',
      total_budget: totalBudget,
      trip_status: status,
      trip_type: cfg.tripType || 'One Way',
      travel_preference: cfg.travelType || 'Friends',
      notes: String(tripSnapshot.notes || '')
    };

    const tripRes = await supa.rest.insert('trips', [tripRow], { upsert: true, onConflict: 'id' });
    if (tripRes.error) return;

    // 1. Replace trip_stops cleanly
    await supa.rest.remove('trip_stops', `trip_id=eq.${encodeURIComponent(tripSnapshot.id)}`);
    if (Array.isArray(tripSnapshot.stops) && tripSnapshot.stops.length > 0) {
      const stopRows = tripSnapshot.stops.map((st, idx) => ({
        trip_id: tripSnapshot.id,
        stop_name: typeof st === 'string' ? st : String(st.stopName || st.stop_name || ''),
        stop_order: typeof st === 'object' && st.stopOrder ? Number(st.stopOrder) : idx + 1,
        latitude: typeof st === 'object' && Number.isFinite(Number(st.latitude)) ? Number(st.latitude) : null,
        longitude: typeof st === 'object' && Number.isFinite(Number(st.longitude)) ? Number(st.longitude) : null
      })).filter((r) => r.stop_name);
      if (stopRows.length > 0) {
        await supa.rest.insert('trip_stops', stopRows);
      }
    }

    // 2. Replace itineraries cleanly
    await supa.rest.remove('itineraries', `trip_id=eq.${encodeURIComponent(tripSnapshot.id)}`);
    if (Array.isArray(tripSnapshot.days) && tripSnapshot.days.length > 0) {
      const itinRows = [];
      tripSnapshot.days.forEach((d) => {
        const dayNum = Number(d.dayNumber) || 1;
        const dayCost = Math.max(0, Number(d.estimatedExpense) || 0);
        const perSlot = Math.round(dayCost / 3);
        const loc = Array.isArray(d.suggestedAttractions) && d.suggestedAttractions.length > 0
          ? d.suggestedAttractions.join(', ')
          : String(cfg.destination || '');
        if (d.morning) {
          itinRows.push({
            trip_id: tripSnapshot.id,
            day_number: dayNum,
            activity_title: `${d.dayTitle || `Day ${dayNum}`} (Morning)`,
            activity_description: d.morning,
            activity_location: loc,
            estimated_cost: perSlot,
            activity_time: '09:00'
          });
        }
        if (d.afternoon) {
          itinRows.push({
            trip_id: tripSnapshot.id,
            day_number: dayNum,
            activity_title: `${d.dayTitle || `Day ${dayNum}`} (Afternoon)`,
            activity_description: d.afternoon,
            activity_location: loc,
            estimated_cost: perSlot,
            activity_time: '14:00'
          });
        }
        if (d.evening) {
          itinRows.push({
            trip_id: tripSnapshot.id,
            day_number: dayNum,
            activity_title: `${d.dayTitle || `Day ${dayNum}`} (Evening)`,
            activity_description: d.evening,
            activity_location: loc,
            estimated_cost: Math.max(0, dayCost - perSlot * 2),
            activity_time: '18:30'
          });
        }
      });
      if (itinRows.length > 0) {
        await supa.rest.insert('itineraries', itinRows);
      }
    }

    // 3. Upsert budgets breakdown
    const split = tripSnapshot.budgetBreakdown || computeCategoryBudgetSplit(totalBudget, tripSnapshot.days);
    await supa.rest.insert(
      'budgets',
      [
        {
          trip_id: tripSnapshot.id,
          ...split
        }
      ],
      { upsert: true, onConflict: 'trip_id' }
    );
  }

  function mapSupabaseTripToFrontend(row, stopsByTrip, itinsByTrip, budgetByTrip) {
    const tripStops = (stopsByTrip[row.id] || []).sort((a, b) => a.stop_order - b.stop_order);
    const tripItins = (itinsByTrip[row.id] || []).sort((a, b) => a.day_number - b.day_number);
    const budgetRow = budgetByTrip[row.id] || null;

    // Reconstruct day cards grouped by day_number
    const dayMap = {};
    tripItins.forEach((item) => {
      const dn = Number(item.day_number) || 1;
      if (!dayMap[dn]) {
        dayMap[dn] = {
          dayNumber: dn,
          dateLabel: formatDateLabel(row.travel_date, dn - 1),
          dayTitle: item.activity_title.replace(/\s*\((Morning|Afternoon|Evening)\)\s*$/i, '') || `Day ${dn}`,
          morning: '',
          afternoon: '',
          evening: '',
          suggestedAttractions: item.activity_location ? item.activity_location.split(',').map((s) => s.trim()).filter(Boolean) : [row.ending_destination],
          estimatedExpense: 0,
          travelTip: 'Synchronized with your Yatra Sphere Supabase itinerary.'
        };
      }
      const timeStr = String(item.activity_time || '');
      const titleStr = String(item.activity_title || '');
      if (/14:|afternoon/i.test(`${timeStr} ${titleStr}`) && !dayMap[dn].afternoon) {
        dayMap[dn].afternoon = item.activity_description || item.activity_title;
      } else if (/18:|19:|20:|evening/i.test(`${timeStr} ${titleStr}`) && !dayMap[dn].evening) {
        dayMap[dn].evening = item.activity_description || item.activity_title;
      } else if (!dayMap[dn].morning) {
        dayMap[dn].morning = item.activity_description || item.activity_title;
      } else if (!dayMap[dn].afternoon) {
        dayMap[dn].afternoon = item.activity_description || item.activity_title;
      } else {
        dayMap[dn].evening = item.activity_description || item.activity_title;
      }
      dayMap[dn].estimatedExpense += Number(item.estimated_cost) || 0;
    });

    const days = Object.values(dayMap).sort((a, b) => a.dayNumber - b.dayNumber);

    return {
      id: row.id,
      userId: row.user_id,
      title: row.trip_name,
      status: row.trip_status === 'completed' ? 'completed' : 'upcoming',
      notes: row.notes || '',
      returnDate: row.return_date || null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      config: {
        origin: row.starting_location,
        destination: row.ending_destination,
        startDate: row.travel_date,
        days: Number(row.number_of_days) || 1,
        travelers: Number(row.number_of_participants) || 1,
        budget: Number(row.total_budget) || 0,
        travelMode: row.travel_mode || 'driving',
        tripType: row.trip_type || 'One Way',
        travelType: row.travel_preference || 'Friends',
        interests: ['Nature', 'Cultural']
      },
      stops: tripStops.map((s) => ({
        id: s.id,
        stopName: s.stop_name,
        stopOrder: s.stop_order,
        latitude: s.latitude,
        longitude: s.longitude
      })),
      budgetBreakdown: budgetRow || null,
      days
    };
  }

  async function syncFromSupabase() {
    const supa = getSupa();
    if (!supa) return { synced: false };

    const validSession = await supa.auth.getValidSession();
    if (!validSession || !validSession.user || !validSession.user.id) {
      return { synced: false };
    }

    const userId = validSession.user.id;

    // 1. Fetch profile
    const profRes = await supa.rest.select('profiles', `id=eq.${encodeURIComponent(userId)}&select=*`);
    if (profRes.data && profRes.data[0]) {
      const p = profRes.data[0];
      const mergedProfile = {
        id: p.id,
        name: p.full_name || 'Traveler',
        email: p.email || validSession.user.email,
        phone: p.phone || '',
        profileImage: p.profile_image || '',
        homeCity: p.home_city || 'New Delhi',
        preferredTravelType: p.preferred_travel_type || 'Friends',
        dietaryNotes: p.dietary_notes || '',
        bio: p.bio || '',
        isDemoPreset: false,
        authProvider: 'supabase',
        createdAt: p.created_at
      };
      upsertCachedUser(mergedProfile);
      safeWriteJson(KEYS.SESSION, {
        userId: mergedProfile.id,
        signedInAt: new Date().toISOString()
      });
    }

    // 2. Fetch trips + child tables (stops, itineraries, budgets)
    const tripsRes = await supa.rest.select(
      'trips',
      `user_id=eq.${encodeURIComponent(userId)}&order=created_at.desc`
    );
    if (Array.isArray(tripsRes.data)) {
      const stopsByTrip = {};
      const itinsByTrip = {};
      const budgetByTrip = {};

      if (tripsRes.data.length > 0) {
        const [stopsRes, itinsRes, budgetsRes] = await Promise.all([
          supa.rest.select('trip_stops', 'select=*&order=stop_order.asc'),
          supa.rest.select('itineraries', 'select=*&order=day_number.asc'),
          supa.rest.select('budgets', 'select=*')
        ]);

        if (Array.isArray(stopsRes.data)) {
          stopsRes.data.forEach((s) => {
            if (!stopsByTrip[s.trip_id]) stopsByTrip[s.trip_id] = [];
            stopsByTrip[s.trip_id].push(s);
          });
        }
        if (Array.isArray(itinsRes.data)) {
          itinsRes.data.forEach((it) => {
            if (!itinsByTrip[it.trip_id]) itinsByTrip[it.trip_id] = [];
            itinsByTrip[it.trip_id].push(it);
          });
        }
        if (Array.isArray(budgetsRes.data)) {
          budgetsRes.data.forEach((b) => {
            budgetByTrip[b.trip_id] = b;
          });
        }
      }

      const mappedTrips = tripsRes.data.map((row) =>
        mapSupabaseTripToFrontend(row, stopsByTrip, itinsByTrip, budgetByTrip)
      );
      safeWriteJson(KEYS.TRIPS, mappedTrips);
    }

    // 3. Fetch wishlists
    const wishRes = await supa.rest.select(
      'wishlists',
      `user_id=eq.${encodeURIComponent(userId)}&select=destination_id&order=created_at.desc`
    );
    if (Array.isArray(wishRes.data)) {
      safeWriteJson(KEYS.WISHLIST, wishRes.data.map((w) => w.destination_id));
    }

    // 4. Fetch packing_checklists
    const chkRes = await supa.rest.select(
      'packing_checklists',
      `user_id=eq.${encodeURIComponent(userId)}&select=*&order=created_at.desc`
    );
    if (Array.isArray(chkRes.data) && chkRes.data.length > 0) {
      const map = safeReadJson(KEYS.CHECKLIST, {});
      map[userId] = {
        items: chkRes.data.map((row) => ({
          id: row.id,
          label: row.item_name,
          category: row.category || 'Essentials',
          tripId: row.trip_id || null,
          tripLabel: row.trip_label || 'General Travel',
          completed: Boolean(row.is_completed),
          createdAt: row.created_at
        })),
        lastSavedAt: new Date().toISOString()
      };
      safeWriteJson(KEYS.CHECKLIST, map);
    }

    emitSyncEvent({ userId, source: 'supabase' });
    return { synced: true, userId };
  }

  function buildDemoSampleTrips(userId) {
    const upcomingStart = computeOffsetDate(21);
    const pastStart = computeOffsetDate(-45);

    return [
      {
        id: 'trip_demo_kashmir_upcoming',
        userId,
        title: 'Kashmir Spring Alpine Circuit (Sample)',
        status: 'upcoming',
        notes: 'Window seats booked; confirm Gulmarg Phase 1 gondola slots two weeks prior.',
        createdAt: new Date().toISOString(),
        variant: 1,
        config: {
          origin: 'New Delhi',
          destination: 'Kashmir',
          startDate: upcomingStart,
          days: 4,
          travelers: 2,
          budget: 44000,
          travelMode: 'driving',
          travelType: 'Friends',
          interests: ['Nature', 'Mountains', 'Food']
        },
        stops: [{ stopName: 'Gulmarg', stopOrder: 1, latitude: 34.0484, longitude: 74.3805 }],
        destinationMeta: {
          stateRegion: 'Srinagar & Gulmarg',
          category: 'Mountains',
          bestTimeToVisit: 'Apr – Oct',
          baselinePerPerson: 21500
        },
        days: [
          {
            dayNumber: 1,
            dateLabel: formatDateLabel(upcomingStart, 0),
            dayTitle: 'Arrival in Srinagar & Dal Lake Dusk',
            morning: 'Arrive in Srinagar, settle into lakeside heritage stay near Nigeen.',
            afternoon: 'Stroll Nishat Bagh terraced Mughal gardens and sample Kashmiri Kahwa.',
            evening: 'Sunset shikara glide across Dal Lake floating lotus gardens.',
            suggestedAttractions: ['Dal Lake', 'Nishat Bagh'],
            estimatedExpense: 11500,
            travelTip: 'Keep a light wool layer ready for breezy lake evenings.'
          },
          {
            dayNumber: 2,
            dateLabel: formatDateLabel(upcomingStart, 1),
            dayTitle: 'Gulmarg Alpine Meadow & Gondola',
            morning: 'Early scenic drive to Gulmarg pine plateau.',
            afternoon: 'Ascend Kongdoori ridge by gondola and walk snowline viewpoints.',
            evening: 'Return to Srinagar for traditional Wazwan dinner.',
            suggestedAttractions: ['Gulmarg Gondola', 'Kongdoori Meadow'],
            estimatedExpense: 12000,
            travelTip: 'Start by 7:30 AM to beat day-excursion traffic.'
          },
          {
            dayNumber: 3,
            dateLabel: formatDateLabel(upcomingStart, 2),
            dayTitle: 'Pahalgam Lidder River Trail',
            morning: 'Drive past Pampore saffron fields toward Pahalgam valley.',
            afternoon: 'Explore Betaab Valley pine trails and Lidder riverside.',
            evening: 'Quiet bonfire dinner and stargazing in Pahalgam.',
            suggestedAttractions: ['Betaab Valley', 'Pampore Saffron Fields'],
            estimatedExpense: 11000,
            travelTip: 'Carry cash in small notes for local pony or union shuttle tickets.'
          },
          {
            dayNumber: 4,
            dateLabel: formatDateLabel(upcomingStart, 3),
            dayTitle: 'Old City Craft Walk & Return',
            morning: 'Morning walk through Srinagar spice & walnut-wood craft lanes.',
            afternoon: 'Pick up saffron and pashmina keepsakes before airport transfer.',
            evening: 'Evening return flight toward New Delhi.',
            suggestedAttractions: ['Lal Chowk Craft Market', 'Hazratbal Shore'],
            estimatedExpense: 9500,
            travelTip: 'Reach Srinagar airport 2.5 hours prior due to extra security checks.'
          }
        ]
      },
      {
        id: 'trip_demo_jaipur_past',
        userId,
        title: 'Jaipur Heritage Weekend (Sample)',
        status: 'completed',
        notes: 'Completed route; sunrise Amber Fort timing worked wonderfully.',
        createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
        variant: 1,
        config: {
          origin: 'New Delhi',
          destination: 'Jaipur',
          startDate: pastStart,
          days: 3,
          travelers: 2,
          budget: 24000,
          travelMode: 'driving',
          travelType: 'Family',
          interests: ['Historical', 'Food', 'Shopping']
        },
        stops: [{ stopName: 'Neemrana Fort', stopOrder: 1, latitude: 27.9889, longitude: 76.3883 }],
        destinationMeta: {
          stateRegion: 'Rajasthan',
          category: 'Heritage',
          bestTimeToVisit: 'Oct – Mar',
          baselinePerPerson: 12000
        },
        days: [
          {
            dayNumber: 1,
            dateLabel: formatDateLabel(pastStart, 0),
            dayTitle: 'Amber Fort Sunrise & Jal Mahal',
            morning: 'Arrive in Jaipur and ascend Amber Fort ramparts early.',
            afternoon: 'Explore Panna Meena stepwell and lunch near Amer road.',
            evening: 'Sunset views from Nahargarh Fort ridge overlooking the city.',
            suggestedAttractions: ['Amber Fort', 'Panna Meena Stepwell', 'Nahargarh Fort'],
            estimatedExpense: 8500,
            travelTip: 'Buy the composite monument ticket at Amber Fort to save queue time.'
          },
          {
            dayNumber: 2,
            dateLabel: formatDateLabel(pastStart, 1),
            dayTitle: 'Walled Pink City & Artisan Bazaars',
            morning: 'Visit Hawa Mahal facade and City Palace courtyards.',
            afternoon: 'Guided tour of Jantar Mantar astronomical instruments.',
            evening: 'Johari Bazaar textile walk and Rajasthani thali dinner.',
            suggestedAttractions: ['Hawa Mahal', 'City Palace', 'Jantar Mantar'],
            estimatedExpense: 8500,
            travelTip: 'Wear slip-off shoes for palace courtyards and temples.'
          },
          {
            dayNumber: 3,
            dateLabel: formatDateLabel(pastStart, 2),
            dayTitle: 'Block Printing Studio & Return',
            morning: 'Morning block-printing workshop in Sanganer.',
            afternoon: 'Final kachori & lassi stop at MI Road before departure.',
            evening: 'Return train to New Delhi.',
            suggestedAttractions: ['Sanganer Craft Studio', 'Albert Hall'],
            estimatedExpense: 7000,
            travelTip: 'Keep extra tote space for hand-printed cotton textiles.'
          }
        ]
      }
    ];
  }

  const CHECKLIST_PRESETS = {
    essential: [
      { label: 'Government Photo ID (Aadhaar / Passport / Driving License)', category: 'Documents' },
      { label: 'Confirmed transit & stay reference copies (offline PDF)', category: 'Documents' },
      { label: 'Power bank (10,000+ mAh) & charging cables', category: 'Tech & Health' },
      { label: 'Personal first-aid pouch & motion-sickness tablets', category: 'Tech & Health' },
      { label: 'Reusable insulated water bottle', category: 'Essentials' },
      { label: 'Small-denomination cash & UPI backup', category: 'Documents' }
    ],
    mountains: [
      { label: 'Thermal base layers & fleece mid-layer', category: 'Clothing' },
      { label: 'Windproof / waterproof outer shell jacket', category: 'Clothing' },
      { label: 'Broken-in trekking or grip-sole walking shoes', category: 'Destination Gear' },
      { label: 'SPF 50 sunscreen, lip balm & UV sunglasses', category: 'Tech & Health' },
      { label: 'Warm woolen socks & beanie', category: 'Clothing' }
    ],
    beaches: [
      { label: 'Breathable cotton & linen daywear', category: 'Clothing' },
      { label: 'Reef-safe sunscreen & polarized sunglasses', category: 'Tech & Health' },
      { label: 'Quick-dry towel & waterproof phone pouch', category: 'Destination Gear' },
      { label: 'Comfortable coastal sandals / slip-ons', category: 'Clothing' }
    ],
    heritage: [
      { label: 'Modest breathable clothing for temples & monuments', category: 'Clothing' },
      { label: 'Slip-on walking shoes for courtyard & fort steps', category: 'Destination Gear' },
      { label: 'Wide-brim hat & foldable daypack', category: 'Essentials' },
      { label: 'Reusable cloth tote for local craft shopping', category: 'Destination Gear' }
    ]
  };

  function createChecklistItemsFromPreset(presetKey, tripLabel) {
    const base = CHECKLIST_PRESETS.essential.concat(CHECKLIST_PRESETS[presetKey] || []);
    return base.map((item, idx) => ({
      id: generateId(`chk_${idx}`),
      label: item.label,
      category: item.category,
      tripLabel: tripLabel || 'General Travel',
      completed: false,
      createdAt: new Date().toISOString()
    }));
  }

  // =========================================================================
  // Auth Adapter (Live Supabase Auth + Local Demo Traveler fallback)
  // =========================================================================
  const auth = {
    async signUp({ name, email, password, homeCity = 'New Delhi' }) {
      const cleanName = String(name || '').trim();
      const cleanEmail = String(email || '').trim().toLowerCase();
      const cleanPass = String(password || '');
      const cleanCity = String(homeCity || 'New Delhi').trim() || 'New Delhi';

      if (cleanName.length < 2) {
        return { data: null, error: { message: 'Please enter your full name (at least 2 characters).' } };
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return { data: null, error: { message: 'Please enter a valid email address.' } };
      }
      if (cleanPass.length < 8) {
        return { data: null, error: { message: 'Password must be at least 8 characters long.' } };
      }

      const supa = getSupa();
      if (supa) {
        const supaRes = await supa.auth.signUp({
          email: cleanEmail,
          password: cleanPass,
          metadata: {
            full_name: cleanName,
            home_city: cleanCity,
            preferred_travel_type: 'Friends'
          }
        });

        if (!supaRes.error && supaRes.data) {
          if (supaRes.data.needsEmailConfirmation) {
            return {
              data: {
                user: supaRes.data.user,
                session: null,
                needsEmailConfirmation: true,
                email: cleanEmail
              },
              error: null
            };
          }

          const supaUser = supaRes.data.user;
          const cachedUser = {
            id: supaUser.id,
            name: cleanName,
            email: cleanEmail,
            homeCity: cleanCity,
            phone: '',
            profileImage: '',
            preferredTravelType: 'Friends',
            dietaryNotes: '',
            bio: 'Exploring India thoughtfully with curated itineraries and balanced travel pacing.',
            isDemoPreset: false,
            authProvider: 'supabase',
            createdAt: supaUser.created_at || new Date().toISOString()
          };
          upsertCachedUser(cachedUser);

          // Ensure profile row exists in public.profiles
          await supa.rest.insert(
            'profiles',
            [
              {
                id: supaUser.id,
                full_name: cleanName,
                email: cleanEmail,
                home_city: cleanCity,
                preferred_travel_type: 'Friends'
              }
            ],
            { upsert: true, onConflict: 'id' }
          );

          const sessionObj = { userId: cachedUser.id, signedInAt: new Date().toISOString() };
          safeWriteJson(KEYS.SESSION, sessionObj);
          await syncFromSupabase();
          const safeUser = sanitizeUserForSession(cachedUser);
          return {
            data: { user: safeUser, session: { ...sessionObj, user: safeUser } },
            error: null
          };
        }

        // If Supabase responded with a genuine account/validation error (not offline), return it directly
        if (supaRes.error && !supaRes.error.isNetworkError) {
          return { data: null, error: supaRes.error };
        }
      }

      // Offline / localStorage fallback when Supabase network is unreachable
      const users = getUsers();
      if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
        return {
          data: null,
          error: { message: 'An account with this email already exists locally. Please log in instead.' }
        };
      }

      const salt = generateSalt();
      const passwordHash = await hashPassword(cleanPass, salt);
      const newUser = {
        id: generateId('usr'),
        name: cleanName,
        email: cleanEmail,
        salt,
        passwordHash,
        homeCity: cleanCity,
        phone: '',
        profileImage: '',
        preferredTravelType: 'Friends',
        dietaryNotes: '',
        bio: 'Exploring India thoughtfully with curated itineraries and balanced travel pacing.',
        isDemoPreset: false,
        authProvider: 'local',
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      setUsers(users);

      const sessionObj = { userId: newUser.id, signedInAt: new Date().toISOString() };
      safeWriteJson(KEYS.SESSION, sessionObj);
      const safeUser = sanitizeUserForSession(newUser);
      return {
        data: { user: safeUser, session: { ...sessionObj, user: safeUser } },
        error: null
      };
    },

    async signInWithPassword({ email, password }) {
      const cleanEmail = String(email || '').trim().toLowerCase();
      const cleanPass = String(password || '');

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return { data: null, error: { message: 'Please enter a valid email address.' } };
      }
      if (!cleanPass) {
        return { data: null, error: { message: 'Please enter your password.' } };
      }

      const supa = getSupa();
      if (supa) {
        const supaRes = await supa.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPass
        });

        if (!supaRes.error && supaRes.data && supaRes.data.user) {
          const supaUser = supaRes.data.user;
          const meta = supaUser.user_metadata || {};
          const cachedUser = {
            id: supaUser.id,
            name: meta.full_name || cleanEmail.split('@')[0],
            email: cleanEmail,
            homeCity: meta.home_city || 'New Delhi',
            phone: meta.phone || '',
            profileImage: meta.profile_image || '',
            preferredTravelType: meta.preferred_travel_type || 'Friends',
            isDemoPreset: false,
            authProvider: 'supabase',
            createdAt: supaUser.created_at || new Date().toISOString()
          };
          upsertCachedUser(cachedUser);

          const sessionObj = { userId: cachedUser.id, signedInAt: new Date().toISOString() };
          safeWriteJson(KEYS.SESSION, sessionObj);
          await syncFromSupabase();

          const current = getCurrentSessionSync();
          return {
            data: { user: current ? current.user : sanitizeUserForSession(cachedUser), session: current },
            error: null
          };
        }

        // Check local demo user fallback if offline or account was created only in local demo mode
        const users = getUsers();
        const localUser = users.find((u) => u.email.toLowerCase() === cleanEmail && u.salt && u.passwordHash);
        if (localUser) {
          const candidateHash = await hashPassword(cleanPass, localUser.salt);
          if (candidateHash === localUser.passwordHash) {
            const sessionObj = { userId: localUser.id, signedInAt: new Date().toISOString() };
            safeWriteJson(KEYS.SESSION, sessionObj);
            const safeUser = sanitizeUserForSession(localUser);
            return {
              data: { user: safeUser, session: { ...sessionObj, user: safeUser } },
              error: null
            };
          }
        }

        if (supaRes.error && !supaRes.error.isNetworkError) {
          return { data: null, error: supaRes.error };
        }
      }

      // Offline fallback check
      const users = getUsers();
      const user = users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (!user || !user.salt || !user.passwordHash) {
        return {
          data: null,
          error: { message: 'Invalid email or password, or account not confirmed yet.' }
        };
      }
      const candidateHash = await hashPassword(cleanPass, user.salt);
      if (candidateHash !== user.passwordHash) {
        return { data: null, error: { message: 'Incorrect password. Please try again.' } };
      }

      const sessionObj = { userId: user.id, signedInAt: new Date().toISOString() };
      safeWriteJson(KEYS.SESSION, sessionObj);
      const safeUser = sanitizeUserForSession(user);
      return {
        data: { user: safeUser, session: { ...sessionObj, user: safeUser } },
        error: null
      };
    },

    async signInDemoTraveler() {
      const supa = getSupa();
      if (supa && supa.isAuthenticated()) {
        await supa.auth.signOut();
      }

      const users = getUsers();
      const demoEmail = 'aarav.demo@yatrasphere.example';
      let demoUser = users.find((u) => u.email === demoEmail);

      if (!demoUser) {
        demoUser = {
          id: 'usr_demo_aarav',
          name: 'Aarav Mehta',
          email: demoEmail,
          salt: null,
          passwordHash: null,
          homeCity: 'New Delhi',
          phone: '+91 98100 00192',
          profileImage: '',
          preferredTravelType: 'Friends',
          dietaryNotes: 'Vegetarian friendly',
          bio: 'Architectural photographer planning mountain passes, coastal heritage walks, and balanced weekend routes across India.',
          isDemoPreset: true,
          authProvider: 'demo-local',
          createdAt: new Date().toISOString()
        };
        users.push(demoUser);
        setUsers(users);
      }

      const sessionObj = { userId: demoUser.id, signedInAt: new Date().toISOString() };
      safeWriteJson(KEYS.SESSION, sessionObj);

      const existingTrips = safeReadJson(KEYS.TRIPS, []);
      if (!Array.isArray(existingTrips) || existingTrips.length === 0) {
        safeWriteJson(KEYS.TRIPS, buildDemoSampleTrips(demoUser.id));
      }

      const existingWishlist = safeReadJson(KEYS.WISHLIST, []);
      if (!Array.isArray(existingWishlist) || existingWishlist.length === 0) {
        safeWriteJson(KEYS.WISHLIST, ['kashmir', 'kerala', 'meghalaya']);
      }

      const safeUser = sanitizeUserForSession(demoUser);
      return {
        data: { user: safeUser, session: { ...sessionObj, user: safeUser } },
        error: null
      };
    },

    getSession() {
      const session = getCurrentSessionSync();
      return { data: { session }, error: null };
    },

    signOut() {
      try {
        global.localStorage.removeItem(KEYS.SESSION);
      } catch (_err) {
        // Ignore storage error
      }
      const supa = getSupa();
      if (supa) {
        supa.auth.signOut().catch(() => {});
      }
      return { error: null };
    }
  };

  // =========================================================================
  // Profile Adapter (table: public.profiles + storage: profile-images)
  // =========================================================================
  const profile = {
    getProfile(userId) {
      const users = getUsers();
      const user = users.find((u) => u.id === userId);
      if (!user) return { data: null, error: { message: 'Profile not found.' } };
      return { data: sanitizeUserForSession(user), error: null };
    },

    updateProfile(userId, updates) {
      const users = getUsers();
      const idx = users.findIndex((u) => u.id === userId);
      if (idx < 0) return { data: null, error: { message: 'Account not found.' } };

      const cleanName = String(updates.name || '').trim();
      const cleanEmail = String(updates.email || '').trim().toLowerCase();

      if (cleanName.length < 2) {
        return { data: null, error: { message: 'Name must be at least 2 characters.' } };
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return { data: null, error: { message: 'Please provide a valid email address.' } };
      }

      const conflict = users.some((u) => u.id !== userId && u.email.toLowerCase() === cleanEmail);
      if (conflict) {
        return { data: null, error: { message: 'Another local profile already uses that email.' } };
      }

      const nextProfileImage =
        updates.profileImage !== undefined ? String(updates.profileImage || '').trim() : users[idx].profileImage || '';

      users[idx] = {
        ...users[idx],
        name: cleanName,
        email: cleanEmail,
        homeCity: String(updates.homeCity || '').trim() || 'New Delhi',
        phone: String(updates.phone || '').trim(),
        profileImage: nextProfileImage,
        preferredTravelType: updates.preferredTravelType || 'Friends',
        dietaryNotes: String(updates.dietaryNotes || '').trim(),
        bio: String(updates.bio || '').trim(),
        updatedAt: new Date().toISOString()
      };

      setUsers(users);

      const supa = getSupa();
      if (supa && isSupabaseSession()) {
        supa.rest
          .update(
            'profiles',
            `id=eq.${encodeURIComponent(userId)}`,
            {
              full_name: users[idx].name,
              email: users[idx].email,
              phone: users[idx].phone,
              profile_image: users[idx].profileImage,
              home_city: users[idx].homeCity,
              preferred_travel_type: users[idx].preferredTravelType,
              dietary_notes: users[idx].dietaryNotes,
              bio: users[idx].bio
            }
          )
          .catch(() => {});
      }

      return { data: sanitizeUserForSession(users[idx]), error: null };
    },

    async uploadAvatar(userId, file) {
      const supa = getSupa();
      if (!supa || !isSupabaseSession()) {
        return {
          data: null,
          error: { message: 'Sign in with a live Supabase account to upload avatars to Supabase Storage.' }
        };
      }
      const uploadRes = await supa.storage.uploadProfileImage(file, userId);
      if (uploadRes.error) return uploadRes;

      const publicUrl = uploadRes.data.publicUrl;
      const users = getUsers();
      const idx = users.findIndex((u) => u.id === userId);
      if (idx >= 0) {
        users[idx].profileImage = publicUrl;
        users[idx].updatedAt = new Date().toISOString();
        setUsers(users);
      }
      await supa.rest.update('profiles', `id=eq.${encodeURIComponent(userId)}`, {
        profile_image: publicUrl
      });
      return { data: { publicUrl }, error: null };
    }
  };

  // =========================================================================
  // Trips Adapter (tables: public.trips, trip_stops, itineraries, budgets)
  // =========================================================================
  const trips = {
    listTrips() {
      const raw = safeReadJson(KEYS.TRIPS, []);
      if (!Array.isArray(raw)) return { data: [], error: null };
      const normalized = raw.map((trip) => ({
        ...trip,
        title:
          trip.title ||
          `${trip.config && trip.config.origin ? trip.config.origin : 'India'} → ${
            trip.config && trip.config.destination ? trip.config.destination : 'Trip'
          }`,
        status: deriveTripStatus(trip)
      }));
      return { data: normalized, error: null };
    },

    saveTrip(tripObj) {
      const list = safeReadJson(KEYS.TRIPS, []);
      const next = Array.isArray(list) ? [...list] : [];
      const idx = next.findIndex((t) => t.id === tripObj.id);
      const snapshot = JSON.parse(JSON.stringify(tripObj));
      snapshot.updatedAt = new Date().toISOString();
      if (idx >= 0) next[idx] = snapshot;
      else next.unshift(snapshot);
      safeWriteJson(KEYS.TRIPS, next);

      if (isSupabaseSession()) {
        syncTripChildrenToSupabase(snapshot).catch(() => {});
      }
      return { data: snapshot, error: null };
    },

    updateTripDetails(tripId, patch) {
      const list = safeReadJson(KEYS.TRIPS, []);
      if (!Array.isArray(list)) return { data: null, error: { message: 'Trip not found.' } };
      const idx = list.findIndex((t) => t.id === tripId);
      if (idx < 0) return { data: null, error: { message: 'Trip not found.' } };

      const existing = list[idx];
      const nextDaysCount = Math.max(1, Math.min(10, Number(patch.days) || existing.config.days || 3));
      const nextStartDate = patch.startDate || existing.config.startDate;
      const nextOrigin = String(patch.origin || existing.config.origin).trim();
      const nextDest = String(patch.destination || existing.config.destination).trim();

      const updatedDays = [];
      for (let i = 0; i < nextDaysCount; i += 1) {
        const prevDay = existing.days && existing.days[i];
        if (prevDay) {
          updatedDays.push({
            ...prevDay,
            dayNumber: i + 1,
            dateLabel: formatDateLabel(nextStartDate, i)
          });
        } else {
          updatedDays.push({
            dayNumber: i + 1,
            dateLabel: formatDateLabel(nextStartDate, i),
            dayTitle: `${nextDest} Discovery Day ${i + 1}`,
            morning: `Morning exploration and local walk in ${nextDest}.`,
            afternoon: `Afternoon highlights and regional dining in ${nextDest}.`,
            evening: `Relaxed evening leisure and sunset viewpoint.`,
            suggestedAttractions: [`${nextDest} Local Highlight`],
            estimatedExpense: Math.round((Number(patch.budget) || existing.config.budget || 15000) / nextDaysCount),
            travelTip: 'Adjust timing based on local daylight and weather.'
          });
        }
      }

      const updatedTrip = {
        ...existing,
        title: String(patch.title || '').trim() || `${nextOrigin} → ${nextDest}`,
        status: patch.status === 'completed' ? 'completed' : 'upcoming',
        notes: String(patch.notes || '').trim(),
        updatedAt: new Date().toISOString(),
        config: {
          ...existing.config,
          origin: nextOrigin,
          destination: nextDest,
          startDate: nextStartDate,
          days: nextDaysCount,
          travelers: Math.max(1, Math.min(12, Number(patch.travelers) || existing.config.travelers || 2)),
          budget: Math.max(3000, Number(patch.budget) || existing.config.budget || 15000),
          travelMode: patch.travelMode || existing.config.travelMode || 'driving',
          travelType: patch.travelType || existing.config.travelType || 'Friends'
        },
        days: updatedDays
      };

      list[idx] = updatedTrip;
      safeWriteJson(KEYS.TRIPS, list);

      if (isSupabaseSession()) {
        syncTripChildrenToSupabase(updatedTrip).catch(() => {});
      }

      return { data: updatedTrip, error: null };
    },

    deleteTrip(tripId) {
      const list = safeReadJson(KEYS.TRIPS, []);
      const filtered = Array.isArray(list) ? list.filter((t) => t.id !== tripId) : [];
      safeWriteJson(KEYS.TRIPS, filtered);

      const supa = getSupa();
      if (supa && isSupabaseSession()) {
        supa.rest.remove('trips', `id=eq.${encodeURIComponent(tripId)}`).catch(() => {});
      }
      return { error: null };
    },

    seedSampleTrips(userId) {
      const list = safeReadJson(KEYS.TRIPS, []);
      const existing = Array.isArray(list) ? list : [];
      const samples = buildDemoSampleTrips(userId).filter(
        (s) => !existing.some((e) => e.id === s.id)
      );
      const merged = [...samples, ...existing];
      safeWriteJson(KEYS.TRIPS, merged);
      return { data: merged, error: null };
    }
  };

  // =========================================================================
  // Wishlist Adapter (table: public.wishlists, shared with script.js)
  // =========================================================================
  const wishlist = {
    listIds() {
      const raw = safeReadJson(KEYS.WISHLIST, []);
      return { data: Array.isArray(raw) ? raw : [], error: null };
    },

    addId(destId) {
      if (!destId) return { data: wishlist.listIds().data, error: null };
      const list = safeReadJson(KEYS.WISHLIST, []);
      const next = Array.isArray(list) ? [...list] : [];
      if (!next.includes(destId)) next.push(destId);
      safeWriteJson(KEYS.WISHLIST, next);

      const supa = getSupa();
      if (supa && isSupabaseSession()) {
        const s = supa.auth.getSession();
        if (s && s.user) {
          supa.rest
            .insert('wishlists', [{ user_id: s.user.id, destination_id: destId }], {
              upsert: true,
              onConflict: 'user_id,destination_id'
            })
            .catch(() => {});
        }
      }
      return { data: next, error: null };
    },

    removeId(destId) {
      const list = safeReadJson(KEYS.WISHLIST, []);
      const next = Array.isArray(list) ? list.filter((id) => id !== destId) : [];
      safeWriteJson(KEYS.WISHLIST, next);

      const supa = getSupa();
      if (supa && isSupabaseSession()) {
        const s = supa.auth.getSession();
        if (s && s.user) {
          supa.rest
            .remove(
              'wishlists',
              `user_id=eq.${encodeURIComponent(s.user.id)}&destination_id=eq.${encodeURIComponent(destId)}`
            )
            .catch(() => {});
        }
      }
      return { data: next, error: null };
    },

    toggleId(destId) {
      const { data: current } = wishlist.listIds();
      if (current.includes(destId)) {
        wishlist.removeId(destId);
        return false;
      }
      wishlist.addId(destId);
      return true;
    }
  };

  // =========================================================================
  // Checklist Adapter (table: public.packing_checklists)
  // =========================================================================
  const checklist = {
    getChecklist(userId) {
      const map = safeReadJson(KEYS.CHECKLIST, {});
      const record = map && map[userId];
      if (record && Array.isArray(record.items)) {
        return { data: record, error: null };
      }
      const starter = {
        items: createChecklistItemsFromPreset('heritage', 'General Travel'),
        lastSavedAt: new Date().toISOString()
      };
      const nextMap = map && typeof map === 'object' ? { ...map } : {};
      nextMap[userId] = starter;
      safeWriteJson(KEYS.CHECKLIST, nextMap);

      if (isSupabaseSession()) {
        checklist.syncChecklistToSupabase(userId, starter.items);
      }

      return { data: starter, error: null };
    },

    syncChecklistToSupabase(userId, items) {
      const supa = getSupa();
      if (!supa || !isSupabaseSession() || !userId) return;
      (async () => {
        await supa.rest.remove('packing_checklists', `user_id=eq.${encodeURIComponent(userId)}`);
        if (!Array.isArray(items) || items.length === 0) return;
        const rows = items.map((item) => ({
          user_id: userId,
          trip_id: item.tripId || null,
          item_name: String(item.label || '').slice(0, 200),
          category: item.category || 'Essentials',
          trip_label: item.tripLabel || 'General Travel',
          is_completed: Boolean(item.completed)
        }));
        await supa.rest.insert('packing_checklists', rows);
      })().catch(() => {});
    },

    saveChecklist(userId, items) {
      const map = safeReadJson(KEYS.CHECKLIST, {});
      const nextMap = map && typeof map === 'object' ? { ...map } : {};
      const record = {
        items: Array.isArray(items) ? items : [],
        lastSavedAt: new Date().toISOString()
      };
      nextMap[userId] = record;
      safeWriteJson(KEYS.CHECKLIST, nextMap);

      if (isSupabaseSession()) {
        checklist.syncChecklistToSupabase(userId, record.items);
      }

      return { data: record, error: null };
    },

    getPresetItems(presetKey, tripLabel) {
      return createChecklistItemsFromPreset(presetKey, tripLabel);
    }
  };

  // Automatically hydrate from Supabase on load if an active session token exists
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      if (isSupabaseSession()) {
        syncFromSupabase().catch(() => {});
      }
    });
  }

  global.YatraAccountStore = {
    KEYS,
    SUPABASE_MIGRATION_SCHEMA,
    auth,
    profile,
    trips,
    wishlist,
    checklist,
    syncFromSupabase,
    isSupabaseSession,
    deriveTripStatus,
    getTripEndDate,
    formatDateLabel
  };
})(window);
