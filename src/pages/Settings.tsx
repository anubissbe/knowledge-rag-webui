import { useState } from 'react';
import { 
  User, Settings as SettingsIcon, Key, Download, Shield, Bell, 
  ChevronRight
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import ProfileSettings from '../components/settings/ProfileSettings';
import ApiKeysSettings from '../components/settings/ApiKeysSettings';
import PreferencesSettings from '../components/settings/PreferencesSettings';
import PrivacySettings from '../components/settings/PrivacySettings';
import DataExportSettings from '../components/settings/DataExportSettings';
import NotificationSettings from '../components/settings/NotificationSettings';

type SettingsTab = 'profile' | 'api-keys' | 'preferences' | 'privacy' | 'data-export' | 'notifications';

const settingsTabs: Array<{ id: SettingsTab; label: string; icon: React.ElementType; description: string }> = [
  { id: 'profile', label: 'Profile', icon: User, description: 'Manage your profile information' },
  { id: 'api-keys', label: 'API Keys', icon: Key, description: 'Manage your API access keys' },
  { id: 'preferences', label: 'Preferences', icon: SettingsIcon, description: 'Customize your experience' },
  { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Configure notification settings' },
  { id: 'privacy', label: 'Privacy', icon: Shield, description: 'Control your privacy settings' },
  { id: 'data-export', label: 'Data Export', icon: Download, description: 'Export your data' },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <nav 
            className="w-full lg:w-64 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4"
            role="navigation"
            aria-label="Settings navigation"
          >
            <ul className="space-y-1" role="list">
              {settingsTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        w-full flex items-center justify-between px-4 py-3 rounded-lg
                        transition-colors duration-200
                        ${isActive 
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }
                      `}
                      aria-current={isActive ? 'page' : undefined}
                      aria-label={`${tab.label} settings`}
                    >
                      <div className="flex items-center">
                        <Icon className="w-5 h-5 mr-3" aria-hidden="true" />
                        <span className="font-medium">{tab.label}</span>
                      </div>
                      {isActive && (
                        <ChevronRight className="w-4 h-4" aria-hidden="true" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Main Content Area */}
          <main className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              {activeTab === 'profile' && <ProfileSettings />}
              {activeTab === 'api-keys' && <ApiKeysSettings />}
              {activeTab === 'preferences' && <PreferencesSettings />}
              {activeTab === 'privacy' && <PrivacySettings />}
              {activeTab === 'data-export' && <DataExportSettings />}
              {activeTab === 'notifications' && <NotificationSettings />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}