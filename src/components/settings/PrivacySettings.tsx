import { useState } from 'react';
import { componentLogger } from '../../utils/logger';
import { Shield, Eye, Users, Trash2, AlertCircle } from 'lucide-react';

export default function PrivacySettings() {
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'friends',
    showEmail: false,
    showActivity: true,
    allowIndexing: false,
    dataSharing: false,
  });

  const [dataRetention, setDataRetention] = useState({
    autoDelete: false,
    retentionDays: 30,
  });

  const handlePrivacyChange = (key: string, value: string | boolean) => {
    setPrivacy({ ...privacy, [key]: value });
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action is permanent and cannot be undone.')) {
      // Handle account deletion
      componentLogger.warn('Account deletion initiated by user');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Privacy Settings
      </h2>

      <div className="space-y-6">
        {/* Profile Visibility */}
        <div>
          <label htmlFor="profile-visibility" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Users className="inline w-4 h-4 mr-1" aria-hidden="true" />
            Profile Visibility
          </label>
          <select
            id="profile-visibility"
            value={privacy.profileVisibility}
            onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-describedby="visibility-help"
          >
            <option value="public">Public - Anyone can see your profile</option>
            <option value="friends">Friends Only - Only friends can see your profile</option>
            <option value="private">Private - Only you can see your profile</option>
          </select>
          <p id="visibility-help" className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Control who can view your profile information
          </p>
        </div>

        {/* Privacy Toggles */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Information Visibility
          </h3>
          
          <label className="flex items-center justify-between">
            <div className="flex items-center">
              <Eye className="w-5 h-5 mr-3 text-gray-400" aria-hidden="true" />
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Show Email Address
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Allow others to see your email address
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={privacy.showEmail}
              onChange={(e) => handlePrivacyChange('showEmail', e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              aria-label="Show email address to others"
            />
          </label>

          <label className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-3 text-gray-400" aria-hidden="true" />
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Show Activity Status
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Let others see when you're active
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={privacy.showActivity}
              onChange={(e) => handlePrivacyChange('showActivity', e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              aria-label="Show activity status to others"
            />
          </label>

          <label className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-3 text-gray-400" aria-hidden="true" />
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Search Engine Indexing
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Allow search engines to index your profile
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={privacy.allowIndexing}
              onChange={(e) => handlePrivacyChange('allowIndexing', e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              aria-label="Allow search engine indexing"
            />
          </label>
        </div>

        {/* Data Retention */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Data Retention
          </h3>
          
          <label className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Trash2 className="w-5 h-5 mr-3 text-gray-400" aria-hidden="true" />
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Auto-delete old data
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Automatically remove data after specified period
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={dataRetention.autoDelete}
              onChange={(e) => setDataRetention({ ...dataRetention, autoDelete: e.target.checked })}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              aria-label="Enable auto-delete for old data"
            />
          </label>

          {dataRetention.autoDelete && (
            <div className="ml-8">
              <label htmlFor="retention-days" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Delete data older than
              </label>
              <div className="flex items-center space-x-2">
                <input
                  id="retention-days"
                  type="number"
                  min="7"
                  max="365"
                  value={dataRetention.retentionDays}
                  onChange={(e) => setDataRetention({ ...dataRetention, retentionDays: parseInt(e.target.value) })}
                  className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">days</span>
              </div>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-4">
            Danger Zone
          </h3>
          
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3" aria-hidden="true" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800 dark:text-red-300">
                  Delete Account
                </h4>
                <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                  Once you delete your account, there is no going back. All your data will be permanently removed.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="mt-3 px-4 py-2 bg-red-600 text-white font-medium rounded-lg
                           hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
                           transition-colors duration-200"
                  aria-label="Delete account permanently"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <button
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg
                     hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                     transition-colors duration-200"
          >
            Save Privacy Settings
          </button>
        </div>
      </div>
    </div>
  );
}