import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import { InterestRequest, InterestStatus } from '../../types/interest';
import { ApplicantInviteForm } from '../../components/interest/ApplicantInviteForm';

type StatusFilter = InterestStatus | 'all';

const WaitlistPage: React.FC = () => {
    const [requests, setRequests] = useState<InterestRequest[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>(InterestStatus.PENDING);
    const [selectedRequest, setSelectedRequest] = useState<InterestRequest | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Modals
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);

    // Form inputs
    const [adminNotes, setAdminNotes] = useState('');
    const [expiresInHours, setExpiresInHours] = useState(24);
    const [rejectReason, setRejectReason] = useState('');
    const [infoMessage, setInfoMessage] = useState('');

    useEffect(() => {
        fetchData();
    }, [statusFilter]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [requestsData, statsData] = await Promise.all([
                statusFilter === 'all'
                    ? apiService.interest.getAll()
                    : (statusFilter === InterestStatus.PENDING ? apiService.interest.getPending() : apiService.interest.getAll(statusFilter as string)),
                apiService.interest.getStats()
            ]);

            setRequests(requestsData);
            setStats(statsData);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to load interest data');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedRequest) return;
        try {
            setActionLoading(true);
            await apiService.interest.approve(
                selectedRequest.id,
                adminNotes || undefined,
                expiresInHours
            );
            setSuccess(`Approved! Invitation sent.`);
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
            await apiService.interest.reject(selectedRequest.id, rejectReason);
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

    const handleRequestInfo = async () => {
        if (!selectedRequest || !infoMessage.trim()) return;
        try {
            setActionLoading(true);
            await apiService.interest.requestInfo(selectedRequest.id, infoMessage);
            setSuccess('Info request sent successfully');
            setShowInfoModal(false);
            setSelectedRequest(null);
            setInfoMessage('');
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to request info');
        } finally {
            setActionLoading(false);
        }
    };

    const openActionModal = (req: InterestRequest, action: 'approve' | 'reject' | 'info') => {
        setSelectedRequest(req);
        if (action === 'approve') setShowApproveModal(true);
        if (action === 'reject') setShowRejectModal(true);
        if (action === 'info') setShowInfoModal(true);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold dark:text-white">Interest Requests / Waitlist</h1>
                <button onClick={() => setShowInviteModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    + New Invitation
                </button>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
                <button onClick={() => setStatusFilter(InterestStatus.PENDING)}
                    className={`px-4 py-2 rounded ${statusFilter === InterestStatus.PENDING ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 dark:bg-gray-700'}`}>
                    Pending
                </button>
                <button onClick={() => setStatusFilter('all')}
                    className={`px-4 py-2 rounded ${statusFilter === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 dark:bg-gray-700'}`}>
                    All
                </button>
            </div>

            {success && <div className="bg-green-100 text-green-800 p-4 rounded mb-6">{success}</div>}
            {error && <div className="bg-red-100 text-red-800 p-4 rounded mb-6">{error}</div>}

            {/* List */}
            {loading ? <div className="text-center py-10">Loading...</div> : (
                <div className="bg-white dark:bg-gray-800 rounded shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {requests.map((req: InterestRequest) => (
                                <tr key={req.id}>
                                    <td className="px-6 py-4 whitespace-nowrap dark:text-gray-200">
                                        {req.given_name} {req.family_name}
                                        {req.alias && <span className="text-gray-400 text-xs ml-2">({req.alias})</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap dark:text-gray-200">{req.primary_email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${req.status === InterestStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                                                req.status === InterestStatus.APPROVED ? 'bg-green-100 text-green-800' :
                                                    req.status === InterestStatus.REJECTED ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(req.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {req.status === InterestStatus.PENDING && (
                                            <>
                                                <button onClick={() => openActionModal(req, 'approve')} className="text-green-600 hover:text-green-900 mx-2">Approve</button>
                                                <button onClick={() => openActionModal(req, 'info')} className="text-blue-600 hover:text-blue-900 mx-2">Request Info</button>
                                                <button onClick={() => openActionModal(req, 'reject')} className="text-red-600 hover:text-red-900 mx-2">Reject</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {requests.length === 0 && (
                                <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No requests found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <ApplicantInviteForm onSuccess={() => {
                        setShowInviteModal(false);
                        fetchData();
                        setSuccess('Invitation created successfully');
                    }} onCancel={() => setShowInviteModal(false)} />
                </div>
            )}

            {/* Approve Modal */}
            {showApproveModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4 dark:text-white">Approve {selectedRequest.given_name}?</h3>
                        <div className="mb-4">
                            <label htmlFor="approve_notes" className="block text-sm dark:text-gray-300">Internal Notes</label>
                            <textarea id="approve_notes" className="w-full border rounded p-2 dark:bg-gray-700 dark:text-white" value={adminNotes} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAdminNotes(e.target.value)} placeholder="Enter internal notes" />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="approve_expires" className="block text-sm dark:text-gray-300">Expire Invitation In (Hours)</label>
                            <input id="approve_expires" type="number" className="w-full border rounded p-2 dark:bg-gray-700 dark:text-white" value={expiresInHours} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExpiresInHours(parseInt(e.target.value))} placeholder="24" />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => setShowApproveModal(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                            <button onClick={handleApprove} disabled={actionLoading} className="px-4 py-2 bg-green-600 text-white rounded">Approve & Send</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4 dark:text-white">Reject {selectedRequest.given_name}?</h3>
                        <div className="mb-4">
                            <label htmlFor="reject_reason" className="block text-sm dark:text-gray-300">Reason (Required)</label>
                            <textarea id="reject_reason" className="w-full border rounded p-2 dark:bg-gray-700 dark:text-white" value={rejectReason} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectReason(e.target.value)} required placeholder="Enter rejection reason" />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                            <button onClick={handleReject} disabled={actionLoading || !rejectReason.trim()} className="px-4 py-2 bg-red-600 text-white rounded">Reject</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Request Info Modal */}
            {showInfoModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4 dark:text-white">Request Info from {selectedRequest.given_name}</h3>
                        <div className="mb-4">
                            <label htmlFor="info_message" className="block text-sm dark:text-gray-300">Message to Applicant (Required)</label>
                            <textarea id="info_message" className="w-full border rounded p-2 dark:bg-gray-700 dark:text-white" value={infoMessage} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInfoMessage(e.target.value)} required placeholder="Please provide..." />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => setShowInfoModal(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                            <button onClick={handleRequestInfo} disabled={actionLoading || !infoMessage.trim()} className="px-4 py-2 bg-blue-600 text-white rounded">Send Request</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WaitlistPage;
