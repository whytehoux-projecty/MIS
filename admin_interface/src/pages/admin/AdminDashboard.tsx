import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService, PendingUser, ActiveUser, SystemStatus, OperatingHours, LoginHistory } from '../../services/apiService';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';
import './AdminDashboard.css';

export const AdminDashboard: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [operatingHours, setOperatingHours] = useState<OperatingHours | null>(null);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: number) => {
    if (!window.confirm('Approve this user?')) return;
    try {
      await apiService.admin.approveUser(userId, 'Approved via dashboard');
      toast.success('User approved!');
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
      fetchDashboardData();
    } catch (err: any) {
      toast.error('Failed to approve: ' + err.message);
    }
  };

  const handleReject = async (userId: number) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    try {
      await apiService.admin.rejectUser(userId, reason);
      toast.success('User rejected');
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err: any) {
      toast.error('Failed to reject: ' + err.message);
    }
  };

  const handleQuestion = async (userId: number) => {
    const question = prompt('Question for applicant:');
    if (!question) return;
    try {
      await apiService.admin.requestInfo(userId, question);
      toast.success('Inquiry sent to user');
      // We don't remove from list because it's still pending
    } catch (err: any) {
      toast.error('Failed to send inquiry: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-500 dark:text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Central Authentication System Overview
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
        >
          🔄 Refresh
        </button>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`p-5 rounded-xl shadow-lg border-2 ${systemStatus?.status === 'open'
          ? 'bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border-green-500'
          : 'bg-gradient-to-br from-red-50 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 border-red-500'
          }`}>
          <div className="flex items-center gap-3 mb-2">
            <span className={`w-4 h-4 rounded-full animate-pulse ${systemStatus?.status === 'open' ? 'bg-green-500' : 'bg-red-500'
              }`}></span>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">System Status</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
            {systemStatus?.status || 'Unknown'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {systemStatus?.message || 'Status unavailable'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">⏰ Operating Hours</h3>
          {operatingHours ? (
            <div className="space-y-2">
              <p className="text-lg">
                <span className="font-semibold">{operatingHours.opening_time}</span>
                <span className="text-gray-500 mx-2">to</span>
                <span className="font-semibold">{operatingHours.closing_time}</span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Timezone: {operatingHours.timezone}
              </p>
              <p className="text-sm">
                <span className={operatingHours.currently_open ? 'text-green-600' : 'text-red-600'}>
                  {operatingHours.currently_open ? '● Currently Open' : '● Currently Closed'}
                </span>
              </p>
            </div>
          ) : (
            <p className="text-gray-500">Operating hours unavailable</p>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/invitations" className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
          <div className="text-3xl font-bold text-orange-600">{pendingUsers.length}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Pending Approvals</div>
        </Link>
        <Link to="/members" className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
          <div className="text-3xl font-bold text-green-600">{activeUsers.length}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Active Users</div>
        </Link>
        <Link to="/invitations" className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
          <div className="text-3xl font-bold text-blue-600">-</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Active Invitations</div>
        </Link>
        <Link to="/analytics" className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
          <div className="text-3xl font-bold text-purple-600">{loginHistory.length}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Recent Logins</div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/invitations"
          className="p-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-4"
        >
          <span className="text-3xl">📧</span>
          <div>
            <div className="font-bold">Manage Invitations</div>
            <div className="text-sm opacity-80">Create and manage invitation codes</div>
          </div>
        </Link>
        <Link
          to="/services"
          className="p-5 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-4"
        >
          <span className="text-3xl">🔗</span>
          <div>
            <div className="font-bold">Connected Services</div>
            <div className="text-sm opacity-80">Manage third-party applications</div>
          </div>
        </Link>
        <Link
          to="/analytics"
          className="p-5 bg-gradient-to-r from-orange-600 to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-4"
        >
          <span className="text-3xl">📊</span>
          <div>
            <div className="font-bold">Analytics</div>
            <div className="text-sm opacity-80">View login history and stats</div>
          </div>
        </Link>
      </div>

      {/* Pending Approvals */}
      {pendingUsers.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              ⏳ Pending Approvals ({pendingUsers.length})
            </h2>
            <Link to="/invitations" className="text-blue-600 hover:underline text-sm">View All →</Link>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {pendingUsers.slice(0, 5).map((user) => (
              <div key={user.id} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-750">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{user.full_name}</div>
                  <div className="text-sm text-gray-500">@{user.username} · {user.email}</div>
                  <div className="text-xs text-gray-400">
                    Applied: {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/admin/applications/${user.id}`}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                  >
                    Review
                  </Link>
                  <button
                    onClick={() => handleApprove(user.id)}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(user.id)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleQuestion(user.id)}
                    className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700"
                  >
                    Question
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Login Activity */}
      {loginHistory.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              📋 Recent Login Activity
            </h2>
            <Link to="/analytics" className="text-blue-600 hover:underline text-sm">View All →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Login Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loginHistory.slice(0, 5).map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-4 py-3 text-sm">{entry.user_id}</td>
                    <td className="px-4 py-3 text-sm">{entry.service_id}</td>
                    <td className="px-4 py-3 text-sm">{new Date(entry.login_at).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${entry.logout_at
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-green-100 text-green-600'
                        }`}>
                        {entry.logout_at ? 'Logged Out' : 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
