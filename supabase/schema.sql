-- ============================================================================
-- Yatra Sphere — Complete Supabase PostgreSQL Database, RLS & Storage Schema
-- Target Project ID: vdnzfnqrbtbvmoksqgum
-- Execute in: Supabase Dashboard -> SQL Editor
--
-- Security & Data Integrity Guarantees:
-- 1. Row Level Security (RLS) is ENABLED on ALL 13 application tables.
-- 2. Private user records use strict auth.uid() ownership policies.
-- 3. Public catalog tables (destinations, hotels, transport_options,
--    weather_information) are read-only for clients; reviews are publicly
--    readable and editable/deletable only by their authenticated author.
-- 4. Storage bucket 'profile-images' restricts writes/deletes to the owner's
--    auth.uid() subfolder.
-- 5. Zero fake users, zero fake bookings, zero fake transactions, and zero
--    fake reviews are inserted. Only the 16 public catalog destinations are
--    seeded idempotently so foreign keys from wishlists and reviews resolve.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. PROFILES TABLE (Linked to auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT 'Traveler',
  email TEXT NOT NULL UNIQUE,
  phone TEXT DEFAULT '',
  profile_image TEXT DEFAULT '',
  home_city TEXT DEFAULT 'New Delhi',
  preferred_travel_type TEXT DEFAULT 'Friends',
  dietary_notes TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. DESTINATIONS TABLE (Public Travel Catalog)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.destinations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  destination_name TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  description TEXT NOT NULL,
  image_url TEXT DEFAULT '',
  category TEXT NOT NULL,
  estimated_budget NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (estimated_budget >= 0),
  best_time_to_visit TEXT DEFAULT '',
  popular_attractions JSONB NOT NULL DEFAULT '[]'::jsonb,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. TRIPS TABLE (Planned Journeys & Google Maps Route Metadata)
-- NOTE: Google Maps Directions URLs are generated dynamically in the client
-- from starting_location, ending_destination, travel_mode, and trip_stops.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.trips (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  trip_name TEXT NOT NULL,
  starting_location TEXT NOT NULL,
  ending_destination TEXT NOT NULL,
  travel_date DATE NOT NULL,
  return_date DATE,
  number_of_days INTEGER NOT NULL DEFAULT 1 CHECK (number_of_days >= 1 AND number_of_days <= 60),
  number_of_participants INTEGER NOT NULL DEFAULT 1 CHECK (number_of_participants >= 1 AND number_of_participants <= 100),
  travel_mode TEXT NOT NULL DEFAULT 'driving' CHECK (travel_mode IN ('driving', 'walking', 'bicycling', 'transit')),
  total_budget NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total_budget >= 0),
  trip_status TEXT NOT NULL DEFAULT 'upcoming' CHECK (trip_status IN ('upcoming', 'completed', 'draft', 'cancelled')),
  trip_type TEXT DEFAULT 'One Way',
  travel_preference TEXT DEFAULT 'Friends',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT trips_valid_return_date CHECK (return_date IS NULL OR return_date >= travel_date)
);

-- ============================================================================
-- 4. TRIP STOPS TABLE (Intermediate Google Maps Waypoints)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.trip_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id TEXT NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  stop_name TEXT NOT NULL,
  stop_order INTEGER NOT NULL CHECK (stop_order >= 1),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT trip_stops_unique_order UNIQUE (trip_id, stop_order)
);

