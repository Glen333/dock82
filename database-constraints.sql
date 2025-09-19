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
