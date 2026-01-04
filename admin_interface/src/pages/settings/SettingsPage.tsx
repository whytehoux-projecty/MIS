import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Shield, Bell, Palette, Database } from 'lucide-react';

interface SettingsCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  badge?: string;
}

const SettingsCard: React.FC<SettingsCardProps> = ({ title, description, icon, href, badge }) => (
  <Link
    to={href}
    className="block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 transition-all group"
  >
    <div className="flex items-start gap-4">
      <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </h3>
          {badge && (
            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {description}
        </p>
      </div>
      <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  </Link>
);

export function SettingsPage() {
  const settingsItems: SettingsCardProps[] = [
    {
      title: 'System Schedule',
      description: 'Configure operating hours, manual overrides, and view schedule change history.',
      icon: <Activity className="h-6 w-6" />,
      href: '/system-schedule',
      badge: 'Super Admin'
    },
    {
      title: 'Security Settings',
      description: 'Manage authentication policies, rate limits, and security preferences.',
      icon: <Shield className="h-6 w-6" />,
      href: '#',
    },
    {
      title: 'Notifications',
      description: 'Configure email notifications and admin alerts.',
      icon: <Bell className="h-6 w-6" />,
      href: '#',
    },
    {
      title: 'Appearance',
      description: 'Customize the admin dashboard theme and layout preferences.',
      icon: <Palette className="h-6 w-6" />,
      href: '#',
    },
    {
      title: 'Database & Backups',
      description: 'View database status and manage backup configurations.',
      icon: <Database className="h-6 w-6" />,
      href: '#',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configure application and system settings
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsItems.map((item) => (
          <SettingsCard key={item.title} {...item} />
        ))}
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Need Help?
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Some settings are only available to Super Admins. Contact your system administrator
          if you need access to restricted settings.
        </p>
      </div>
    </div>
  );
}