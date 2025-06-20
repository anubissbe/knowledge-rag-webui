import { type FC, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Brain, 
  Search, 
  FolderOpen, 
  Network, 
  Settings,
  Menu,
  X,
  Plus,
  Home,
  BarChart3,
  TestTube,
  Upload
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ size?: number }>
  href: string
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home, href: '/' },
  { id: 'memories', label: 'Memories', icon: Brain, href: '/memories' },
  { id: 'search', label: 'Search', icon: Search, href: '/search' },
  { id: 'collections', label: 'Collections', icon: FolderOpen, href: '/collections' },
  { id: 'graph', label: 'Knowledge Graph', icon: Network, href: '/graph' },
  { id: 'import-export', label: 'Import/Export', icon: Upload, href: '/import-export' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics' },
]

// Add test pages in development mode
if (import.meta.env.DEV) {
  navItems.push({ id: 'test-mcp', label: 'Test MCP', icon: TestTube, href: '/test-mcp' })
  navItems.push({ id: 'test-websocket', label: 'Test WebSocket', icon: TestTube, href: '/test-websocket' })
}

export const Sidebar: FC = () => {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const isActive = (href: string) => {
    return location.pathname === href || 
           (href !== '/' && location.pathname.startsWith(href))
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-background border"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          "h-full bg-background border-r transition-all duration-300",
          "flex flex-col",
          isCollapsed ? "w-16" : "w-64",
          // Mobile styles
          "fixed lg:relative",
          "z-40",
          isMobileOpen ? "left-0" : "-left-full lg:left-0"
        )}
      >
        {/* Logo/Brand */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h1 className={cn(
              "font-bold text-xl transition-opacity",
              isCollapsed && "opacity-0"
            )}>
              Knowledge RAG
            </h1>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:block p-1 rounded hover:bg-muted"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* New Memory Button */}
        <div className="p-4">
          <Link
            to="/memories/new"
            className={cn(
              "flex items-center gap-2 w-full",
              "px-4 py-2 rounded-lg",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90 transition-colors",
              isCollapsed && "justify-center px-2"
            )}
          >
            <Plus size={20} />
            {!isCollapsed && <span>New Memory</span>}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <li key={item.id}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2 rounded-lg",
                      "transition-colors duration-200",
                      active
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground",
                      isCollapsed && "justify-center px-2"
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon size={20} />
                    {!isCollapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Settings at bottom */}
        <div className="p-4 border-t">
          <Link
            to="/settings"
            className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-lg",
              "hover:bg-muted text-muted-foreground hover:text-foreground",
              "transition-colors",
              isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? "Settings" : undefined}
          >
            <Settings size={20} />
            {!isCollapsed && <span>Settings</span>}
          </Link>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}