-- ============================================================================
-- 5. ITINERARIES TABLE (Day-by-Day Trip Schedule Entries)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id TEXT NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number >= 1),
  activity_title TEXT NOT NULL,
  activity_description TEXT DEFAULT '',
  activity_location TEXT DEFAULT '',
  estimated_cost NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (estimated_cost >= 0),
  activity_time TEXT DEFAULT '09:00',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 6. BUDGETS TABLE (Per-Trip Category Expense Tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id TEXT NOT NULL UNIQUE REFERENCES public.trips(id) ON DELETE CASCADE,
  transportation_cost NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (transportation_cost >= 0),
  accommodation_cost NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (accommodation_cost >= 0),
  food_cost NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (food_cost >= 0),
  activities_cost NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (activities_cost >= 0),
  miscellaneous_cost NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (miscellaneous_cost >= 0),
  total_expenses NUMERIC(12, 2) NOT NULL DEFAULT 0,
  remaining_budget NUMERIC(12, 2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 7. HOTELS TABLE (Illustrative Stay Listings Linked to Destinations)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_name TEXT NOT NULL,
  destination_id TEXT NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
  description TEXT DEFAULT '',
  price_per_night NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (price_per_night >= 0),
  amenities JSONB NOT NULL DEFAULT '[]'::jsonb,
  image_url TEXT DEFAULT '',
  rating NUMERIC(3, 2) CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5)),
  booking_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 8. TRANSPORT OPTIONS TABLE (Public Transit Comparison Catalog)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.transport_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  starting_location TEXT NOT NULL,
  ending_location TEXT NOT NULL,
  transport_type TEXT NOT NULL CHECK (transport_type IN ('Train', 'Bus', 'Flight', 'Cab')),
  estimated_price NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (estimated_price >= 0),
  estimated_duration TEXT NOT NULL,
  booking_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 9. WEATHER INFORMATION TABLE (Cached Forecast Snapshots by Destination)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.weather_information (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id TEXT NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
  temperature NUMERIC(5, 2),
  weather_condition TEXT DEFAULT '',
  forecast_date DATE NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT weather_unique_dest_date UNIQUE (destination_id, forecast_date)
);

-- ============================================================================
-- 10. WISHLISTS TABLE (User Saved Destinations)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  destination_id TEXT NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT wishlists_unique_user_dest UNIQUE (user_id, destination_id)
);

-- ============================================================================
-- 11. REVIEWS TABLE (User Destination Reviews & Ratings)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  destination_id TEXT NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
  reviewer_name TEXT DEFAULT 'Yatra Traveler',
  trip_type TEXT DEFAULT 'Friends',
  review_title TEXT DEFAULT '',
  eco_tip TEXT DEFAULT '',
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL CHECK (char_length(trim(review_text)) >= 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 12. PACKING CHECKLISTS TABLE (User & Trip Packing Items)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.packing_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  trip_id TEXT REFERENCES public.trips(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL CHECK (char_length(trim(item_name)) >= 1),
  category TEXT DEFAULT 'Essentials',
  trip_label TEXT DEFAULT 'General Travel',
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 13. CHAT HISTORY TABLE (AI Travel Assistant Conversation Log)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL CHECK (char_length(trim(message)) >= 1),
  response TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_destinations_category ON public.destinations(category);
CREATE INDEX IF NOT EXISTS idx_trips_user_date ON public.trips(user_id, travel_date);
CREATE INDEX IF NOT EXISTS idx_trips_status ON public.trips(user_id, trip_status);
CREATE INDEX IF NOT EXISTS idx_trip_stops_trip_order ON public.trip_stops(trip_id, stop_order);
CREATE INDEX IF NOT EXISTS idx_itineraries_trip_day ON public.itineraries(trip_id, day_number);
CREATE INDEX IF NOT EXISTS idx_budgets_trip_id ON public.budgets(trip_id);
CREATE INDEX IF NOT EXISTS idx_hotels_destination_id ON public.hotels(destination_id);
CREATE INDEX IF NOT EXISTS idx_transport_route ON public.transport_options(starting_location, ending_location);
CREATE INDEX IF NOT EXISTS idx_weather_dest_date ON public.weather_information(destination_id, forecast_date);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON public.wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_dest_id ON public.wishlists(destination_id);
CREATE INDEX IF NOT EXISTS idx_reviews_dest_created ON public.reviews(destination_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_packing_user_trip ON public.packing_checklists(user_id, trip_id);
CREATE INDEX IF NOT EXISTS idx_chat_user_created ON public.chat_history(user_id, created_at DESC);

-- ============================================================================
-- TRIGGERS & AUTOMATION FUNCTIONS
-- ============================================================================

-- A. Automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_trips_updated_at ON public.trips;
CREATE TRIGGER trg_trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_reviews_updated_at ON public.reviews;
CREATE TRIGGER trg_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- B. Automatically create public.profiles row when a new auth.users account signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    phone,
    profile_image,
    home_city,
    preferred_travel_type
  )
  VALUES (
    NEW.id,
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''), split_part(COALESCE(NEW.email, 'Traveler'), '@', 1)),
    LOWER(COALESCE(NEW.email, '')),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'profile_image', ''),
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'home_city'), ''), 'New Delhi'),
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'preferred_travel_type'), ''), 'Friends')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- C. Automatically keep budgets.total_expenses & budgets.remaining_budget synced
CREATE OR REPLACE FUNCTION public.sync_budget_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_trip_budget NUMERIC(12, 2) := 0;
BEGIN
  SELECT COALESCE(total_budget, 0) INTO v_trip_budget
  FROM public.trips
  WHERE id = NEW.trip_id;

  NEW.total_expenses :=
    COALESCE(NEW.transportation_cost, 0) +
    COALESCE(NEW.accommodation_cost, 0) +
    COALESCE(NEW.food_cost, 0) +
    COALESCE(NEW.activities_cost, 0) +
    COALESCE(NEW.miscellaneous_cost, 0);

  NEW.remaining_budget := COALESCE(v_trip_budget, 0) - NEW.total_expenses;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_budgets_sync_totals ON public.budgets;
