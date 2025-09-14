'use client'

import { useState, useEffect } from 'react'
import { Slider } from './slider'
import { Button } from './button'
import { cn } from '@/lib/utils'

// Utility function for consistent rounding
const roundToDecimals = (value: number, decimals: number = 4): number => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

interface AssetBuySliderProps {
  currentPrice: number
  minInvestment: number
  maxInvestment: number
  availableBalance: number
  onAmountChange: (amount: number) => void
  className?: string
}

export function AssetBuySlider({ 
  currentPrice, 
  minInvestment, 
  maxInvestment, 
  availableBalance,
  onAmountChange,
  className 
}: AssetBuySliderProps) {
  const [sliderValue, setSliderValue] = useState([0])
  const [inputValue, setInputValue] = useState('')
  const [isInputFocused, setIsInputFocused] = useState(false)

  // Calculate actual max investment (limited by available balance)
  const actualMaxInvestment = Math.min(maxInvestment, availableBalance)
  
  // Calculate amount based on slider value (0-100 percentage)
  const amount = roundToDecimals((sliderValue[0] / 100) * actualMaxInvestment, 2)
  const units = roundToDecimals(amount / currentPrice, 4)
  const totalValue = roundToDecimals(amount, 2)

  // Update input value when slider changes
  useEffect(() => {
    if (!isInputFocused) {
      // Format with Indonesian locale (comma as decimal separator)
      setInputValue(amount.toFixed(2).replace('.', ','))
    }
  }, [amount, isInputFocused])

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
      // Round the input value to 2 decimals for consistency
      const roundedValue = roundToDecimals(numValue, 2)
      
      // Use tolerance for floating-point comparison
      const tolerance = 0.01
      const isValid = roundedValue >= (minInvestment - tolerance) && roundedValue <= (actualMaxInvestment + tolerance)
      
      if (isValid) {
        const percentage = (roundedValue / actualMaxInvestment) * 100
        setSliderValue([Math.min(100, Math.max(0, percentage))])
        onAmountChange(roundedValue)
      }
    }
  }

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value)
    const newAmount = roundToDecimals((value[0] / 100) * actualMaxInvestment, 2)
    onAmountChange(newAmount)
  }

  const handlePercentageClick = (percentage: number) => {
    const newValue = [percentage]
    setSliderValue(newValue)
    const newAmount = roundToDecimals((percentage / 100) * actualMaxInvestment, 2)
    onAmountChange(newAmount)
  }

  const handleAmountClick = (amount: number) => {
    const roundedAmount = roundToDecimals(amount, 2)
    const percentage = (roundedAmount / actualMaxInvestment) * 100
    setSliderValue([Math.min(100, Math.max(0, percentage))])
    onAmountChange(roundedAmount)
  }

  const percentageButtons = [
    { label: '25%', value: 25 },
    { label: '50%', value: 50 },
    { label: '75%', value: 75 },
    { label: '100%', value: 100 }
  ]

  const amountButtons = [
    { label: 'Min', value: minInvestment },
    { label: '100K', value: 100000 },
    { label: '500K', value: 500000 },
    { label: '1M', value: 1000000 },
    { label: '5M', value: 5000000 }
  ].filter(btn => btn.value <= actualMaxInvestment)

  return (
    <div className={cn("space-y-4", className)}>
      {/* Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Jumlah Investasi
          </label>
          <span className="text-sm text-gray-500">
            {sliderValue[0].toFixed(0)}% dari maksimal
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
          Jumlah (Manual Input)
        </label>
        <input
          type="number"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          placeholder={`Min: Rp ${minInvestment.toLocaleString('id-ID')}`}
          min={minInvestment}
          max={actualMaxInvestment}
          step="1000"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500">
          Maksimal: Rp {actualMaxInvestment.toLocaleString('id-ID')}
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

      {/* Quick Amount Buttons */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Pilih Jumlah Cepat
        </label>
        <div className="grid grid-cols-3 gap-2">
          {amountButtons.map((button) => (
            <Button
              key={button.value}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAmountClick(button.value)}
              className="text-xs"
            >
              {button.label === 'Min' ? 'Min' : 
               button.value >= 1000000 ? `${button.value / 1000000}M` :
               `${button.value / 1000}K`}
            </Button>
          ))}
        </div>
      </div>

      {/* Calculation Display */}
      {amount > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 bg-green-600 rounded-full"></div>
            <span className="text-sm font-medium text-green-900">Perhitungan Pembelian</span>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-green-700">Jumlah Investasi:</span>
              <span className="font-medium text-green-900">
                Rp {amount.toLocaleString('id-ID')}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-green-700">Unit yang Dibeli:</span>
              <span className="font-medium text-green-900">
                {units.toFixed(4)} unit
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-green-700">Harga per Unit:</span>
              <span className="font-medium text-green-900">
                Rp {currentPrice.toLocaleString('id-ID')}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-green-700">Total Nilai:</span>
              <span className="font-medium text-green-900">
                Rp {totalValue.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
