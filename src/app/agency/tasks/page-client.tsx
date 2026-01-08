'use client';

import { useState } from 'react';
import {
    Plus,
    Search,
    CheckSquare,
    Square,
    Clock,
    AlertCircle,
    CheckCircle,
    Circle,
    MoreVertical,
    Calendar,
    User,
} from 'lucide-react';
import { Button, Input, Select, Badge } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';

interface Task {
    id: string;
    title: string;
    priority: 'low' | 'medium' | 'high';
    due_date: string;
    status: 'pending' | 'in_progress' | 'completed';
    assignee: string;
}

interface TasksPageClientProps {
    tasks: Task[];
    currentUser: string;
}

export function TasksPageClient({ tasks: initialTasks, currentUser }: TasksPageClientProps) {
    const [tasks, setTasks] = useState(initialTasks);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', priority: 'medium', due_date: '' });

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const toggleTaskStatus = (taskId: string) => {
        setTasks(tasks.map(task => {
            if (task.id === taskId) {
                const newStatus = task.status === 'completed' ? 'pending' : 'completed';
                return { ...task, status: newStatus };
            }
            return task;
        }));
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'info';
            default: return 'gray';
        }
    };

    const formatDueDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'Overdue';
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    const isDueDatePast = (dateStr: string) => {
        return new Date(dateStr) < new Date();
    };

    const handleAddTask = () => {
        if (!newTask.title) return;
        const task: Task = {
            id: Date.now().toString(),
            title: newTask.title,
            priority: newTask.priority as any,
            due_date: newTask.due_date || new Date().toISOString(),
            status: 'pending',
            assignee: currentUser,
        };
        setTasks([task, ...tasks]);
        setNewTask({ title: '', priority: 'medium', due_date: '' });
        setShowAddModal(false);
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
                    </div>
                ) : (
                    filteredTasks.map(task => (
                        <div key={task.id} className={`task-item ${task.status === 'completed' ? 'completed' : ''}`}>
                            <button
                                className="task-checkbox"
                                onClick={() => toggleTaskStatus(task.id)}
                            >
                                {task.status === 'completed' ? (
                                    <CheckCircle size={22} className="text-success-500" />
                                ) : (
                                    <Circle size={22} className="text-tertiary" />
                                )}
                            </button>

                            <div className="task-content">
                                <div className="task-title">{task.title}</div>
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

                            <Badge variant={getPriorityColor(task.priority) as any}>
                                {task.priority}
                            </Badge>
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
                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
                    <Button onClick={handleAddTask} disabled={!newTask.title}>
                        Add Task
                    </Button>
                </div>
            </Modal>

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
            `}</style>
        </div>
    );
}
