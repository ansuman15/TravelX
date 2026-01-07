-- ============================================
-- SEED DATA: Create Super Admin User
-- Run this AFTER creating the auth user in Supabase Dashboard
-- ============================================

-- Replace 'YOUR_AUTH_USER_ID' with the actual UUID from Supabase Auth
-- You can find this in Authentication > Users after creating a user

-- First, create a test agency
INSERT INTO agencies (id, name, slug, email, phone, subscription_plan, is_active)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'TravelX Demo Agency',
  'travelx-demo',
  'demo@travelx.com',
  '+91 9876543210',
  'enterprise',
  true
) ON CONFLICT (id) DO NOTHING;

-- IMPORTANT: Replace this ID with your actual auth user ID from Supabase Auth
-- Go to Authentication > Users, create a user, and copy their UUID

-- Example: Insert super admin user
-- INSERT INTO users (id, agency_id, email, full_name, role, is_active)
-- VALUES (
--   'YOUR_AUTH_USER_ID_HERE',  -- Replace with actual UUID
--   NULL,  -- Super admin doesn't belong to an agency
--   'admin@travelx.com',
--   'Super Admin',
--   'super_admin',
--   true
-- );

-- Example: Insert agency admin user
-- INSERT INTO users (id, agency_id, email, full_name, role, is_active)
-- VALUES (
--   'YOUR_AGENCY_ADMIN_AUTH_ID',  -- Replace with actual UUID
--   'a0000000-0000-0000-0000-000000000001',  -- Demo agency ID
--   'admin@demo-agency.com',
--   'Agency Admin',
--   'agency_admin',
--   true
-- );

-- ============================================
-- DEMO DATA: Sample Leads
-- ============================================
INSERT INTO leads (agency_id, source, full_name, email, phone, destination, travel_start, travel_end, adults, children, budget_range, message, status, priority)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'website', 'Rahul Sharma', 'rahul@example.com', '+91 9876543211', 'Bali, Indonesia', '2026-02-15', '2026-02-22', 2, 0, '₹1,50,000 - ₹2,00,000', 'Looking for a romantic getaway', 'new', 'high'),
  ('a0000000-0000-0000-0000-000000000001', 'google_ads', 'Priya Patel', 'priya@example.com', '+91 9876543212', 'Dubai, UAE', '2026-03-01', '2026-03-07', 4, 2, '₹3,00,000 - ₹4,00,000', 'Family vacation with kids', 'contacted', 'medium'),
  ('a0000000-0000-0000-0000-000000000001', 'referral', 'Amit Kumar', 'amit@example.com', '+91 9876543213', 'Singapore & Malaysia', '2026-02-20', '2026-02-28', 2, 1, '₹2,50,000 - ₹3,00,000', 'Honeymoon + family trip', 'quoted', 'high'),
  ('a0000000-0000-0000-0000-000000000001', 'walk_in', 'Sneha Reddy', 'sneha@example.com', '+91 9876543214', 'Thailand', '2026-04-10', '2026-04-17', 6, 0, '₹4,00,000 - ₹5,00,000', 'Group trip with friends', 'new', 'medium'),
  ('a0000000-0000-0000-0000-000000000001', 'meta_ads', 'Vikram Singh', 'vikram@example.com', '+91 9876543215', 'Maldives', '2026-03-15', '2026-03-20', 2, 0, '₹5,00,000+', 'Luxury honeymoon', 'negotiating', 'urgent'),
  ('a0000000-0000-0000-0000-000000000001', 'call', 'Meera Joshi', 'meera@example.com', '+91 9876543216', 'Europe Tour', '2026-05-01', '2026-05-15', 4, 0, '₹8,00,000 - ₹10,00,000', '15-day Europe tour', 'new', 'low')
ON CONFLICT DO NOTHING;

-- ============================================
-- DEMO DATA: Sample Customers
-- ============================================
INSERT INTO customers (agency_id, full_name, email, phone, passport_number, passport_expiry, date_of_birth, nationality, gender, city, country)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'Rajesh Gupta', 'rajesh.gupta@email.com', '+91 9876543220', 'P1234567', '2028-06-15', '1985-03-20', 'Indian', 'male', 'Mumbai', 'India'),
  ('a0000000-0000-0000-0000-000000000001', 'Anita Desai', 'anita.desai@email.com', '+91 9876543221', 'P2345678', '2029-01-10', '1990-07-12', 'Indian', 'female', 'Delhi', 'India'),
  ('a0000000-0000-0000-0000-000000000001', 'Suresh Nair', 'suresh.nair@email.com', '+91 9876543222', 'P3456789', '2027-09-20', '1978-11-05', 'Indian', 'male', 'Bangalore', 'India')
ON CONFLICT DO NOTHING;

-- ============================================
-- DEMO DATA: Sample Suppliers
-- ============================================
INSERT INTO suppliers (agency_id, name, type, contact_name, email, phone, city, country, is_active)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'Emirates Airlines', 'airline', 'Booking Desk', 'booking@emirates.com', '+971 4 555 1234', 'Dubai', 'UAE', true),
  ('a0000000-0000-0000-0000-000000000001', 'Marriott Hotels', 'hotel', 'Reservations', 'reservations@marriott.com', '+1 800 555 1234', 'Multiple', 'Global', true),
  ('a0000000-0000-0000-0000-000000000001', 'Bali Paradise DMC', 'dmc', 'Made Wayan', 'made@baliparadise.com', '+62 361 555 1234', 'Bali', 'Indonesia', true),
  ('a0000000-0000-0000-0000-000000000001', 'Thailand Transfers', 'transport', 'Somchai', 'booking@thaitransfers.com', '+66 2 555 1234', 'Bangkok', 'Thailand', true)
ON CONFLICT DO NOTHING;
