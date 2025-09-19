import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Types
type RiskVolatility = {
  KONSERVATIF: number
  MODERAT: number
  AGRESIF: number
}

type TypeVolatility = {
  PASAR_UANG: number
  OBLIGASI: number
  CAMPURAN: number
  SAHAM: number
}

export type MarketConfig = {
  riskVolatility: RiskVolatility
  typeVolatility: TypeVolatility
  marketTrendFactor: number
  randomFactor: number
  meanReversionFactor: number
  minPriceFloor: number
  simulationInterval: number
}

// Default market configuration
const DEFAULT_CONFIG: MarketConfig = {
  riskVolatility: {
    KONSERVATIF: 0.0005,  // 0.05% - Very low volatility
    MODERAT: 0.002,       // 0.2% - Low volatility
    AGRESIF: 0.005        // 0.5% - Moderate volatility
  },
  typeVolatility: {
    PASAR_UANG: 0.3,
    OBLIGASI: 0.5,
    CAMPURAN: 0.8,
    SAHAM: 1.2
  },
  marketTrendFactor: 0.85,
  randomFactor: 0.15,
  meanReversionFactor: 0.1,
  minPriceFloor: 0.05,
  simulationInterval: 10000
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all market configuration settings
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: {
          startsWith: 'market_config_'
        }
      }
    })

    // Convert settings to configuration object
    const config: MarketConfig = { ...DEFAULT_CONFIG }
    
    settings.forEach(setting => {
      const key = setting.key.replace('market_config_', '')
      try {
        ;(config as unknown as Record<string, unknown>)[key] = JSON.parse(setting.value)
      } catch (error) {
        console.error(`Error parsing setting ${setting.key}:`, error)
      }
    })

    return NextResponse.json({
      success: true,
      config
    })

  } catch (error) {
    console.error('Error fetching market configuration:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { config } = body as { config?: Partial<MarketConfig> }

    if (!config) {
      return NextResponse.json({ 
        error: 'Configuration data is required' 
      }, { status: 400 })
    }

    // Validate configuration
    const validation = validateConfiguration(config)
    if (!validation.valid) {
      return NextResponse.json({ 
        error: validation.error 
      }, { status: 400 })
    }

    // Save configuration to database
    const updatePromises = Object.entries(config).map(([key, value]) => 
      prisma.systemSetting.upsert({
        where: { key: `market_config_${key}` },
        update: { value: JSON.stringify(value) },
        create: { 
          key: `market_config_${key}`, 
          value: JSON.stringify(value) 
        }
      })
    )

    await Promise.all(updatePromises)

    return NextResponse.json({
      success: true,
      message: 'Market configuration updated successfully',
      config
    })

  } catch (error) {
    console.error('Error updating market configuration:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { key, value } = body as { key?: keyof MarketConfig; value?: unknown }

    if (!key || value === undefined) {
      return NextResponse.json({ 
        error: 'Key and value are required' 
      }, { status: 400 })
    }

    // Validate specific configuration
    const validation = validateSpecificConfig(key as keyof MarketConfig, value)
    if (!validation.valid) {
      return NextResponse.json({ 
        error: validation.error 
      }, { status: 400 })
    }

    // Update specific configuration
    await prisma.systemSetting.upsert({
      where: { key: `market_config_${key}` },
      update: { value: JSON.stringify(value) },
      create: { 
        key: `market_config_${key}`, 
        value: JSON.stringify(value) 
      }
    })

    return NextResponse.json({
      success: true,
      message: `${key} updated successfully`,
      key,
      value
    })

  } catch (error) {
    console.error('Error updating market configuration:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

function validateConfiguration(config: Partial<MarketConfig>): { valid: boolean; error?: string } {
  // Validate risk volatility
  if (config.riskVolatility) {
    const riskLevels = ['KONSERVATIF', 'MODERAT', 'AGRESIF']
    const rv = config.riskVolatility as RiskVolatility
    for (const level of riskLevels) {
      const key = level as keyof RiskVolatility
      if (rv[key] === undefined || 
          typeof rv[key] !== 'number' ||
          rv[key] < 0 ||
          rv[key] > 1) {
        return { valid: false, error: `Invalid risk volatility for ${level}. Must be between 0 and 1` }
      }
    }
  }

  // Validate type volatility
  if (config.typeVolatility) {
    const types = ['PASAR_UANG', 'OBLIGASI', 'CAMPURAN', 'SAHAM']
    const tv = config.typeVolatility as TypeVolatility
    for (const type of types) {
      const key = type as keyof TypeVolatility
      if (tv[key] === undefined || 
          typeof tv[key] !== 'number' ||
          tv[key] < 0 ||
          tv[key] > 5) {
        return { valid: false, error: `Invalid type volatility for ${type}` }
      }
    }
  }

  // Validate factors
  if (config.marketTrendFactor !== undefined) {
    if (typeof config.marketTrendFactor !== 'number' || 
        config.marketTrendFactor < 0 || 
        config.marketTrendFactor > 1) {
      return { valid: false, error: 'Market trend factor must be between 0 and 1' }
    }
  }

  if (config.randomFactor !== undefined) {
    if (typeof config.randomFactor !== 'number' || 
        config.randomFactor < 0 || 
        config.randomFactor > 1) {
      return { valid: false, error: 'Random factor must be between 0 and 1' }
    }
  }

  if (config.meanReversionFactor !== undefined) {
    if (typeof config.meanReversionFactor !== 'number' || 
        config.meanReversionFactor < 0 || 
        config.meanReversionFactor > 1) {
      return { valid: false, error: 'Mean reversion factor must be between 0 and 1' }
    }
  }

  if (config.minPriceFloor !== undefined) {
    if (typeof config.minPriceFloor !== 'number' || 
        config.minPriceFloor < 0 || 
        config.minPriceFloor > 1) {
      return { valid: false, error: 'Minimum price floor must be between 0 and 1' }
    }
  }

  if (config.simulationInterval !== undefined) {
    if (typeof config.simulationInterval !== 'number' || 
        config.simulationInterval < 1000 || 
        config.simulationInterval > 300000) {
      return { valid: false, error: 'Simulation interval must be between 1000 and 300000 ms' }
    }
  }

  return { valid: true }
}

function validateSpecificConfig(key: keyof MarketConfig, value: unknown): { valid: boolean; error?: string } {
  switch (key) {
    case 'riskVolatility':
      if (typeof value !== 'object' || value === null) {
        return { valid: false, error: 'Risk volatility must be an object' }
      }
      const riskLevels = ['KONSERVATIF', 'MODERAT', 'AGRESIF']
      for (const level of riskLevels) {
        const typed = value as RiskVolatility as Record<string, number>
        if (typed[level] === undefined || 
            typeof typed[level] !== 'number' ||
            typed[level] < 0 ||
            typed[level] > 1) {
          return { valid: false, error: `Invalid risk volatility for ${level}. Must be between 0 and 1` }
        }
      }
      break

    case 'typeVolatility':
      if (typeof value !== 'object' || value === null) {
        return { valid: false, error: 'Type volatility must be an object' }
      }
      const types = ['PASAR_UANG', 'OBLIGASI', 'CAMPURAN', 'SAHAM']
      for (const type of types) {
        const typed = value as TypeVolatility as Record<string, number>
        if (typed[type] === undefined || 
            typeof typed[type] !== 'number' ||
            typed[type] < 0 ||
            typed[type] > 5) {
          return { valid: false, error: `Invalid type volatility for ${type}` }
        }
      }
      break

    case 'marketTrendFactor':
    case 'randomFactor':
    case 'meanReversionFactor':
    case 'minPriceFloor':
      if (typeof value !== 'number' || value < 0 || value > 1) {
        return { valid: false, error: `${key} must be a number between 0 and 1` }
      }
      break

    case 'simulationInterval':
      if (typeof value !== 'number' || value < 1000 || value > 300000) {
        return { valid: false, error: 'Simulation interval must be between 1000 and 300000 ms' }
      }
      break

    default:
      return { valid: false, error: `Unknown configuration key: ${key}` }
  }

  return { valid: true }
}
