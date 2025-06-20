import React from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAccessibility } from '@/contexts/AccessibilityContext'
import { ThemeRadioGroup, ThemeToggle } from '@/components/ThemeToggle'
import { useAuthStore } from '@/stores'
import { User, Palette, Shield, Download, Bell, Globe, Eye, Keyboard } from 'lucide-react'

export const SettingsPage: React.FC = () => {
  const { theme, resolvedTheme } = useTheme()
  const { settings, updateSetting, resetSettings } = useAccessibility()
  const { user } = useAuthStore()

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and application settings.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Settings Navigation */}
        <div className="space-y-1">
          <nav className="space-y-2">
            {[
              { icon: User, label: 'Profile', id: 'profile' },
              { icon: Palette, label: 'Appearance', id: 'appearance' },
              { icon: Eye, label: 'Accessibility', id: 'accessibility' },
              { icon: Bell, label: 'Notifications', id: 'notifications' },
              { icon: Shield, label: 'Privacy', id: 'privacy' },
              { icon: Download, label: 'Data Export', id: 'export' },
              { icon: Globe, label: 'Language', id: 'language' }
            ].map(({ icon: Icon, label, id }) => (
              <button
                key={id}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors
                  ${id === 'accessibility' 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Section */}
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Profile</h2>
            </div>
            
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <input
                  type="text"
                  value={user?.name || ''}
                  className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                  readOnly
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Appearance Section */}
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Palette className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Appearance</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Theme Preference
                </h3>
                <ThemeRadioGroup />
              </div>

              <div className="flex items-center justify-between py-3 border-t border-border">
                <div>
                  <p className="font-medium">Quick Theme Toggle</p>
                  <p className="text-sm text-muted-foreground">
                    Current theme: {theme} ({resolvedTheme})
                  </p>
                </div>
                <ThemeToggle />
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium">Theme Preview</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 border rounded-lg bg-background">
                    <div className="space-y-2">
                      <div className="h-3 bg-primary rounded"></div>
                      <div className="h-2 bg-muted rounded w-3/4"></div>
                      <div className="h-2 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg bg-muted">
                    <div className="space-y-2">
                      <div className="h-3 bg-primary rounded"></div>
                      <div className="h-2 bg-muted-foreground/20 rounded w-3/4"></div>
                      <div className="h-2 bg-muted-foreground/20 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Accessibility Section */}
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Accessibility</h2>
            </div>
            
            <div className="space-y-6">
              {/* High Contrast */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">High Contrast Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Increase contrast for better visibility
                  </p>
                </div>
                <button
                  onClick={() => updateSetting('highContrast', !settings.highContrast)}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${settings.highContrast ? 'bg-primary' : 'bg-muted'}
                  `}
                  aria-pressed={settings.highContrast}
                  aria-label="Toggle high contrast mode"
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${settings.highContrast ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between py-3 border-t border-border">
                <div>
                  <p className="font-medium">Reduced Motion</p>
                  <p className="text-sm text-muted-foreground">
                    Minimize animations and transitions
                  </p>
                </div>
                <button
                  onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${settings.reducedMotion ? 'bg-primary' : 'bg-muted'}
                  `}
                  aria-pressed={settings.reducedMotion}
                  aria-label="Toggle reduced motion"
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>

              {/* Large Text */}
              <div className="flex items-center justify-between py-3 border-t border-border">
                <div>
                  <p className="font-medium">Large Text</p>
                  <p className="text-sm text-muted-foreground">
                    Increase text size for better readability
                  </p>
                </div>
                <button
                  onClick={() => updateSetting('largeText', !settings.largeText)}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${settings.largeText ? 'bg-primary' : 'bg-muted'}
                  `}
                  aria-pressed={settings.largeText}
                  aria-label="Toggle large text"
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${settings.largeText ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>

              {/* Screen Reader Mode */}
              <div className="flex items-center justify-between py-3 border-t border-border">
                <div>
                  <p className="font-medium">Screen Reader Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Enhanced support for screen readers
                  </p>
                </div>
                <button
                  onClick={() => updateSetting('screenReaderMode', !settings.screenReaderMode)}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${settings.screenReaderMode ? 'bg-primary' : 'bg-muted'}
                  `}
                  aria-pressed={settings.screenReaderMode}
                  aria-label="Toggle screen reader mode"
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${settings.screenReaderMode ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>

              {/* Keyboard Navigation */}
              <div className="flex items-center justify-between py-3 border-t border-border">
                <div>
                  <div className="flex items-center gap-2">
                    <Keyboard className="h-4 w-4" />
                    <p className="font-medium">Keyboard Navigation</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Show keyboard shortcuts and enhance tab navigation
                  </p>
                </div>
                <button
                  onClick={() => updateSetting('keyboardNavigation', !settings.keyboardNavigation)}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${settings.keyboardNavigation ? 'bg-primary' : 'bg-muted'}
                  `}
                  aria-pressed={settings.keyboardNavigation}
                  aria-label="Toggle keyboard navigation help"
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${settings.keyboardNavigation ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>

              {/* Focus Ring Style */}
              <div className="py-3 border-t border-border">
                <div className="mb-3">
                  <p className="font-medium">Focus Ring Style</p>
                  <p className="text-sm text-muted-foreground">
                    Choose how focus indicators appear
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['default', 'enhanced', 'high-contrast'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => updateSetting('focusRing', style)}
                      className={`
                        px-3 py-2 text-sm rounded-md border transition-colors capitalize
                        ${settings.focusRing === style
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-input hover:bg-muted'
                        }
                      `}
                      aria-pressed={settings.focusRing === style}
                    >
                      {style.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset Button */}
              <div className="pt-4 border-t border-border">
                <button
                  onClick={resetSettings}
                  className="px-4 py-2 text-sm bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors"
                >
                  Reset Accessibility Settings
                </button>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Notifications</h2>
            </div>
            
            <div className="space-y-4">
              {[
                { label: 'Email notifications', description: 'Receive email updates about your memories' },
                { label: 'Push notifications', description: 'Get notified about important events' },
                { label: 'Weekly digest', description: 'Summary of your weekly activity' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    defaultChecked={index === 0}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Section */}
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Privacy & Security</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Make memories private by default</p>
                  <p className="text-sm text-muted-foreground">
                    New memories will be private unless explicitly shared
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                  defaultChecked
                />
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Analytics tracking</p>
                  <p className="text-sm text-muted-foreground">
                    Help improve the application with usage analytics
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Data Export Section */}
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Data Export</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Export your data in various formats. This includes all your memories, collections, and settings.
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                {['JSON', 'CSV', 'Markdown', 'PDF'].map((format) => (
                  <button
                    key={format}
                    className="px-4 py-2 border border-input rounded-md hover:bg-muted transition-colors text-sm"
                  >
                    Export as {format}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}