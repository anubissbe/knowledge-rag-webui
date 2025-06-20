import { type FC, useState, useEffect, useRef } from 'react'
import { Search, User, LogOut, Command, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores'
import { ThemeToggleButton } from '../ThemeToggle'
import { OnboardingTrigger } from '../onboarding/OnboardingTrigger'
import { cn } from '@/lib/utils'

export const Header: FC = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/auth/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleProfile = () => {
    navigate('/settings')
    setIsUserMenuOpen(false)
  }

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isUserMenuOpen])

  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Search bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Search memories..."
              className={cn(
                "w-full pl-10 pr-12 py-2",
                "bg-muted/50 rounded-lg",
                "border border-transparent",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                "placeholder:text-muted-foreground",
                "transition-all"
              )}
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Command size={12} />K
              </span>
            </kbd>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-4 ml-6">
          {/* Help/Tutorial */}
          <OnboardingTrigger variant="help" />
          
          {/* Theme toggle */}
          <ThemeToggleButton />

          {/* User menu - only show if authenticated */}
          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <User size={16} className="text-primary" />
                  )}
                </div>
              </button>

              {/* Dropdown menu */}
              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border bg-background shadow-lg z-20">
                    <div className="p-2">
                      <div className="px-3 py-2 border-b border-border">
                        <div className="font-medium text-sm">{user?.name}</div>
                        <div className="text-xs text-muted-foreground">{user?.email}</div>
                      </div>
                      
                      <div className="py-1">
                        <button 
                          onClick={handleProfile}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted transition-colors"
                        >
                          <Settings size={16} />
                          <span>Settings</span>
                        </button>
                        <OnboardingTrigger 
                          variant="menu-item"
                          className="text-left"
                        />
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted transition-colors text-destructive"
                        >
                          <LogOut size={16} />
                          <span>Sign out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/auth/login')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  )
}