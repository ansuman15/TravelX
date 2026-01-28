'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Search,
    CheckSquare,
    Clock,
    CheckCircle,
    Circle,
    Calendar,
    User,
    Trash2,
} from 'lucide-react';
import { Button, Input, Select, Badge } from '@/components/ui';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { createTask, updateTask, deleteTask, toggleTaskStatus } from '@/lib/actions/tasks';

interface Task {
    id: string;
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    due_date: string;
    status: 'pending' | 'in_progress' | 'completed';
    assignee: string;
    assignee_id?: string;
    created_by?: string;
}

interface StaffMember {
    id: string;
    full_name: string;
}

interface TasksPageClientProps {
    tasks: Task[];
    currentUser: string;
    currentUserId: string;
    staffList: StaffMember[];
}

export function TasksPageClient({
    tasks: initialTasks,
    currentUser,
    currentUserId,
    staffList
}: TasksPageClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [tasks, setTasks] = useState(initialTasks);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
    const [error, setError] = useState('');

    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
        assignee_id: currentUserId
    });

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleToggleStatus = async (taskId: string) => {
        setError('');
        startTransition(async () => {
            const result = await toggleTaskStatus(taskId);
            if (result.error) {
                setError(result.error);
            } else {
                router.refresh();
            }
        });
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'info';
            default: return 'gray';
        }
    };

    const formatDueDate = (dateStr: string | null) => {
        if (!dateStr) return 'No due date';
        const date = new Date(dateStr);
        const today = new Date();
        const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'Overdue';
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    const isDueDatePast = (dateStr: string | null) => {
        if (!dateStr) return false;
        return new Date(dateStr) < new Date();
    };

    const handleAddTask = async () => {
        if (!newTask.title) return;
        setError('');

        startTransition(async () => {
            const result = await createTask({
                title: newTask.title,
                description: newTask.description || undefined,
                priority: newTask.priority as 'low' | 'medium' | 'high',
                due_date: newTask.due_date || undefined,
                assignee_id: newTask.assignee_id || undefined,
            });

            if (result.error) {
                setError(result.error);
            } else {
                setNewTask({ title: '', description: '', priority: 'medium', due_date: '', assignee_id: currentUserId });
                setShowAddModal(false);
                router.refresh();
            }
        });
    };

    const confirmDelete = (taskId: string) => {
        setTaskToDelete(taskId);
        setShowDeleteConfirm(true);
    };

    const handleDelete = async () => {
        if (!taskToDelete) return;
        setError('');

        startTransition(async () => {
            const result = await deleteTask(taskToDelete);
            if (result.error) {
                setError(result.error);
            } else {
                setShowDeleteConfirm(false);
                setTaskToDelete(null);
                router.refresh();
            }
        });
    };

    const pendingCount = tasks.filter(t => t.status === 'pending').length;
    const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
    const completedCount = tasks.filter(t => t.status === 'completed').length;

    return (
        <div className="page-content">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Tasks</h1>
                    <p className="text-secondary text-sm">Manage your pending tasks and to-dos</p>
                </div>
                <Button onClick={() => setShowAddModal(true)}>
                    <Plus size={18} />
                    Add Task
                </Button>
            </div>

            {error && (
                <div className="alert alert-error mb-4">
                    {error}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="flex items-center gap-3">
                            <div className="stat-icon">
                                <CheckSquare size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{tasks.length}</div>
                                <div className="text-sm text-secondary">Total Tasks</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="flex items-center gap-3">
                            <div className="stat-icon warning">
                                <Circle size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{pendingCount}</div>
                                <div className="text-sm text-secondary">Pending</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="flex items-center gap-3">
                            <div className="stat-icon primary">
                                <Clock size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{inProgressCount}</div>
                                <div className="text-sm text-secondary">In Progress</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="flex items-center gap-3">
                            <div className="stat-icon success">
                                <CheckCircle size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{completedCount}</div>
                                <div className="text-sm text-secondary">Completed</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-6">
                <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                    <div className="flex gap-4">
                        <div style={{ flex: 1 }}>
                            <div className="input-wrapper">
                                <Search className="input-icon" size={18} />
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Search tasks..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ paddingLeft: '40px' }}
                                />
                            </div>
                        </div>
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ width: '150px' }}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Task List */}
            <div className="task-list">
                {filteredTasks.length === 0 ? (
                    <div className="empty-state">
                        <CheckSquare size={48} />
                        <p>No tasks found</p>
                        <Button variant="ghost" onClick={() => setShowAddModal(true)}>
                            Create your first task
                        </Button>
                    </div>
                ) : (
                    filteredTasks.map(task => (
                        <div key={task.id} className={`task-item ${task.status === 'completed' ? 'completed' : ''}`}>
                            <button
                                className="task-checkbox"
                                onClick={() => handleToggleStatus(task.id)}
                                disabled={isPending}
                            >
                                {task.status === 'completed' ? (
                                    <CheckCircle size={22} className="text-success-500" />
                                ) : (
                                    <Circle size={22} className="text-tertiary" />
                                )}
                            </button>

                            <div className="task-content">
                                <div className="task-title">{task.title}</div>
                                {task.description && (
                                    <div className="task-description">{task.description}</div>
                                )}
                                <div className="task-meta">
                                    <span className={`task-due ${isDueDatePast(task.due_date) && task.status !== 'completed' ? 'overdue' : ''}`}>
                                        <Calendar size={12} />
                                        {formatDueDate(task.due_date)}
                                    </span>
                                    <span className="task-assignee">
                                        <User size={12} />
                                        {task.assignee}
                                    </span>
                                </div>
                            </div>

                            <Badge variant={getPriorityColor(task.priority) as 'error' | 'warning' | 'info'}>
                                {task.priority}
                            </Badge>

                            <button
                                className="task-delete"
                                onClick={() => confirmDelete(task.id)}
                                title="Delete task"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Add Task Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add New Task"
            >
                <div className="form-group">
                    <label className="form-label">Task Title *</label>
                    <Input
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        placeholder="What needs to be done?"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                        className="form-input"
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        placeholder="Add more details..."
                        rows={3}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                        <label className="form-label">Priority</label>
                        <Select
                            value={newTask.priority}
                            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </Select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Due Date</label>
                        <Input
                            type="date"
                            value={newTask.due_date}
                            onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Assign To</label>
                    <Select
                        value={newTask.assignee_id}
                        onChange={(e) => setNewTask({ ...newTask, assignee_id: e.target.value })}
                    >
                        {staffList.map(staff => (
                            <option key={staff.id} value={staff.id}>
                                {staff.full_name} {staff.id === currentUserId ? '(Me)' : ''}
                            </option>
                        ))}
                    </Select>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
                    <Button onClick={handleAddTask} disabled={!newTask.title || isPending}>
                        {isPending ? 'Adding...' : 'Add Task'}
                    </Button>
                </div>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Delete Task"
                message="Are you sure you want to delete this task? This action cannot be undone."
                confirmText={isPending ? 'Deleting...' : 'Delete'}
                variant="danger"
            />

            <style jsx>{`
                .stat-icon {
                    width: 48px;
                    height: 48px;
                    background: var(--bg-secondary);
                    color: var(--text-secondary);
                    border-radius: var(--radius-lg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .stat-icon.warning {
                    background: var(--warning-50);
                    color: var(--warning-600);
                }
                .stat-icon.primary {
                    background: var(--primary-50);
                    color: var(--primary-600);
                }
                .stat-icon.success {
                    background: var(--success-50);
                    color: var(--success-600);
                }
                .task-list {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-2);
                }
                .task-item {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-3);
                    padding: var(--spacing-4);
                    background: white;
                    border: 1px solid var(--border-light);
                    border-radius: var(--radius-lg);
                    transition: all 0.2s ease;
                }
                .task-item:hover {
                    border-color: var(--primary-200);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                }
                .task-item.completed {
                    opacity: 0.6;
                }
                .task-item.completed .task-title {
                    text-decoration: line-through;
                    color: var(--text-tertiary);
                }
                .task-checkbox {
                    background: none;
                    border: none;
                    padding: 0;
                    cursor: pointer;
                    display: flex;
                }
                .task-content {
                    flex: 1;
                }
                .task-title {
                    font-weight: 500;
                    font-size: 15px;
                    margin-bottom: 4px;
                }
                .task-description {
                    font-size: 13px;
                    color: var(--text-secondary);
                    margin-bottom: 4px;
                }
                .task-meta {
                    display: flex;
                    gap: var(--spacing-4);
                    font-size: 12px;
                    color: var(--text-tertiary);
                }
                .task-meta span {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .task-due.overdue {
                    color: var(--error-600);
                }
                .task-delete {
                    background: none;
                    border: none;
                    padding: var(--spacing-2);
                    cursor: pointer;
                    color: var(--text-tertiary);
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                .task-item:hover .task-delete {
                    opacity: 1;
                }
                .task-delete:hover {
                    color: var(--error-600);
                }
                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: var(--spacing-8);
                    background: white;
                    border: 1px solid var(--border-light);
                    border-radius: var(--radius-lg);
                    color: var(--text-tertiary);
                    gap: var(--spacing-3);
                }
                .alert-error {
                    background: var(--error-50);
                    color: var(--error-700);
                    padding: var(--spacing-3) var(--spacing-4);
                    border-radius: var(--radius-md);
                    border: 1px solid var(--error-200);
                }
            `}</style>
        </div>
    );
}
