import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { apiService } from '../services/apiService';
const SystemToggleComponent = ({ schedule, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(null);
    const handleToggle = async (status) => {
        setLoading(true);
        try {
            const toggle = {
                status,
                reason: `Quick toggle to ${status}`
            };
            const updated = await apiService.system.toggleSystemStatus(toggle);
            onUpdate(updated);
            setShowConfirm(null);
        }
        catch (err) {
            console.error('Failed to toggle system:', err);
            alert('Failed to toggle system status');
        }
        finally {
            setLoading(false);
        }
    };
    if (!schedule)
        return null;
    return (_jsxs("div", { className: "bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700", children: [_jsx("h3", { className: "text-lg font-bold text-gray-900 dark:text-white mb-3", children: "Quick Controls" }), _jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: `p-3 rounded-lg ${schedule.is_manually_overridden
                            ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
                            : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'}`, children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: `w-2 h-2 rounded-full ${schedule.is_manually_overridden ? 'bg-orange-500 animate-pulse' : 'bg-blue-500'}` }), _jsx("span", { className: "text-sm font-medium text-gray-900 dark:text-white", children: schedule.is_manually_overridden
                                        ? `Manual: ${schedule.manual_status?.toUpperCase()}`
                                        : 'Auto (Scheduled)' })] }) }), _jsxs("div", { className: "grid grid-cols-3 gap-2", children: [_jsx("button", { onClick: () => setShowConfirm('open'), disabled: loading || (schedule.is_manually_overridden && schedule.manual_status === 'open'), className: "px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium", children: "Open" }), _jsx("button", { onClick: () => setShowConfirm('closed'), disabled: loading || (schedule.is_manually_overridden && schedule.manual_status === 'closed'), className: "px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium", children: "Close" }), _jsx("button", { onClick: () => setShowConfirm('auto'), disabled: loading || !schedule.is_manually_overridden, className: "px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium", children: "Auto" })] }), showConfirm && (_jsxs("div", { className: "p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg", children: [_jsx("p", { className: "text-sm text-gray-900 dark:text-white mb-2", children: showConfirm === 'auto'
                                    ? 'Return to automatic scheduled operation?'
                                    : `Force system ${showConfirm}?` }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => handleToggle(showConfirm), disabled: loading, className: "px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 disabled:opacity-50", children: "Confirm" }), _jsx("button", { onClick: () => setShowConfirm(null), disabled: loading, className: "px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 disabled:opacity-50", children: "Cancel" })] })] }))] })] }));
};
export default SystemToggleComponent;
