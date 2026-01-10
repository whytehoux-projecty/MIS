import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import { toast } from 'react-hot-toast';
import { InterestRequest, InterestStatus } from '../../types/interest';
import { NewApplicantInviteForm } from '../invitations/NewApplicantInviteForm';

export const InterestRequestsPage: React.FC = () => {
    const [requests, setRequests] = useState<InterestRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<InterestRequest | null>(null);

    // Modals
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false); // For new admin invite

    // Action state
    const [adminNotes, setAdminNotes] = useState('');
    const [expiresInHours, setExpiresInHours] = useState(24);
    const [rejectReason, setRejectReason] = useState('');
    const [infoMessage, setInfoMessage] = useState('');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await apiService.interest.getPending();
            setRequests(data);
        } catch (error) {
            toast.error('Failed to load requests');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedRequest) return;
        try {
            const result = await apiService.interest.approve(selectedRequest.id, adminNotes, expiresInHours);
            toast.success(`Approved! Code: ${result.invitation_code}, PIN: ${result.pin}`);
            setShowApproveModal(false);
            resetForms();
            fetchRequests();
        } catch (error: any) {
            toast.error(error.message || 'Approval failed');
        }
    };

    const handleReject = async () => {
        if (!selectedRequest) return;
        try {
            await apiService.interest.reject(selectedRequest.id, rejectReason);
            toast.success('Request rejected');
            setShowRejectModal(false);
            resetForms();
            fetchRequests();
        } catch (error: any) {
            toast.error(error.message || 'Rejection failed');
        }
    };

    const handleRequestInfo = async () => {
        if (!selectedRequest) return;
        try {
            await apiService.interest.requestInfo(selectedRequest.id, infoMessage);
            toast.success('Info request sent');
            setShowInfoModal(false);
            resetForms();
            fetchRequests();
        } catch (error: any) {
            toast.error(error.message || 'Info request failed');
        }
    };

    const resetForms = () => {
        setAdminNotes('');
        setExpiresInHours(24);
        setRejectReason('');
        setInfoMessage('');
        setSelectedRequest(null);
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold dark:text-white">Interest Requests</h1>
                <button
                    onClick={() => setShowInviteModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    + New Direct Invite
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10 dark:text-gray-300">Loading requests...</div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email/Phone</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submitted</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {requests.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No pending requests</td></tr>
                            ) : requests.map(req => (
                                <tr key={req.id}>
                                    <td className="px-6 py-4 whitespace-nowrap dark:text-gray-200">
                                        <div className="text-sm font-medium">{req.given_name} {req.family_name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{req.gender}, {req.marital_status}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap dark:text-gray-200">
                                        <div className="text-sm">{req.primary_email}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{req.primary_phone}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(req.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {req.status === 'pending' && (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => { setSelectedRequest(req); setShowApproveModal(true); }}
                                                    className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded">Approve</button>
                                                <button
                                                    onClick={() => { setSelectedRequest(req); setShowRejectModal(true); }}
                                                    className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded">Reject</button>
                                                <button
                                                    onClick={() => { setSelectedRequest(req); setShowInfoModal(true); }}
                                                    className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded">Request Info</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modals */}
            {/* Approve Modal */}
            {showApproveModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4 dark:text-white">Approve {selectedRequest.given_name}?</h3>
                        <div className="mb-4">
                            <label htmlFor="approve-notes" className="block text-sm dark:text-gray-300 mb-1">Internal Notes</label>
                            <textarea id="approve-notes" className="w-full border rounded p-2 dark:bg-gray-700 dark:text-white" value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder="Optional internal notes" />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="approve-expires" className="block text-sm dark:text-gray-300 mb-1">Invitation Expires In (Hours)</label>
                            <input id="approve-expires" type="number" className="w-full border rounded p-2 dark:bg-gray-700 dark:text-white" value={expiresInHours} onChange={e => setExpiresInHours(parseInt(e.target.value))} placeholder="24" />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => setShowApproveModal(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 dark:text-gray-200 rounded">Cancel</button>
                            <button onClick={handleApprove} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Approve & Send</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4 dark:text-white">Reject {selectedRequest.given_name}?</h3>
                        <div className="mb-4">
                            <label htmlFor="reject-reason" className="block text-sm dark:text-gray-300 mb-1">Reason (Required)</label>
                            <textarea id="reject-reason" className="w-full border rounded p-2 dark:bg-gray-700 dark:text-white" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Enter rejection reason" required />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 dark:text-gray-200 rounded">Cancel</button>
                            <button onClick={handleReject} disabled={!rejectReason.trim()} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50">Reject</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Info Modal */}
            {showInfoModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4 dark:text-white">Request Info from {selectedRequest.given_name}</h3>
                        <div className="mb-4">
                            <label className="block text-sm dark:text-gray-300 mb-1">Message (Required)</label>
                            <textarea className="w-full border rounded p-2 dark:bg-gray-700 dark:text-white" value={infoMessage} onChange={e => setInfoMessage(e.target.value)} placeholder="What info do you need?" required />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => setShowInfoModal(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 dark:text-gray-200 rounded">Cancel</button>
                            <button onClick={handleRequestInfo} disabled={!infoMessage.trim()} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">Send Request</button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
                        <button
                            onClick={() => setShowInviteModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            ✕
                        </button>
                        <h2 className="text-xl font-bold mb-4 dark:text-white">Create New Direct Invitation</h2>
                        <NewApplicantInviteForm onSuccess={() => {
                            setShowInviteModal(false);
                            // Optionally fetch requests if we want to show the new invitee in a list, 
                            // though they usually skip 'pending' and go to 'invited'. 
                            // We might want to switch view to 'all' or 'invited' to see them.
                        }} />
                    </div>
                </div>
            )}

        </div>
    );
};

export default InterestRequestsPage;
