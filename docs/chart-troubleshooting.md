# Chart Troubleshooting Guide

## Common Issues and Solutions

### 1. Chart Not Rendering

**Symptoms:**
- Chart container shows loading spinner indefinitely
- Empty white space where chart should be
- Console errors related to chart initialization

**Possible Causes:**
- Container not ready when chart initializes
- Missing or incorrect data
- API errors
- Lightweight Charts version compatibility

**Solutions:**

#### Check Container Timing
```typescript
// Ensure container is ready before chart creation
const waitForContainer = useCallback((): Promise<HTMLDivElement> => {
  return new Promise((resolve, reject) => {
    let attempts = 0
    const maxAttempts = 20
    const checkInterval = 50

    const checkContainer = () => {
      if (chartContainerRef.current) {
        resolve(chartContainerRef.current)
      } else if (attempts >= maxAttempts) {
        reject(new Error('Container not found'))
      } else {
        setTimeout(checkContainer, checkInterval)
      }
    }
    checkContainer()
  })
}, [])
```

#### Verify Data Format
```typescript
// Ensure data has correct format
const lineData: LineData[] = uniqueData.map(item => ({
  time: item.time as Time, // Must be Time type
  value: item.close        // Must be number
}))
```

#### Check API Response
```typescript
// Verify API is returning data
console.log('API Response:', result.data.chartData.length, 'points')
if (result.data.chartData.length === 0) {
  console.warn('No data received from API')
}
```

### 2. Assertion Failed Errors

**Symptoms:**
- `Error: Assertion failed` in console
- Chart fails to initialize
- Series creation fails

**Solutions:**

#### Use Correct API
```typescript
// ❌ WRONG - causes assertion errors
const lineSeries = chart.addSeries('Line', options)

// ✅ CORRECT - v5.0 API
import { LineSeries } from 'lightweight-charts'
const lineSeries = chart.addSeries(LineSeries, options)
```

#### Minimal Configuration
```typescript
// Start with minimal options
const lineSeries = chart.addSeries(LineSeries, {
  color: '#26a69a',
  lineWidth: 2,
})
```

### 3. Chart Disappears on Timeframe Switch

**Symptoms:**
- Chart renders initially
- Disappears when switching timeframes
- Data updates but chart becomes empty

**Solutions:**

#### Proper State Management
```typescript
// Ensure chart is ready before data updates
useEffect(() => {
  if (isChartReady && chartData.length > 0 && lineSeriesRef.current) {
    updateChart()
  }
}, [chartData, isChartReady, updateChart])
```

#### Data Validation
```typescript
// Validate data before updating
const updateChart = useCallback(() => {
  if (!lineSeriesRef.current || chartData.length === 0) {
    return
  }

  // Sort and validate data
  const sortedData = [...chartData].sort((a, b) => a.time - b.time)
  const validData = sortedData.filter(item => 
    typeof item.time === 'number' && 
    typeof item.close === 'number' &&
    !isNaN(item.close) &&
    item.close > 0
  )

  if (validData.length === 0) {
    console.warn('No valid data to display')
    return
  }

  lineSeriesRef.current.setData(validData)
}, [chartData])
```

### 4. Performance Issues

**Symptoms:**
- Slow chart rendering
- Laggy interactions
- High memory usage

**Solutions:**

#### Optimize Data Updates
```typescript
// Use useCallback to prevent unnecessary re-renders
const updateChart = useCallback(() => {
  // Update logic here
}, [chartData])

// Debounce data updates
const debouncedUpdate = useMemo(
  () => debounce(updateChart, 300),
  [updateChart]
)
```

#### Limit Data Points
```typescript
// Limit data points for better performance
const response = await fetch(`/api/market/history?productId=${product.id}&hours=${hours}&limit=100`)
```

#### Proper Cleanup
```typescript
// Clean up chart on unmount
useEffect(() => {
  return () => {
    if (chartRef.current) {
      chartRef.current.remove()
    }
  }
}, [])
```

### 5. TypeScript Errors

