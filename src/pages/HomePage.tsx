import { type FC } from 'react'
import { Link } from 'react-router-dom'
import { Brain, Search, Network, TrendingUp } from 'lucide-react'

export const HomePage: FC = () => {
  const stats = [
    { label: 'Total Memories', value: '0', icon: Brain },
    { label: 'Collections', value: '0', icon: Network },
    { label: 'Searches Today', value: '0', icon: Search },
    { label: 'Knowledge Growth', value: '+0%', icon: TrendingUp },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome back!</h1>
        <p className="text-muted-foreground text-lg">
          Your personal knowledge management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="rounded-lg border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <Icon className="text-muted-foreground" size={24} />
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/memories/new"
            className="group rounded-lg border p-6 hover:border-primary transition-colors"
          >
            <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
              Create New Memory
            </h3>
            <p className="text-sm text-muted-foreground">
              Start capturing your thoughts and ideas
            </p>
          </Link>
          
          <Link
            to="/search"
            className="group rounded-lg border p-6 hover:border-primary transition-colors"
          >
            <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
              Search Knowledge
            </h3>
            <p className="text-sm text-muted-foreground">
              Find information across all your memories
            </p>
          </Link>
          
          <Link
            to="/graph"
            className="group rounded-lg border p-6 hover:border-primary transition-colors"
          >
            <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
              Explore Graph
            </h3>
            <p className="text-sm text-muted-foreground">
              Visualize connections in your knowledge
            </p>
          </Link>
        </div>
      </div>

      {/* Recent Memories */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Recent Memories</h2>
        <div className="rounded-lg border bg-muted/50 p-8 text-center">
          <p className="text-muted-foreground">No memories yet. Create your first memory to get started!</p>
          <Link
            to="/memories/new"
            className="inline-flex mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Create Memory
          </Link>
        </div>
      </div>
    </div>
  )
}