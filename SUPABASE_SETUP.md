# Supabase Backend Setup Guide — Yatra Sphere

This guide configures the live Supabase PostgreSQL database, Authentication, Row Level Security (RLS), and Storage bucket for **Yatra Sphere**.

- **Target Project ID:** `vdnzfnqrbtbvmoksqgum`
- **Project URL:** `https://vdnzfnqrbtbvmoksqgum.supabase.co`
- **Frontend Key Used:** Publishable Key only (`sb_publishable_...` inside `supabase-client.js`). Never commit or place a `service_role` secret key in frontend files.

## 1. Run the Complete Database & RLS Schema

1. Open your **Supabase Dashboard** for project `vdnzfnqrbtbvmoksqgum`.
2. Go to **SQL Editor** -> **New query**.
3. Copy the entire contents of `supabase/schema.sql` and click **Run**.

This creates:
- All **13 tables**: `profiles`, `destinations`, `trips`, `trip_stops`, `itineraries`, `budgets`, `hotels`, `transport_options`, `weather_information`, `wishlists`, `reviews`, `packing_checklists`, `chat_history`
- Foreign keys with `ON DELETE CASCADE` and performance indexes
- `handle_new_user()` trigger to auto-create rows in `public.profiles` on Supabase Auth registration
- `sync_budget_totals()` trigger to calculate `total_expenses` and `remaining_budget` automatically
- **Row Level Security (RLS)** on every table (`auth.uid()` owner policies for user data + public read policies for `destinations`, `hotels`, `transport_options`, `weather_information`, and `reviews`)
- **Storage bucket** `profile-images` with owner-scoped upload/update/delete policies and public avatar reads
- Public `destinations` catalog reference rows (no fake users, fake bookings, fake transactions, or fake reviews)

## 2. Verify Authentication Settings

1. In Supabase Dashboard, open **Authentication** -> **Providers** -> **Email**.
2. Ensure **Email provider** is enabled.
3. Optional for instant signup during testing: toggle **Confirm email** off under Email provider settings (if enabled, users receive a verification email before their first login).
4. Under **Authentication** -> **URL Configuration**, add your preview / production site URL under **Redirect URLs** if needed.

## 3. Google Maps Route Integration Behavior

- Stored routes persist only route fields: `starting_location`, `ending_destination`, ordered `trip_stops` (`stop_name`, `stop_order`, `latitude`, `longitude`), `number_of_participants`, `travel_date`, and `travel_mode`.
- Static Google Maps URLs are **never stored** in the database; `YatraSupabase.buildGoogleMapsDirectionsUrl(trip, stops)` generates fresh Google Maps Directions links dynamically on demand.

## 4. Graceful Local Fallback

- If a visitor explores Yatra Sphere offline or uses the passwordless **Demo Traveler** quick-preview, the frontend preserves full `localStorage` fallback functionality alongside live Supabase Auth & Postgres sync.
