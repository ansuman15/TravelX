-- ============================================
-- TRAVELX DATABASE SCHEMA
-- Migration 001: Core Tables & RLS
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- AGENCIES (TENANTS)
-- ============================================
CREATE TABLE IF NOT EXISTS agencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  logo_url TEXT,
  gst_number TEXT,
  subscription_plan TEXT DEFAULT 'basic',
  subscription_status TEXT DEFAULT 'active',
  max_staff INT DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USERS (ALL PLATFORM USERS)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'agency_admin', 'agency_staff')),
  staff_role TEXT CHECK (staff_role IN ('sales', 'operations', 'visa', 'accountant', NULL)),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CUSTOMERS
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  alternate_phone TEXT,
  passport_number TEXT,
  passport_expiry DATE,
  date_of_birth DATE,
  nationality TEXT DEFAULT 'Indian',
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  pincode TEXT,
  preferences JSONB DEFAULT '{}',
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LEADS
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('website', 'google_ads', 'meta_ads', 'call', 'referral', 'walk_in', 'other')),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  destination TEXT,
  travel_dates TEXT,
  travel_start DATE,
  travel_end DATE,
  adults INT DEFAULT 1,
  children INT DEFAULT 0,
  budget_range TEXT,
  message TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'negotiating', 'booked', 'lost')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID REFERENCES users(id),
  converted_to_customer_id UUID REFERENCES customers(id),
  lost_reason TEXT,
  api_key_used TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FOLLOW-UPS
-- ============================================
CREATE TABLE IF NOT EXISTS followups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES users(id),
  due_date TIMESTAMPTZ NOT NULL,
  type TEXT DEFAULT 'call' CHECK (type IN ('call', 'email', 'whatsapp', 'meeting', 'other')),
  notes TEXT,
  outcome TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'rescheduled')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ENQUIRIES
-- ============================================
CREATE TABLE IF NOT EXISTS enquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  enquiry_number TEXT UNIQUE NOT NULL,
  lead_id UUID REFERENCES leads(id),
  customer_id UUID REFERENCES customers(id),
  destination TEXT NOT NULL,
  travel_start DATE,
  travel_end DATE,
  adults INT DEFAULT 1,
  children INT DEFAULT 0,
  budget DECIMAL(12,2),
  currency TEXT DEFAULT 'INR',
  requirements TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'quoted', 'converted', 'closed')),
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SUPPLIERS
-- ============================================
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('airline', 'hotel', 'dmc', 'transport', 'visa_agent', 'insurance', 'other')),
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  gst_number TEXT,
  bank_details JSONB,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PACKAGES (TEMPLATES)
-- ============================================
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  destination TEXT NOT NULL,
  duration_days INT NOT NULL,
  duration_nights INT,
  base_price DECIMAL(12,2),
  currency TEXT DEFAULT 'INR',
  description TEXT,
  highlights TEXT[],
  inclusions TEXT[],
  exclusions TEXT[],
  terms TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ITINERARIES (VERSIONED)
-- ============================================
CREATE TABLE IF NOT EXISTS itineraries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  package_id UUID REFERENCES packages(id),
  enquiry_id UUID REFERENCES enquiries(id),
  name TEXT NOT NULL,
  version INT DEFAULT 1,
  is_draft BOOLEAN DEFAULT true,
  destination TEXT,
  duration_days INT,
  total_cost DECIMAL(12,2),
  total_price DECIMAL(12,2),
  currency TEXT DEFAULT 'INR',
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ITINERARY DAYS
-- ============================================
CREATE TABLE IF NOT EXISTS itinerary_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  itinerary_id UUID NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  activities JSONB DEFAULT '[]',
  meals_included TEXT[],
  accommodation TEXT,
  transport TEXT,
  notes TEXT,
  UNIQUE(itinerary_id, day_number)
);

-- ============================================
-- BOOKINGS (SYSTEM HEART)
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  booking_number TEXT UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),
  enquiry_id UUID REFERENCES enquiries(id),
  itinerary_id UUID REFERENCES itineraries(id),
  status TEXT DEFAULT 'enquiry' CHECK (
    status IN ('enquiry', 'confirmed', 'documents_pending', 'ticketed', 'completed', 'cancelled')
  ),
  travel_start DATE NOT NULL,
  travel_end DATE NOT NULL,
  destination TEXT,
  adults INT DEFAULT 1,
  children INT DEFAULT 0,
  total_cost DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  amount_paid DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  assigned_to UUID REFERENCES users(id),
  notes TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BOOKING SERVICES
