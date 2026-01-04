import React, { useState } from 'react';
import { apiService, ScheduleResponse, SystemToggle } from '../services/apiService';

interface SystemToggleProps {
    schedule: ScheduleResponse | null;
    onUpdate: (schedule: ScheduleResponse) => void;
}

const SystemToggleComponent: React.FC<SystemToggleProps> = ({ schedule, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState<'open' | 'closed' | 'auto' | null>(null);

    const handleToggle = async (status: 'open' | 'closed' | 'auto') => {
        setLoading(true);
        try {
            const toggle: SystemToggle = {
                status,
                reason: `Quick toggle to ${status}`
            };
            const updated = await apiService.system.toggleSystemStatus(toggle);
            onUpdate(updated);
            setShowConfirm(null);
        } catch (err) {
            console.error('Failed to toggle system:', err);
            alert('Failed to toggle system status');
        } finally {
            setLoading(false);
        }
    };

    if (!schedule) return null;

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Quick Controls</h3>

            <div className="space-y-3">
                {/* Current Mode Indicator */}
                <div className={`p-3 rounded-lg ${schedule.is_manually_overridden
                        ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
                        : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                    }`}>
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${schedule.is_manually_overridden ? 'bg-orange-500 animate-pulse' : 'bg-blue-500'
                            }`}></span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {schedule.is_manually_overridden
                                ? `Manual: ${schedule.manual_status?.toUpperCase()}`
                                : 'Auto (Scheduled)'}
                        </span>
                    </div>
                </div>

                {/* Toggle Buttons */}
                <div className="grid grid-cols-3 gap-2">
                    <button
                        onClick={() => setShowConfirm('open')}
                        disabled={loading || (schedule.is_manually_overridden && schedule.manual_status === 'open')}
                        className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        Open
                    </button>
                    <button
                        onClick={() => setShowConfirm('closed')}
                        disabled={loading || (schedule.is_manually_overridden && schedule.manual_status === 'closed')}
                        className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => setShowConfirm('auto')}
                        disabled={loading || !schedule.is_manually_overridden}
                        className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        Auto
                    </button>
                </div>

                {/* Confirmation Dialog */}
                {showConfirm && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-sm text-gray-900 dark:text-white mb-2">
                            {showConfirm === 'auto'
                                ? 'Return to automatic scheduled operation?'
                                : `Force system ${showConfirm}?`}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleToggle(showConfirm)}
                                disabled={loading}
                                className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 disabled:opacity-50"
                            >
                                Confirm
                            </button>
                            <button
                                onClick={() => setShowConfirm(null)}
                                disabled={loading}
                                className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SystemToggleComponent;