CREATE TRIGGER trg_budgets_sync_totals
  BEFORE INSERT OR UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION public.sync_budget_totals();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) ON ALL 13 TABLES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packing_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

-- 1. profiles (Owner-only access)
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- 2. destinations (Public read-only catalog)
DROP POLICY IF EXISTS "destinations_public_read" ON public.destinations;
CREATE POLICY "destinations_public_read" ON public.destinations
  FOR SELECT USING (true);

-- 3. trips (Owner-only access)
DROP POLICY IF EXISTS "trips_select_own" ON public.trips;
CREATE POLICY "trips_select_own" ON public.trips
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "trips_insert_own" ON public.trips;
CREATE POLICY "trips_insert_own" ON public.trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "trips_update_own" ON public.trips;
CREATE POLICY "trips_update_own" ON public.trips
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "trips_delete_own" ON public.trips;
CREATE POLICY "trips_delete_own" ON public.trips
  FOR DELETE USING (auth.uid() = user_id);

-- 4. trip_stops (Owner via parent trips.user_id)
DROP POLICY IF EXISTS "trip_stops_select_own" ON public.trip_stops;
CREATE POLICY "trip_stops_select_own" ON public.trip_stops
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "trip_stops_insert_own" ON public.trip_stops;
CREATE POLICY "trip_stops_insert_own" ON public.trip_stops
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "trip_stops_update_own" ON public.trip_stops;
CREATE POLICY "trip_stops_update_own" ON public.trip_stops
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "trip_stops_delete_own" ON public.trip_stops;
CREATE POLICY "trip_stops_delete_own" ON public.trip_stops
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.user_id = auth.uid())
  );

-- 5. itineraries (Owner via parent trips.user_id)
DROP POLICY IF EXISTS "itineraries_select_own" ON public.itineraries;
CREATE POLICY "itineraries_select_own" ON public.itineraries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "itineraries_insert_own" ON public.itineraries;
CREATE POLICY "itineraries_insert_own" ON public.itineraries
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "itineraries_update_own" ON public.itineraries;
CREATE POLICY "itineraries_update_own" ON public.itineraries
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "itineraries_delete_own" ON public.itineraries;
CREATE POLICY "itineraries_delete_own" ON public.itineraries
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.user_id = auth.uid())
  );

