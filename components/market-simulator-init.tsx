'use client'

import { useEffect } from 'react'

export function MarketSimulatorInit() {
  useEffect(() => {
    // Market simulator should run on server-side only
    // This component is just a placeholder for client-side initialization
    // The actual market simulator will be started via API calls
    
    // Check if market simulator is running
    const checkMarketStatus = async () => {
      try {
        const response = await fetch('/api/market/control')
        const data = await response.json()
        console.log('Market simulator status:', data.isRunning ? 'Running' : 'Stopped')
      } catch (error) {
        console.log('Market simulator not accessible from client')
      }
    }

    checkMarketStatus()
  }, [])

  // This component doesn't render anything
  return null
}
