import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
const SystemSchedulePage = () => {
    const [schedule, setSchedule] = useState(null);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    // Form state
    const [openingHour, setOpeningHour] = useState(9);
    const [openingMinute, setOpeningMinute] = useState(0);
    const [closingHour, setClosingHour] = useState(17);
    const [closingMinute, setClosingMinute] = useState(0);
    const [warningMinutes, setWarningMinutes] = useState(15);
    const [timezone, setTimezone] = useState('UTC');
    // Manual override state
    const [overrideReason, setOverrideReason] = useState('');
    const [overrideDuration, setOverrideDuration] = useState(undefined);
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
        }
        catch (err) {
            setError(err.response?.data?.detail || 'Failed to load schedule');
        }
        finally {
            setLoading(false);
        }
    };
    const fetchAuditLogs = async () => {
        try {
            const logs = await apiService.system.getScheduleAuditLog(0, 20);
            setAuditLogs(logs);
        }
        catch (err) {
            console.error('Failed to load audit logs:', err);
        }
    };
    const handleUpdateSchedule = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setSaving(true);
        try {
            const update = {
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
        }
        catch (err) {
            setError(err.response?.data?.detail || 'Failed to update schedule');
        }
        finally {
            setSaving(false);
        }
    };
    const handleToggleSystem = async (status) => {
        setError(null);
        setSuccess(null);
        setSaving(true);
        try {
            const toggle = {
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
        }
        catch (err) {
            setError(err.response?.data?.detail || 'Failed to toggle system');
        }
        finally {
            setSaving(false);
        }
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx("div", { className: "text-lg text-gray-600 dark:text-gray-400", children: "Loading schedule..." }) }));
    }
    return (_jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 dark:text-white", children: "System Schedule" }), _jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Configure operating hours and manual overrides" })] }), error && (_jsx("div", { className: "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg", children: error })), success && (_jsx("div", { className: "bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg", children: success })), schedule && (_jsxs("div", { className: `p-6 rounded-xl shadow-lg border-2 ${schedule.is_manually_overridden
                    ? 'bg-gradient-to-br from-orange-50 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 border-orange-500'
                    : 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-500'}`, children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 dark:text-white mb-4", children: "Current Status" }), schedule.is_manually_overridden ? (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-3 h-3 rounded-full bg-orange-500 animate-pulse" }), _jsxs("span", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: ["Manual Override Active: ", schedule.manual_status?.toUpperCase()] })] }), schedule.override_reason && (_jsxs("p", { className: "text-sm text-gray-700 dark:text-gray-300", children: ["Reason: ", schedule.override_reason] })), schedule.override_expires_at && (_jsxs("p", { className: "text-sm text-gray-700 dark:text-gray-300", children: ["Expires: ", new Date(schedule.override_expires_at).toLocaleString()] }))] })) : (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-3 h-3 rounded-full bg-blue-500" }), _jsx("span", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "Automatic Mode (Scheduled)" })] }), _jsxs("p", { className: "text-sm text-gray-700 dark:text-gray-300", children: ["Operating Hours: ", schedule.opening_time, " - ", schedule.closing_time, " ", schedule.timezone] })] }))] })), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 dark:text-white mb-4", children: "Manual Override" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Reason (Optional)" }), _jsx("input", { type: "text", value: overrideReason, onChange: (e) => setOverrideReason(e.target.value), placeholder: "e.g., Emergency maintenance", className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Duration (minutes, optional)" }), _jsx("input", { type: "number", value: overrideDuration || '', onChange: (e) => setOverrideDuration(e.target.value ? parseInt(e.target.value) : undefined), placeholder: "Leave empty for indefinite", min: "1", className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" })] }), _jsxs("div", { className: "grid grid-cols-3 gap-3", children: [_jsx("button", { onClick: () => handleToggleSystem('open'), disabled: saving, className: "px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium", children: "Force Open" }), _jsx("button", { onClick: () => handleToggleSystem('closed'), disabled: saving, className: "px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium", children: "Force Closed" }), _jsx("button", { onClick: () => handleToggleSystem('auto'), disabled: saving, className: "px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium", children: "Auto Mode" })] })] })] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 dark:text-white mb-4", children: "Operating Hours" }), _jsxs("form", { onSubmit: handleUpdateSchedule, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Opening Hour" }), _jsx("input", { type: "number", value: openingHour, onChange: (e) => setOpeningHour(parseInt(e.target.value)), min: "0", max: "23", title: "Opening Hour", placeholder: "0-23", className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Opening Minute" }), _jsx("input", { type: "number", value: openingMinute, onChange: (e) => setOpeningMinute(parseInt(e.target.value)), min: "0", max: "59", title: "Opening Minute", placeholder: "0-59", className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Closing Hour" }), _jsx("input", { type: "number", value: closingHour, onChange: (e) => setClosingHour(parseInt(e.target.value)), min: "0", max: "23", title: "Closing Hour", placeholder: "0-23", className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Closing Minute" }), _jsx("input", { type: "number", value: closingMinute, onChange: (e) => setClosingMinute(parseInt(e.target.value)), min: "0", max: "59", title: "Closing Minute", placeholder: "0-59", className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Warning Minutes Before Close" }), _jsx("input", { type: "number", value: warningMinutes, onChange: (e) => setWarningMinutes(parseInt(e.target.value)), min: "0", title: "Warning Minutes", placeholder: "e.g. 15", className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Timezone" }), _jsx("input", { type: "text", value: timezone, onChange: (e) => setTimezone(e.target.value), title: "Timezone", placeholder: "e.g. UTC", className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" })] }), _jsx("button", { type: "submit", disabled: saving, className: "w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 font-medium", children: saving ? 'Saving...' : 'Update Operating Hours' })] })] })] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 dark:text-white mb-4", children: "Change History" }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200 dark:divide-gray-700", children: [_jsx("thead", { className: "bg-gray-50 dark:bg-gray-900", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Timestamp" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Action" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Admin ID" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Reason" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200 dark:divide-gray-700", children: auditLogs.map((log) => (_jsxs("tr", { className: "hover:bg-gray-50 dark:hover:bg-gray-750", children: [_jsx("td", { className: "px-4 py-3 text-sm text-gray-900 dark:text-white", children: new Date(log.timestamp).toLocaleString() }), _jsx("td", { className: "px-4 py-3 text-sm", children: _jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${log.action === 'manual_override' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200' :
                                                        log.action === 'update_hours' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' :
                                                            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'}`, children: log.action.replace('_', ' ') }) }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-900 dark:text-white", children: log.admin_id }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-600 dark:text-gray-400", children: log.reason || '-' })] }, log.id))) })] }) })] })] }));
};
export default SystemSchedulePage;
