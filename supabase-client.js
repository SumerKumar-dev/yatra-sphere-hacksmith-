/**
 * Yatra Sphere — Pure Vanilla JS Supabase Client (Auth, PostgREST CRUD & Storage)
 * Zero external frameworks or build tools; uses standard browser fetch().
 *
 * SECURITY: Uses ONLY the Supabase Publishable key + signed-in user JWT.
 * Never place a service_role secret key anywhere in frontend source files.
 */

'use strict';

(function attachYatraSupabase(global) {
  const SUPABASE_PROJECT_ID = 'vdnzfnqrbtbvmoksqgum';
  const SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_Uc5nm9cInWJxnRgwNoPPQw_iw6PDNsV';
  const PROFILE_IMAGES_BUCKET = 'profile-images';
  const SUPABASE_SESSION_KEY = 'yatraSphere_supabaseSession';

  function readSessionRaw() {
    try {
      const raw = global.localStorage.getItem(SUPABASE_SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && parsed.access_token && parsed.user ? parsed : null;
    } catch (_err) {
      return null;
    }
  }

  function writeSessionRaw(session) {
    try {
      if (!session) {
        global.localStorage.removeItem(SUPABASE_SESSION_KEY);
      } else {
        global.localStorage.setItem(SUPABASE_SESSION_KEY, JSON.stringify(session));
      }
    } catch (_err) {
      // Ignore storage quota / private mode restrictions
    }
  }

  function buildHeaders(extra = {}, accessToken = null) {
    const token = accessToken || SUPABASE_PUBLISHABLE_KEY;
    return {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${token}`,
      ...extra
    };
  }

  async function parseResponseBody(res) {
    const text = await res.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch (_err) {
      return { message: text };
    }
  }

  function normalizeError(status, body, fallbackMsg) {
    const code = (body && (body.code || body.error_code)) || '';
    const msg =
      (body && (body.msg || body.message || body.error_description || body.error)) ||
      fallbackMsg ||
      `Supabase request failed (${status})`;
    const isSchemaMissing =
      status === 404 ||
      code === 'PGRST205' ||
      /could not find the table|relation .* does not exist/i.test(String(msg));
    return {
      status,
      code,
      message: String(msg),
      isSchemaMissing
    };
  }

  async function requestJson(url, options = {}, accessToken = null) {
    try {
      const res = await global.fetch(url, {
        ...options,
        headers: buildHeaders(options.headers || {}, accessToken)
      });
      const body = await parseResponseBody(res);
      if (!res.ok) {
        return {
          data: null,
          error: normalizeError(res.status, body, `Request error (${res.status})`)
        };
      }
      return { data: body, error: null };
    } catch (err) {
      return {
        data: null,
        error: {
          status: 0,
          code: 'NETWORK_ERROR',
          message: err && err.message ? err.message : 'Network unavailable for Supabase request.',
          isNetworkError: true
        }
      };
    }
  }

  function formatAuthSession(rawPayload) {
    if (!rawPayload || !rawPayload.access_token || !rawPayload.user) return null;
    const expiresIn = Number(rawPayload.expires_in) || 3600;
    return {
      access_token: rawPayload.access_token,
      refresh_token: rawPayload.refresh_token || '',
      token_type: rawPayload.token_type || 'bearer',
      expires_in: expiresIn,
      expires_at: rawPayload.expires_at || Math.floor(Date.now() / 1000) + expiresIn,
      user: rawPayload.user
    };
  }

  // =========================================================================
  // Auth API (/auth/v1)
  // =========================================================================
  const auth = {
    getSession() {
      return readSessionRaw();
    },

    async getValidSession() {
      const current = readSessionRaw();
      if (!current) return null;
      const nowSec = Math.floor(Date.now() / 1000);
      if (current.expires_at && current.expires_at - 45 > nowSec) {
        return current;
      }
      if (!current.refresh_token) return current;

      const res = await requestJson(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: current.refresh_token })
      });

      if (res.error || !res.data || !res.data.access_token) {
        if (res.error && (res.error.status === 400 || res.error.status === 401)) {
          writeSessionRaw(null);
          return null;
        }
        return current;
      }

      const refreshed = formatAuthSession(res.data);
      if (refreshed) writeSessionRaw(refreshed);
      return refreshed;
    },

    async signUp({ email, password, metadata = {} }) {
      const res = await requestJson(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: String(email || '').trim().toLowerCase(),
          password: String(password || ''),
          data: metadata
        })
      });

      if (res.error) return res;

      const session = formatAuthSession(res.data);
      const user = (session && session.user) || (res.data && res.data.user) || (res.data && res.data.id ? res.data : null);

      if (session) {
        writeSessionRaw(session);
        return {
          data: { user: session.user, session, needsEmailConfirmation: false },
          error: null
        };
      }

      return {
        data: { user, session: null, needsEmailConfirmation: true },
        error: null
      };
    },

    async signInWithPassword({ email, password }) {
      const res = await requestJson(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: String(email || '').trim().toLowerCase(),
          password: String(password || '')
        })
      });

      if (res.error) return res;

      const session = formatAuthSession(res.data);
      if (!session) {
        return {
          data: null,
          error: { message: 'Supabase did not return a valid session token.' }
        };
      }
      writeSessionRaw(session);
      return { data: { user: session.user, session }, error: null };
    },

    async signOut() {
      const current = readSessionRaw();
      writeSessionRaw(null);
      if (current && current.access_token) {
        await requestJson(
          `${SUPABASE_URL}/auth/v1/logout`,
          { method: 'POST' },
          current.access_token
        );
      }
      return { error: null };
    }
  };

  // =========================================================================
  // PostgREST CRUD API (/rest/v1)
  // =========================================================================
  const rest = {
    async select(table, queryStr = '') {
      const session = await auth.getValidSession();
      const qs = queryStr ? `?${queryStr.replace(/^\?/, '')}` : '';
      return requestJson(
        `${SUPABASE_URL}/rest/v1/${encodeURIComponent(table)}${qs}`,
        { method: 'GET' },
        session ? session.access_token : null
      );
    },

    async insert(table, rows, { upsert = false, onConflict = '' } = {}) {
      const session = await auth.getValidSession();
      const headers = {
        'Content-Type': 'application/json',
        Prefer: upsert ? 'resolution=merge-duplicates,return=representation' : 'return=representation'
      };
      const qs = upsert && onConflict ? `?on_conflict=${encodeURIComponent(onConflict)}` : '';
      return requestJson(
        `${SUPABASE_URL}/rest/v1/${encodeURIComponent(table)}${qs}`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(rows)
        },
        session ? session.access_token : null
      );
    },

    async update(table, matchQuery, patch) {
      const session = await auth.getValidSession();
      const qs = matchQuery ? `?${matchQuery.replace(/^\?/, '')}` : '';
      return requestJson(
        `${SUPABASE_URL}/rest/v1/${encodeURIComponent(table)}${qs}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Prefer: 'return=representation'
          },
          body: JSON.stringify(patch)
        },
        session ? session.access_token : null
      );
    },

    async remove(table, matchQuery) {
      const session = await auth.getValidSession();
      const qs = matchQuery ? `?${matchQuery.replace(/^\?/, '')}` : '';
      return requestJson(
        `${SUPABASE_URL}/rest/v1/${encodeURIComponent(table)}${qs}`,
        {
          method: 'DELETE',
          headers: { Prefer: 'return=representation' }
        },
        session ? session.access_token : null
      );
    }
  };

  // =========================================================================
  // Supabase Storage API (/storage/v1)
  // =========================================================================
  const storage = {
    getPublicUrl(objectPath, bucket = PROFILE_IMAGES_BUCKET) {
      const cleanPath = String(objectPath || '')
        .replace(/^\/+/, '')
        .split('/')
        .map((seg) => encodeURIComponent(seg))
        .join('/');
      return `${SUPABASE_URL}/storage/v1/object/public/${encodeURIComponent(bucket)}/${cleanPath}`;
    },

    async uploadProfileImage(file, userId) {
      if (!file || !userId) {
        return { data: null, error: { message: 'Image file and user ID are required.' } };
      }
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (file.type && !allowed.includes(file.type)) {
        return { data: null, error: { message: 'Please upload a JPEG, PNG, WebP, or GIF image.' } };
      }
      if (file.size > 5 * 1024 * 1024) {
        return { data: null, error: { message: 'Profile image must be 5 MB or smaller.' } };
      }

      const session = await auth.getValidSession();
      if (!session || !session.access_token) {
        return { data: null, error: { message: 'Sign in with a live Supabase account to upload profile images.' } };
      }

      const rawExt = (file.name && file.name.split('.').pop()) || 'jpg';
      const safeExt = rawExt.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
      const objectPath = `${userId}/avatar_${Date.now()}.${safeExt}`;
      const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${PROFILE_IMAGES_BUCKET}/${objectPath}`;

      try {
        const res = await global.fetch(uploadUrl, {
          method: 'POST',
          headers: buildHeaders(
            {
              'Content-Type': file.type || 'image/jpeg',
              'x-upsert': 'true'
            },
            session.access_token
          ),
          body: file
        });
        const body = await parseResponseBody(res);
        if (!res.ok) {
          return { data: null, error: normalizeError(res.status, body, 'Failed to upload profile image.') };
        }
        const publicUrl = storage.getPublicUrl(objectPath, PROFILE_IMAGES_BUCKET);
        return { data: { path: objectPath, publicUrl }, error: null };
      } catch (err) {
        return {
          data: null,
          error: { message: err && err.message ? err.message : 'Network error uploading profile image.' }
        };
      }
    }
  };

  // =========================================================================
  // Dynamic Google Maps Directions URL Generator (Never persisted in DB)
  // =========================================================================
  function buildGoogleMapsDirectionsUrl(tripRow, stopRows = []) {
    const origin = String(
      (tripRow && (tripRow.starting_location || (tripRow.config && tripRow.config.origin))) || ''
    ).trim();
    const destination = String(
      (tripRow && (tripRow.ending_destination || (tripRow.config && tripRow.config.destination))) || ''
    ).trim();
    const travelMode = String(
      (tripRow && (tripRow.travel_mode || (tripRow.config && tripRow.config.travelMode))) || 'driving'
    ).toLowerCase();

    const orderedStops = Array.isArray(stopRows)
      ? [...stopRows]
          .sort(
            (a, b) =>
              (Number(a && (a.stop_order !== undefined ? a.stop_order : a.stopOrder)) || 0) -
              (Number(b && (b.stop_order !== undefined ? b.stop_order : b.stopOrder)) || 0)
          )
          .map((s) =>
            typeof s === 'string'
              ? s.trim()
              : String((s && (s.stop_name || s.stopName)) || '').trim()
          )
          .filter(Boolean)
      : [];

    if (!origin || !destination) return '';

    let url =
      'https://www.google.com/maps/dir/?api=1' +
      '&origin=' + encodeURIComponent(origin) +
      '&destination=' + encodeURIComponent(destination);

    if (orderedStops.length > 0) {
      url += '&waypoints=' + encodeURIComponent(orderedStops.join('|'));
    }

    const validModes = ['driving', 'walking', 'bicycling', 'transit'];
    url += '&travelmode=' + encodeURIComponent(validModes.includes(travelMode) ? travelMode : 'driving');
    return url;
  }

  global.YatraSupabase = {
    projectId: SUPABASE_PROJECT_ID,
    url: SUPABASE_URL,
    publishableKey: SUPABASE_PUBLISHABLE_KEY,
    buckets: { profileImages: PROFILE_IMAGES_BUCKET },
    auth,
    rest,
    storage,
    buildGoogleMapsDirectionsUrl,
    isAuthenticated() {
      const s = readSessionRaw();
      return Boolean(s && s.access_token && s.user && s.user.id);
    }
  };
})(window);
