-- Database Constraints and Triggers for Dock Rental Platform
-- These enforce business rules at the database level for data integrity

-- 26' hard limit for boat length vs slip
ALTER TABLE bookings
  ADD CONSTRAINT boat_len_vs_slip CHECK (boat_length <= 26);

-- Check-out must be after check-in
ALTER TABLE bookings
  ADD CONSTRAINT valid_dates CHECK (check_out > check_in);

-- Renters max 30 nights (DB enforced)
CREATE OR REPLACE FUNCTION enforce_renter_nights()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.user_type = 'renter' AND (NEW.check_out - NEW.check_in) > 30 THEN
    RAISE EXCEPTION 'Renters can only book up to 30 nights';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_enforce_renter_nights ON bookings;
CREATE TRIGGER trg_enforce_renter_nights
BEFORE INSERT OR UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION enforce_renter_nights();

-- Prevent overlap on same slip for confirmed bookings
CREATE OR REPLACE FUNCTION prevent_overlap()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE conflict_count INT;
BEGIN
  SELECT COUNT(*) INTO conflict_count
  FROM bookings b
  WHERE b.slip_id = NEW.slip_id
    AND b.status = 'confirmed'
    AND daterange(b.check_in, b.check_out, '[]') && daterange(NEW.check_in, NEW.check_out, '[]');

  IF conflict_count > 0 THEN
    RAISE EXCEPTION 'Slip is not available for the selected dates';
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_prevent_overlap ON bookings;
CREATE TRIGGER trg_prevent_overlap
BEFORE INSERT OR UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION prevent_overlap();

-- Renters: dock reservation cannot start earlier than 7 days before rental start
CREATE OR REPLACE FUNCTION enforce_7day_window()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.user_type = 'renter' THEN
    IF NEW.rental_start_date IS NULL OR NEW.rental_end_date IS NULL THEN
      RAISE EXCEPTION 'Rental property dates required for renters';
    END IF;

    IF NEW.check_in < (NEW.rental_start_date - INTERVAL '7 days')::date THEN
      RAISE EXCEPTION 'Dock slips can only be reserved within 7 days prior to your rental arrival date';
    END IF;

    IF NEW.check_out > NEW.rental_end_date THEN
      RAISE EXCEPTION 'Dock reservation cannot extend beyond your home rental period';
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_enforce_7day ON bookings;
CREATE TRIGGER trg_enforce_7day
BEFORE INSERT OR UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION enforce_7day_window();

-- Additional useful constraints and indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_slip_dates ON bookings(slip_id, check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_renter ON bookings(renter_auth_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_slips_available ON slips(available);

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_slips_updated_at 
    BEFORE UPDATE ON slips 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON bookings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE slips ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- USERS: only see/update your own row
CREATE POLICY "users_self_select" ON users
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "users_self_update" ON users
  FOR UPDATE USING (auth.uid() = auth_user_id);

-- SLIPS: public readable, only admins mutate (use service role or edge function)
CREATE POLICY "slips_public_read" ON slips
  FOR SELECT USING (true);

-- BOOKINGS:
-- renters/homeowners can read their own bookings by email or auth id
CREATE POLICY "bookings_read_own" ON bookings
  FOR SELECT USING (
    renter_auth_id = auth.uid()
    OR lower(guest_email) = lower((SELECT email FROM users WHERE auth_user_id = auth.uid()))
  );

-- renters/homeowners create their own booking
CREATE POLICY "bookings_insert_self" ON bookings
  FOR INSERT WITH CHECK (
    renter_auth_id = auth.uid()
    OR user_type = 'homeowner'
  );

-- allow updates to own booking (e.g., cancel) before check-in
CREATE POLICY "bookings_update_own" ON bookings
  FOR UPDATE USING (
    renter_auth_id = auth.uid()
    OR lower(guest_email) = lower((SELECT email FROM users WHERE auth_user_id = auth.uid()))
  );

-- Supabase Storage RLS Policies
-- Slip images: anyone can read, only authenticated users can upload
CREATE POLICY "slip_images_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'slip-images');

CREATE POLICY "slip_images_write" ON storage.objects
  FOR INSERT TO authenticated USING (bucket_id = 'slip-images');

-- Documents: only owner can read/write (prefix by user id)
CREATE POLICY "docs_rw_owner" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'documents'
    AND (auth.uid())::text = split_part(name, '/', 1)  -- path like: {uid}/filename.pdf
  )
  WITH CHECK (
    bucket_id = 'documents'
    AND (auth.uid())::text = split_part(name, '/', 1)
  );
