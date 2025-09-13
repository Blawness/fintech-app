'use client'

import { useEffect } from 'react'

export function MarketSimulatorInit() {
  useEffect(() => {
    // Initialize market simulator on client side
    // This ensures it only runs in the browser
    if (typeof window !== 'undefined') {
      // Import and start market simulator
      import('@/lib/market-simulator').then(({ marketSimulator }) => {
        if (!marketSimulator.isSimulationRunning()) {
          console.log('Starting market simulator...')
          marketSimulator.start(10000) // 10 seconds interval
        }
      }).catch(error => {
        console.error('Failed to start market simulator:', error)
      })
    }
  }, [])

  // This component doesn't render anything
  return null
}
