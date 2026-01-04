import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { apiService } from '../../services/apiService';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
export const AnalyticsPage = () => {
    const [loginHistory, setLoginHistory] = useState([]);
    const [users, setUsers] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterUserId, setFilterUserId] = useState('');
    const [filterServiceId, setFilterServiceId] = useState('');
    useEffect(() => {
        fetchAnalyticsData();
    }, []);
    const fetchAnalyticsData = async () => {
        try {
            setLoading(true);
            const [historyRes, usersRes, servicesRes] = await Promise.all([
                apiService.admin.getLoginHistory({ limit: 100 }),
                apiService.admin.getAllUsers(),
                apiService.services.list(true),
            ]);
            setLoginHistory(Array.isArray(historyRes) ? historyRes : []);
            setUsers(Array.isArray(usersRes) ? usersRes : []);
            setServices(Array.isArray(servicesRes) ? servicesRes : []);
        }
        catch (error) {
            toast.error('Failed to load analytics: ' + (error.message || 'Unknown error'));
            console.error(error);
        }
        finally {
            setLoading(false);
        }
    };
    const applyFilters = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filterUserId)
                params.user_id = parseInt(filterUserId);
            if (filterServiceId)
                params.service_id = parseInt(filterServiceId);
            const historyRes = await apiService.admin.getLoginHistory(params);
            setLoginHistory(Array.isArray(historyRes) ? historyRes : []);
        }
        catch (error) {
            toast.error('Failed to filter: ' + error.message);
        }
        finally {
            setLoading(false);
        }
    };
    const clearFilters = () => {
        setFilterUserId('');
        setFilterServiceId('');
        fetchAnalyticsData();
    };
    const getUserName = (userId) => {
        const user = users.find(u => u.id === userId);
        return user ? user.username : `User #${userId}`;
    };
    const getServiceName = (serviceId) => {
        const service = services.find(s => s.id === serviceId);
        return service ? service.service_name : `Service #${serviceId}`;
    };
    const formatDateTime = (dateStr) => {
        return new Date(dateStr).toLocaleString();
    };
    // Calculate stats
    const totalLogins = loginHistory.length;
    const activeSessionsCount = loginHistory.filter(l => !l.logout_at).length;
    const uniqueUsers = new Set(loginHistory.map(l => l.user_id)).size;
    const uniqueServices = new Set(loginHistory.map(l => l.service_id)).size;
    if (loading) {
        return (_jsx("div", { className: "p-6 flex justify-center items-center min-h-[400px]", children: _jsx(LoadingSpinner, { size: "large" }) }));
    }
    return (_jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Analytics Dashboard" }), _jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Login history and usage statistics" })] }), _jsx("button", { onClick: fetchAnalyticsData, className: "px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600", children: "\uD83D\uDD04 Refresh" })] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700", children: [_jsx("div", { className: "text-3xl font-bold text-blue-600", children: totalLogins }), _jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Total Logins" })] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700", children: [_jsx("div", { className: "text-3xl font-bold text-green-600", children: activeSessionsCount }), _jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Active Sessions" })] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700", children: [_jsx("div", { className: "text-3xl font-bold text-purple-600", children: uniqueUsers }), _jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Unique Users" })] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700", children: [_jsx("div", { className: "text-3xl font-bold text-orange-600", children: uniqueServices }), _jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Services Used" })] })] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700", children: [_jsx("h3", { className: "text-sm font-medium text-gray-700 dark:text-gray-300 mb-3", children: "Filter Results" }), _jsxs("div", { className: "flex flex-wrap gap-4 items-end", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs text-gray-500 mb-1", children: "User" }), _jsxs("select", { value: filterUserId, onChange: (e) => setFilterUserId(e.target.value), className: "px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm", "aria-label": "Filter by user", children: [_jsx("option", { value: "", children: "All Users" }), users.map(user => (_jsx("option", { value: user.id, children: user.username }, user.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs text-gray-500 mb-1", children: "Service" }), _jsxs("select", { value: filterServiceId, onChange: (e) => setFilterServiceId(e.target.value), className: "px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm", "aria-label": "Filter by service", children: [_jsx("option", { value: "", children: "All Services" }), services.map(service => (_jsx("option", { value: service.id, children: service.service_name }, service.id)))] })] }), _jsx("button", { onClick: applyFilters, className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm", children: "Apply Filters" }), _jsx("button", { onClick: clearFilters, className: "px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm", children: "Clear" })] })] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden", children: [_jsx("div", { className: "p-4 border-b border-gray-200 dark:border-gray-700", children: _jsx("h2", { className: "text-lg font-bold text-gray-900 dark:text-white", children: "Login History" }) }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200 dark:divide-gray-700", children: [_jsx("thead", { className: "bg-gray-50 dark:bg-gray-900", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "User" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Service" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Login Time" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Logout Time" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Session Expires" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Status" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200 dark:divide-gray-700", children: loginHistory.length === 0 ? (_jsx("tr", { children: _jsxs("td", { colSpan: 6, className: "px-4 py-12 text-center text-gray-500", children: [_jsx("p", { className: "text-lg font-medium", children: "No login history found" }), _jsx("p", { className: "text-sm", children: "Login activity will appear here once users start logging in." })] }) })) : (loginHistory.map((entry) => (_jsxs("tr", { className: "hover:bg-gray-50 dark:hover:bg-gray-750", children: [_jsxs("td", { className: "px-4 py-3 text-sm", children: [_jsx("div", { className: "font-medium", children: getUserName(entry.user_id) }), _jsxs("div", { className: "text-xs text-gray-400", children: ["ID: ", entry.user_id] })] }), _jsxs("td", { className: "px-4 py-3 text-sm", children: [_jsx("div", { className: "font-medium", children: getServiceName(entry.service_id) }), _jsxs("div", { className: "text-xs text-gray-400", children: ["ID: ", entry.service_id] })] }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-600 dark:text-gray-300", children: formatDateTime(entry.login_at) }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-600 dark:text-gray-300", children: entry.logout_at ? formatDateTime(entry.logout_at) : '-' }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-600 dark:text-gray-300", children: formatDateTime(entry.session_expires_at) }), _jsx("td", { className: "px-4 py-3", children: _jsx("span", { className: `px-2 py-1 text-xs rounded-full font-semibold ${entry.logout_at
                                                        ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                                        : new Date(entry.session_expires_at) > new Date()
                                                            ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200'
                                                            : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200'}`, children: entry.logout_at
                                                        ? 'Logged Out'
                                                        : new Date(entry.session_expires_at) > new Date()
                                                            ? 'Active'
                                                            : 'Expired' }) })] }, entry.id)))) })] }) })] })] }));
};
export default AnalyticsPage;
