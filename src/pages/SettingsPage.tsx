import React from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { ThemeRadioGroup, ThemeToggle } from '@/components/ThemeToggle'
import { useAuthStore } from '@/stores'
import { User, Palette, Shield, Download, Bell, Globe } from 'lucide-react'

export const SettingsPage: React.FC = () => {
  const { theme, resolvedTheme } = useTheme()
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
              { icon: Bell, label: 'Notifications', id: 'notifications' },
              { icon: Shield, label: 'Privacy', id: 'privacy' },
              { icon: Download, label: 'Data Export', id: 'export' },
              { icon: Globe, label: 'Language', id: 'language' }
            ].map(({ icon: Icon, label, id }) => (
              <button
                key={id}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors
                  ${id === 'appearance' 
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