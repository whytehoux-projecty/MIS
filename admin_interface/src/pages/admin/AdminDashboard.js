import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/apiService';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';
import './AdminDashboard.css';
export const AdminDashboard = () => {
    const [systemStatus, setSystemStatus] = useState(null);
    const [operatingHours, setOperatingHours] = useState(null);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [activeUsers, setActiveUsers] = useState([]);
    const [loginHistory, setLoginHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        fetchDashboardData();
    }, []);
    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch system status
            const [statusRes, hoursRes] = await Promise.all([
                apiService.system.getStatus().catch(() => null),
                apiService.system.getOperatingHours().catch(() => null),
            ]);
            setSystemStatus(statusRes);
            setOperatingHours(hoursRes);
            // Fetch user data
            const [pending, active, history] = await Promise.all([
                apiService.admin.getPendingUsers().catch(() => []),
                apiService.admin.getAllUsers().catch(() => []),
                apiService.admin.getLoginHistory({ limit: 10 }).catch(() => []),
            ]);
            setPendingUsers(Array.isArray(pending) ? pending : []);
            setActiveUsers(Array.isArray(active) ? active : []);
            setLoginHistory(Array.isArray(history) ? history : []);
        }
        catch (err) {
            setError(err.message || 'Failed to fetch dashboard data');
            toast.error('Failed to load dashboard data');
        }
        finally {
            setLoading(false);
        }
    };
    const handleApprove = async (userId) => {
        if (!window.confirm('Approve this user?'))
            return;
        try {
            await apiService.admin.approveUser(userId, 'Approved via dashboard');
            toast.success('User approved!');
            setPendingUsers(prev => prev.filter(u => u.id !== userId));
            fetchDashboardData();
        }
        catch (err) {
            toast.error('Failed to approve: ' + err.message);
        }
    };
    const handleReject = async (userId) => {
        const reason = prompt('Rejection reason:');
        if (!reason)
            return;
        try {
            await apiService.admin.rejectUser(userId, reason);
            toast.success('User rejected');
            setPendingUsers(prev => prev.filter(u => u.id !== userId));
        }
        catch (err) {
            toast.error('Failed to reject: ' + err.message);
        }
    };
    if (loading) {
        return (_jsxs("div", { className: "p-6 flex flex-col items-center justify-center min-h-[400px]", children: [_jsx(LoadingSpinner, { size: "large" }), _jsx("p", { className: "mt-4 text-gray-500 dark:text-gray-400", children: "Loading dashboard..." })] }));
    }
    if (error) {
        return (_jsxs("div", { className: "p-6 text-center", children: [_jsx("p", { className: "text-red-600 dark:text-red-400 text-lg", children: error }), _jsx("button", { onClick: fetchDashboardData, className: "mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700", children: "Retry" })] }));
    }
    return (_jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 dark:text-white", children: "Admin Dashboard" }), _jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Central Authentication System Overview" })] }), _jsx("button", { onClick: fetchDashboardData, className: "px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm", children: "\uD83D\uDD04 Refresh" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: [_jsxs("div", { className: `p-5 rounded-xl shadow-lg border-2 ${systemStatus?.status === 'open'
                            ? 'bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border-green-500'
                            : 'bg-gradient-to-br from-red-50 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 border-red-500'}`, children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx("span", { className: `w-4 h-4 rounded-full animate-pulse ${systemStatus?.status === 'open' ? 'bg-green-500' : 'bg-red-500'}` }), _jsx("h3", { className: "text-lg font-bold text-gray-800 dark:text-white", children: "System Status" })] }), _jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-white capitalize", children: systemStatus?.status || 'Unknown' }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300 mt-1", children: systemStatus?.message || 'Status unavailable' })] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700", children: [_jsx("h3", { className: "text-lg font-bold text-gray-800 dark:text-white mb-2", children: "\u23F0 Operating Hours" }), operatingHours ? (_jsxs("div", { className: "space-y-2", children: [_jsxs("p", { className: "text-lg", children: [_jsx("span", { className: "font-semibold", children: operatingHours.opening_time }), _jsx("span", { className: "text-gray-500 mx-2", children: "to" }), _jsx("span", { className: "font-semibold", children: operatingHours.closing_time })] }), _jsxs("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: ["Timezone: ", operatingHours.timezone] }), _jsx("p", { className: "text-sm", children: _jsx("span", { className: operatingHours.currently_open ? 'text-green-600' : 'text-red-600', children: operatingHours.currently_open ? '● Currently Open' : '● Currently Closed' }) })] })) : (_jsx("p", { className: "text-gray-500", children: "Operating hours unavailable" }))] })] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs(Link, { to: "/invitations", className: "bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow", children: [_jsx("div", { className: "text-3xl font-bold text-orange-600", children: pendingUsers.length }), _jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Pending Approvals" })] }), _jsxs(Link, { to: "/members", className: "bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow", children: [_jsx("div", { className: "text-3xl font-bold text-green-600", children: activeUsers.length }), _jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Active Users" })] }), _jsxs(Link, { to: "/invitations", className: "bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow", children: [_jsx("div", { className: "text-3xl font-bold text-blue-600", children: "-" }), _jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Active Invitations" })] }), _jsxs(Link, { to: "/analytics", className: "bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow", children: [_jsx("div", { className: "text-3xl font-bold text-purple-600", children: loginHistory.length }), _jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Recent Logins" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs(Link, { to: "/invitations", className: "p-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-4", children: [_jsx("span", { className: "text-3xl", children: "\uD83D\uDCE7" }), _jsxs("div", { children: [_jsx("div", { className: "font-bold", children: "Manage Invitations" }), _jsx("div", { className: "text-sm opacity-80", children: "Create and manage invitation codes" })] })] }), _jsxs(Link, { to: "/services", className: "p-5 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-4", children: [_jsx("span", { className: "text-3xl", children: "\uD83D\uDD17" }), _jsxs("div", { children: [_jsx("div", { className: "font-bold", children: "Connected Services" }), _jsx("div", { className: "text-sm opacity-80", children: "Manage third-party applications" })] })] }), _jsxs(Link, { to: "/analytics", className: "p-5 bg-gradient-to-r from-orange-600 to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-4", children: [_jsx("span", { className: "text-3xl", children: "\uD83D\uDCCA" }), _jsxs("div", { children: [_jsx("div", { className: "font-bold", children: "Analytics" }), _jsx("div", { className: "text-sm opacity-80", children: "View login history and stats" })] })] })] }), pendingUsers.length > 0 && (_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden", children: [_jsxs("div", { className: "p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center", children: [_jsxs("h2", { className: "text-xl font-bold text-gray-900 dark:text-white", children: ["\u23F3 Pending Approvals (", pendingUsers.length, ")"] }), _jsx(Link, { to: "/invitations", className: "text-blue-600 hover:underline text-sm", children: "View All \u2192" })] }), _jsx("div", { className: "divide-y divide-gray-200 dark:divide-gray-700", children: pendingUsers.slice(0, 5).map((user) => (_jsxs("div", { className: "p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-750", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900 dark:text-white", children: user.full_name }), _jsxs("div", { className: "text-sm text-gray-500", children: ["@", user.username, " \u00B7 ", user.email] }), _jsxs("div", { className: "text-xs text-gray-400", children: ["Applied: ", new Date(user.created_at).toLocaleDateString()] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => handleApprove(user.id), className: "px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700", children: "Approve" }), _jsx("button", { onClick: () => handleReject(user.id), className: "px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700", children: "Reject" })] })] }, user.id))) })] })), loginHistory.length > 0 && (_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden", children: [_jsxs("div", { className: "p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 dark:text-white", children: "\uD83D\uDCCB Recent Login Activity" }), _jsx(Link, { to: "/analytics", className: "text-blue-600 hover:underline text-sm", children: "View All \u2192" })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200 dark:divide-gray-700", children: [_jsx("thead", { className: "bg-gray-50 dark:bg-gray-900", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "User ID" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Service ID" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Login Time" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Status" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200 dark:divide-gray-700", children: loginHistory.slice(0, 5).map((entry) => (_jsxs("tr", { className: "hover:bg-gray-50 dark:hover:bg-gray-750", children: [_jsx("td", { className: "px-4 py-3 text-sm", children: entry.user_id }), _jsx("td", { className: "px-4 py-3 text-sm", children: entry.service_id }), _jsx("td", { className: "px-4 py-3 text-sm", children: new Date(entry.login_at).toLocaleString() }), _jsx("td", { className: "px-4 py-3", children: _jsx("span", { className: `px-2 py-1 text-xs rounded-full ${entry.logout_at
                                                        ? 'bg-gray-100 text-gray-600'
                                                        : 'bg-green-100 text-green-600'}`, children: entry.logout_at ? 'Logged Out' : 'Active' }) })] }, entry.id))) })] }) })] }))] }));
};
export default AdminDashboard;
