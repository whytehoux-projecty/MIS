import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { apiService } from '../../services/apiService';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
export const MembersPage = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchMembers();
    }, []);
    const fetchMembers = async () => {
        try {
            setLoading(true);
            const data = await apiService.admin.getAllUsers();
            setMembers(Array.isArray(data) ? data : []);
        }
        catch (error) {
            toast.error('Failed to load members');
            console.error(error);
        }
        finally {
            setLoading(false);
        }
    };
    if (loading) {
        return (_jsx("div", { className: "p-6 flex justify-center", children: _jsx(LoadingSpinner, {}) }));
    }
    return (_jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsxs("h1", { className: "text-2xl font-bold", children: ["Active Members (", members.length, ")"] }), _jsx("button", { onClick: fetchMembers, className: "px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md", children: "Refresh" })] }), _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200 dark:divide-gray-700", children: [_jsx("thead", { className: "bg-gray-50 dark:bg-gray-900", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Username" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Full Name" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Email" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Joined" })] }) }), _jsx("tbody", { className: "bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700", children: members.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "px-6 py-4 text-center text-sm text-gray-500", children: "No members found." }) })) : (members.map((member) => (_jsxs("tr", { className: "hover:bg-gray-50 dark:hover:bg-gray-750", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium", children: member.username }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm", children: member.full_name }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: member.email }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("span", { className: `px-2 py-1 rounded-full text-xs font-semibold ${member.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'}`, children: member.is_active ? 'Active' : 'Inactive' }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: member.created_at
                                                ? new Date(member.created_at).toLocaleDateString()
                                                : '-' })] }, member.id)))) })] }) }) })] }));
};
