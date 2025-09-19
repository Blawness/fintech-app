# Market Configuration Guide

## Overview

The market configuration system allows administrators to dynamically adjust the market simulation parameters without restarting the application. This provides real-time control over how the market simulator behaves.

## Features

### 1. Risk Level Volatility Configuration
- **KONSERVATIF**: Conservative products volatility (default: 0.05%)
- **MODERAT**: Moderate products volatility (default: 0.2%)
- **AGRESIF**: Aggressive products volatility (default: 0.5%)

### 2. Product Type Volatility Multipliers
- **PASAR_UANG**: Money market multiplier (default: 0.3)
- **OBLIGASI**: Bonds multiplier (default: 0.5)
- **CAMPURAN**: Mixed products multiplier (default: 0.8)
- **SAHAM**: Stocks multiplier (default: 1.2)

### 3. Algorithm Factors
- **Market Trend Factor**: Percentage that follows expected return trend (default: 85%)
- **Random Factor**: Percentage of random movement (default: 15%)
- **Mean Reversion Factor**: Mean reversion for conservative products (default: 10%)
- **Min Price Floor**: Minimum price as percentage of original (default: 5%)

### 4. Simulation Settings
- **Simulation Interval**: Time between price updates in milliseconds (default: 10,000ms)

## How to Use

### Accessing Configuration
1. Navigate to Admin Panel → Market Control
2. Click "Show Configuration" button
3. Adjust parameters using the input fields
4. Click "Save Configuration" to apply changes
5. Use "Reset to Saved" to discard unsaved changes
6. Use "Reset to Defaults" to restore original values

### Save System
- **Temporary Changes**: All changes are stored temporarily until you click "Save Configuration"
- **Unsaved Indicator**: Orange text shows when you have unsaved changes
- **Reset Options**: 
  - "Reset to Saved": Discard unsaved changes and return to last saved state
  - "Reset to Defaults": Restore original default values
- **Real-time Updates**: Once saved, changes are immediately applied to the running market simulator

### API Endpoints

#### Get Configuration
```http
GET /api/admin/market-config
```

#### Update Configuration
```http
POST /api/admin/market-config
Content-Type: application/json

{
  "config": {
    "riskVolatility": {
      "KONSERVATIF": 0.001,
      "MODERAT": 0.003,
      "AGRESIF": 0.008
    },
    "marketTrendFactor": 0.85,
    "randomFactor": 0.15
  }
}
```

#### Update Single Value
```http
PUT /api/admin/market-config
Content-Type: application/json

{
  "key": "marketTrendFactor",
  "value": 0.9
}
```

## Configuration Validation

The system validates all configuration values:
- Risk volatility: 0 to 1 (0% to 100%) - Supports very low values down to 0.0001 (0.01%)
- Type volatility: 0 to 5 (0x to 5x multiplier)
- Algorithm factors: 0 to 1 (0% to 100%)
- Simulation interval: 1,000 to 300,000 ms (1 second to 5 minutes)

### Low Risk Volatility Support
The system now supports extremely low volatility values for very conservative market simulations:
- Minimum step: 0.0001 (0.01%)
- Display precision: 3 decimal places
- Ideal for stable, low-risk investment products

## Default Values

```javascript
{
  riskVolatility: {
    KONSERVATIF: 0.0005, // 0.05%
    MODERAT: 0.002,      // 0.2%
    AGRESIF: 0.005       // 0.5%
  },
  typeVolatility: {
    PASAR_UANG: 0.3,     // 0.3x
    OBLIGASI: 0.5,       // 0.5x
    CAMPURAN: 0.8,       // 0.8x
    SAHAM: 1.2           // 1.2x
  },
  marketTrendFactor: 0.85,    // 85%
  randomFactor: 0.15,         // 15%
  meanReversionFactor: 0.1,   // 10%
  minPriceFloor: 0.05,        // 5%
  simulationInterval: 10000   // 10 seconds
}
```

## Best Practices

1. **Start Conservative**: Begin with default values and adjust gradually
2. **Monitor Performance**: Watch how changes affect market behavior
3. **Test Changes**: Use the "Simulate Once" button to test changes
4. **Backup Settings**: Note down working configurations
5. **Gradual Changes**: Make small adjustments rather than large changes

## Troubleshooting

### Configuration Not Updating
- Check if you have admin permissions
- Verify the market simulator is running
- Check browser console for errors

### Invalid Values
- Ensure values are within the valid ranges
- Check for proper number formatting
- Verify decimal points are used correctly

### Performance Issues
- Lower simulation interval for more frequent updates
- Increase random factor for more volatility
- Adjust risk volatility based on desired market behavior

## Technical Details

### Database Storage
Configuration is stored in the `system_settings` table with keys prefixed by `market_config_`.

### Real-time Updates
The market simulator automatically refreshes its configuration when changes are made, ensuring immediate effect without restart.

### Validation
All configuration values are validated both on the frontend and backend to ensure system stability.
