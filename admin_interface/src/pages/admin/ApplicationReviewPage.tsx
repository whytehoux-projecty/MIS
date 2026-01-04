import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService, PendingUser } from '../../services/apiService';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

export const ApplicationReviewPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<PendingUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Onboarding Modal State
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [onboardingStep, setOnboardingStep] = useState<'confirm' | 'processing' | 'success'>('confirm');
    const [membershipKey, setMembershipKey] = useState<string>('');

    useEffect(() => {
        if (id) fetchUserDetails(parseInt(id));
    }, [id]);

    const fetchUserDetails = async (userId: number) => {
        try {
            setLoading(true);
            const data = await apiService.admin.getPendingUser(userId);
            setUser(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch user details');
            toast.error('Load failed');
        } finally {
            setLoading(false);
        }
    };

    const initiateApproval = () => {
        if (!user) return;
        setShowOnboarding(true);
        setOnboardingStep('confirm');
    };

    const confirmApproval = async () => {
        if (!user) return;
        setOnboardingStep('processing');
        try {
            const result = await apiService.admin.approveUser(user.id);
            setMembershipKey(result.auth_key);
            setOnboardingStep('success');
            toast.success('Approved successfully');
        } catch (err: any) {
            toast.error('Approval failed: ' + err.message);
            setShowOnboarding(false);
        }
    };

    const handleReject = async () => {
        if (!user) return;
        const reason = prompt('Reason for rejection:');
        if (!reason) return;
        try {
            await apiService.admin.rejectUser(user.id, reason);
            toast.success('Rejected successfully');
            navigate('/admin');
        } catch (err: any) {
            toast.error('Rejection failed: ' + err.message);
        }
    };

    const handleQuestion = async () => {
        if (!user) return;
        const question = prompt('Enter your question for the applicant:');
        if (!question) return;
        try {
            await apiService.admin.requestInfo(user.id, question);
            toast.success('Inquiry sent');
            navigate('/admin');
        } catch (err: any) {
            toast.error('Failed to send inquiry: ' + err.message);
        }
    };

    if (loading) return <div className="p-10 flex justify-center"><LoadingSpinner /></div>;
    if (error || !user) return <div className="p-10 text-red-600">Error: {error || 'User not found'}</div>;

    const photos = user.photo_ids ? user.photo_ids.split(',').filter(Boolean) : [];
    const policies = user.policies_accepted ? JSON.parse(user.policies_accepted as any) : {};

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6 relative">
            <div className="flex justify-between items-center">
                <button onClick={() => navigate('/admin')} className="text-gray-600 hover:text-gray-900">
                    ← Back to Dashboard
                </button>
                <h1 className="text-2xl font-bold">Application Review: {user.full_name}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Col: Personal Info */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-bold mb-4 border-b pb-2">Personal Information</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 uppercase">Full Name</label>
                                <p className="font-medium">{user.full_name}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase">Username</label>
                                <p className="font-medium">@{user.username}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase">Email</label>
                                <p className="font-medium">{user.email}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase">Phone</label>
                                <p className="font-medium">{user.phone || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase">Date of Birth</label>
                                <p className="font-medium">{user.date_of_birth || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase">Occupation</label>
                                <p className="font-medium">{user.occupation || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-bold mb-4 border-b pb-2">Address & Location</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="text-xs text-gray-500 uppercase">Address</label>
                                <p className="font-medium">{user.address || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase">City</label>
                                <p className="font-medium">{user.city || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase">State</label>
                                <p className="font-medium">{user.state || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase">Country</label>
                                <p className="font-medium">{user.country || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase">Postal Code</label>
                                <p className="font-medium">{user.postal_code || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-bold mb-4 border-b pb-2">Biography & References</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 uppercase">Biography</label>
                                <p className="font-medium whitespace-pre-wrap">{user.biography || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase">Reference Details</label>
                                <p className="font-medium whitespace-pre-wrap">{user.reference_details || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Invitation Details Section */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-bold mb-4 border-b pb-2">Invitation Details</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 uppercase">Invitation Code</label>
                                <p className="font-medium text-blue-600">{user.invitation_code || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase">Invitation ID</label>
                                <p className="font-medium">{user.invitation_id ? `#${user.invitation_id}` : 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Col: Media & Actions */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-bold mb-4 border-b pb-2">Identity Verification</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 uppercase block mb-2">Uploaded Photos</label>
                                {photos.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        {photos.map(id => (
                                            <a key={id} href={`http://localhost:8000/api/upload/photo/${id}`} target="_blank" rel="noreferrer">
                                                <img
                                                    src={`http://localhost:8000/api/upload/photo/${id}`}
                                                    alt="ID"
                                                    className="w-full h-24 object-cover rounded border hover:opacity-75"
                                                />
                                            </a>
                                        ))}
                                    </div>
                                ) : <p className="text-sm text-gray-500">No photos uploaded</p>}
                            </div>

                            <div>
                                <label className="text-xs text-gray-500 uppercase block mb-2">Oath Recording</label>
                                {user.audio_oath_id ? (
                                    <audio controls className="w-full h-8">
                                        <source src={`http://localhost:8000/api/upload/audio/${user.audio_oath_id}`} type="audio/webm" />
                                        Your browser does not support audio.
                                    </audio>
                                ) : <p className="text-sm text-gray-500">No oath recording</p>}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-bold mb-4 border-b pb-2">Policies</h2>
                        <ul className="text-sm space-y-1">
                            {Object.entries(policies).map(([key, val]) => (
                                <li key={key} className="flex items-center">
                                    <span className={val ? "text-green-500 mr-2" : "text-red-500 mr-2"}>
                                        {val ? "✓" : "✗"}
                                    </span>
                                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow sticky top-6">
                        <h2 className="text-lg font-bold mb-4 border-b pb-2">Actions</h2>
                        <div className="space-y-3">
                            <button onClick={initiateApproval} className="w-full py-3 bg-green-600 text-white font-bold rounded hover:bg-green-700 transition-colors">
                                Approve Application
                            </button>
                            <button onClick={handleQuestion} className="w-full py-3 bg-yellow-500 text-white font-bold rounded hover:bg-yellow-600 transition-colors">
                                Request More Info
                            </button>
                            <button onClick={handleReject} className="w-full py-3 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition-colors">
                                Reject Application
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Onboarding Modal */}
            {showOnboarding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold border-b pb-2">
                            {onboardingStep === 'confirm' && 'Confirm Approval'}
                            {onboardingStep === 'processing' && 'Processing Onboarding...'}
                            {onboardingStep === 'success' && 'Onboarding Complete!'}
                        </h3>

                        {onboardingStep === 'confirm' && (
                            <div className="space-y-4">
                                <p className="text-gray-600">
                                    Are you sure you want to approve <b>{user.full_name}</b>?
                                    <br />
                                    This will generate a unique membership key and add them to the active members registry.
                                </p>
                                <div className="flex gap-3 justify-end">
                                    <button
                                        onClick={() => setShowOnboarding(false)}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmApproval}
                                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                    >
                                        Yes, Approve & Generate Key
                                    </button>
                                </div>
                            </div>
                        )}

                        {onboardingStep === 'processing' && (
                            <div className="flex flex-col items-center justify-center py-8 space-y-4">
                                <LoadingSpinner />
                                <p className="text-sm text-gray-500">Generating membership credentials...</p>
                            </div>
                        )}

                        {onboardingStep === 'success' && (
                            <div className="space-y-6">
                                <div className="p-4 bg-green-50 border border-green-200 rounded text-center">
                                    <div className="text-green-600 text-4xl mb-2">✓</div>
                                    <h4 className="font-bold text-green-800">Registration Approved</h4>
                                    <p className="text-sm text-green-700 mt-1">User has been successfully onboarded.</p>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold">Generated Membership Key</label>
                                    <div className="mt-1 p-3 bg-gray-100 rounded font-mono text-lg text-center tracking-widest border border-gray-300 select-all">
                                        {membershipKey}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 text-center">This key gives the member access to all system services.</p>
                                </div>

                                <button
                                    onClick={() => navigate('/admin')}
                                    className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Return to Dashboard
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
