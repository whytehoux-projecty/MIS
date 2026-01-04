import React, { useState, useEffect } from 'react';
import { apiService, WaitlistRequest, WaitlistStats } from '../../services/apiService';

type StatusFilter = 'all' | 'pending' | 'approved' | 'invited' | 'rejected';

const WaitlistPage: React.FC = () => {
    const [requests, setRequests] = useState<WaitlistRequest[]>([]);
    const [stats, setStats] = useState<WaitlistStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
    const [selectedRequest, setSelectedRequest] = useState<WaitlistRequest | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Modal state
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');
    const [expiresInHours, setExpiresInHours] = useState(72);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        fetchData();
    }, [statusFilter]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [requestsData, statsData] = await Promise.all([
                statusFilter === 'pending'
                    ? apiService.waitlist.getPending()
                    : apiService.waitlist.getAll(statusFilter === 'all' ? undefined : statusFilter),
                apiService.waitlist.getStats()
            ]);

            setRequests(requestsData);
            setStats(statsData);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to load waitlist data');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedRequest) return;

        try {
            setActionLoading(true);
            const result = await apiService.waitlist.approve(selectedRequest.id, {
                admin_notes: adminNotes || undefined,
                expires_in_hours: expiresInHours
            });

            setSuccess(`Approved! Invitation code: ${result.invitation_code}, PIN: ${result.pin}`);
            setShowApproveModal(false);
            setSelectedRequest(null);
            setAdminNotes('');
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to approve request');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selectedRequest || !rejectReason.trim()) return;

        try {
            setActionLoading(true);
            await apiService.waitlist.reject(selectedRequest.id, rejectReason);

            setSuccess('Request rejected successfully');
            setShowRejectModal(false);
            setSelectedRequest(null);
            setRejectReason('');
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to reject request');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
            case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
            case 'invited': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
            case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    if (loading && requests.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg text-gray-600 dark:text-gray-400">Loading waitlist...</div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Waitlist Management</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Review and process interest requests
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Refresh
                </button>
            </div>

            {/* Alerts */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg flex justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">×</button>
                </div>
            )}
            {success && (
                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg flex justify-between">
                    <span>{success}</span>
                    <button onClick={() => setSuccess(null)} className="text-green-600 hover:text-green-800">×</button>
                </div>
            )}

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl shadow border border-yellow-200 dark:border-yellow-800">
                        <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.pending}</div>
                        <div className="text-sm text-yellow-600 dark:text-yellow-400">Pending</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl shadow border border-green-200 dark:border-green-800">
                        <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.approved}</div>
                        <div className="text-sm text-green-600 dark:text-green-400">Approved</div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl shadow border border-blue-200 dark:border-blue-800">
                        <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.invited}</div>
                        <div className="text-sm text-blue-600 dark:text-blue-400">Invited</div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl shadow border border-red-200 dark:border-red-800">
                        <div className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.rejected}</div>
                        <div className="text-sm text-red-600 dark:text-red-400">Rejected</div>
                    </div>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                {(['pending', 'all', 'approved', 'invited', 'rejected'] as StatusFilter[]).map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setStatusFilter(filter)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${statusFilter === filter
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                ))}
            </div>

            {/* Requests Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                        No requests found
                                    </td>
                                </tr>
                            ) : (
                                requests.map((request) => (
                                    <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                            {request.full_name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                            {request.email}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                            {request.company || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                            {request.role || '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(request.status)}`}>
                                                {request.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(request.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            {request.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedRequest(request);
                                                            setShowApproveModal(true);
                                                        }}
                                                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedRequest(request);
                                                            setShowRejectModal(true);
                                                        }}
                                                        className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Approve Modal */}
            {showApproveModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            Approve Request
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            Approving <strong>{selectedRequest.full_name}</strong> ({selectedRequest.email}).
                            An invitation code will be generated and sent.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Admin Notes (optional)
                                </label>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Internal notes..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Invitation Expires In (hours)
                                </label>
                                <input
                                    type="number"
                                    value={expiresInHours}
                                    onChange={(e) => setExpiresInHours(parseInt(e.target.value) || 72)}
                                    min={1}
                                    title="Invitation expiration hours"
                                    placeholder="72"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowApproveModal(false);
                                    setSelectedRequest(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApprove}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                {actionLoading ? 'Processing...' : 'Approve & Send Invite'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            Reject Request
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            Rejecting <strong>{selectedRequest.full_name}</strong> ({selectedRequest.email}).
                        </p>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Rejection Reason <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Reason for rejection..."
                                required
                            />
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setSelectedRequest(null);
                                    setRejectReason('');
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={actionLoading || !rejectReason.trim()}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                {actionLoading ? 'Processing...' : 'Reject Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WaitlistPage;
