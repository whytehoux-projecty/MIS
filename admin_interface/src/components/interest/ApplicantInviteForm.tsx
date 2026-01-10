import React, { useState } from 'react';
import { apiService } from '../../services/apiService';
import { Gender, MaritalStatus, AdminInviteCreate } from '../../types/interest';

interface ApplicantInviteFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export const ApplicantInviteForm: React.FC<ApplicantInviteFormProps> = ({ onSuccess, onCancel }) => {
    const [formData, setFormData] = useState<AdminInviteCreate>({
        given_name: '',
        family_name: '',
        primary_email: '',
        primary_phone: '',
        gender: Gender.MALE,
        marital_status: MaritalStatus.SINGLE_NO_RELATIONSHIP,
        expires_in_hours: 24
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [files, setFiles] = useState<{ face?: File, id?: File }>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: AdminInviteCreate) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'face' | 'id') => {
        if (e.target.files && e.target.files[0]) {
            setFiles((prev: { face?: File, id?: File }) => ({ ...prev, [type]: e.target.files![0] }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let facePhotoId = formData.face_photo_id as string | undefined;
            let idPhotoId = formData.government_id_photo_id as string | undefined;

            // Upload files if present
            if (files.face) {
                const fd = new FormData();
                fd.append('file', files.face);
                const res = await apiService.upload.photo(fd);
                if (!res.success) throw new Error('Failed to upload face photo');
                facePhotoId = res.file_id;
            }

            if (files.id) {
                const fd = new FormData();
                fd.append('file', files.id);
                const res = await apiService.upload.photo(fd);
                if (!res.success) throw new Error('Failed to upload ID card');
                idPhotoId = res.file_id;
            }

            const dataToSubmit: AdminInviteCreate = {
                ...formData,
                face_photo_id: facePhotoId,
                government_id_photo_id: idPhotoId
            };

            await apiService.interest.createAdminInvite(dataToSubmit);
            onSuccess();
        } catch (err: any) {
            setError(err.message || err.response?.data?.detail || 'Failed to create invitation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-2xl w-full mx-auto">
            <h2 className="text-xl font-bold mb-4 dark:text-white">New Applicant Invitation</h2>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="given_name" className="block text-sm font-medium dark:text-gray-300">Given Name *</label>
                        <input id="given_name" name="given_name" value={formData.given_name} onChange={handleChange} required
                            placeholder="Enter given name"
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                    <div>
                        <label htmlFor="family_name" className="block text-sm font-medium dark:text-gray-300">Family Name *</label>
                        <input id="family_name" name="family_name" value={formData.family_name} onChange={handleChange} required
                            placeholder="Enter family name"
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                    <div>
                        <label htmlFor="middle_name" className="block text-sm font-medium dark:text-gray-300">Middle Name</label>
                        <input id="middle_name" name="middle_name" value={formData.middle_name || ''} onChange={handleChange}
                            placeholder="Enter middle name"
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                    <div>
                        <label htmlFor="alias" className="block text-sm font-medium dark:text-gray-300">Alias</label>
                        <input id="alias" name="alias" value={formData.alias || ''} onChange={handleChange}
                            placeholder="Enter alias"
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="gender" className="block text-sm font-medium dark:text-gray-300">Gender *</label>
                        <select id="gender" name="gender" value={formData.gender} onChange={handleChange} required
                            aria-label="Select gender"
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="marital_status" className="block text-sm font-medium dark:text-gray-300">Marital Status *</label>
                        <select id="marital_status" name="marital_status" value={formData.marital_status} onChange={handleChange} required
                            aria-label="Select marital status"
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            {Object.values(MaritalStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="primary_email" className="block text-sm font-medium dark:text-gray-300">Primary Email *</label>
                        <input id="primary_email" type="email" name="primary_email" value={formData.primary_email} onChange={handleChange} required
                            placeholder="Enter primary email"
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                    <div>
                        <label htmlFor="primary_phone" className="block text-sm font-medium dark:text-gray-300">Primary Phone *</label>
                        <input id="primary_phone" name="primary_phone" value={formData.primary_phone} onChange={handleChange} required
                            placeholder="Enter primary phone"
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="face_photo" className="block text-sm font-medium dark:text-gray-300">Face Photo</label>
                        <input id="face_photo" type="file" accept="image/*" onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'face')}
                            placeholder="Upload face photo"
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                    <div>
                        <label htmlFor="gov_id" className="block text-sm font-medium dark:text-gray-300">Gov ID (Image)</label>
                        <input id="gov_id" type="file" accept="image/*" onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'id')}
                            placeholder="Upload government ID"
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                </div>

                <div>
                    <label htmlFor="referral_member_id" className="block text-sm font-medium dark:text-gray-300">Referral Member ID</label>
                    <input id="referral_member_id" name="referral_member_id" value={formData.referral_member_id || ''} onChange={handleChange}
                        placeholder="Enter referral member ID"
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>

                <div>
                    <label htmlFor="admin_notes" className="block text-sm font-medium dark:text-gray-300">Admin Notes (Internal)</label>
                    <textarea id="admin_notes" name="admin_notes" value={formData.admin_notes || ''} onChange={handleChange}
                        placeholder="Enter internal notes"
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                    <button type="button" onClick={onCancel} disabled={loading}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                        {loading ? 'Creating...' : 'Create & Invite'}
                    </button>
                </div>
            </form>
        </div>
    );
};
