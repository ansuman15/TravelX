'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// ============================================
// TASK TYPES
// ============================================
export interface Task {
    id: string;
    agency_id: string;
    title: string;
    description: string | null;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'in_progress' | 'completed';
    due_date: string | null;
    assignee_id: string | null;
    created_by: string | null;
    created_at: string;
    updated_at: string;
    assignee?: {
        id: string;
        full_name: string;
    };
}

// ============================================
// GET TASKS
// ============================================
export async function getTasks() {
    const user = await requireAuth();

    if (!user.agency_id) {
        return { error: 'No agency associated', data: [] };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('tasks')
        .select(`
            *,
            assignee:users!assignee_id(id, full_name)
        `)
        .eq('agency_id', user.agency_id)
        .order('created_at', { ascending: false });

    if (error) {
        return { error: error.message, data: [] };
    }

    return { data: data || [] };
}

// ============================================
// CREATE TASK
// ============================================
export async function createTask(formData: {
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    due_date?: string;
    assignee_id?: string;
}) {
    const user = await requireAuth();

    if (!user.agency_id) {
        return { error: 'No agency associated' };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('tasks')
        .insert({
            agency_id: user.agency_id,
            title: formData.title,
            description: formData.description || null,
            priority: formData.priority || 'medium',
            status: 'pending',
            due_date: formData.due_date || null,
            assignee_id: formData.assignee_id || user.id,
            created_by: user.id,
        })
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/tasks');
    return { data };
}

// ============================================
// UPDATE TASK
// ============================================
export async function updateTask(
    taskId: string,
    formData: {
        title?: string;
        description?: string;
        priority?: 'low' | 'medium' | 'high';
        status?: 'pending' | 'in_progress' | 'completed';
        due_date?: string;
        assignee_id?: string;
    }
) {
    const user = await requireAuth();

    if (!user.agency_id) {
        return { error: 'No agency associated' };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('tasks')
        .update(formData)
        .eq('id', taskId)
        .eq('agency_id', user.agency_id)
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/tasks');
    return { data };
}

// ============================================
// DELETE TASK
// ============================================
export async function deleteTask(taskId: string) {
    const user = await requireAuth();

    if (!user.agency_id) {
        return { error: 'No agency associated' };
    }

    const supabase = await createClient();

    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('agency_id', user.agency_id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/tasks');
    return { success: true };
}

// ============================================
// TOGGLE TASK STATUS
// ============================================
export async function toggleTaskStatus(taskId: string) {
    const user = await requireAuth();

    if (!user.agency_id) {
        return { error: 'No agency associated' };
    }

    const supabase = await createClient();

    // First get the current status
    const { data: task } = await supabase
        .from('tasks')
        .select('status')
        .eq('id', taskId)
        .single();

    if (!task) {
        return { error: 'Task not found' };
    }

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';

    const { data, error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId)
        .eq('agency_id', user.agency_id)
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/tasks');
    return { data };
}
