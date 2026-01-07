'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Plus,
    ArrowLeft,
    MapPin,
    Clock,
    Calendar,
    Edit2,
    Trash2,
    ChevronDown,
    ChevronUp,
    GripVertical,
    Utensils,
    Hotel,
    Car,
    Save,
    X,
} from 'lucide-react';
import { Badge, Button, Input, Select } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import {
    createItinerary,
    addItineraryDay,
    updateItineraryDay,
    deleteItineraryDay
} from '@/lib/actions/packages';

interface ItineraryDay {
    id: string;
    itinerary_id: string;
    day_number: number;
    title: string;
    description: string | null;
    activities: string[] | null;
    meals_included: string[] | null;
    accommodation: string | null;
    transport: string | null;
    notes: string | null;
}

interface Itinerary {
    id: string;
    package_id: string;
    name: string;
    destination: string;
    duration_days: number;
    duration_nights: number;
    version: number;
    created_at: string;
    days: ItineraryDay[];
}

interface Package {
    id: string;
    name: string;
    destination: string;
    duration_days: number;
    duration_nights: number;
    description: string | null;
    category: string | null;
}

interface Supplier {
    id: string;
    name: string;
    type: string;
}

interface ItineraryBuilderClientProps {
    pkg: Package;
    initialItineraries: Itinerary[];
    suppliers: Supplier[];
}

const MEAL_OPTIONS = ['Breakfast', 'Lunch', 'Dinner', 'All Meals'];

