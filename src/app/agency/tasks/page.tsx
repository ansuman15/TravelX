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

    const supabase = await createClient();

    // Fetch tasks from database with assignee info
    const { data: tasks, error } = await supabase
        .from('tasks')
        .select(`
            *,
            assignee:users!tasks_assignee_id_fkey(id, full_name),
            creator:users!tasks_created_by_fkey(id, full_name)
        `)
        .eq('agency_id', user.agency_id)
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching tasks:', error);
    }

    // Transform data for client component
    const formattedTasks = (tasks || []).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority as 'low' | 'medium' | 'high',
        status: task.status as 'pending' | 'in_progress' | 'completed',
        due_date: task.due_date,
        assignee: task.assignee?.full_name || 'Unassigned',
        assignee_id: task.assignee_id,
        created_by: task.creator?.full_name,
    }));

    // Fetch staff for assignment dropdown
    const { data: staff } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('agency_id', user.agency_id)
        .eq('is_active', true);

    return (
        <TasksPageClient
            tasks={formattedTasks}
            currentUser={user.full_name}
            currentUserId={user.id}
            staffList={staff || []}
        />
    );
}
