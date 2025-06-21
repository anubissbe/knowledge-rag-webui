import { useState } from 'react';
import { componentLogger } from '../../utils/logger';
import { Bell, Mail, MessageSquare, Calendar, TrendingUp, Users, Shield } from 'lucide-react';

interface NotificationCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  settings: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

export default function NotificationSettings() {
  const [notifications, setNotifications] = useState<NotificationCategory[]>([
    {
      id: 'updates',
      title: 'Product Updates',
      description: 'New features and improvements',
      icon: TrendingUp,
      settings: { email: true, push: false, inApp: true },
    },
    {
      id: 'reminders',
      title: 'Reminders',
      description: 'Task deadlines and scheduled events',
      icon: Calendar,
      settings: { email: true, push: true, inApp: true },
    },
    {
      id: 'social',
      title: 'Social Activity',
      description: 'Mentions, shares, and collaborations',
      icon: Users,
      settings: { email: false, push: true, inApp: true },
    },
    {
      id: 'security',
      title: 'Security Alerts',
      description: 'Login attempts and security updates',
      icon: Shield,
      settings: { email: true, push: true, inApp: true },
    },
  ]);

  const [emailDigest, setEmailDigest] = useState({
    enabled: true,
    frequency: 'weekly',
  });

  const handleNotificationChange = (categoryId: string, type: 'email' | 'push' | 'inApp', value: boolean) => {
    setNotifications(notifications.map(cat => 
      cat.id === categoryId 
        ? { ...cat, settings: { ...cat.settings, [type]: value } }
        : cat
    ));
  };

  const handleSaveSettings = () => {
    componentLogger.info('Saving notification settings', { notifications, emailDigest });
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Notification Settings
      </h2>

      <div className="space-y-6">
        {/* Notification Categories */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Notification Preferences
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full" role="table">
              <thead>
                <tr className="text-left text-sm text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th scope="col" className="pb-3 pr-4">Category</th>
                  <th scope="col" className="pb-3 px-4 text-center">
                    <Mail className="w-4 h-4 inline" aria-hidden="true" />
                    <span className="sr-only">Email</span>
                  </th>
                  <th scope="col" className="pb-3 px-4 text-center">
                    <Bell className="w-4 h-4 inline" aria-hidden="true" />
                    <span className="sr-only">Push</span>
                  </th>
                  <th scope="col" className="pb-3 pl-4 text-center">
                    <MessageSquare className="w-4 h-4 inline" aria-hidden="true" />
                    <span className="sr-only">In-App</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((category) => {
                  const Icon = category.icon;
                  return (
                    <tr key={category.id}>
                      <td className="py-4 pr-4">
                        <div className="flex items-start">
                          <Icon className="w-5 h-5 mr-3 text-gray-400 mt-0.5" aria-hidden="true" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {category.title}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {category.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={category.settings.email}
                          onChange={(e) => handleNotificationChange(category.id, 'email', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          aria-label={`Email notifications for ${category.title}`}
                        />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={category.settings.push}
                          onChange={(e) => handleNotificationChange(category.id, 'push', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          aria-label={`Push notifications for ${category.title}`}
                        />
                      </td>
                      <td className="py-4 pl-4 text-center">
                        <input
                          type="checkbox"
                          checked={category.settings.inApp}
                          onChange={(e) => handleNotificationChange(category.id, 'inApp', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          aria-label={`In-app notifications for ${category.title}`}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Email Digest */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Email Digest
          </h3>
          
          <label className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Mail className="w-5 h-5 mr-3 text-gray-400" aria-hidden="true" />
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable Email Digest
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Receive a summary of your activity
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={emailDigest.enabled}
              onChange={(e) => setEmailDigest({ ...emailDigest, enabled: e.target.checked })}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              aria-label="Enable email digest"
            />
          </label>

          {emailDigest.enabled && (
            <div className="ml-8">
              <label htmlFor="digest-frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Frequency
              </label>
              <select
                id="digest-frequency"
                value={emailDigest.frequency}
                onChange={(e) => setEmailDigest({ ...emailDigest, frequency: e.target.value })}
                className="w-full max-w-xs px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              const allEnabled = notifications.every(n => n.settings.email && n.settings.push && n.settings.inApp);
              notifications.forEach(n => {
                n.settings.email = !allEnabled;
                n.settings.push = !allEnabled;
                n.settings.inApp = !allEnabled;
              });
              setNotifications([...notifications]);
            }}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            {notifications.every(n => n.settings.email && n.settings.push && n.settings.inApp) 
              ? 'Disable all' 
              : 'Enable all'}
          </button>
          
          <button
            onClick={() => {
              notifications.forEach(n => {
                n.settings.email = false;
                n.settings.push = false;
                n.settings.inApp = true;
              });
              setNotifications([...notifications]);
            }}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            In-app only
          </button>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <button
            onClick={handleSaveSettings}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg
                     hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                     transition-colors duration-200"
          >
            Save Notification Settings
          </button>
        </div>
      </div>
    </div>
  );
}