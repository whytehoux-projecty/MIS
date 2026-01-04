import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { apiService } from '../../services/apiService';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
export const InvitationsPage = () => {
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [includeUsed, setIncludeUsed] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    // Form state
    const [formData, setFormData] = useState({
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
        }
        catch (error) {
            toast.error('Failed to load invitations: ' + (error.message || 'Unknown error'));
            console.error(error);
        }
        finally {
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
        }
        catch (error) {
            toast.error('Failed to create invitation: ' + (error.message || 'Unknown error'));
            console.error(error);
        }
        finally {
            setCreateLoading(false);
        }
    };
    const handleDelete = async (invitationId) => {
        if (!window.confirm('Are you sure you want to delete this invitation?'))
            return;
        try {
            await apiService.invitations.delete(invitationId);
            toast.success('Invitation deleted');
            setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
        }
        catch (error) {
            toast.error('Failed to delete invitation: ' + (error.message || 'Unknown error'));
            console.error(error);
        }
    };
    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard!`);
    };
    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleString();
    };
    const isExpired = (expiresAt) => {
        if (!expiresAt)
            return false;
        return new Date(expiresAt) < new Date();
    };
    if (loading) {
        return (_jsx("div", { className: "p-6 flex justify-center items-center min-h-[400px]", children: _jsx(LoadingSpinner, { size: "large" }) }));
    }
    return (_jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Invitation Codes" }), _jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Manage invitation codes for new member registration" })] }), _jsxs("div", { className: "flex gap-3", children: [_jsxs("label", { className: "flex items-center gap-2 text-sm", children: [_jsx("input", { type: "checkbox", checked: includeUsed, onChange: (e) => setIncludeUsed(e.target.checked), className: "form-checkbox h-4 w-4 text-blue-600" }), _jsx("span", { className: "text-gray-600 dark:text-gray-300", children: "Show used" })] }), _jsx("button", { onClick: () => setShowCreateModal(true), className: "px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg", children: "+ Create Invitation" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: invitations.filter(i => !i.is_used).length }), _jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Active Invitations" })] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: invitations.filter(i => i.is_used).length }), _jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Used Invitations" })] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700", children: [_jsx("div", { className: "text-2xl font-bold text-orange-600", children: invitations.filter(i => !i.is_used && isExpired(i.expires_at)).length }), _jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Expired" })] })] }), _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200 dark:divide-gray-700", children: [_jsx("thead", { className: "bg-gray-50 dark:bg-gray-900", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Code" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "PIN" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Intended For" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Created" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Expires" }), _jsx("th", { className: "px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actions" })] }) }), _jsx("tbody", { className: "bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700", children: invitations.length === 0 ? (_jsx("tr", { children: _jsxs("td", { colSpan: 7, className: "px-6 py-12 text-center text-gray-500", children: [_jsx("p", { className: "text-lg font-medium", children: "No invitations found" }), _jsx("p", { className: "text-sm", children: "Create your first invitation code to get started." })] }) })) : (invitations.map((invitation) => (_jsxs("tr", { className: "hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("code", { className: "px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded font-mono text-sm font-bold", children: invitation.code }), _jsx("button", { onClick: () => copyToClipboard(invitation.code, 'Code'), className: "text-gray-400 hover:text-blue-600 text-xs", title: "Copy code", children: "\uD83D\uDCCB" })] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("code", { className: "px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded font-mono text-sm font-bold", children: invitation.pin }), _jsx("button", { onClick: () => copyToClipboard(invitation.pin, 'PIN'), className: "text-gray-400 hover:text-blue-600 text-xs", title: "Copy PIN", children: "\uD83D\uDCCB" })] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300", children: invitation.intended_for || _jsx("span", { className: "text-gray-400", children: "Anyone" }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: invitation.is_used ? (_jsxs("span", { className: "px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", children: ["Used by ", invitation.used_by] })) : isExpired(invitation.expires_at) ? (_jsx("span", { className: "px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", children: "Expired" })) : (_jsx("span", { className: "px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", children: "Active" })) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: formatDate(invitation.created_at) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: invitation.expires_at ? formatDate(invitation.expires_at) : 'Never' }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: !invitation.is_used && (_jsx("button", { onClick: () => handleDelete(invitation.id), className: "px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs", children: "Delete" })) })] }, invitation.id)))) })] }) }) }), showCreateModal && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 dark:text-white mb-4", children: "Create New Invitation" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Intended For (optional)" }), _jsx("input", { type: "email", value: formData.intended_for, onChange: (e) => setFormData(prev => ({ ...prev, intended_for: e.target.value })), placeholder: "recipient@example.com", className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Notes (optional)" }), _jsx("textarea", { value: formData.notes, onChange: (e) => setFormData(prev => ({ ...prev, notes: e.target.value })), placeholder: "Internal notes about this invitation...", rows: 2, className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Expires In (hours)" }), _jsxs("select", { value: formData.expires_in_hours, onChange: (e) => setFormData(prev => ({ ...prev, expires_in_hours: parseInt(e.target.value) })), className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white", "aria-label": "Select expiration time", children: [_jsx("option", { value: 24, children: "24 hours" }), _jsx("option", { value: 48, children: "48 hours" }), _jsx("option", { value: 72, children: "72 hours (Default)" }), _jsx("option", { value: 168, children: "1 week" }), _jsx("option", { value: 720, children: "30 days" })] })] })] }), _jsxs("div", { className: "flex gap-3 mt-6", children: [_jsx("button", { onClick: () => setShowCreateModal(false), className: "flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700", children: "Cancel" }), _jsx("button", { onClick: handleCreate, disabled: createLoading, className: "flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50", children: createLoading ? 'Creating...' : 'Create Invitation' })] })] }) }))] }));
};
export default InvitationsPage;
