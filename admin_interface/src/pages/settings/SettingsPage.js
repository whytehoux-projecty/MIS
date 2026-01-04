import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { Activity, Shield, Bell, Palette, Database } from 'lucide-react';
const SettingsCard = ({ title, description, icon, href, badge }) => (_jsx(Link, { to: href, className: "block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 transition-all group", children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors", children: icon }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors", children: title }), badge && (_jsx("span", { className: "px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full", children: badge }))] }), _jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400 mt-1", children: description })] }), _jsx("div", { className: "text-gray-400 group-hover:text-blue-500 transition-colors", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z", clipRule: "evenodd" }) }) })] }) }));
export function SettingsPage() {
    const settingsItems = [
        {
            title: 'System Schedule',
            description: 'Configure operating hours, manual overrides, and view schedule change history.',
            icon: _jsx(Activity, { className: "h-6 w-6" }),
            href: '/system-schedule',
            badge: 'Super Admin'
        },
        {
            title: 'Security Settings',
            description: 'Manage authentication policies, rate limits, and security preferences.',
            icon: _jsx(Shield, { className: "h-6 w-6" }),
            href: '#',
        },
        {
            title: 'Notifications',
            description: 'Configure email notifications and admin alerts.',
            icon: _jsx(Bell, { className: "h-6 w-6" }),
            href: '#',
        },
        {
            title: 'Appearance',
            description: 'Customize the admin dashboard theme and layout preferences.',
            icon: _jsx(Palette, { className: "h-6 w-6" }),
            href: '#',
        },
        {
            title: 'Database & Backups',
            description: 'View database status and manage backup configurations.',
            icon: _jsx(Database, { className: "h-6 w-6" }),
            href: '#',
        },
    ];
    return (_jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 dark:text-white", children: "Settings" }), _jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Configure application and system settings" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: settingsItems.map((item) => (_jsx(SettingsCard, { ...item }, item.title))) }), _jsxs("div", { className: "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2", children: "Need Help?" }), _jsx("p", { className: "text-sm text-blue-700 dark:text-blue-300", children: "Some settings are only available to Super Admins. Contact your system administrator if you need access to restricted settings." })] })] }));
}