**Symptoms:**
- Type errors in chart implementation
- Missing type definitions
- Compilation errors

**Solutions:**

#### Correct Imports
```typescript
import { 
  createChart, 
  ColorType, 
  IChartApi, 
  ISeriesApi, 
  LineData, 
  LineSeries, 
  Time 
} from 'lightweight-charts'
```

#### Type Assertions
```typescript
// Cast time to Time type
const lineData: LineData[] = uniqueData.map(item => ({
  time: item.time as Time,
  value: item.close
}))
```

### 6. Styling Issues

**Symptoms:**
- Chart not responsive
- Incorrect colors or styling
- Layout problems

**Solutions:**

#### Responsive Container
```typescript
// Ensure container has proper dimensions
<div 
  ref={chartContainerRef} 
  className="w-full bg-white rounded-lg border-2 border-gray-200"
  style={{ 
    height: '450px',
    minHeight: '450px',
    maxHeight: '450px'
  }}
>
```

#### Handle Resize
```typescript
// Update chart width on resize
const handleResize = () => {
  if (chartContainerRef.current && chartRef.current) {
    chartRef.current.applyOptions({
      width: chartContainerRef.current.clientWidth,
    })
  }
}

window.addEventListener('resize', handleResize)
```

## Debug Tools

### 1. Debug Panel
```typescript
{process.env.NODE_ENV === 'development' && (
  <div className="p-2 bg-gray-100 text-xs text-gray-600 border-b">
    Chart: {isChartReady ? 'Ready' : 'Not Ready'} | 
    Data: {chartData.length} | 
    Timeframe: {selectedTimeframe} | 
    Loading: {loading ? 'Yes' : 'No'}
  </div>
)}
```

### 2. Console Logging
```typescript
// Add detailed logging
console.log('[Chart] Initializing...')
console.log('[Chart] Container found:', !!chartContainerRef.current)
console.log('[Chart] Data points:', chartData.length)
console.log('[Chart] Series created:', !!lineSeriesRef.current)
```

### 3. Force Update Button
```typescript
{process.env.NODE_ENV === 'development' && (
  <button
    onClick={() => {
      console.log('[Chart] Manual update triggered')
      if (chartData.length > 0) {
        updateChart()
      } else {
        fetchChartData(hours)
      }
    }}
    className="px-4 py-2 rounded-lg text-sm font-medium bg-yellow-100 text-yellow-700"
  >
    Force Update
  </button>
)}
```

## Testing Checklist

### Before Deployment
- [ ] Chart renders on initial load
- [ ] Timeframe switching works
- [ ] Data updates correctly
- [ ] Responsive design works
- [ ] No console errors
- [ ] Performance is acceptable
- [ ] Error states display properly

### Common Test Cases
1. **Empty Data**: Test with no data from API
2. **Invalid Data**: Test with malformed data
3. **Network Errors**: Test with API failures
4. **Rapid Switching**: Test quick timeframe changes
5. **Window Resize**: Test responsive behavior
6. **Long Sessions**: Test for memory leaks

## Performance Monitoring

### Key Metrics
- Chart initialization time
- Data update frequency
- Memory usage
- Render performance
- User interaction response

### Optimization Tips
1. **Limit Data Points**: Use reasonable limits (100-500 points)
2. **Debounce Updates**: Prevent excessive updates
3. **Lazy Loading**: Load chart only when needed
4. **Proper Cleanup**: Remove event listeners and chart instances
5. **Efficient Rendering**: Use React.memo for components

## Support Resources

### Documentation
- [Lightweight Charts v5.0 Docs](https://tradingview.github.io/lightweight-charts/)
- [Chart Usage Guide](./chart-usage.md)
- [API Reference](./api.md)

### Common Patterns
- Container timing patterns
- Data validation patterns
- Error handling patterns
- Performance optimization patterns

### Getting Help
1. Check console logs for errors
2. Use debug tools to identify issues
3. Refer to this troubleshooting guide
4. Check Lightweight Charts documentation
5. Contact development team