export function ItineraryBuilderClient({
    pkg,
    initialItineraries,
    suppliers
}: ItineraryBuilderClientProps) {
    const router = useRouter();
    const [itineraries, setItineraries] = useState<Itinerary[]>(initialItineraries);
    const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(
        initialItineraries[0] || null
    );
    const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
    const [showCreateItinerary, setShowCreateItinerary] = useState(false);
    const [showAddDay, setShowAddDay] = useState(false);
    const [editingDay, setEditingDay] = useState<ItineraryDay | null>(null);
    const [loading, setLoading] = useState(false);

    // Itinerary form
    const [itineraryForm, setItineraryForm] = useState({
        name: `${pkg.name} - Version 1`,
        destination: pkg.destination,
        duration_days: pkg.duration_days,
        duration_nights: pkg.duration_nights,
    });

    // Day form
    const [dayForm, setDayForm] = useState({
        day_number: 1,
        title: '',
        description: '',
        activities: [''],
        meals_included: [] as string[],
        accommodation: '',
        transport: '',
        notes: '',
    });

    const resetDayForm = (dayNumber: number = 1) => {
        setDayForm({
            day_number: dayNumber,
            title: `Day ${dayNumber}`,
            description: '',
            activities: [''],
            meals_included: [],
            accommodation: '',
            transport: '',
            notes: '',
        });
    };

    const toggleDayExpand = (dayId: string) => {
        const newExpanded = new Set(expandedDays);
        if (newExpanded.has(dayId)) {
            newExpanded.delete(dayId);
        } else {
            newExpanded.add(dayId);
        }
        setExpandedDays(newExpanded);
    };

    const handleCreateItinerary = async () => {
        setLoading(true);
        const result = await createItinerary({
            package_id: pkg.id,
            ...itineraryForm,
        });

        if (result.data) {
            setShowCreateItinerary(false);
            router.refresh();
        }
        setLoading(false);
    };

    const handleAddDay = async () => {
        if (!selectedItinerary) return;

        setLoading(true);
        const result = await addItineraryDay({
            itinerary_id: selectedItinerary.id,
            day_number: dayForm.day_number,
            title: dayForm.title,
            description: dayForm.description || undefined,
            activities: dayForm.activities.filter(a => a.trim()),
            meals_included: dayForm.meals_included,
            accommodation: dayForm.accommodation || undefined,
            transport: dayForm.transport || undefined,
            notes: dayForm.notes || undefined,
        });

        if (result.data) {
            setShowAddDay(false);
            resetDayForm(dayForm.day_number + 1);
            router.refresh();
        }
        setLoading(false);
    };

    const handleUpdateDay = async () => {
        if (!editingDay) return;

        setLoading(true);
        const result = await updateItineraryDay(editingDay.id, {
            title: dayForm.title,
            description: dayForm.description || undefined,
            activities: dayForm.activities.filter(a => a.trim()),
            meals_included: dayForm.meals_included,
            accommodation: dayForm.accommodation || undefined,
            transport: dayForm.transport || undefined,
            notes: dayForm.notes || undefined,
        });

        if (result.data) {
            setEditingDay(null);
            router.refresh();
        }
        setLoading(false);
    };

    const handleDeleteDay = async (dayId: string) => {
        if (!confirm('Delete this day?')) return;

        await deleteItineraryDay(dayId);
        router.refresh();
    };

    const openEditDay = (day: ItineraryDay) => {
        setDayForm({
            day_number: day.day_number,
            title: day.title,
            description: day.description || '',
            activities: day.activities?.length ? day.activities : [''],
            meals_included: day.meals_included || [],
            accommodation: day.accommodation || '',
            transport: day.transport || '',
            notes: day.notes || '',
        });
        setEditingDay(day);
    };

    const openAddDay = () => {
        const nextDayNumber = (selectedItinerary?.days?.length || 0) + 1;
        resetDayForm(nextDayNumber);
        setShowAddDay(true);
    };

    const addActivity = () => {
        setDayForm({
            ...dayForm,
            activities: [...dayForm.activities, ''],
        });
    };

    const updateActivity = (index: number, value: string) => {
        const newActivities = [...dayForm.activities];
        newActivities[index] = value;
        setDayForm({ ...dayForm, activities: newActivities });
    };

    const removeActivity = (index: number) => {
        const newActivities = dayForm.activities.filter((_, i) => i !== index);
        setDayForm({ ...dayForm, activities: newActivities.length ? newActivities : [''] });
    };

    const toggleMeal = (meal: string) => {
        const newMeals = dayForm.meals_included.includes(meal)
            ? dayForm.meals_included.filter(m => m !== meal)
            : [...dayForm.meals_included, meal];
        setDayForm({ ...dayForm, meals_included: newMeals });
    };

    const sortedDays = selectedItinerary?.days?.sort((a, b) => a.day_number - b.day_number) || [];

    return (
        <div className="page-content">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Link href="/agency/packages">
                    <button className="btn btn-ghost">
                        <ArrowLeft size={18} />
                    </button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">{pkg.name}</h1>
                    <div className="flex items-center gap-3 text-secondary text-sm">
                        <span className="flex items-center gap-1">
                            <MapPin size={14} /> {pkg.destination}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock size={14} /> {pkg.duration_days}D / {pkg.duration_nights}N
                        </span>
                    </div>
                </div>
                <Button onClick={() => setShowCreateItinerary(true)}>
                    <Plus size={18} />
                    New Itinerary
                </Button>
            </div>

            <div className="grid grid-cols-4 gap-6">
                {/* Itinerary List Sidebar */}
                <div>
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Itineraries</h3>
                        </div>
                        <div className="card-body" style={{ padding: 0 }}>
                            {itineraries.length === 0 ? (
                                <div className="text-center text-secondary" style={{ padding: 'var(--spacing-6)' }}>
                                    No itineraries yet
                                </div>
                            ) : (
                                itineraries.map(itin => (
                                    <div
                                        key={itin.id}
                                        className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedItinerary?.id === itin.id ? 'bg-primary-50 border-l-2 border-primary-500' : ''}`}
                                        onClick={() => setSelectedItinerary(itin)}
                                        style={{ borderBottom: '1px solid var(--border-light)' }}
                                    >
                                        <div className="font-medium">{itin.name}</div>
                                        <div className="text-sm text-secondary">
                                            Version {itin.version} • {itin.days?.length || 0} days
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Day-wise Itinerary Builder */}
                <div style={{ gridColumn: 'span 3' }}>
                    {selectedItinerary ? (
                        <div className="card">
                            <div className="card-header">
                                <div>
                                    <h3 className="card-title">{selectedItinerary.name}</h3>
                                    <div className="text-sm text-secondary">
                                        {selectedItinerary.duration_days} Days, {selectedItinerary.duration_nights} Nights
                                    </div>
                                </div>
                                <Button size="sm" onClick={openAddDay}>
                                    <Plus size={16} />
                                    Add Day
                                </Button>
                            </div>
                            <div className="card-body" style={{ padding: 0 }}>
                                {sortedDays.length === 0 ? (
                                    <div className="text-center" style={{ padding: 'var(--spacing-10)' }}>
                                        <Calendar size={48} className="text-secondary mx-auto mb-4" style={{ opacity: 0.3 }} />
                                        <div className="text-secondary mb-4">No days added yet</div>
                                        <Button onClick={openAddDay}>
                                            <Plus size={16} />
                                            Add First Day
                                        </Button>
                                    </div>
                                ) : (
                                    <div>
                                        {sortedDays.map((day) => (
                                            <div
                                                key={day.id}
                                                className="border-b"
                                                style={{ borderColor: 'var(--border-light)' }}
                                            >
                                                {/* Day Header */}
                                                <div
                                                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50"
                                                    onClick={() => toggleDayExpand(day.id)}
                                                >
                                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-600 font-bold">
                                                        {day.day_number}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-medium">{day.title}</div>
                                                        <div className="text-sm text-secondary">
                                                            {day.activities?.length || 0} activities
                                                            {day.meals_included?.length ? ` • ${day.meals_included.join(', ')}` : ''}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            className="btn btn-ghost btn-sm"
                                                            onClick={(e) => { e.stopPropagation(); openEditDay(day); }}
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button
                                                            className="btn btn-ghost btn-sm"
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteDay(day.id); }}
                                                        >
                                                            <Trash2 size={14} className="text-error-500" />
                                                        </button>
                                                        {expandedDays.has(day.id) ? (
                                                            <ChevronUp size={18} className="text-secondary" />
                                                        ) : (
                                                            <ChevronDown size={18} className="text-secondary" />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Day Details (Expanded) */}
                                                {expandedDays.has(day.id) && (
                                                    <div className="px-4 pb-4 ml-14" style={{ borderTop: '1px solid var(--border-light)' }}>
                                                        {day.description && (
                                                            <div className="mt-3">
                                                                <div className="text-xs text-secondary mb-1">Description</div>
                                                                <p className="text-sm">{day.description}</p>
                                                            </div>
                                                        )}

                                                        {day.activities && day.activities.length > 0 && (
                                                            <div className="mt-3">
                                                                <div className="text-xs text-secondary mb-1">Activities</div>
                                                                <ul className="list-disc list-inside text-sm">
                                                                    {day.activities.map((activity, i) => (
                                                                        <li key={i}>{activity}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}

                                                        <div className="grid grid-cols-3 gap-4 mt-3">
                                                            {day.accommodation && (
                                                                <div>
                                                                    <div className="text-xs text-secondary mb-1 flex items-center gap-1">
                                                                        <Hotel size={12} /> Accommodation
                                                                    </div>
                                                                    <div className="text-sm">{day.accommodation}</div>
                                                                </div>
                                                            )}
                                                            {day.transport && (
                                                                <div>
                                                                    <div className="text-xs text-secondary mb-1 flex items-center gap-1">
                                                                        <Car size={12} /> Transport
                                                                    </div>
                                                                    <div className="text-sm">{day.transport}</div>
                                                                </div>
                                                            )}
                                                            {day.meals_included && day.meals_included.length > 0 && (
                                                                <div>
                                                                    <div className="text-xs text-secondary mb-1 flex items-center gap-1">
                                                                        <Utensils size={12} /> Meals
                                                                    </div>
                                                                    <div className="text-sm">{day.meals_included.join(', ')}</div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {day.notes && (
                                                            <div className="mt-3 p-2 rounded bg-warning-50 text-sm text-warning-800">
                                                                <strong>Note:</strong> {day.notes}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="card">
                            <div className="card-body text-center" style={{ padding: 'var(--spacing-10)' }}>
                                <div className="text-secondary">
                                    {itineraries.length === 0
                                        ? 'Create your first itinerary to get started'
                                        : 'Select an itinerary from the list'}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Itinerary Modal */}
            <Modal
                isOpen={showCreateItinerary}
                onClose={() => setShowCreateItinerary(false)}
                title="Create New Itinerary"
            >
                <div className="space-y-4">
                    <div className="form-group">
                        <label className="form-label">Itinerary Name *</label>
                        <Input
                            value={itineraryForm.name}
                            onChange={(e) => setItineraryForm({ ...itineraryForm, name: e.target.value })}
                            placeholder="e.g., Bali Adventure - Premium"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Destination</label>
                        <Input
                            value={itineraryForm.destination}
                            onChange={(e) => setItineraryForm({ ...itineraryForm, destination: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="form-label">Days</label>
                            <Input
                                type="number"
                                min={1}
                                value={itineraryForm.duration_days}
                                onChange={(e) => setItineraryForm({ ...itineraryForm, duration_days: parseInt(e.target.value) || 1 })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Nights</label>
                            <Input
                                type="number"
                                min={0}
                                value={itineraryForm.duration_nights}
                                onChange={(e) => setItineraryForm({ ...itineraryForm, duration_nights: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="ghost" onClick={() => setShowCreateItinerary(false)}>Cancel</Button>
                    <Button onClick={handleCreateItinerary} disabled={loading || !itineraryForm.name}>
                        {loading ? 'Creating...' : 'Create Itinerary'}
                    </Button>
                </div>
            </Modal>

            {/* Add/Edit Day Modal */}
            <Modal
                isOpen={showAddDay || !!editingDay}
                onClose={() => { setShowAddDay(false); setEditingDay(null); }}
                title={editingDay ? `Edit Day ${editingDay.day_number}` : `Add Day ${dayForm.day_number}`}
                size="lg"
            >
                <div className="grid grid-cols-2 gap-4">
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Day Title *</label>
                        <Input
                            value={dayForm.title}
                            onChange={(e) => setDayForm({ ...dayForm, title: e.target.value })}
                            placeholder="e.g., Arrival & City Tour"
                        />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-textarea"
                            rows={2}
                            value={dayForm.description}
                            onChange={(e) => setDayForm({ ...dayForm, description: e.target.value })}
                            placeholder="Brief description of the day..."
                        />
                    </div>

                    {/* Activities */}
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Activities</label>
                        {dayForm.activities.map((activity, i) => (
                            <div key={i} className="flex gap-2 mb-2">
                                <Input
                                    value={activity}
                                    onChange={(e) => updateActivity(i, e.target.value)}
                                    placeholder="e.g., Visit Tanah Lot Temple"
                                />
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => removeActivity(i)}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                        <button type="button" className="btn btn-ghost btn-sm" onClick={addActivity}>
                            <Plus size={14} /> Add Activity
                        </button>
                    </div>

                    {/* Meals */}
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Meals Included</label>
                        <div className="flex gap-2">
                            {MEAL_OPTIONS.map(meal => (
                                <button
                                    key={meal}
                                    type="button"
                                    className={`px-3 py-1 rounded-full text-sm ${dayForm.meals_included.includes(meal)
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-gray-100 text-gray-700'
                                        }`}
                                    onClick={() => toggleMeal(meal)}
                                >
                                    {meal}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Accommodation</label>
                        <Input
                            value={dayForm.accommodation}
                            onChange={(e) => setDayForm({ ...dayForm, accommodation: e.target.value })}
                            placeholder="e.g., 5-star Beach Resort"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Transport</label>
                        <Input
                            value={dayForm.transport}
                            onChange={(e) => setDayForm({ ...dayForm, transport: e.target.value })}
                            placeholder="e.g., Private AC Car"
                        />
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Notes</label>
                        <textarea
                            className="form-textarea"
                            rows={2}
                            value={dayForm.notes}
                            onChange={(e) => setDayForm({ ...dayForm, notes: e.target.value })}
                            placeholder="Any special notes for this day..."
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="ghost" onClick={() => { setShowAddDay(false); setEditingDay(null); }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={editingDay ? handleUpdateDay : handleAddDay}
                        disabled={loading || !dayForm.title}
                    >
                        {loading ? 'Saving...' : (editingDay ? 'Update Day' : 'Add Day')}
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
