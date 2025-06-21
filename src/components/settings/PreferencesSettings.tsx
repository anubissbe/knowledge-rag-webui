import { useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { Monitor, Moon, Sun, Globe, Clock } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ja', name: '日本語' },
  { code: 'zh', name: '中文' },
];

const timezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Asia/Shanghai', label: 'Beijing, Shanghai' },
];

export default function PreferencesSettings() {
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [timeFormat, setTimeFormat] = useState('12h');

  const handleSavePreferences = () => {
    // Save preferences to API
    console.log('Saving preferences:', { theme, language, timezone, dateFormat, timeFormat });
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Preferences
      </h2>

      <div className="space-y-6">
        {/* Theme Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Appearance
          </label>
          <div className="grid grid-cols-3 gap-4" role="radiogroup" aria-label="Theme selection">
            <button
              onClick={() => setTheme('light')}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200
                ${theme === 'light' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }
              `}
              role="radio"
              aria-checked={theme === 'light'}
              aria-label="Light theme"
            >
              <Sun className="w-6 h-6 mx-auto mb-2 text-yellow-500" aria-hidden="true" />
              <span className="block text-sm font-medium text-gray-900 dark:text-white">Light</span>
            </button>
            
            <button
              onClick={() => setTheme('dark')}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200
                ${theme === 'dark' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }
              `}
              role="radio"
              aria-checked={theme === 'dark'}
              aria-label="Dark theme"
            >
              <Moon className="w-6 h-6 mx-auto mb-2 text-blue-500" aria-hidden="true" />
              <span className="block text-sm font-medium text-gray-900 dark:text-white">Dark</span>
            </button>
            
            <button
              onClick={() => setTheme('system')}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200
                ${theme === 'system' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }
              `}
              role="radio"
              aria-checked={theme === 'system'}
              aria-label="System theme"
            >
              <Monitor className="w-6 h-6 mx-auto mb-2 text-gray-500" aria-hidden="true" />
              <span className="block text-sm font-medium text-gray-900 dark:text-white">System</span>
            </button>
          </div>
        </div>

        {/* Language Selection */}
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Globe className="inline w-4 h-4 mr-1" aria-hidden="true" />
            Language
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Timezone Selection */}
        <div>
          <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Clock className="inline w-4 h-4 mr-1" aria-hidden="true" />
            Timezone
          </label>
          <select
            id="timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {timezones.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Format */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date Format
          </label>
          <div className="space-y-2" role="radiogroup" aria-label="Date format selection">
            {['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'].map((format) => (
              <label key={format} className="flex items-center">
                <input
                  type="radio"
                  name="dateFormat"
                  value={format}
                  checked={dateFormat === format}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{format}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Time Format */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Time Format
          </label>
          <div className="space-y-2" role="radiogroup" aria-label="Time format selection">
            <label className="flex items-center">
              <input
                type="radio"
                name="timeFormat"
                value="12h"
                checked={timeFormat === '12h'}
                onChange={(e) => setTimeFormat(e.target.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">12-hour (AM/PM)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="timeFormat"
                value="24h"
                checked={timeFormat === '24h'}
                onChange={(e) => setTimeFormat(e.target.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">24-hour</span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <button
            onClick={handleSavePreferences}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg
                     hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                     transition-colors duration-200"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}