-- 6. budgets (Owner via parent trips.user_id)
DROP POLICY IF EXISTS "budgets_select_own" ON public.budgets;
CREATE POLICY "budgets_select_own" ON public.budgets
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "budgets_insert_own" ON public.budgets;
CREATE POLICY "budgets_insert_own" ON public.budgets
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "budgets_update_own" ON public.budgets;
CREATE POLICY "budgets_update_own" ON public.budgets
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "budgets_delete_own" ON public.budgets;
CREATE POLICY "budgets_delete_own" ON public.budgets
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.user_id = auth.uid())
  );

-- 7. hotels (Public read-only catalog)
DROP POLICY IF EXISTS "hotels_public_read" ON public.hotels;
CREATE POLICY "hotels_public_read" ON public.hotels
  FOR SELECT USING (true);

-- 8. transport_options (Public read-only catalog)
DROP POLICY IF EXISTS "transport_options_public_read" ON public.transport_options;
CREATE POLICY "transport_options_public_read" ON public.transport_options
  FOR SELECT USING (true);

-- 9. weather_information (Public read-only catalog)
DROP POLICY IF EXISTS "weather_information_public_read" ON public.weather_information;
CREATE POLICY "weather_information_public_read" ON public.weather_information
  FOR SELECT USING (true);

-- 10. wishlists (Owner-only access)
DROP POLICY IF EXISTS "wishlists_select_own" ON public.wishlists;
CREATE POLICY "wishlists_select_own" ON public.wishlists
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "wishlists_insert_own" ON public.wishlists;
CREATE POLICY "wishlists_insert_own" ON public.wishlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "wishlists_delete_own" ON public.wishlists;
CREATE POLICY "wishlists_delete_own" ON public.wishlists
  FOR DELETE USING (auth.uid() = user_id);

-- 11. reviews (Public read, authenticated author create/update/delete)
DROP POLICY IF EXISTS "reviews_public_read" ON public.reviews;
CREATE POLICY "reviews_public_read" ON public.reviews
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "reviews_insert_own" ON public.reviews;
CREATE POLICY "reviews_insert_own" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "reviews_update_own" ON public.reviews;
CREATE POLICY "reviews_update_own" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reviews_delete_own" ON public.reviews;
CREATE POLICY "reviews_delete_own" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id);

