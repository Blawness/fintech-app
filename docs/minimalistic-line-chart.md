# Minimalistic Line Chart Documentation

## Overview

Komponen `MinimalisticLineChart` adalah implementasi chart line yang bersih dan minimalistic untuk menampilkan data investasi. Chart ini dirancang untuk memberikan tampilan yang sederhana namun informatif, fokus pada data harga tanpa elemen candlestick yang kompleks.

## Karakteristik

### Desain Minimalistic
- **Line Chart Sederhana**: Menggunakan line chart hijau yang bersih
- **Layout Bersih**: Tidak ada elemen yang berlebihan atau mengganggu
- **Fokus pada Data**: Menampilkan informasi harga yang penting
- **Warna Konsisten**: Menggunakan skema warna yang konsisten

### Fitur Utama
- **Timeframe Selection**: 1D, 5D, 1M, 6M, YTD, 1Y, 5Y, MAX
- **Price Change Indicator**: Menampilkan perubahan harga dengan warna
- **Responsive Design**: Menyesuaikan dengan berbagai ukuran layar
- **Loading States**: Indikator loading yang smooth
- **Error Handling**: Penanganan error yang user-friendly

## Implementasi

### Import Component
```typescript
import MinimalisticLineChart from '@/components/ui/minimalistic-line-chart'
```

### Basic Usage
```tsx
<MinimalisticLineChart 
  product={{
    id: '1',
    name: 'Amazon.com Inc',
    currentPrice: 146.79,
    riskLevel: 'AGRESIF',
    expectedReturn: 15.5,
    category: 'Technology'
  }}
  className="w-full"
/>
```

### Props Interface
```typescript
interface MinimalisticLineChartProps {
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

## Perbedaan dengan FinalV5Chart

### Yang Dihapus (Candlestick Features)
- ❌ Candlestick series
- ❌ Volume histogram
- ❌ Complex chart info (24H High/Low, Volume, Data Points)
- ❌ Debug tools
- ❌ Complex styling

### Yang Dipertahankan (Line Chart Features)
- ✅ Line chart sederhana
- ✅ Timeframe selection
- ✅ Price change indicator
- ✅ Basic product information
- ✅ Responsive design
- ✅ Error handling

## Styling

### CSS Classes
- **Container**: `bg-white rounded-lg border`
- **Header**: `p-6 border-b`
- **Chart Area**: `p-4`
- **Timeframe Buttons**: `px-3 py-1.5 rounded text-sm font-medium`

### Color Scheme
- **Line Color**: `#22c55e` (green-500)
- **Positive Change**: `text-green-600 bg-green-100`
- **Negative Change**: `text-red-600 bg-red-100`
- **Background**: `#ffffff` (white)

## Timeframe Options

| Label | Value | Hours | Description |
|-------|-------|-------|-------------|
| 1D    | 1D    | 24    | 1 Hari      |
| 5D    | 5D    | 120   | 5 Hari      |
| 1M    | 1M    | 720   | 1 Bulan     |
| 6M    | 6M    | 4320  | 6 Bulan     |
| YTD   | YTD   | 8760  | Year to Date|
| 1Y    | 1Y    | 8760  | 1 Tahun     |
| 5Y    | 5Y    | 43800 | 5 Tahun     |
| MAX   | MAX   | 87600 | Maksimal    |

## API Integration

### Data Source
Chart menggunakan API endpoint yang sama dengan `FinalV5Chart`:
```typescript
const response = await fetch(`/api/market/history?productId=${product.id}&hours=${hours}&limit=100`)
```

### Data Conversion
Data candlestick dikonversi menjadi line data:
```typescript
const lineData: ChartData[] = result.data.chartData.map((item: any) => ({
  time: item.time,
  value: item.close
}))
```

## Error Handling

### Error States
1. **Loading State**: Spinner saat mengambil data
2. **Error State**: Pesan error dengan tombol retry
3. **No Data State**: Pesan jika tidak ada data

### Error Messages
- Chart initialization failed
- Chart update failed
- Failed to fetch data

## Performance

### Optimizations
- Data validation sebelum update chart
- Unique timestamps untuk menghindari duplikasi
- Proper cleanup pada unmount
- Responsive resize handling

### Memory Management
- Chart cleanup saat component unmount
- Event listener cleanup
- Ref cleanup

## Usage Examples

### 1. Admin Market Page
```tsx
// app/admin/market/page.tsx
<MinimalisticLineChart 
  product={{
    id: 'demo',
    name: 'Sample Investment Product',
    currentPrice: 150000,
    riskLevel: 'MODERAT',
    expectedReturn: 12.5,
    category: 'Technology'
  }}
  className="w-full"
/>
```

### 2. Chart Demo Page
```tsx
// app/admin/market/chart-demo/page.tsx
<MinimalisticLineChart 
  product={selectedProduct}
  className="w-full"
/>
```

### 3. Investment Modal
```tsx
// app/investment/investment-modal.tsx
{activeTab === 'chart' && (
  <MinimalisticLineChart product={product} />
)}
```

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

## Best Practices

### 1. Data Management
- Selalu validasi data sebelum update chart
- Gunakan unique timestamps
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

## Troubleshooting

### Common Issues

1. **Chart tidak muncul**
   - Pastikan container sudah siap
   - Check console untuk error messages
   - Verify API endpoint berfungsi

2. **Data tidak update**
   - Pastikan data format sesuai interface
   - Check API response structure
   - Verify timeframe selection

3. **Styling issues**
   - Check CSS classes
   - Verify Tailwind CSS configuration
   - Check responsive breakpoints

### Debug Steps

1. **Check Console Logs**
   - `[MinimalisticLineChart] Fetching data...`
   - `[MinimalisticLineChart] Data received: X points`
   - `[MinimalisticLineChart] Chart updated successfully`

2. **Verify Data Format**
   ```typescript
   interface ChartData {
     time: number
     value: number
   }
   ```

3. **Check API Response**
   ```typescript
   {
     success: true,
     data: {
       chartData: [
         { time: 1234567890, close: 150.00, ... }
       ]
     }
   }
   ```

## Future Enhancements

### Potential Features
- [ ] Hover tooltips
- [ ] Zoom functionality
- [ ] Multiple timeframes
- [ ] Export functionality
- [ ] Custom themes

### Performance Improvements
- [ ] Data caching
- [ ] Virtual scrolling
- [ ] WebGL rendering
- [ ] Lazy loading

## Support

Untuk pertanyaan atau masalah terkait minimalistic line chart:
1. Check console logs untuk error details
2. Verify data format dan API response
3. Refer ke dokumentasi Lightweight Charts
4. Contact development team
