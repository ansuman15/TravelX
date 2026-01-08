-- ============================================
-- TRAVELX CLOUD INFRASTRUCTURE MIGRATION v2
-- Run this in Supabase SQL Editor
-- Fixed version with proper ordering
-- ============================================

-- ============================================
-- STEP 1: CREATE ALL TABLES FIRST (NO RLS)
-- ============================================

-- 1. Tasks Table
DROP TABLE IF EXISTS tasks CASCADE;
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
    due_date TIMESTAMPTZ,
    assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Itineraries Table
DROP TABLE IF EXISTS itinerary_days CASCADE;
DROP TABLE IF EXISTS itineraries CASCADE;
CREATE TABLE itineraries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    destination TEXT,
    duration_days INTEGER DEFAULT 1,
    status TEXT CHECK (status IN ('draft', 'active', 'archived')) DEFAULT 'draft',
    description TEXT,
    cover_image TEXT,
    used_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE itinerary_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    itinerary_id UUID NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    title TEXT,
    description TEXT,
    activities JSONB DEFAULT '[]'::jsonb,
    locations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Documents Table
DROP TABLE IF EXISTS documents CASCADE;
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    folder TEXT DEFAULT 'General',
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Notifications Table
DROP TABLE IF EXISTS notifications CASCADE;
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('booking', 'payment', 'task', 'system', 'message')),
    title TEXT NOT NULL,
    message TEXT,
    data JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Vehicle Tracking Table (skip booking reference if bookings table doesn't exist)
DROP TABLE IF EXISTS vehicle_tracking CASCADE;
CREATE TABLE vehicle_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
    booking_id UUID,
    vehicle_id TEXT,
    vehicle_name TEXT,
    driver_name TEXT,
    driver_phone TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    speed DECIMAL(5, 2),
    heading INTEGER,
    status TEXT CHECK (status IN ('active', 'idle', 'offline')) DEFAULT 'active',
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Staff Invitations Table
DROP TABLE IF EXISTS staff_invitations CASCADE;
CREATE TABLE staff_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'agency_staff',
    staff_role TEXT,
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    token TEXT UNIQUE,
    status TEXT CHECK (status IN ('pending', 'accepted', 'expired')) DEFAULT 'pending',
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 2: ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_invitations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: CREATE RLS POLICIES
-- ============================================

-- Tasks Policies
CREATE POLICY "tasks_select" ON tasks FOR SELECT USING (
    agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid())
);
CREATE POLICY "tasks_insert" ON tasks FOR INSERT WITH CHECK (
    agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid())
);
CREATE POLICY "tasks_update" ON tasks FOR UPDATE USING (
    agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid())
);
CREATE POLICY "tasks_delete" ON tasks FOR DELETE USING (
    agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid())
);

-- Itineraries Policies
CREATE POLICY "itineraries_select" ON itineraries FOR SELECT USING (
    agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid())
);
CREATE POLICY "itineraries_all" ON itineraries FOR ALL USING (
    agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid())
);

-- Itinerary Days Policies
CREATE POLICY "itinerary_days_select" ON itinerary_days FOR SELECT USING (
    itinerary_id IN (SELECT id FROM itineraries WHERE agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid()))
);
CREATE POLICY "itinerary_days_all" ON itinerary_days FOR ALL USING (
    itinerary_id IN (SELECT id FROM itineraries WHERE agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid()))
);

-- Documents Policies
CREATE POLICY "documents_select" ON documents FOR SELECT USING (
    agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid())
);
CREATE POLICY "documents_insert" ON documents FOR INSERT WITH CHECK (
    agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid())
);
CREATE POLICY "documents_delete" ON documents FOR DELETE USING (
    agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid())
);

-- Notifications Policies
CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "notifications_delete" ON notifications FOR DELETE USING (user_id = auth.uid());

-- Vehicle Tracking Policies
CREATE POLICY "vehicle_tracking_select" ON vehicle_tracking FOR SELECT USING (
    agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid())
);
CREATE POLICY "vehicle_tracking_all" ON vehicle_tracking FOR ALL USING (
    agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid())
);

-- Staff Invitations Policies
CREATE POLICY "staff_invitations_select" ON staff_invitations FOR SELECT USING (
    agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid() AND role = 'agency_admin')
);
CREATE POLICY "staff_invitations_insert" ON staff_invitations FOR INSERT WITH CHECK (
    agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid() AND role = 'agency_admin')
);

-- ============================================
-- STEP 4: CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_tasks_agency ON tasks(agency_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_agency ON itineraries(agency_id);
CREATE INDEX IF NOT EXISTS idx_documents_agency ON documents(agency_id);
CREATE INDEX IF NOT EXISTS idx_documents_folder ON documents(folder);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_vehicle_tracking_agency ON vehicle_tracking(agency_id);

-- ============================================
-- STEP 5: CREATE UPDATE TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tasks_updated_at ON tasks;
CREATE TRIGGER tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS itineraries_updated_at ON itineraries;
CREATE TRIGGER itineraries_updated_at
    BEFORE UPDATE ON itineraries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 6: ENABLE REALTIME (Optional)
-- ============================================

-- Uncomment if you want real-time updates:
-- ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
-- ALTER PUBLICATION supabase_realtime ADD TABLE vehicle_tracking;

-- ============================================
-- MIGRATION COMPLETE ✅
-- ============================================
