# Analytics Dashboard Implementation Guide

## Overview

The Analytics Dashboard provides comprehensive insights into memory usage, search patterns, and system performance. Built with React, TypeScript, and Recharts, it offers real-time data visualization and export capabilities.

## Architecture

### Components Structure

```
src/
├── pages/
│   └── AnalyticsPage.tsx          # Main analytics dashboard
├── stores/
│   └── analyticsStore.ts          # Analytics state management
└── components/
    └── analytics/
        ├── MetricCard.tsx         # Reusable metric display
        ├── TimeRangeSelector.tsx  # Period selection
        └── ChartContainer.tsx     # Chart wrapper component
```

## Implementation Details

### 1. Analytics Page Component

```typescript
// src/pages/AnalyticsPage.tsx
export function AnalyticsPage() {
  const { memories } = useMemoryStore();
  const { collections } = useCollectionStore();
  const { stats, loading, timeRange, fetchStats, setTimeRange } = useAnalyticsStore();
  
  // Calculate local statistics from store data
  useEffect(() => {
    calculateLocalStats();
  }, [memories, collections, timeRange]);
  
  return (
    <div className="container mx-auto p-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Memories" value={stats.totalMemories} />
        <MetricCard title="Collections" value={stats.totalCollections} />
        <MetricCard title="Total Tags" value={stats.totalTags} />
        <MetricCard title="Entities" value={stats.totalEntities} />
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <MemoryGrowthChart data={stats.memoryGrowth} />
        <CollectionDistributionChart data={stats.collectionDistribution} />
        <TagUsageChart data={stats.tagUsage} />
        <EntityTypesChart data={stats.entityTypes} />
      </div>
    </div>
  );
}
```

### 2. Analytics Store

```typescript
// src/stores/analyticsStore.ts
interface AnalyticsState {
  stats: {
    totalMemories: number;
    totalCollections: number;
    totalTags: number;
    totalEntities: number;
    memoryGrowth: TimeSeriesData[];
    collectionDistribution: PieData[];
    tagUsage: BarData[];
    entityTypes: BarData[];
  };
  timeRange: 'week' | 'month' | 'year';
  loading: boolean;
  
  fetchStats: () => Promise<void>;
  setTimeRange: (range: 'week' | 'month' | 'year') => void;
  calculateLocalStats: () => void;
}
```

### 3. Data Visualizations

#### Memory Growth Chart
- **Type**: Area Chart
- **Data**: Time-series memory creation data
- **Features**: Smooth animations, tooltips, responsive

#### Collection Distribution
- **Type**: Pie Chart
- **Data**: Memory count per collection
- **Features**: Interactive labels, custom colors

#### Tag Usage
- **Type**: Bar Chart
- **Data**: Top 10 most used tags
- **Features**: Horizontal bars, count display

#### Entity Types
- **Type**: Bar Chart
- **Data**: Entity type frequency
- **Features**: Sorted by count, type labels

## Key Features

### 1. Time Range Filtering
```typescript
const timeRanges = ['week', 'month', 'year'];
const filterDataByTimeRange = (data: any[], range: string) => {
  const now = new Date();
  const startDate = new Date();
  
  switch (range) {
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }
  
  return data.filter(item => new Date(item.date) >= startDate);
};
```

### 2. Real-time Updates
- Integrated with WebSocket for live data
- Auto-refresh on memory/collection changes
- Optimistic UI updates

### 3. Performance Metrics
- Search success rate
- Average response time
- API call statistics
- Cache hit rate
- System uptime

### 4. Export Functionality
```typescript
const exportAnalytics = () => {
  const data = {
    generatedAt: new Date().toISOString(),
    timeRange,
    statistics: stats,
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `analytics-${timeRange}-${Date.now()}.json`;
  a.click();
};
```

## Responsive Design

### Mobile Optimizations
- Single column layout on small screens
- Touch-friendly chart interactions
- Simplified metric displays
- Horizontal scroll for charts

### Tablet Adjustments
- 2-column grid for metrics
- Side-by-side chart layout
- Optimized font sizes

## Testing

### Unit Tests
```typescript
describe('AnalyticsPage', () => {
  it('displays correct metric values', () => {
    const { getByText } = render(<AnalyticsPage />);
    expect(getByText('Total Memories')).toBeInTheDocument();
  });
  
  it('updates charts on time range change', async () => {
    const { getByText } = render(<AnalyticsPage />);
    fireEvent.click(getByText('Month'));
    await waitFor(() => {
      expect(mockFetchStats).toHaveBeenCalledWith('month');
    });
  });
});
```

### E2E Tests
```typescript
test('analytics dashboard displays all sections', async ({ page }) => {
  await page.goto('/analytics');
  
  // Check metrics
  await expect(page.locator('text=Total Memories')).toBeVisible();
  
  // Check charts
  const charts = page.locator('svg.recharts-surface');
  await expect(charts).toHaveCount(4);
  
  // Test time range
  await page.click('button:has-text("Year")');
  await expect(page.locator('button:has-text("Year")')).toHaveClass(/bg-primary/);
});
```

## Performance Considerations

### Data Optimization
- Local calculation for basic stats
- Debounced API calls
- Memoized chart data
- Lazy loading for heavy visualizations

### Bundle Size
- Chart library is dynamically imported
- Tree-shaking for unused chart types
- Minimal dependencies

## Future Enhancements

1. **Advanced Analytics**
   - Trend analysis
   - Predictive insights
   - Anomaly detection

2. **Custom Dashboards**
   - Drag-and-drop widgets
   - User-defined metrics
   - Saved dashboard layouts

3. **Export Options**
   - PDF reports
   - CSV data export
   - Scheduled reports

4. **Real-time Collaboration**
   - Shared dashboards
   - Team analytics
   - User activity tracking

## Troubleshooting

### Common Issues

1. **Charts not rendering**
   - Check if data is properly formatted
   - Verify Recharts is installed
   - Check for console errors

2. **Slow performance**
   - Reduce data points for large datasets
   - Enable virtual scrolling
   - Use pagination for lists

3. **Data not updating**
   - Verify WebSocket connection
   - Check store subscriptions
   - Ensure proper cleanup in useEffect

## API Integration

### Endpoints Used
- `GET /api/analytics/stats` - Fetch statistics
- `GET /api/analytics/metrics` - Performance metrics
- `GET /api/analytics/export` - Export data

### WebSocket Events
- `analytics:update` - Real-time stat updates
- `metrics:change` - Performance metric changes

## Security Considerations

- No sensitive data in analytics
- Aggregated statistics only
- User-scoped data filtering
- Rate limiting on exports