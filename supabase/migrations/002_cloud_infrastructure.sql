-- ============================================
-- TRAVELX CLOUD INFRASTRUCTURE MIGRATION
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
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

-- RLS for tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tasks in their agency" ON tasks
    FOR SELECT USING (
        agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can create tasks in their agency" ON tasks
    FOR INSERT WITH CHECK (
        agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can update tasks in their agency" ON tasks
    FOR UPDATE USING (
        agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can delete tasks in their agency" ON tasks
    FOR DELETE USING (
        agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid())
    );

-- ============================================
-- 2. ITINERARIES TABLES
-- ============================================
CREATE TABLE IF NOT EXISTS itineraries (
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

CREATE TABLE IF NOT EXISTS itinerary_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    itinerary_id UUID NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    title TEXT,
    description TEXT,
    activities JSONB DEFAULT '[]'::jsonb,
    locations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for itineraries
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view itineraries in their agency" ON itineraries
    FOR SELECT USING (
        agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can manage itineraries in their agency" ON itineraries
    FOR ALL USING (
        agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can view itinerary days" ON itinerary_days
    FOR SELECT USING (
        itinerary_id IN (SELECT id FROM itineraries WHERE agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid()))
    );

CREATE POLICY "Users can manage itinerary days" ON itinerary_days
    FOR ALL USING (
        itinerary_id IN (SELECT id FROM itineraries WHERE agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid()))
    );

-- ============================================
-- 3. DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
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

-- RLS for documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view documents in their agency" ON documents
    FOR SELECT USING (
        agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can create documents in their agency" ON documents
    FOR INSERT WITH CHECK (
        agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can delete documents in their agency" ON documents
    FOR DELETE USING (
        agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid())
    );

-- ============================================
-- 4. NOTIFICATIONS TABLE (Real-time)
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
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

-- RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ============================================
-- 5. VEHICLE TRACKING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS vehicle_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
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

-- RLS for vehicle tracking
ALTER TABLE vehicle_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tracking in their agency" ON vehicle_tracking
    FOR SELECT USING (
        agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can manage tracking in their agency" ON vehicle_tracking
    FOR ALL USING (
        agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid())
    );

-- Enable realtime for live tracking
ALTER PUBLICATION supabase_realtime ADD TABLE vehicle_tracking;

-- ============================================
-- 6. STAFF INVITATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS staff_invitations (
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

-- RLS for invitations
ALTER TABLE staff_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agency admins can view invitations" ON staff_invitations
    FOR SELECT USING (
        agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid() AND role = 'agency_admin')
    );

CREATE POLICY "Agency admins can create invitations" ON staff_invitations
    FOR INSERT WITH CHECK (
        agency_id IN (SELECT agency_id FROM users WHERE id = auth.uid() AND role = 'agency_admin')
    );

-- ============================================
-- 7. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_tasks_agency ON tasks(agency_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_agency ON itineraries(agency_id);
CREATE INDEX IF NOT EXISTS idx_documents_agency ON documents(agency_id);
CREATE INDEX IF NOT EXISTS idx_documents_folder ON documents(folder);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_vehicle_tracking_booking ON vehicle_tracking(booking_id);

-- ============================================
-- 8. UPDATE TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER itineraries_updated_at
    BEFORE UPDATE ON itineraries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
