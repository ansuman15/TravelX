'use client';

import { useState } from 'react';
import {
    Settings,
    Mail,
    Shield,
    Bell,
    Database,
    Save,
    Loader2,
    Globe,
    ToggleLeft,
    ToggleRight,
} from 'lucide-react';
import { Button, Input, Select } from '@/components/ui';

export function SettingsPageClient() {
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    // Settings state
    const [settings, setSettings] = useState({
        platformName: 'TravelX',
        supportEmail: 'support@travelx.app',
        defaultAgencyLimit: 5,
        maxStaffPerAgency: 10,
        maintenanceMode: false,
        emailNotifications: true,
        autoBackup: true,
        defaultCurrency: 'INR',
        defaultTimezone: 'Asia/Kolkata',
    });

    const handleSave = async () => {
        setSaving(true);
        // Simulate save
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSaving(false);
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Settings },
        { id: 'email', label: 'Email', icon: Mail },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ];

    return (
        <div className="page-content">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Platform Settings</h1>
                    <p className="text-secondary text-sm">Configure platform-wide settings</p>
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

            <div className="settings-layout">
                {/* Tabs */}
                <div className="settings-tabs">
                    {tabs.map((tab) => {
                        const IconComponent = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <IconComponent size={18} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="settings-content">
                    {activeTab === 'general' && (
                        <div className="card">
                            <div className="card-header">
                                <Globe size={18} className="text-primary-500" />
                                <span>General Settings</span>
                            </div>
                            <div className="card-body">
                                <div className="settings-grid">
                                    <div className="form-group">
                                        <label className="form-label">Platform Name</label>
                                        <Input
                                            value={settings.platformName}
                                            onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Support Email</label>
                                        <Input
                                            type="email"
                                            value={settings.supportEmail}
                                            onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Default Currency</label>
                                        <Select
                                            value={settings.defaultCurrency}
                                            onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                                        >
                                            <option value="INR">INR - Indian Rupee</option>
                                            <option value="USD">USD - US Dollar</option>
                                            <option value="EUR">EUR - Euro</option>
                                        </Select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Default Timezone</label>
                                        <Select
                                            value={settings.defaultTimezone}
                                            onChange={(e) => setSettings({ ...settings, defaultTimezone: e.target.value })}
                                        >
                                            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                            <option value="UTC">UTC</option>
                                            <option value="America/New_York">America/New_York (EST)</option>
                                        </Select>
                                    </div>
                                </div>

                                <div className="settings-divider" />

                                <h4 className="font-semibold mb-4">Agency Limits</h4>
                                <div className="settings-grid">
                                    <div className="form-group">
                                        <label className="form-label">Default Staff Limit per Agency</label>
                                        <Input
                                            type="number"
                                            value={settings.defaultAgencyLimit}
                                            onChange={(e) => setSettings({ ...settings, defaultAgencyLimit: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Max Staff per Agency</label>
                                        <Input
                                            type="number"
                                            value={settings.maxStaffPerAgency}
                                            onChange={(e) => setSettings({ ...settings, maxStaffPerAgency: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'email' && (
                        <div className="card">
                            <div className="card-header">
                                <Mail size={18} className="text-primary-500" />
                                <span>Email Configuration</span>
                            </div>
                            <div className="card-body">
                                <div className="settings-toggle">
                                    <div>
                                        <div className="font-medium">Email Notifications</div>
                                        <div className="text-sm text-secondary">Send email notifications for important events</div>
                                    </div>
                                    <button
                                        className="toggle-btn"
                                        onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                                    >
                                        {settings.emailNotifications ? (
                                            <ToggleRight size={32} className="text-primary-500" />
                                        ) : (
                                            <ToggleLeft size={32} className="text-secondary" />
                                        )}
                                    </button>
                                </div>
                                <div className="text-sm text-secondary mt-4">
                                    Email service is configured using Supabase built-in email. Configure in your Supabase dashboard.
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="card">
                            <div className="card-header">
                                <Shield size={18} className="text-primary-500" />
                                <span>Security Settings</span>
                            </div>
                            <div className="card-body">
                                <div className="settings-toggle">
                                    <div>
                                        <div className="font-medium">Maintenance Mode</div>
                                        <div className="text-sm text-secondary">Block all non-admin access to the platform</div>
                                    </div>
                                    <button
                                        className="toggle-btn"
                                        onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                                    >
                                        {settings.maintenanceMode ? (
                                            <ToggleRight size={32} className="text-error-500" />
                                        ) : (
                                            <ToggleLeft size={32} className="text-secondary" />
                                        )}
                                    </button>
                                </div>

                                <div className="settings-divider" />

                                <div className="settings-toggle">
                                    <div>
                                        <div className="font-medium">Auto Backup</div>
                                        <div className="text-sm text-secondary">Automatically backup database daily</div>
                                    </div>
                                    <button
                                        className="toggle-btn"
                                        onClick={() => setSettings({ ...settings, autoBackup: !settings.autoBackup })}
                                    >
                                        {settings.autoBackup ? (
                                            <ToggleRight size={32} className="text-primary-500" />
                                        ) : (
                                            <ToggleLeft size={32} className="text-secondary" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="card">
                            <div className="card-header">
                                <Bell size={18} className="text-primary-500" />
                                <span>Notification Preferences</span>
                            </div>
                            <div className="card-body">
                                <p className="text-secondary">
                                    Configure notification settings for the platform. Each agency can override these settings.
                                </p>
                                <div className="mt-4">
                                    <div className="text-sm text-secondary">
                                        Notification settings are managed per-agency. Visit the Agencies page to configure individual agency notifications.
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .settings-layout {
                    display: grid;
                    grid-template-columns: 220px 1fr;
                    gap: var(--spacing-6);
                }
                .settings-tabs {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-2);
                }
                .settings-tab {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-3);
                    padding: var(--spacing-3) var(--spacing-4);
                    border: none;
                    background: transparent;
                    border-radius: var(--radius-lg);
                    cursor: pointer;
                    font-size: var(--font-sm);
                    color: var(--text-secondary);
                    transition: all 0.2s ease;
                }
                .settings-tab:hover {
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                }
                .settings-tab.active {
                    background: var(--primary-50);
                    color: var(--primary-600);
                }
                .settings-content {
                    min-height: 400px;
                }
                .settings-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: var(--spacing-4);
                }
                .settings-divider {
                    height: 1px;
                    background: var(--border-light);
                    margin: var(--spacing-6) 0;
                }
                .settings-toggle {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: var(--spacing-4) 0;
                }
                .toggle-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0;
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
