import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { TasksPageClient } from './page-client';

export const dynamic = 'force-dynamic';

export default async function AgencyTasksPage() {
    const user = await requireAuth();

    if (!user.agency_id) {
        redirect('/onboarding');
    }

    // For now, return mock tasks - TODO: Create tasks table in database
    const mockTasks = [
        { id: '1', title: 'Follow up with client - Bali trip', priority: 'high' as const, due_date: new Date().toISOString(), status: 'pending' as const, assignee: user.full_name },
        { id: '2', title: 'Prepare visa documents for Dubai package', priority: 'medium' as const, due_date: new Date(Date.now() + 86400000).toISOString(), status: 'in_progress' as const, assignee: user.full_name },
        { id: '3', title: 'Confirm hotel booking for Thailand trip', priority: 'high' as const, due_date: new Date(Date.now() + 172800000).toISOString(), status: 'pending' as const, assignee: user.full_name },
        { id: '4', title: 'Send invoice to customer', priority: 'low' as const, due_date: new Date(Date.now() + 259200000).toISOString(), status: 'completed' as const, assignee: user.full_name },
        { id: '5', title: 'Update package pricing', priority: 'medium' as const, due_date: new Date(Date.now() + 345600000).toISOString(), status: 'pending' as const, assignee: user.full_name },
    ];

    return (
        <TasksPageClient
            tasks={mockTasks}
            currentUser={user.full_name}
        />
    );
}
