# 🖥️ Admin Interface Updates

> **Document:** 03_ADMIN_INTERFACE_UPDATES.md  
> **Created:** 2026-01-10  
> **Priority:** 🔴 Critical

---

## 1. New Applicant Invite Form Component

### File: `admin_interface/src/pages/invitations/NewApplicantInviteForm.tsx`

```tsx
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
      const result = await apiService.interest.createAdminInvite(formData);
      toast.success(`Invitation sent! Code: ${result.invitation_code}`);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* NAMES SECTION */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Names</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Given Name *</label>
            <input
              type="text"
              value={formData.given_name}
              onChange={(e) => setFormData({...formData, given_name: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Middle Name</label>
            <input
              type="text"
              value={formData.middle_name}
              onChange={(e) => setFormData({...formData, middle_name: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Family Name *</label>
            <input
              type="text"
              value={formData.family_name}
              onChange={(e) => setFormData({...formData, family_name: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Alias (Nick/Street Name)</label>
            <input
              type="text"
              value={formData.alias}
              onChange={(e) => setFormData({...formData, alias: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* DEMOGRAPHICS SECTION */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Demographics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Gender *</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value as any})}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Marital Status *</label>
            <select
              value={formData.marital_status}
              onChange={(e) => setFormData({...formData, marital_status: e.target.value as any})}
              className="w-full px-3 py-2 border rounded-lg"
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
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Primary Email *</label>
            <input
              type="email"
              value={formData.primary_email}
              onChange={(e) => setFormData({...formData, primary_email: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Primary Phone *</label>
            <input
              type="tel"
              value={formData.primary_phone}
              onChange={(e) => setFormData({...formData, primary_phone: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
        </div>
      </div>

      {/* REFERRAL SECTION */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Referral</h3>
        <div className="flex items-center gap-4 mb-4">
          <input
            type="checkbox"
            checked={formData.has_referral}
            onChange={(e) => setFormData({...formData, has_referral: e.target.checked})}
            className="h-4 w-4"
          />
          <label>Referred by a member?</label>
        </div>
        {formData.has_referral && (
          <input
            type="text"
            placeholder="Member's Referral ID"
            value={formData.referral_member_id}
            onChange={(e) => setFormData({...formData, referral_member_id: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
          />
        )}
      </div>

      {/* INVITATION SETTINGS */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Invitation Settings</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Expires In</label>
            <select
              value={formData.expires_in_hours}
              onChange={(e) => setFormData({...formData, expires_in_hours: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value={24}>24 hours</option>
              <option value={48}>48 hours</option>
              <option value={72}>72 hours</option>
              <option value={168}>1 week</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Admin Notes</label>
            <textarea
              value={formData.admin_notes}
              onChange={(e) => setFormData({...formData, admin_notes: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              rows={2}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        {loading ? 'Creating...' : 'Create & Send Invitation'}
      </button>
    </form>
  );
};
```

---

## 2. Updated Interest Requests Page

### File: `admin_interface/src/pages/interest/InterestRequestsPage.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import { toast } from 'react-hot-toast';

interface InterestRequest {
  id: number;
  given_name: string;
  family_name: string;
  alias: string;
  primary_email: string;
  primary_phone: string;
  gender: string;
  marital_status: string;
  status: string;
  created_at: string;
  face_photo_url?: string;
  government_id_photo_url?: string;
}

export const InterestRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<InterestRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<InterestRequest | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await apiService.interest.getPending();
      setRequests(data);
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (notes: string, hours: number) => {
    if (!selectedRequest) return;
    try {
      const result = await apiService.interest.approve(selectedRequest.id, { 
        admin_notes: notes, 
        expires_in_hours: hours 
      });
      toast.success(`Approved! Code: ${result.invitation_code}, PIN: ${result.pin}`);
      setShowApproveModal(false);
      fetchRequests();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleReject = async (reason: string) => {
    if (!selectedRequest) return;
    try {
      await apiService.interest.reject(selectedRequest.id, reason);
      toast.success('Request rejected');
      setShowRejectModal(false);
      fetchRequests();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleRequestInfo = async (message: string) => {
    if (!selectedRequest) return;
    try {
      await apiService.interest.requestInfo(selectedRequest.id, message);
      toast.success('Info request sent');
      setShowInfoModal(false);
      fetchRequests();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Interest Requests</h1>
      
      <table className="w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(req => (
            <tr key={req.id}>
              <td>{req.given_name} {req.family_name}</td>
              <td>{req.primary_email}</td>
              <td>{req.primary_phone}</td>
              <td><span className="badge">{req.status}</span></td>
              <td>{new Date(req.created_at).toLocaleDateString()}</td>
              <td>
                {req.status === 'pending' && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setSelectedRequest(req); setShowApproveModal(true); }}
                      className="btn-green">Approve</button>
                    <button 
                      onClick={() => { setSelectedRequest(req); setShowRejectModal(true); }}
                      className="btn-red">Reject</button>
                    <button 
                      onClick={() => { setSelectedRequest(req); setShowInfoModal(true); }}
                      className="btn-yellow">Request Info</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modals would go here */}
    </div>
  );
};
```

---

## 3. API Service Updates

### Add to `admin_interface/src/services/apiService.ts`

```typescript
// Interest Request API
interest = {
  getPending: async (skip = 0, limit = 50): Promise<InterestRequest[]> => {
    return await this.get(`/api/interest/pending?skip=${skip}&limit=${limit}`);
  },

  getAll: async (status?: string): Promise<InterestRequest[]> => {
    const params = status ? `?status=${status}` : '';
    return await this.get(`/api/interest/all${params}`);
  },

  getStats: async (): Promise<InterestStats> => {
    return await this.get('/api/interest/stats');
  },

  approve: async (id: number, data: ApproveRequest): Promise<ApprovalResponse> => {
    return await this.post(`/api/interest/${id}/approve`, data);
  },

  reject: async (id: number, reason: string): Promise<void> => {
    return await this.post(`/api/interest/${id}/reject`, { reason });
  },

  requestInfo: async (id: number, message: string): Promise<void> => {
    return await this.post(`/api/interest/${id}/request-info`, { message });
  },

  createAdminInvite: async (data: AdminInviteCreate): Promise<InviteResponse> => {
    return await this.post('/api/interest/admin-invite', data);
  },
};
```

---

## 4. New TypeScript Interfaces

```typescript
// Add to apiService.ts

export interface InterestRequest {
  id: number;
  given_name: string;
  middle_name?: string;
  family_name: string;
  alias?: string;
  full_name: string;
  display_name: string;
  gender: string;
  marital_status: string;
  primary_email: string;
  primary_phone: string;
  additional_emails: string[];
  additional_phones: string[];
  has_referral: boolean;
  referral_member_id?: string;
  face_photo_url?: string;
  government_id_type?: string;
  government_id_photo_url?: string;
  source: string;
  status: string;
  created_at: string;
}

export interface InterestStats {
  total: number;
  pending: number;
  invited: number;
  rejected: number;
  info_requested: number;
}

export interface AdminInviteCreate {
  given_name: string;
  middle_name?: string;
  family_name: string;
  alias?: string;
  gender: string;
  marital_status: string;
  primary_email: string;
  primary_phone: string;
  has_referral?: boolean;
  referral_member_id?: string;
  admin_notes?: string;
  expires_in_hours?: number;
}
```
