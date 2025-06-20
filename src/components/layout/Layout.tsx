import { type FC, type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { cn } from '@/lib/utils'
import { useRealtimeSync } from '../../hooks/useRealtimeSync'

interface LayoutProps {
  children: ReactNode
  className?: string
}

export const Layout: FC<LayoutProps> = ({ children, className }) => {
  // Setup real-time sync based on current route
  useRealtimeSync();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <div className="lg:hidden">
        <Header />
      </div>
      
      <div className="flex h-screen">
        {/* Sidebar - hidden on mobile, shown on desktop */}
        <aside className="hidden lg:block">
          <Sidebar />
        </aside>
        
        {/* Main content area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Desktop header */}
          <div className="hidden lg:block">
            <Header />
          </div>
          
          {/* Content */}
          <div id="main-content" className={cn("flex-1 overflow-auto p-6", className)}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}