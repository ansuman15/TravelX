'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    User,
    Mail,
    Phone,
    Shield,
    Save,
    Loader2,
    Camera,
    Building,
} from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

interface ProfileUser {
    id: string;
    email: string;
    full_name: string;
    role: string;
    phone: string | null;
    avatar_url: string | null;
}

interface ProfilePageClientProps {
    user: ProfileUser;
    agencyName?: string;
}

export function ProfilePageClient({ user, agencyName }: ProfilePageClientProps) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        full_name: user.full_name || '',
        phone: user.phone || '',
    });
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const userInitials = user.full_name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U';

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            const supabase = createClient();

            const { error } = await supabase
                .from('users')
                .update({
                    full_name: formData.full_name,
                    phone: formData.phone || null,
                })
                .eq('id', user.id);

            if (error) {
                setMessage({ type: 'error', text: error.message });
            } else {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                router.refresh();
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
        }

        setSaving(false);
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'agency_admin':
                return 'Agency Admin';
            case 'agency_staff':
                return 'Staff';
            case 'super_admin':
                return 'Super Admin';
            default:
                return role;
        }
    };

    return (
        <div className="page-content">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">My Profile</h1>
                    <p className="text-secondary text-sm">Manage your account information</p>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                        <>
                            <Loader2 size={18} className="spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save size={18} />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>

            {message && (
                <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mb-6`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="card">
                    <div className="card-body" style={{ textAlign: 'center' }}>
                        <div className="profile-avatar">
                            {user.avatar_url ? (
                                <img src={user.avatar_url} alt={user.full_name} />
                            ) : (
                                <span>{userInitials}</span>
                            )}
                            <button className="avatar-edit" type="button">
                                <Camera size={16} />
                            </button>
                        </div>
                        <h3 className="font-semibold mt-4">{user.full_name}</h3>
                        <p className="text-sm text-secondary">{user.email}</p>

                        {agencyName && (
                            <div className="agency-badge mt-3">
                                <Building size={14} />
                                <span>{agencyName}</span>
                            </div>
                        )}

                        <div className="role-badge mt-2">
                            <Shield size={14} />
                            <span>{getRoleLabel(user.role)}</span>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <div className="card-header">
                        <User size={18} className="text-primary-500" />
                        <span>Personal Information</span>
                    </div>
                    <div className="card-body">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <Input
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    placeholder="Your name"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <Input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                        </div>

                        <div className="form-group mt-4">
                            <label className="form-label">Email Address</label>
                            <Input
                                type="email"
                                value={user.email}
                                disabled
                            />
                            <span className="form-hint">Email cannot be changed</span>
                        </div>

                        <div className="form-group mt-4">
                            <label className="form-label">Role</label>
                            <Input
                                value={getRoleLabel(user.role)}
                                disabled
                            />
                            <span className="form-hint">Contact your agency admin to change role</span>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .profile-avatar {
                    width: 120px;
                    height: 120px;
                    background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 36px;
                    font-weight: 700;
                    margin: 0 auto;
                    position: relative;
                }
                .profile-avatar img {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    object-fit: cover;
                }
                .avatar-edit {
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    width: 36px;
                    height: 36px;
                    background: white;
                    border: 2px solid white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: var(--text-secondary);
                    transition: all 0.2s ease;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                }
                .avatar-edit:hover {
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                }
                .agency-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    background: var(--bg-secondary);
                    color: var(--text-secondary);
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 500;
                }
                .role-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    background: var(--primary-50);
                    color: var(--primary-600);
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 500;
                }
                .alert {
                    padding: 12px 16px;
                    border-radius: 8px;
                    font-size: 14px;
                }
                .alert-success {
                    background: var(--success-50);
                    color: var(--success-700);
                    border: 1px solid var(--success-200);
                }
                .alert-error {
                    background: var(--error-50);
                    color: var(--error-700);
                    border: 1px solid var(--error-200);
                }
                .form-hint {
                    font-size: 12px;
                    color: var(--text-tertiary);
                    margin-top: 4px;
                    display: block;
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