-- ============================================
CREATE TABLE IF NOT EXISTS booking_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL CHECK (
    service_type IN ('flight', 'hotel', 'transfer', 'activity', 'visa', 'insurance', 'other')
  ),
  supplier_id UUID REFERENCES suppliers(id),
  description TEXT NOT NULL,
  service_date DATE,
  cost_price DECIMAL(12,2),
  sell_price DECIMAL(12,2),
  quantity INT DEFAULT 1,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  confirmation_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PAYMENTS (LEDGER MODEL - APPEND-ONLY)
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL, -- positive = payment, negative = refund
  currency TEXT DEFAULT 'INR',
  payment_mode TEXT NOT NULL CHECK (
    payment_mode IN ('cash', 'card', 'bank_transfer', 'upi', 'cheque', 'other')
  ),
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  reference_number TEXT,
  notes TEXT,
  recorded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INVOICES (IMMUTABLE AFTER ISSUE)
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'paid', 'cancelled', 'void')),
  issued_at TIMESTAMPTZ,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  pdf_url TEXT,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DOCUMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (
    type IN ('passport', 'visa', 'ticket', 'voucher', 'insurance', 'id_proof', 'photo', 'other')
  ),
  name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size INT,
  mime_type TEXT,
  version INT DEFAULT 1,
  expiry_date DATE,
  notes TEXT,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TASKS
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general' CHECK (
    category IN ('general', 'visa', 'ticketing', 'hotel', 'documentation', 'payment', 'other')
  ),
  assigned_to UUID REFERENCES users(id),
  due_date TIMESTAMPTZ,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AUDIT LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL,
  entity TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'status_change', 'payment', 'login', 'other')),
  old_data JSONB,
  new_data JSONB,
  changes JSONB,
  performed_by UUID REFERENCES users(id),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- API KEYS (FOR LEAD INTAKE)
-- ============================================
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  key_hash TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  rate_limit INT DEFAULT 100, -- requests per hour
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BOOKING STATUS HISTORY
-- ============================================
CREATE TABLE IF NOT EXISTS booking_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID NOT NULL REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_agency ON users(agency_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_customers_agency ON customers(agency_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_leads_agency ON leads(agency_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_bookings_agency ON bookings(agency_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_number ON bookings(booking_number);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_tasks_agency ON tasks(agency_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity, entity_id);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_status_history ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's agency_id
CREATE OR REPLACE FUNCTION get_user_agency_id()
RETURNS UUID AS $$
  SELECT agency_id FROM users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Helper function to check if user is super_admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Helper function to check if user is agency_admin
CREATE OR REPLACE FUNCTION is_agency_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'agency_admin')
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- ============================================
-- AGENCIES POLICIES
-- ============================================
CREATE POLICY "Super admin can manage all agencies" ON agencies
  FOR ALL USING (is_super_admin());

CREATE POLICY "Users can view their own agency" ON agencies
  FOR SELECT USING (id = get_user_agency_id());

CREATE POLICY "Agency admin can update their agency" ON agencies
  FOR UPDATE USING (id = get_user_agency_id() AND is_agency_admin());

-- ============================================
-- USERS POLICIES
-- ============================================
CREATE POLICY "Super admin can manage all users" ON users
  FOR ALL USING (is_super_admin());

CREATE POLICY "Users can view users in their agency" ON users
  FOR SELECT USING (agency_id = get_user_agency_id() OR is_super_admin());

CREATE POLICY "Agency admin can manage staff" ON users
  FOR ALL USING (
    is_agency_admin() AND 
    agency_id = get_user_agency_id() AND
    role = 'agency_staff'
  );

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (id = auth.uid());

-- ============================================
-- STANDARD AGENCY ISOLATION POLICIES
-- ============================================

-- Customers
CREATE POLICY "Agency isolation for customers" ON customers
  FOR ALL USING (agency_id = get_user_agency_id() OR is_super_admin());

-- Leads
CREATE POLICY "Agency isolation for leads" ON leads
  FOR ALL USING (agency_id = get_user_agency_id() OR is_super_admin());

-- Follow-ups
CREATE POLICY "Agency isolation for followups" ON followups
  FOR ALL USING (agency_id = get_user_agency_id() OR is_super_admin());

-- Enquiries
CREATE POLICY "Agency isolation for enquiries" ON enquiries
  FOR ALL USING (agency_id = get_user_agency_id() OR is_super_admin());

-- Suppliers
CREATE POLICY "Agency isolation for suppliers" ON suppliers
  FOR ALL USING (agency_id = get_user_agency_id() OR is_super_admin());

-- Packages
CREATE POLICY "Agency isolation for packages" ON packages
  FOR ALL USING (agency_id = get_user_agency_id() OR is_super_admin());

-- Itineraries
CREATE POLICY "Agency isolation for itineraries" ON itineraries
  FOR ALL USING (agency_id = get_user_agency_id() OR is_super_admin());

-- Itinerary Days (through itinerary)
CREATE POLICY "Agency isolation for itinerary_days" ON itinerary_days
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM itineraries 
      WHERE id = itinerary_days.itinerary_id 
      AND (agency_id = get_user_agency_id() OR is_super_admin())
    )
  );

-- Bookings
CREATE POLICY "Agency isolation for bookings" ON bookings
  FOR ALL USING (agency_id = get_user_agency_id() OR is_super_admin());

-- Booking Services (through booking)
CREATE POLICY "Agency isolation for booking_services" ON booking_services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE id = booking_services.booking_id 
      AND (agency_id = get_user_agency_id() OR is_super_admin())
    )
  );

