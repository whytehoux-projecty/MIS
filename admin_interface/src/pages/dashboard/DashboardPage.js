import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { apiService } from '../../services/apiService';
import { Users, Mail, FolderOpen, TrendingUp, Activity } from 'lucide-react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
export const DashboardPage = () => {
    const [stats, setStats] = useState([
        { name: 'Total Members', value: '-', icon: Users, change: '0%', changeType: 'neutral' },
        { name: 'Active Invitations', value: '-', icon: Mail, change: '0%', changeType: 'neutral' },
        { name: 'Media Files', value: '0', icon: FolderOpen, change: '0%', changeType: 'neutral' },
        { name: 'Growth Rate', value: '0%', icon: TrendingUp, change: '0%', changeType: 'neutral' },
    ]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [members, pending] = await Promise.all([
                    apiService.admin.getAllUsers(),
                    apiService.admin.getPendingUsers()
                ]);
                setStats([
                    { name: 'Total Members', value: members.length.toString(), icon: Users, change: '+0%', changeType: 'neutral' },
                    { name: 'Active Invitations', value: pending.length.toString(), icon: Mail, change: '+0%', changeType: 'neutral' },
                    { name: 'Media Files', value: '0', icon: FolderOpen, change: '0%', changeType: 'neutral' },
                    { name: 'Growth Rate', value: '0%', icon: TrendingUp, change: '0%', changeType: 'neutral' },
                ]);
            }
            catch (error) {
                console.error('Failed to fetch dashboard stats', error);
            }
            finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);
    if (loading) {
        return (_jsx("div", { className: "flex h-64 items-center justify-center", children: _jsx(LoadingSpinner, {}) }));
    }
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight text-gray-900 dark:text-white", children: "Dashboard" }), _jsx("p", { className: "text-muted-foreground mt-2", children: "Overview of your organization's key metrics and activity." })] }), _jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4", children: stats.map((item) => (_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: item.name }), _jsx(item.icon, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: item.value }), _jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [item.change, " from last month"] })] })] }, item.name))) }), _jsxs("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-7", children: [_jsxs(Card, { className: "col-span-4", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Recent Activity" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-8", children: [
                                        {
                                            id: 1,
                                            type: 'system',
                                            content: 'System initialized successfully.',
                                            time: 'Just now',
                                            icon: Activity
                                        }
                                    ].map((activity) => (_jsxs("div", { className: "flex items-center", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-sm font-medium leading-none", children: activity.content }), _jsx("p", { className: "text-sm text-muted-foreground", children: activity.time })] }), _jsx("div", { className: "ml-auto font-medium", children: _jsx(activity.icon, { className: "h-4 w-4 text-muted-foreground" }) })] }, activity.id))) }) })] }), _jsxs(Card, { className: "col-span-3", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Quick Actions" }) }), _jsx(CardContent, { children: _jsx("p", { className: "text-sm text-muted-foreground", children: "Shortcuts to common tasks will appear here." }) })] })] })] }));
};
