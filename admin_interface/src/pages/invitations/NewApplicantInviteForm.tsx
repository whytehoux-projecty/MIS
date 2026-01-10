import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { apiService } from '../../services/apiService';

interface FormData {
    given_name: string;
    middle_name: string;
    family_name: string;
    alias: string;
    gender: 'male' | 'female' | '';
    marital_status: 'married' | 'single_no_relationship' | 'single_in_relationship' | '';
    primary_email: string;
    additional_emails: string[];
    primary_phone: string;
    additional_phones: string[];
    has_referral: boolean;
    referral_member_id: string;
    face_photo_id: string;
    government_id_type: string;
    government_id_photo_id: string;
    admin_notes: string;
    expires_in_hours: number;
}

export const NewApplicantInviteForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        given_name: '',
        middle_name: '',
        family_name: '',
        alias: '',
        gender: '',
        marital_status: '',
        primary_email: '',
        additional_emails: [],
        primary_phone: '',
        additional_phones: [],
        has_referral: false,
        referral_member_id: '',
        face_photo_id: '',
        government_id_type: '',
        government_id_photo_id: '',
        admin_notes: '',
        expires_in_hours: 24,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.given_name || !formData.family_name || !formData.primary_email) {
            toast.error('Please fill required fields');
            return;
        }

        setLoading(true);
        try {
            // Need to cast gender and marital_status to enum or specific string type expected by API if strict
            const result = await apiService.interest.createAdminInvite(formData as any);
            toast.success(`Invitation sent! Code: ${result.invitation_code}`);
            onSuccess();
        } catch (error: any) {
            toast.error(error.message || 'Failed to create invitation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto p-2">
            {/* NAMES SECTION */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">Names</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="given_name" className="block text-sm font-medium mb-1 dark:text-gray-200">Given Name *</label>
                        <input
                            id="given_name"
                            type="text"
                            value={formData.given_name}
                            onChange={(e) => setFormData({ ...formData, given_name: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:text-white"
                            placeholder="Enter given name"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="middle_name" className="block text-sm font-medium mb-1 dark:text-gray-200">Middle Name</label>
                        <input
                            id="middle_name"
                            type="text"
                            value={formData.middle_name}
                            onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:text-white"
                            placeholder="Enter middle name"
                        />
                    </div>
                    <div>
                        <label htmlFor="family_name" className="block text-sm font-medium mb-1 dark:text-gray-200">Family Name *</label>
                        <input
                            id="family_name"
                            type="text"
                            value={formData.family_name}
                            onChange={(e) => setFormData({ ...formData, family_name: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:text-white"
                            placeholder="Enter family name"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="alias" className="block text-sm font-medium mb-1 dark:text-gray-200">Alias (Nick/Street Name)</label>
                        <input
                            id="alias"
                            type="text"
                            value={formData.alias}
                            onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:text-white"
                            placeholder="Enter alias"
                        />
                    </div>
                </div>
            </div>

            {/* DEMOGRAPHICS SECTION */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">Demographics</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="gender" className="block text-sm font-medium mb-1 dark:text-gray-200">Gender *</label>
                        <select
                            id="gender"
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:text-white"
                            aria-label="Select gender"
                            required
                        >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="marital_status" className="block text-sm font-medium mb-1 dark:text-gray-200">Marital Status *</label>
                        <select
                            id="marital_status"
                            value={formData.marital_status}
                            onChange={(e) => setFormData({ ...formData, marital_status: e.target.value as any })}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:text-white"
                            aria-label="Select marital status"
                            required
                        >
                            <option value="">Select Status</option>
                            <option value="married">Married</option>
                            <option value="single_no_relationship">Single (No Relationship)</option>
                            <option value="single_in_relationship">Single (In a Relationship)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* CONTACT SECTION */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="primary_email" className="block text-sm font-medium mb-1 dark:text-gray-200">Primary Email *</label>
                        <input
                            id="primary_email"
                            type="email"
                            value={formData.primary_email}
                            onChange={(e) => setFormData({ ...formData, primary_email: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:text-white"
                            placeholder="email@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="primary_phone" className="block text-sm font-medium mb-1 dark:text-gray-200">Primary Phone *</label>
                        <input
                            id="primary_phone"
                            type="tel"
                            value={formData.primary_phone}
                            onChange={(e) => setFormData({ ...formData, primary_phone: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:text-white"
                            placeholder="+234 XXX XXX XXXX"
                            required
                        />
                    </div>
                </div>
            </div>

            {/* REFERRAL SECTION */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">Referral</h3>
                <div className="flex items-center gap-4 mb-4 dark:text-gray-200">
                    <input
                        id="has_referral"
                        type="checkbox"
                        checked={formData.has_referral}
                        onChange={(e) => setFormData({ ...formData, has_referral: e.target.checked })}
                        className="h-4 w-4 rounded dark:bg-gray-600"
                    />
                    <label htmlFor="has_referral">Referred by a member?</label>
                </div>
                {formData.has_referral && (
                    <div>
                        <label htmlFor="referral_member_id" className="sr-only">Member's Referral ID</label>
                        <input
                            id="referral_member_id"
                            type="text"
                            placeholder="Member's Referral ID"
                            value={formData.referral_member_id}
                            onChange={(e) => setFormData({ ...formData, referral_member_id: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:text-white"
                        />
                    </div>
                )}
            </div>

            {/* INVITATION SETTINGS */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">Invitation Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="expires_in_hours" className="block text-sm font-medium mb-1 dark:text-gray-200">Expires In</label>
                        <select
                            id="expires_in_hours"
                            value={formData.expires_in_hours}
                            onChange={(e) => setFormData({ ...formData, expires_in_hours: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:text-white"
                            aria-label="Select expiration time"
                        >
                            <option value={24}>24 hours</option>
                            <option value={48}>48 hours</option>
                            <option value={72}>72 hours</option>
                            <option value={168}>1 week</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="admin_notes" className="block text-sm font-medium mb-1 dark:text-gray-200">Admin Notes</label>
                        <textarea
                            id="admin_notes"
                            value={formData.admin_notes}
                            onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:text-white"
                            placeholder="Internal notes about this invitation"
                            rows={2}
                        />
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
            >
                {loading ? 'Creating...' : 'Create & Send Invitation'}
            </button>
        </form>
    );
};
