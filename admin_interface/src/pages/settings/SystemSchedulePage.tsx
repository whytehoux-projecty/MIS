import React, { useState, useEffect } from 'react';
import { apiService, ScheduleResponse, ScheduleUpdate, SystemToggle, ScheduleAuditLog } from '../../services/apiService';

const SystemSchedulePage: React.FC = () => {
    const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
    const [auditLogs, setAuditLogs] = useState<ScheduleAuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form state
    const [openingHour, setOpeningHour] = useState(9);
    const [openingMinute, setOpeningMinute] = useState(0);
    const [closingHour, setClosingHour] = useState(17);
    const [closingMinute, setClosingMinute] = useState(0);
    const [warningMinutes, setWarningMinutes] = useState(15);
    const [timezone, setTimezone] = useState('UTC');

    // Manual override state
    const [overrideReason, setOverrideReason] = useState('');
    const [overrideDuration, setOverrideDuration] = useState<number | undefined>(undefined);

    useEffect(() => {
        fetchSchedule();
        fetchAuditLogs();
    }, []);

    const fetchSchedule = async () => {
        try {
            setLoading(true);
            const data = await apiService.system.getCurrentSchedule();
            setSchedule(data);

            // Parse times
            const [oh, om] = data.opening_time.split(':').map(Number);
            const [ch, cm] = data.closing_time.split(':').map(Number);

            setOpeningHour(oh);
            setOpeningMinute(om);
            setClosingHour(ch);
            setClosingMinute(cm);
            setWarningMinutes(data.warning_minutes_before_close);
            setTimezone(data.timezone);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to load schedule');
        } finally {
            setLoading(false);
        }
    };

    const fetchAuditLogs = async () => {
        try {
            const logs = await apiService.system.getScheduleAuditLog(0, 20);
            setAuditLogs(logs);
        } catch (err) {
            console.error('Failed to load audit logs:', err);
        }
    };

    const handleUpdateSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setSaving(true);

        try {
            const update: ScheduleUpdate = {
                opening_hour: openingHour,
                opening_minute: openingMinute,
                closing_hour: closingHour,
                closing_minute: closingMinute,
                warning_minutes: warningMinutes,
                timezone: timezone
            };

            const updated = await apiService.system.updateOperatingHours(update);
            setSchedule(updated);
            setSuccess('Operating hours updated successfully!');
            fetchAuditLogs();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to update schedule');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleSystem = async (status: 'open' | 'closed' | 'auto') => {
        setError(null);
        setSuccess(null);
        setSaving(true);

        try {
            const toggle: SystemToggle = {
                status,
                reason: overrideReason || undefined,
                duration_minutes: overrideDuration
            };

            const updated = await apiService.system.toggleSystemStatus(toggle);
            setSchedule(updated);
            setSuccess(`System ${status === 'auto' ? 'returned to automatic mode' : `manually set to ${status}`}!`);
            setOverrideReason('');
            setOverrideDuration(undefined);
            fetchAuditLogs();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to toggle system');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg text-gray-600 dark:text-gray-400">Loading schedule...</div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Schedule</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Configure operating hours and manual overrides
                </p>
            </div>

            {/* Alerts */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg">
                    {success}
                </div>
            )}

            {/* Current Status */}
            {schedule && (
                <div className={`p-6 rounded-xl shadow-lg border-2 ${schedule.is_manually_overridden
                    ? 'bg-gradient-to-br from-orange-50 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 border-orange-500'
                    : 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-500'
                    }`}>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Current Status</h2>

                    {schedule.is_manually_overridden ? (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-orange-500 animate-pulse"></span>
                                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Manual Override Active: {schedule.manual_status?.toUpperCase()}
                                </span>
                            </div>
                            {schedule.override_reason && (
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Reason: {schedule.override_reason}
                                </p>
                            )}
                            {schedule.override_expires_at && (
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Expires: {new Date(schedule.override_expires_at).toLocaleString()}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Automatic Mode (Scheduled)
                                </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Operating Hours: {schedule.opening_time} - {schedule.closing_time} {schedule.timezone}
                            </p>
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Manual Override Controls */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Manual Override</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Reason (Optional)
                            </label>
                            <input
                                type="text"
                                value={overrideReason}
                                onChange={(e) => setOverrideReason(e.target.value)}
                                placeholder="e.g., Emergency maintenance"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Duration (minutes, optional)
                            </label>
                            <input
                                type="number"
                                value={overrideDuration || ''}
                                onChange={(e) => setOverrideDuration(e.target.value ? parseInt(e.target.value) : undefined)}
                                placeholder="Leave empty for indefinite"
                                min="1"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => handleToggleSystem('open')}
                                disabled={saving}
                                className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                            >
                                Force Open
                            </button>
                            <button
                                onClick={() => handleToggleSystem('closed')}
                                disabled={saving}
                                className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                            >
                                Force Closed
                            </button>
                            <button
                                onClick={() => handleToggleSystem('auto')}
                                disabled={saving}
                                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                            >
                                Auto Mode
                            </button>
                        </div>
                    </div>
                </div>

                {/* Operating Hours Configuration */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Operating Hours</h2>

                    <form onSubmit={handleUpdateSchedule} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Opening Hour
                                </label>
                                <input
                                    type="number"
                                    value={openingHour}
                                    onChange={(e) => setOpeningHour(parseInt(e.target.value))}
                                    min="0"
                                    max="23"
                                    title="Opening Hour"
                                    placeholder="0-23"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Opening Minute
                                </label>
                                <input
                                    type="number"
                                    value={openingMinute}
                                    onChange={(e) => setOpeningMinute(parseInt(e.target.value))}
                                    min="0"
                                    max="59"
                                    title="Opening Minute"
                                    placeholder="0-59"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Closing Hour
                                </label>
                                <input
                                    type="number"
                                    value={closingHour}
                                    onChange={(e) => setClosingHour(parseInt(e.target.value))}
                                    min="0"
                                    max="23"
                                    title="Closing Hour"
                                    placeholder="0-23"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Closing Minute
                                </label>
                                <input
                                    type="number"
                                    value={closingMinute}
                                    onChange={(e) => setClosingMinute(parseInt(e.target.value))}
                                    min="0"
                                    max="59"
                                    title="Closing Minute"
                                    placeholder="0-59"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Warning Minutes Before Close
                            </label>
                            <input
                                type="number"
                                value={warningMinutes}
                                onChange={(e) => setWarningMinutes(parseInt(e.target.value))}
                                min="0"
                                title="Warning Minutes"
                                placeholder="e.g. 15"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Timezone
                            </label>
                            <input
                                type="text"
                                value={timezone}
                                onChange={(e) => setTimezone(e.target.value)}
                                title="Timezone"
                                placeholder="e.g. UTC"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 font-medium"
                        >
                            {saving ? 'Saving...' : 'Update Operating Hours'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Audit Log */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Change History</h2>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {auditLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${log.action === 'manual_override' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200' :
                                            log.action === 'update_hours' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' :
                                                'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                                            }`}>
                                            {log.action.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                        {log.admin_id}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        {log.reason || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SystemSchedulePage;
