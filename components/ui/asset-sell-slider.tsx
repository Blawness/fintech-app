'use client'

import { useState, useEffect } from 'react'
import { Slider } from './slider'
import { Button } from './button'
import { cn } from '@/lib/utils'

// Utility function for consistent rounding
const roundToDecimals = (value: number, decimals: number = 4): number => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

interface AssetSellSliderProps {
  maxUnits: number
  currentPrice: number
  averagePrice: number
  onUnitsChange: (units: number) => void
  className?: string
}

export function AssetSellSlider({ 
  maxUnits, 
  currentPrice, 
  averagePrice, 
  onUnitsChange,
  className 
}: AssetSellSliderProps) {
  const [sliderValue, setSliderValue] = useState([0])
  const [inputValue, setInputValue] = useState('')
  const [isInputFocused, setIsInputFocused] = useState(false)

  // Calculate units based on slider value (0-100 percentage) with consistent rounding
  const units = roundToDecimals((sliderValue[0] / 100) * maxUnits, 4)
  const totalValue = roundToDecimals(units * currentPrice, 2)
  const gain = roundToDecimals((currentPrice - averagePrice) * units, 2)
  const gainPercent = averagePrice > 0 ? roundToDecimals(((currentPrice - averagePrice) / averagePrice) * 100, 2) : 0

  // Update input value when slider changes
  useEffect(() => {
    if (!isInputFocused) {
      // Format with Indonesian locale (comma as decimal separator)
      setInputValue(units.toFixed(4).replace('.', ','))
    }
  }, [units, isInputFocused])

  // Helper function to parse number with both dot and comma decimal separators
  const parseNumber = (value: string): number => {
    // Replace comma with dot for Indonesian locale format
    const normalizedValue = value.replace(',', '.')
    return parseFloat(normalizedValue)
  }

  // Update slider when input changes
  const handleInputChange = (value: string) => {
    setInputValue(value)
    const numValue = parseNumber(value)
    
    if (!isNaN(numValue) && numValue >= 0) {
      // Round the input value to 4 decimals for consistency
      const roundedValue = roundToDecimals(numValue, 4)
      
      // Check if rounded value is within max units (with small tolerance)
      const tolerance = 0.0001
      const isValid = roundedValue <= (maxUnits + tolerance)
      
      if (isValid) {
        const percentage = (roundedValue / maxUnits) * 100
        setSliderValue([Math.min(100, Math.max(0, percentage))])
        onUnitsChange(roundedValue)
      }
    }
  }

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value)
    const newUnits = roundToDecimals((value[0] / 100) * maxUnits, 4)
    onUnitsChange(newUnits)
  }

  const handlePercentageClick = (percentage: number) => {
    const newValue = [percentage]
    setSliderValue(newValue)
    const newUnits = roundToDecimals((percentage / 100) * maxUnits, 4)
    onUnitsChange(newUnits)
  }

  const percentageButtons = [
    { label: '25%', value: 25 },
    { label: '50%', value: 50 },
    { label: '75%', value: 75 },
    { label: '100%', value: 100 }
  ]

  return (
    <div className={cn("space-y-4", className)}>
      {/* Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Jumlah Unit yang Dijual
          </label>
          <span className="text-sm text-gray-500">
            {sliderValue[0].toFixed(0)}% dari total
          </span>
        </div>
        
        <Slider
          value={sliderValue}
          onValueChange={handleSliderChange}
          max={100}
          step={0.1}
          className="w-full"
        />
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Input Field */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Unit (Manual Input)
        </label>
        <input
          type="number"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          placeholder={`Maksimal ${maxUnits.toFixed(4)} unit`}
          min="0"
          max={maxUnits}
          step="0.0001"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500">
          Maksimal: {maxUnits.toFixed(4)} unit
        </p>
      </div>

      {/* Quick Percentage Buttons */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Pilih Persentase
        </label>
        <div className="grid grid-cols-4 gap-2">
          {percentageButtons.map((button) => (
            <Button
              key={button.value}
              type="button"
              variant={sliderValue[0] === button.value ? "default" : "outline"}
              size="sm"
              onClick={() => handlePercentageClick(button.value)}
              className={cn(
                "text-xs",
                sliderValue[0] === button.value && "bg-blue-600 text-white"
              )}
            >
              {button.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Calculation Display */}
      {units > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 bg-red-600 rounded-full"></div>
            <span className="text-sm font-medium text-red-900">Perhitungan Penjualan</span>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-red-700">Unit Dijual:</span>
              <span className="font-medium text-red-900">
                {units.toFixed(4)} unit
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-red-700">Total Penjualan:</span>
              <span className="font-medium text-red-900">
                Rp {totalValue.toLocaleString('id-ID')}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-red-700">Keuntungan:</span>
              <span className={cn(
                "font-medium",
                gain >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {gain >= 0 ? '+' : ''}Rp {gain.toLocaleString('id-ID')}
                ({gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