-- Payments
CREATE POLICY "Agency isolation for payments" ON payments
  FOR ALL USING (agency_id = get_user_agency_id() OR is_super_admin());

-- Invoices
CREATE POLICY "Agency isolation for invoices" ON invoices
  FOR ALL USING (agency_id = get_user_agency_id() OR is_super_admin());

-- Documents
CREATE POLICY "Agency isolation for documents" ON documents
  FOR ALL USING (agency_id = get_user_agency_id() OR is_super_admin());

-- Tasks
CREATE POLICY "Agency isolation for tasks" ON tasks
  FOR ALL USING (agency_id = get_user_agency_id() OR is_super_admin());

-- Audit Logs (read-only for agency)
CREATE POLICY "Agency can view their audit logs" ON audit_logs
  FOR SELECT USING (agency_id = get_user_agency_id() OR is_super_admin());

CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- API Keys
CREATE POLICY "Agency isolation for api_keys" ON api_keys
  FOR ALL USING (agency_id = get_user_agency_id() OR is_super_admin());

-- Booking Status History (through booking)
CREATE POLICY "Agency isolation for booking_status_history" ON booking_status_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE id = booking_status_history.booking_id 
      AND (agency_id = get_user_agency_id() OR is_super_admin())
    )
  );

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON agencies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enquiries_updated_at BEFORE UPDATE ON enquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_itineraries_updated_at BEFORE UPDATE ON itineraries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGER TO UPDATE BOOKING AMOUNT_PAID
-- ============================================
CREATE OR REPLACE FUNCTION update_booking_amount_paid()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE bookings 
  SET amount_paid = (
    SELECT COALESCE(SUM(amount), 0) 
    FROM payments 
    WHERE booking_id = NEW.booking_id
  )
  WHERE id = NEW.booking_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_booking_amount_paid
  AFTER INSERT ON payments
  FOR EACH ROW EXECUTE FUNCTION update_booking_amount_paid();

-- ============================================
-- FUNCTION TO GENERATE UNIQUE NUMBERS
-- ============================================
CREATE OR REPLACE FUNCTION generate_booking_number(agency_id UUID)
RETURNS TEXT AS $$
DECLARE
  agency_slug TEXT;
  seq_num INT;
BEGIN
  SELECT slug INTO agency_slug FROM agencies WHERE id = agency_id;
  SELECT COUNT(*) + 1 INTO seq_num FROM bookings WHERE bookings.agency_id = generate_booking_number.agency_id;
  RETURN UPPER(SUBSTRING(agency_slug, 1, 3)) || '-' || TO_CHAR(NOW(), 'YYMMDD') || '-' || LPAD(seq_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_invoice_number(agency_id UUID)
RETURNS TEXT AS $$
DECLARE
  agency_slug TEXT;
  seq_num INT;
BEGIN
  SELECT slug INTO agency_slug FROM agencies WHERE id = agency_id;
  SELECT COUNT(*) + 1 INTO seq_num FROM invoices WHERE invoices.agency_id = generate_invoice_number.agency_id;
  RETURN 'INV-' || UPPER(SUBSTRING(agency_slug, 1, 3)) || '-' || TO_CHAR(NOW(), 'YYMMDD') || '-' || LPAD(seq_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_enquiry_number(agency_id UUID)
RETURNS TEXT AS $$
DECLARE
  agency_slug TEXT;
  seq_num INT;
BEGIN
  SELECT slug INTO agency_slug FROM agencies WHERE id = agency_id;
  SELECT COUNT(*) + 1 INTO seq_num FROM enquiries WHERE enquiries.agency_id = generate_enquiry_number.agency_id;
  RETURN 'ENQ-' || UPPER(SUBSTRING(agency_slug, 1, 3)) || '-' || LPAD(seq_num::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;
