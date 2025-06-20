import React, { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { useUserStore, useUIStore } from '../../stores';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
];

export function LanguageSettings() {
  const { preferences, updatePreferences } = useUserStore();
  const { addNotification } = useUIStore();
  const [selectedLanguage, setSelectedLanguage] = useState(preferences.language || 'en');

  const handleLanguageChange = async (languageCode: string) => {
    setSelectedLanguage(languageCode);
    try {
      await updatePreferences({ language: languageCode });
      addNotification({
        title: 'Language Updated',
        message: 'Your language preference has been saved',
        type: 'success'
      });
    } catch (error) {
      addNotification({
        title: 'Error',
        message: 'Failed to update language preference',
        type: 'error'
      });
    }
  };

  return (
    <div className="bg-card border rounded-lg p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Globe className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Language & Region</h2>
      </div>
      
      <div className="space-y-6">
        {/* Language Selection */}
        <div>
          <h3 className="font-medium mb-4">Display Language</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`
                  flex items-center justify-between p-3 rounded-lg border transition-all
                  ${selectedLanguage === language.code 
                    ? 'border-primary bg-primary/5' 
                    : 'border-input hover:bg-muted'
                  }
                `}
              >
                <div className="text-left">
                  <p className="font-medium">{language.name}</p>
                  <p className="text-sm text-muted-foreground">{language.nativeName}</p>
                </div>
                {selectedLanguage === language.code && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Date & Time Format */}
        <div className="border-t border-border pt-6">
          <h3 className="font-medium mb-4">Date & Time Format</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Date Format</label>
              <select
                value={preferences.dateFormat || 'MM/DD/YYYY'}
                onChange={(e) => updatePreferences({ dateFormat: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</option>
                <option value="DD.MM.YYYY">DD.MM.YYYY (31.12.2024)</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Time Format</label>
              <select
                value={preferences.timeFormat || '12h'}
                onChange={(e) => updatePreferences({ timeFormat: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="12h">12-hour (3:30 PM)</option>
                <option value="24h">24-hour (15:30)</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Timezone</label>
              <select
                value={preferences.timezone || 'auto'}
                onChange={(e) => updatePreferences({ timezone: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="auto">Auto-detect</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
                <option value="Asia/Shanghai">Shanghai</option>
              </select>
            </div>
          </div>
        </div>

        {/* Number Format */}
        <div className="border-t border-border pt-6">
          <h3 className="font-medium mb-4">Number Format</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Number Separator</label>
              <select
                value={preferences.numberFormat || 'comma'}
                onChange={(e) => updatePreferences({ numberFormat: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="comma">1,234.56 (Comma for thousands)</option>
                <option value="space">1 234.56 (Space for thousands)</option>
                <option value="period">1.234,56 (Period for thousands)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Translation Note */}
        <div className="bg-muted/50 rounded-lg p-4 text-sm">
          <p className="text-muted-foreground">
            <strong>Note:</strong> Changing the display language will update the interface language throughout the application. Some content may remain in its original language.
          </p>
        </div>
      </div>
    </div>
  );
}