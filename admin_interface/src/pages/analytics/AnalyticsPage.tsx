import React, { useEffect, useState } from 'react';
import { apiService, LoginHistory, ActiveUser, Service } from '../../services/apiService';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export const AnalyticsPage: React.FC = () => {
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [users, setUsers] = useState<ActiveUser[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterUserId, setFilterUserId] = useState<string>('');
  const [filterServiceId, setFilterServiceId] = useState<string>('');

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
    } catch (error: any) {
      toast.error('Failed to load analytics: ' + (error.message || 'Unknown error'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      const params: { user_id?: number; service_id?: number } = {};
      if (filterUserId) params.user_id = parseInt(filterUserId);
      if (filterServiceId) params.service_id = parseInt(filterServiceId);

      const historyRes = await apiService.admin.getLoginHistory(params);
      setLoginHistory(Array.isArray(historyRes) ? historyRes : []);
    } catch (error: any) {
      toast.error('Failed to filter: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilterUserId('');
    setFilterServiceId('');
    fetchAnalyticsData();
  };

  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? user.username : `User #${userId}`;
  };

  const getServiceName = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId);
    return service ? service.service_name : `Service #${serviceId}`;
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  // Calculate stats
  const totalLogins = loginHistory.length;
  const activeSessionsCount = loginHistory.filter(l => !l.logout_at).length;
  const uniqueUsers = new Set(loginHistory.map(l => l.user_id)).size;
  const uniqueServices = new Set(loginHistory.map(l => l.service_id)).size;

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Login history and usage statistics
          </p>
        </div>
        <button
          onClick={fetchAnalyticsData}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700">
          <div className="text-3xl font-bold text-blue-600">{totalLogins}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Logins</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700">
          <div className="text-3xl font-bold text-green-600">{activeSessionsCount}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Active Sessions</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700">
          <div className="text-3xl font-bold text-purple-600">{uniqueUsers}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Unique Users</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700">
          <div className="text-3xl font-bold text-orange-600">{uniqueServices}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Services Used</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Filter Results</h3>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">User</label>
            <select
              value={filterUserId}
              onChange={(e) => setFilterUserId(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              aria-label="Filter by user"
            >
              <option value="">All Users</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.username}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Service</label>
            <select
              value={filterServiceId}
              onChange={(e) => setFilterServiceId(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              aria-label="Filter by service"
            >
              <option value="">All Services</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>{service.service_name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Login History Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Login History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Login Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Logout Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Session Expires</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loginHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    <p className="text-lg font-medium">No login history found</p>
                    <p className="text-sm">Login activity will appear here once users start logging in.</p>
                  </td>
                </tr>
              ) : (
                loginHistory.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium">{getUserName(entry.user_id)}</div>
                      <div className="text-xs text-gray-400">ID: {entry.user_id}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium">{getServiceName(entry.service_id)}</div>
                      <div className="text-xs text-gray-400">ID: {entry.service_id}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {formatDateTime(entry.login_at)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {entry.logout_at ? formatDateTime(entry.logout_at) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {formatDateTime(entry.session_expires_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full font-semibold ${entry.logout_at
                          ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                          : new Date(entry.session_expires_at) > new Date()
                            ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200'
                        }`}>
                        {entry.logout_at
                          ? 'Logged Out'
                          : new Date(entry.session_expires_at) > new Date()
                            ? 'Active'
                            : 'Expired'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;