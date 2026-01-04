import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
const WaitlistPage = () => {
    const [requests, setRequests] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [selectedRequest, setSelectedRequest] = useState(null);
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
        }
        catch (err) {
            setError(err.response?.data?.detail || 'Failed to load waitlist data');
        }
        finally {
            setLoading(false);
        }
    };
    const handleApprove = async () => {
        if (!selectedRequest)
            return;
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
        }
        catch (err) {
            setError(err.response?.data?.detail || 'Failed to approve request');
        }
        finally {
            setActionLoading(false);
        }
    };
    const handleReject = async () => {
        if (!selectedRequest || !rejectReason.trim())
            return;
        try {
            setActionLoading(true);
            await apiService.waitlist.reject(selectedRequest.id, rejectReason);
            setSuccess('Request rejected successfully');
            setShowRejectModal(false);
            setSelectedRequest(null);
            setRejectReason('');
            fetchData();
        }
        catch (err) {
            setError(err.response?.data?.detail || 'Failed to reject request');
        }
        finally {
            setActionLoading(false);
        }
    };
    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
            case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
            case 'invited': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
            case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };
    if (loading && requests.length === 0) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx("div", { className: "text-lg text-gray-600 dark:text-gray-400", children: "Loading waitlist..." }) }));
    }
    return (_jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 dark:text-white", children: "Waitlist Management" }), _jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Review and process interest requests" })] }), _jsx("button", { onClick: fetchData, className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700", children: "Refresh" })] }), error && (_jsxs("div", { className: "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg flex justify-between", children: [_jsx("span", { children: error }), _jsx("button", { onClick: () => setError(null), className: "text-red-600 hover:text-red-800", children: "\u00D7" })] })), success && (_jsxs("div", { className: "bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg flex justify-between", children: [_jsx("span", { children: success }), _jsx("button", { onClick: () => setSuccess(null), className: "text-green-600 hover:text-green-800", children: "\u00D7" })] })), stats && (_jsxs("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-4", children: [_jsxs("div", { className: "bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700", children: [_jsx("div", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: stats.total }), _jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Total" })] }), _jsxs("div", { className: "bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl shadow border border-yellow-200 dark:border-yellow-800", children: [_jsx("div", { className: "text-2xl font-bold text-yellow-700 dark:text-yellow-300", children: stats.pending }), _jsx("div", { className: "text-sm text-yellow-600 dark:text-yellow-400", children: "Pending" })] }), _jsxs("div", { className: "bg-green-50 dark:bg-green-900/20 p-4 rounded-xl shadow border border-green-200 dark:border-green-800", children: [_jsx("div", { className: "text-2xl font-bold text-green-700 dark:text-green-300", children: stats.approved }), _jsx("div", { className: "text-sm text-green-600 dark:text-green-400", children: "Approved" })] }), _jsxs("div", { className: "bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl shadow border border-blue-200 dark:border-blue-800", children: [_jsx("div", { className: "text-2xl font-bold text-blue-700 dark:text-blue-300", children: stats.invited }), _jsx("div", { className: "text-sm text-blue-600 dark:text-blue-400", children: "Invited" })] }), _jsxs("div", { className: "bg-red-50 dark:bg-red-900/20 p-4 rounded-xl shadow border border-red-200 dark:border-red-800", children: [_jsx("div", { className: "text-2xl font-bold text-red-700 dark:text-red-300", children: stats.rejected }), _jsx("div", { className: "text-sm text-red-600 dark:text-red-400", children: "Rejected" })] })] })), _jsx("div", { className: "flex gap-2 border-b border-gray-200 dark:border-gray-700", children: ['pending', 'all', 'approved', 'invited', 'rejected'].map((filter) => (_jsx("button", { onClick: () => setStatusFilter(filter), className: `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${statusFilter === filter
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`, children: filter.charAt(0).toUpperCase() + filter.slice(1) }, filter))) }), _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200 dark:divide-gray-700", children: [_jsx("thead", { className: "bg-gray-50 dark:bg-gray-900", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Name" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Email" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Company" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Role" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Status" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Date" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200 dark:divide-gray-700", children: requests.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "px-4 py-8 text-center text-gray-500 dark:text-gray-400", children: "No requests found" }) })) : (requests.map((request) => (_jsxs("tr", { className: "hover:bg-gray-50 dark:hover:bg-gray-750", children: [_jsx("td", { className: "px-4 py-3 text-sm font-medium text-gray-900 dark:text-white", children: request.full_name }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-600 dark:text-gray-300", children: request.email }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-600 dark:text-gray-300", children: request.company || '-' }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-600 dark:text-gray-300", children: request.role || '-' }), _jsx("td", { className: "px-4 py-3", children: _jsx("span", { className: `px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(request.status)}`, children: request.status }) }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-500 dark:text-gray-400", children: new Date(request.created_at).toLocaleDateString() }), _jsx("td", { className: "px-4 py-3", children: request.status === 'pending' && (_jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => {
                                                            setSelectedRequest(request);
                                                            setShowApproveModal(true);
                                                        }, className: "px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700", children: "Approve" }), _jsx("button", { onClick: () => {
                                                            setSelectedRequest(request);
                                                            setShowRejectModal(true);
                                                        }, className: "px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700", children: "Reject" })] })) })] }, request.id)))) })] }) }) }), showApproveModal && selectedRequest && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl", children: [_jsx("h3", { className: "text-xl font-bold text-gray-900 dark:text-white mb-4", children: "Approve Request" }), _jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-300 mb-4", children: ["Approving ", _jsx("strong", { children: selectedRequest.full_name }), " (", selectedRequest.email, "). An invitation code will be generated and sent."] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Admin Notes (optional)" }), _jsx("textarea", { value: adminNotes, onChange: (e) => setAdminNotes(e.target.value), rows: 2, className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white", placeholder: "Internal notes..." })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Invitation Expires In (hours)" }), _jsx("input", { type: "number", value: expiresInHours, onChange: (e) => setExpiresInHours(parseInt(e.target.value) || 72), min: 1, title: "Invitation expiration hours", placeholder: "72", className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" })] })] }), _jsxs("div", { className: "flex gap-3 mt-6", children: [_jsx("button", { onClick: () => {
                                        setShowApproveModal(false);
                                        setSelectedRequest(null);
                                    }, className: "flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700", children: "Cancel" }), _jsx("button", { onClick: handleApprove, disabled: actionLoading, className: "flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50", children: actionLoading ? 'Processing...' : 'Approve & Send Invite' })] })] }) })), showRejectModal && selectedRequest && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl", children: [_jsx("h3", { className: "text-xl font-bold text-gray-900 dark:text-white mb-4", children: "Reject Request" }), _jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-300 mb-4", children: ["Rejecting ", _jsx("strong", { children: selectedRequest.full_name }), " (", selectedRequest.email, ")."] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: ["Rejection Reason ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("textarea", { value: rejectReason, onChange: (e) => setRejectReason(e.target.value), rows: 3, className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white", placeholder: "Reason for rejection...", required: true })] }), _jsxs("div", { className: "flex gap-3 mt-6", children: [_jsx("button", { onClick: () => {
                                        setShowRejectModal(false);
                                        setSelectedRequest(null);
                                        setRejectReason('');
                                    }, className: "flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700", children: "Cancel" }), _jsx("button", { onClick: handleReject, disabled: actionLoading || !rejectReason.trim(), className: "flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50", children: actionLoading ? 'Processing...' : 'Reject Request' })] })] }) }))] }));
};
export default WaitlistPage;
