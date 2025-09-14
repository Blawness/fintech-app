# Chart Usage Documentation

## Overview

Dokumentasi ini menjelaskan cara menggunakan TradingView Lightweight Charts v5.0 dalam aplikasi fintech. Chart digunakan untuk menampilkan data harga investasi dengan berbagai timeframe dan fitur interaktif.

## Komponen Chart

### FinalV5Chart

Komponen utama untuk menampilkan chart investasi dengan fitur lengkap.

**Lokasi**: `components/ui/final-v5-chart.tsx`

**Props**:
```typescript
interface FinalV5ChartProps {
  product: {
    id: string
    name: string
    currentPrice: number
    riskLevel: string
    expectedReturn: number
    category: string
  }
  className?: string
}
```

## Fitur Chart

### 1. Timeframe Selection
- **1H**: 1 jam
- **4H**: 4 jam
- **1D**: 1 hari
- **1W**: 1 minggu
- **1M**: 1 bulan

### 2. Chart Types
- **Line Chart**: Menampilkan pergerakan harga
- **Volume Histogram**: Menampilkan volume transaksi (opsional)

### 3. Interactive Features
- **Price Change Indicator**: Menampilkan perubahan harga dengan warna
- **Chart Info**: 24H High/Low, Volume, Data Points
- **Debug Tools**: Force update button (development mode)

## Implementasi

### 1. Import Chart Component

```typescript
import FinalV5Chart from '@/components/ui/final-v5-chart'
```

### 2. Basic Usage

```tsx
<FinalV5Chart 
  product={product} 
  className="custom-chart-class"
/>
```

### 3. Integration dengan Investment Modal

```tsx
// app/investment/investment-modal.tsx
{activeTab === 'chart' && (
  <div className="space-y-6">
    <FinalV5Chart product={product} />
    {/* Product Information */}
  </div>
)}
```

## API Integration

### Data Source
Chart menggunakan API endpoint `/api/market/history` untuk mengambil data:

```typescript
const response = await fetch(`/api/market/history?productId=${product.id}&hours=${hours}&limit=100`)
```

### Data Format
```typescript
interface ChartData {
  time: number      // Unix timestamp
  open: number      // Harga pembukaan
  high: number      // Harga tertinggi
  low: number       // Harga terendah
  close: number     // Harga penutupan
  volume: number    // Volume transaksi
}
```

## Konfigurasi Chart

### Chart Options
```typescript
const chart = createChart(container, {
  layout: {
    background: { type: ColorType.Solid, color: '#ffffff' },
    textColor: '#333333',
  },
  width: container.clientWidth || 800,
  height: 400,
  grid: {
    vertLines: { color: '#f0f0f0' },
    horzLines: { color: '#f0f0f0' },
  },
  rightPriceScale: {
    borderColor: '#cccccc',
    scaleMargins: {
      top: 0.1,
      bottom: 0.1,
    },
  },
  timeScale: {
    borderColor: '#cccccc',
    timeVisible: true,
    secondsVisible: false,
  },
})
```

### Line Series Options
```typescript
const lineSeries = chart.addSeries(LineSeries, {
  color: '#26a69a',
  lineWidth: 2,
  priceLineVisible: true,
  lastValueVisible: true,
})
```

## Styling

### CSS Classes
- **Chart Container**: `w-full bg-white rounded-lg border-2 border-gray-200`
- **Header**: `p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50`
- **Timeframe Buttons**: `px-4 py-2 rounded-lg text-sm font-medium`
- **Info Cards**: `bg-gray-50 rounded-lg p-3`

### Responsive Design
- Chart container memiliki fixed height: `450px`
- Responsive width menggunakan `container.clientWidth`
- Grid layout untuk info cards: `grid-cols-2 md:grid-cols-4`

## Error Handling

### Error States
1. **Loading State**: Menampilkan spinner saat mengambil data
2. **Error State**: Menampilkan pesan error dengan tombol retry
3. **No Data State**: Menampilkan pesan jika tidak ada data

### Debug Tools
- **Debug Panel**: Menampilkan status chart (development mode)
- **Force Update Button**: Memaksa update chart
- **Console Logging**: Logging detail untuk debugging

## Performance Optimization

### 1. Data Validation
```typescript
// Sort and validate data
const sortedData = [...chartData].sort((a, b) => a.time - b.time)
const uniqueData = []
const seenTimes = new Set()

for (const item of sortedData) {
  if (!seenTimes.has(item.time) && 
      typeof item.time === 'number' && 
      item.time > 0 &&
      typeof item.close === 'number' &&
      !isNaN(item.close) &&
      item.close > 0) {
    seenTimes.add(item.time)
    uniqueData.push(item)
  }
}
```

### 2. Container Timing
```typescript
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

### 3. Cleanup
```typescript
const cleanupChart = useCallback(() => {
  if (chartRef.current) {
    try {
      chartRef.current.remove()
      chartRef.current = null
      lineSeriesRef.current = null
      setIsChartReady(false)
    } catch (err) {
      console.error('Cleanup error:', err)
    }
  }
}, [])
```

## Troubleshooting

### Common Issues

1. **Chart tidak muncul**
   - Pastikan container sudah siap
   - Check console untuk error messages
   - Gunakan debug panel untuk status

2. **Data tidak update**
   - Pastikan API endpoint berfungsi
   - Check data format sesuai interface
   - Gunakan force update button

3. **Timeframe switching tidak berfungsi**
   - Pastikan state management benar
   - Check useEffect dependencies
   - Verify API call parameters

### Debug Steps

1. **Enable Debug Mode**
   ```typescript
   {process.env.NODE_ENV === 'development' && (
     <div className="p-2 bg-gray-100 text-xs text-gray-600 border-b">
       Chart: {isChartReady ? 'Ready' : 'Not Ready'} | 
       Data: {chartData.length} | 
       Timeframe: {selectedTimeframe}
     </div>
   )}
   ```

2. **Check Console Logs**
   - `[FinalV5Chart] === INITIALIZE START ===`
   - `[FinalV5Chart] Container found!`
   - `[FinalV5Chart] Line series created successfully`
   - `[FinalV5Chart] Chart updated successfully`

3. **Use Force Update**
   - Klik tombol "Force Update" di debug panel
   - Check console untuk manual update logs

## Best Practices

### 1. Data Management
- Selalu validasi data sebelum update chart
- Gunakan unique timestamps untuk menghindari duplikasi
- Sort data berdasarkan waktu

### 2. Performance
- Gunakan useCallback untuk functions
- Implement proper cleanup
- Avoid unnecessary re-renders

### 3. Error Handling
- Implement try-catch untuk semua operations
- Provide user-friendly error messages
- Include retry mechanisms

### 4. Accessibility
- Gunakan semantic HTML
- Provide alt text untuk icons
- Ensure keyboard navigation

## Dependencies

### Required Packages
```json
{
  "lightweight-charts": "^5.0.8"
}
```

### Required Imports
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

## Version Compatibility

- **Lightweight Charts**: v5.0.8
- **React**: 18+
- **TypeScript**: 4.9+
- **Next.js**: 13+

## Support

Untuk pertanyaan atau masalah terkait chart, silakan:
1. Check console logs untuk error details
2. Gunakan debug tools yang tersedia
3. Refer ke dokumentasi Lightweight Charts resmi
4. Contact development team
