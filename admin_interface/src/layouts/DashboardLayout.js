import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useThemeStore } from '@/stores/themeStore';
import { Home, Users, Mail, FolderOpen, Settings, User, BarChart3, Menu, X, Sun, Moon, Link2, Activity, ClipboardList } from 'lucide-react';
const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Members', href: '/members', icon: Users },
    { name: 'Waitlist', href: '/waitlist', icon: ClipboardList },
    { name: 'Invitations', href: '/invitations', icon: Mail },
    { name: 'Services', href: '/services', icon: Link2 },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Media', href: '/media', icon: FolderOpen },
    { name: 'System Status', href: '/system-schedule', icon: Activity },
    { name: 'Settings', href: '/settings', icon: Settings },
];
export const DashboardLayout = () => {
    const { theme, setTheme } = useThemeStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-50 dark:bg-gray-900", children: [_jsxs("div", { className: `fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`, children: [_jsx("div", { className: "fixed inset-0 bg-gray-600 bg-opacity-75", onClick: () => setSidebarOpen(false) }), _jsxs("div", { className: "fixed inset-y-0 left-0 flex w-64 flex-col bg-white dark:bg-gray-800", children: [_jsxs("div", { className: "flex h-16 items-center justify-between px-4", children: [_jsx("h1", { className: "text-xl font-semibold text-gray-900 dark:text-white", children: "MIS" }), _jsx("button", { onClick: () => setSidebarOpen(false), className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", "aria-label": "Close sidebar", children: _jsx(X, { className: "h-6 w-6" }) })] }), _jsx("nav", { className: "flex-1 space-y-1 px-2 py-4", children: navigation.map((item) => {
                                    const isActive = location.pathname === item.href;
                                    return (_jsxs(Link, { to: item.href, className: `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive
                                            ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'}`, onClick: () => setSidebarOpen(false), children: [_jsx(item.icon, { className: "mr-3 h-5 w-5" }), item.name] }, item.name));
                                }) })] })] }), _jsx("div", { className: "hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col", children: _jsxs("div", { className: "flex flex-col flex-grow bg-white dark:bg-gray-800 pt-5 pb-4 overflow-y-auto", children: [_jsx("div", { className: "flex items-center flex-shrink-0 px-4", children: _jsx("h1", { className: "text-xl font-semibold text-gray-900 dark:text-white", children: "MIS" }) }), _jsx("nav", { className: "mt-5 flex-1 px-2 space-y-1", children: navigation.map((item) => {
                                const isActive = location.pathname === item.href;
                                return (_jsxs(Link, { to: item.href, className: `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive
                                        ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'}`, children: [_jsx(item.icon, { className: "mr-3 h-5 w-5" }), item.name] }, item.name));
                            }) })] }) }), _jsxs("div", { className: "lg:pl-64 flex flex-col flex-1", children: [_jsxs("div", { className: "sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8", children: [_jsx("button", { type: "button", className: "-m-2.5 p-2.5 text-gray-700 dark:text-gray-300 lg:hidden", onClick: () => setSidebarOpen(true), "aria-label": "Open sidebar", children: _jsx(Menu, { className: "h-6 w-6" }) }), _jsxs("div", { className: "flex flex-1 gap-x-4 self-stretch lg:gap-x-6", children: [_jsx("div", { className: "flex flex-1" }), _jsxs("div", { className: "flex items-center gap-x-4 lg:gap-x-6", children: [_jsx("button", { onClick: toggleTheme, className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", "aria-label": "Toggle theme", children: theme === 'dark' ? _jsx(Sun, { className: "h-5 w-5" }) : _jsx(Moon, { className: "h-5 w-5" }) }), _jsx("div", { className: "relative", children: _jsxs(Link, { to: "/profile", className: "flex items-center gap-x-4 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white", children: [_jsx(User, { className: "h-5 w-5" }), "Admin"] }) })] })] })] }), _jsx("main", { className: "flex-1", children: _jsx("div", { className: "py-6", children: _jsx("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", children: _jsx(Outlet, {}) }) }) })] })] }));
};