-- 12. packing_checklists (Owner-only access; validates parent trip ownership when trip_id provided)
DROP POLICY IF EXISTS "packing_select_own" ON public.packing_checklists;
CREATE POLICY "packing_select_own" ON public.packing_checklists
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "packing_insert_own" ON public.packing_checklists;
CREATE POLICY "packing_insert_own" ON public.packing_checklists
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND (
      trip_id IS NULL OR EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "packing_update_own" ON public.packing_checklists;
CREATE POLICY "packing_update_own" ON public.packing_checklists
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "packing_delete_own" ON public.packing_checklists;
CREATE POLICY "packing_delete_own" ON public.packing_checklists
  FOR DELETE USING (auth.uid() = user_id);

-- 13. chat_history (Owner-only access)
DROP POLICY IF EXISTS "chat_history_select_own" ON public.chat_history;
CREATE POLICY "chat_history_select_own" ON public.chat_history
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "chat_history_insert_own" ON public.chat_history;
CREATE POLICY "chat_history_insert_own" ON public.chat_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "chat_history_delete_own" ON public.chat_history;
CREATE POLICY "chat_history_delete_own" ON public.chat_history
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- SUPABASE STORAGE: profile-images BUCKET & OWNER RLS POLICIES
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  TRUE,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = TRUE,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

DROP POLICY IF EXISTS "profile_images_public_read" ON storage.objects;
CREATE POLICY "profile_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-images');

DROP POLICY IF EXISTS "profile_images_owner_upload" ON storage.objects;
CREATE POLICY "profile_images_owner_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "profile_images_owner_update" ON storage.objects;
CREATE POLICY "profile_images_owner_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "profile_images_owner_delete" ON storage.objects;
CREATE POLICY "profile_images_owner_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- PUBLIC CATALOG REFERENCE DATA: 16 DESTINATIONS (No fake users/reviews/bookings)
-- Needed so wishlists & reviews FK constraints against destinations(id) succeed.
-- ============================================================================
INSERT INTO public.destinations (
  id, destination_name, state, country, description, image_url, category,
  estimated_budget, best_time_to_visit, popular_attractions, latitude, longitude
) VALUES
  ('manali', 'Manali', 'Himachal Pradesh', 'India', 'High-altitude cedar valleys, snowy Himalayan passes, river trails, and cozy mountain cafes.', 'src/assets/images/dest_manali_1795160234518.jpg', 'Mountains', 14500, 'Oct – Jun', '["Hadimba Devi Temple","Solang Valley","Atal Tunnel & Sissu","Old Manali Cafes"]'::jsonb, 32.2432, 77.1892),
  ('goa', 'Goa', 'Konkan Coast', 'India', 'Sunlit Arabian Sea coves, swaying coconut palms, Latin-quarter lanes, and tranquil coastal culture.', 'src/assets/images/dest_goa_1795160234653.jpg', 'Beaches', 13000, 'Nov – Mar', '["Palolem & Agonda Coves","Fontainhas Latin Quarter","Basilica of Bom Jesus","Dudhsagar Waterfalls"]'::jsonb, 15.2993, 74.1240),
  ('jaipur', 'Jaipur', 'Rajasthan', 'India', 'Terracotta palaces, hilltop forts, vibrant spice bazaars, and royal Rajput architectural mastery.', 'src/assets/images/dest_jaipur_1795160234828.jpg', 'Historical', 12000, 'Oct – Mar', '["Amber Fort","Hawa Mahal","City Palace & Jantar Mantar","Nahargarh Fort Ridge"]'::jsonb, 26.9124, 75.7873),
  ('kashmir', 'Kashmir', 'Srinagar & Gulmarg', 'India', 'Alpine pine meadows, mirror-still Dal Lake shikaras, Mughal gardens, and saffron valleys.', 'src/assets/images/dest_kashmir_1795160234553.jpg', 'Mountains', 21500, 'Apr – Oct', '["Dal Lake Shikaras","Gulmarg Gondola","Pahalgam Betaab Valley","Mughal Gardens"]'::jsonb, 34.0837, 74.7973),
  ('kerala', 'Kerala', 'Alleppey & Munnar', 'India', 'Palm-fringed emerald backwaters, misty tea plantations, spice trails, and serene wooden houseboats.', 'src/assets/images/dest_kerala_1795160234548.jpg', 'Nature', 18000, 'Sep – Mar', '["Alleppey Backwaters","Munnar Tea Hills","Fort Kochi Heritage","Periyar Wildlife Reserve"]'::jsonb, 9.4981, 76.3388),
  ('meghalaya', 'Meghalaya', 'Shillong & Cherrapunji', 'India', 'Living double-decker root bridges, cascading limestone waterfalls, crystal rivers, and misty hills.', 'src/assets/images/dest_meghalaya_1795160234524.jpg', 'Adventure', 19500, 'Oct – May', '["Nongriat Double-Decker Root Bridge","Nohkalikai Falls","Umngot Crystal River (Dawki)","Laitlum Grand Canyon"]'::jsonb, 25.5788, 91.8933),
  ('varanasi', 'Varanasi', 'Uttar Pradesh', 'India', 'Ancient riverfront ghats illuminated by evening Ganga Aarti, narrow heritage lanes, and sacred dawn boats.', 'src/assets/images/dest_varanasi_1795160767426.jpg', 'Religious', 9500, 'Oct – Mar', '["Dashashwamedh Ghat Evening Aarti","Sunrise River Boat Ride","Sarnath Buddhist Ruins","Assi Ghat Dawn"]'::jsonb, 25.3176, 82.9739),
  ('rishikesh', 'Rishikesh', 'Uttarakhand', 'India', 'Emerald Himalayan river rapids, iconic suspension bridges, yoga retreats, and evening river rituals.', 'src/assets/images/dest_rishikesh_1795160767098.jpg', 'Adventure', 10000, 'Sep – May', '["River Rafting on the Ganga","Triveni Ghat Aarti","Lakshman Jhula Zone","Beatles Ashram Heritage Trail"]'::jsonb, 30.0869, 78.2676),
  ('ladakh', 'Ladakh', 'Leh & Nubra Valley', 'India', 'High-altitude desert lakes, stark mountain passes, whitewashed monasteries, and crystal night skies.', 'src/assets/images/dest_ladakh_1795160767317.jpg', 'Adventure', 26000, 'May – Sep', '["Pangong Tso Lake","Nubra Valley Dunes","Thiksey Monastery","Khardung La Pass"]'::jsonb, 34.1526, 77.5771),
  ('hampi', 'Hampi', 'Karnataka', 'India', 'UNESCO-listed boulder-strewn Vijayanagara temple ruins, stone chariots, and sunlit Tungabhadra hills.', 'src/assets/images/dest_hampi_1795160767561.jpg', 'Historical', 11000, 'Oct – Feb', '["Vittala Temple Stone Chariot","Virupaksha Temple","Matanga Hill Sunrise","Lotus Mahal Enclosure"]'::jsonb, 15.3350, 76.4600),
  ('andaman', 'Andaman Islands', 'Havelock & Neil', 'India', 'White-sand tropical bays, thriving coral reefs, turquoise lagoons, and historic island trails.', 'src/assets/images/dest_andaman_1795160767697.jpg', 'Beaches', 24500, 'Oct – May', '["Radhanagar Beach","Elephant Beach Reefs","Cellular Jail Heritage","Neil Island Natural Bridge"]'::jsonb, 11.6234, 92.7265),
  ('udaipur', 'Udaipur', 'Rajasthan', 'India', 'Shimmering lake palaces, sandstone arches, serene Pichola boat rides, and Aravalli mountain sunsets.', 'src/assets/images/dest_udaipur_1795160769864.jpg', 'Historical', 14000, 'Sep – Mar', '["City Palace Complex","Lake Pichola Boat Ride","Jag Mandir","Monsoon Palace Sunset"]'::jsonb, 24.5854, 73.7125),
  ('coorg', 'Coorg', 'Karnataka', 'India', 'Aromatic coffee estates, misty Western Ghats ridges, woodland waterfalls, and Kodava hospitality.', 'src/assets/images/dest_coorg_1795160769915.jpg', 'Nature', 12500, 'Oct – May', '["Abbey Falls","Raja''s Seat Sunrise","Dubare Elephant Sanctuary","Plantation Trail"]'::jsonb, 12.3375, 75.8069),
  ('amritsar', 'Amritsar', 'Punjab', 'India', 'Luminous gilded shrines reflecting over sacred waters, bustling culinary streets, and living heritage.', 'src/assets/images/dest_amritsar_1795160770881.jpg', 'Religious', 9000, 'Oct – Mar', '["Sri Harmandir Sahib (Golden Temple)","Jallianwala Bagh","Partition Museum","Wagah Border Ceremony"]'::jsonb, 31.6340, 74.8723),
  ('corbett', 'Jim Corbett National Park', 'Uttarakhand', 'India', 'Sal forest riverbanks, misty grasslands, morning jeep trails, and India''s oldest tiger sanctuary.', 'src/assets/images/dest_corbett_1795160769727.jpg', 'Wildlife', 13500, 'Nov – Jun', '["Dhikala Grassland Safari","Bijrani Forest Zone","Garjiya Devi Temple","Kosi Riverbed"]'::jsonb, 29.5300, 78.7747),
  ('kaziranga', 'Kaziranga National Park', 'Assam', 'India', 'Tall elephant-grass floodplains, Brahmaputra wetlands, and the flagship sanctuary of the one-horned rhino.', 'src/assets/images/dest_kaziranga_1795160770089.jpg', 'Wildlife', 16500, 'Nov – Apr', '["Kohora Central Jeep Safari","Bagori Western Range","Kaziranga Orchid Park","Brahmaputra Dolphin Point"]'::jsonb, 26.5775, 93.1711)
ON CONFLICT (id) DO NOTHING;
