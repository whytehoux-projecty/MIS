import React, { useEffect, useState } from 'react';
import { apiService, Invitation, CreateInvitationRequest } from '../../services/apiService';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export const InvitationsPage: React.FC = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [includeUsed, setIncludeUsed] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateInvitationRequest>({
    intended_for: '',
    notes: '',
    expires_in_hours: 72,
  });

  useEffect(() => {
    fetchInvitations();
  }, [includeUsed]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const data = await apiService.invitations.list(includeUsed);
      setInvitations(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error('Failed to load invitations: ' + (error.message || 'Unknown error'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      setCreateLoading(true);
      const newInvitation = await apiService.invitations.create(formData);
      toast.success('Invitation created successfully!');
      setInvitations(prev => [newInvitation, ...prev]);
      setShowCreateModal(false);
      setFormData({ intended_for: '', notes: '', expires_in_hours: 72 });
    } catch (error: any) {
      toast.error('Failed to create invitation: ' + (error.message || 'Unknown error'));
      console.error(error);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = async (invitationId: number) => {
    if (!window.confirm('Are you sure you want to delete this invitation?')) return;

    try {
      await apiService.invitations.delete(invitationId);
      toast.success('Invitation deleted');
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    } catch (error: any) {
      toast.error('Failed to delete invitation: ' + (error.message || 'Unknown error'));
      console.error(error);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invitation Codes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage invitation codes for new member registration
          </p>
        </div>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={includeUsed}
              onChange={(e) => setIncludeUsed(e.target.checked)}
              className="form-checkbox h-4 w-4 text-blue-600"
            />
            <span className="text-gray-600 dark:text-gray-300">Show used</span>
          </label>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg"
          >
            + Create Invitation
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600">{invitations.filter(i => !i.is_used).length}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Active Invitations</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600">{invitations.filter(i => i.is_used).length}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Used Invitations</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-orange-600">
            {invitations.filter(i => !i.is_used && isExpired(i.expires_at)).length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Expired</div>
        </div>
      </div>

      {/* Invitations Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PIN</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intended For</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {invitations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <p className="text-lg font-medium">No invitations found</p>
                    <p className="text-sm">Create your first invitation code to get started.</p>
                  </td>
                </tr>
              ) : (
                invitations.map((invitation) => (
                  <tr key={invitation.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded font-mono text-sm font-bold">
                          {invitation.code}
                        </code>
                        <button
                          onClick={() => copyToClipboard(invitation.code, 'Code')}
                          className="text-gray-400 hover:text-blue-600 text-xs"
                          title="Copy code"
                        >
                          📋
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded font-mono text-sm font-bold">
                          {invitation.pin}
                        </code>
                        <button
                          onClick={() => copyToClipboard(invitation.pin, 'PIN')}
                          className="text-gray-400 hover:text-blue-600 text-xs"
                          title="Copy PIN"
                        >
                          📋
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {invitation.intended_for || <span className="text-gray-400">Anyone</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {invitation.is_used ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Used by {invitation.used_by}
                        </span>
                      ) : isExpired(invitation.expires_at) ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          Expired
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invitation.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invitation.expires_at ? formatDate(invitation.expires_at) : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {!invitation.is_used && (
                        <button
                          onClick={() => handleDelete(invitation.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create New Invitation</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Intended For (optional)
                </label>
                <input
                  type="email"
                  value={formData.intended_for}
                  onChange={(e) => setFormData(prev => ({ ...prev, intended_for: e.target.value }))}
                  placeholder="recipient@example.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Internal notes about this invitation..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expires In (hours)
                </label>
                <select
                  value={formData.expires_in_hours}
                  onChange={(e) => setFormData(prev => ({ ...prev, expires_in_hours: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  aria-label="Select expiration time"
                >
                  <option value={24}>24 hours</option>
                  <option value={48}>48 hours</option>
                  <option value={72}>72 hours (Default)</option>
                  <option value={168}>1 week</option>
                  <option value={720}>30 days</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={createLoading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
              >
                {createLoading ? 'Creating...' : 'Create Invitation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvitationsPage;