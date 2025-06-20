# Analytics Dashboard Documentation

## Overview

The Analytics Dashboard provides comprehensive insights into your Knowledge RAG system usage, including memory statistics, search patterns, entity extraction metrics, and system performance. It helps users understand their knowledge management patterns and optimize their workflow.

## Features

### 1. Key Metrics Overview

The dashboard displays four primary metrics at the top:

- **Total Memories**: Complete count of all memories in the system
- **Collections**: Number of organized memory collections
- **Total Tags**: Unique tags used across all memories
- **Entities**: Total extracted entities (people, organizations, locations, etc.)

Each metric card shows:
- Current total count
- Recent activity (e.g., "+12 this week")
- Visual icon for quick recognition

### 2. Time Range Selection

Users can view analytics for different time periods:
- **Week**: Last 7 days of activity
- **Month**: Last 30 days (default view)
- **Year**: Last 365 days

The selected range affects:
- Memory growth charts
- Activity calculations
- Trend analysis

### 3. Visualizations

#### Memory Growth Chart
- Area chart showing memory creation over time
- Grouped by day (week view), week (month view), or month (year view)
- Interactive tooltip showing exact counts
- Responsive design adapts to screen size

#### Collection Distribution
- Pie chart displaying memory distribution across collections
- Shows percentage and count for each collection
- Color-coded for easy identification
- Helps identify most-used collections

#### Most Used Tags
- Bar chart of top 10 most frequently used tags
- Shows tag name and usage count
- Helps identify content themes and organization patterns
- Angled labels for better readability

#### Entity Types
- Horizontal bar chart showing entity type distribution
- Categories: Person, Organization, Location, Project, Concept
- Useful for understanding knowledge composition

### 4. Activity Insights

#### Recent Activity Panel
- Memories created this month
- Average memory length in characters
- Most active day of the week
- Peak activity hour

#### Popular Searches
- Top 5 most frequent search queries
- Shows search term and frequency count
- Helps understand what users search for most

#### Memory Insights
- Percentage of memories with images
- Percentage with external links
- Percentage containing code snippets
- Sharing statistics

### 5. Storage & Performance

#### Storage Usage
- Visual progress bar showing used vs. total storage
- Breakdown by memory type (Note, Document, Link, Image)
- Percentage and absolute values
- Color-coded type indicators

#### Performance Metrics
- **Search Success Rate**: Percentage of successful searches
- **Average Response Time**: API response speed
- **API Calls Today**: Total API usage
- **Cache Hit Rate**: Caching effectiveness
- **Active Sessions**: Current user count
- **Uptime**: System availability percentage

## Technical Implementation

### Data Sources

1. **Local Data** (Real-time)
   - Memory count and metadata
   - Collection information
   - Tag extraction
   - Basic statistics

2. **Server Data** (Cached)
   - Entity extraction metrics
   - Search query logs
   - Performance metrics
   - Storage information

### State Management

The analytics dashboard uses a dedicated Zustand store (`analyticsStore.ts`):

```typescript
interface AnalyticsState {
  stats: AnalyticsStats | null;
  loading: boolean;
  error: string | null;
  timeRange: 'week' | 'month' | 'year';
  
  fetchStats: () => Promise<void>;
  setTimeRange: (range: TimeRange) => void;
  calculateLocalStats: (memories, collections) => void;
}
```

### Charts Library

Uses Recharts for data visualization:
- Responsive containers
- Custom tooltips
- Animated transitions
- Touch-friendly on mobile

### Performance Optimizations

1. **Lazy Loading**: Dashboard components load on-demand
2. **Data Aggregation**: Pre-calculated statistics reduce computation
3. **Memoization**: Chart data cached to prevent re-renders
4. **Virtual Scrolling**: For large datasets (future enhancement)

## Usage Guidelines

### Best Practices

1. **Regular Monitoring**
   - Check weekly for usage trends
   - Monitor storage usage to prevent limits
   - Track search patterns to improve organization

2. **Data Interpretation**
   - High tag diversity indicates good organization
   - Collection balance shows effective categorization
   - Entity extraction quality reflects content richness

3. **Performance Monitoring**
   - Response times > 200ms may indicate issues
   - Cache hit rate < 60% suggests optimization needed
   - Monitor API calls for usage spikes

### Common Use Cases

1. **Content Audit**
   - Identify under-utilized collections
   - Find redundant or similar tags
   - Discover content gaps

2. **Usage Analysis**
   - Understand peak usage times
   - Track user engagement trends
   - Measure feature adoption

3. **System Health**
   - Monitor performance degradation
   - Track storage growth rate
   - Identify potential bottlenecks

## Customization

### Adding New Metrics

To add custom metrics:

1. Update `AnalyticsStats` interface
2. Modify data fetching in `analyticsStore`
3. Add visualization component
4. Update dashboard layout

### Custom Time Ranges

Extend time range options:

```typescript
type TimeRange = 'day' | 'week' | 'month' | 'quarter' | 'year';
```

### Export Functionality

Future enhancement to export analytics data:
- CSV export for raw data
- PDF reports for sharing
- API endpoint for programmatic access

## Troubleshooting

### Common Issues

1. **Charts Not Loading**
   - Check browser console for errors
   - Verify data is being fetched
   - Ensure Recharts is properly installed

2. **Incorrect Metrics**
   - Clear browser cache
   - Refresh analytics data
   - Check time range selection

3. **Performance Issues**
   - Reduce time range scope
   - Check for large datasets
   - Monitor browser memory usage

### Debug Mode

Enable analytics debugging:

```javascript
localStorage.setItem('ANALYTICS_DEBUG', 'true');
```

This logs:
- Data fetch requests
- Calculation timings
- Chart render performance

## Future Enhancements

1. **Advanced Analytics**
   - Predictive trends
   - Anomaly detection
   - Comparative analysis

2. **Custom Dashboards**
   - Drag-and-drop widgets
   - Saved view configurations
   - Role-based dashboards

3. **Real-time Updates**
   - Live metric updates via WebSocket
   - Activity feed
   - Collaborative analytics

4. **Data Export**
   - Scheduled reports
   - API access
   - Integration with BI tools

## API Reference

### Endpoints (Future)

```typescript
GET /api/analytics/stats
  ?timeRange=week|month|year
  ?metrics=memories,collections,tags,entities

GET /api/analytics/trends
  ?metric=memory_growth
  ?groupBy=day|week|month

GET /api/analytics/search
  ?limit=10
  ?timeRange=month
```

### Response Format

```json
{
  "stats": {
    "totalMemories": 1234,
    "totalCollections": 15,
    "totalTags": 89,
    "totalEntities": 567
  },
  "trends": {
    "memoryGrowth": [
      { "date": "2024-01-01", "count": 45 }
    ]
  },
  "metadata": {
    "calculatedAt": "2024-01-15T10:30:00Z",
    "timeRange": "month"
  }
}
```