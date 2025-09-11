import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Eye, 
  EyeOff, 
  TrendingUp,
  TrendingDown,
  Flame
} from 'lucide-react'

interface PortfolioSummaryProps {
  totalValue: number
  totalGain: number
  totalGainPercent: number
  rdnBalance: number
  tradingBalance: number
  riskProfile: string
  assetAllocation: {
    moneyMarket: number
    bonds: number
    stocks: number
    mixed: number
    cash: number
  }
  monthlyStreak: number
  showValues: boolean
  onToggleVisibility: () => void
  onDeposit?: () => void
}

export function PortfolioSummary({
  totalValue,
  totalGain,
  totalGainPercent,
  rdnBalance,
  tradingBalance,
  riskProfile,
  assetAllocation,
  monthlyStreak,
  showValues,
  onToggleVisibility,
  onDeposit
}: PortfolioSummaryProps) {
  const getRiskProfileIcon = (profile: string) => {
    switch (profile) {
      case 'KONSERVATIF':
        return '🐰'
      case 'MODERAT':
        return '🐱'
      case 'AGRESIF':
        return '🐯'
      default:
        return '🐰'
    }
  }

  const getRiskProfileColor = (profile: string) => {
    switch (profile) {
      case 'KONSERVATIF':
        return 'text-green-600'
      case 'MODERAT':
        return 'text-yellow-600'
      case 'AGRESIF':
        return 'text-red-600'
      default:
        return 'text-green-600'
    }
  }

  return (
    <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Nilai Portofolio</h2>
            <div className="flex items-center space-x-2">
              {showValues ? (
                <span className="text-2xl font-bold text-gray-900">
                  Rp {totalValue.toLocaleString('id-ID')}
                </span>
              ) : (
                <span className="text-2xl font-bold text-gray-900">••••••••</span>
              )}
              <button 
                onClick={onToggleVisibility}
                className="text-gray-500 hover:text-gray-700"
              >
                {showValues ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-sm text-gray-600">Keuntungan</span>
              {showValues ? (
                <span className={`text-sm font-medium flex items-center ${
                  totalGain >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {totalGain >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {totalGain >= 0 ? '+' : ''}Rp {Math.abs(totalGain).toLocaleString('id-ID')} ({totalGainPercent.toFixed(2)}%)
                </span>
              ) : (
                <span className="text-sm font-medium text-green-600">••••••</span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm text-gray-600">Imbal Hasil</span>
              <span className="text-sm font-medium text-gray-900">0.00%</span>
            </div>
            <div className="text-sm text-gray-600">Saldo RDN</div>
            <div className="text-sm font-medium text-gray-900">
              {showValues ? `Rp ${rdnBalance.toLocaleString('id-ID')}` : '••••••'}
            </div>
            <div className="text-sm text-gray-600">Saldo Trading</div>
            <div className="text-sm font-medium text-gray-900">
              {showValues ? `Rp ${tradingBalance.toLocaleString('id-ID')}` : '••••••'}
            </div>
          </div>
        </div>

        {/* Asset Allocation */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Alokasi Aset</h3>
          <div className="flex space-x-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-1">
                <span className="text-xs text-green-600">💰</span>
              </div>
              <div className="text-xs text-gray-600">Pasar Uang</div>
              <div className="text-xs font-medium">{assetAllocation.moneyMarket.toFixed(1)}%</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-1">
                <span className="text-xs text-purple-600">📊</span>
              </div>
              <div className="text-xs text-gray-600">Obligasi</div>
              <div className="text-xs font-medium">{assetAllocation.bonds.toFixed(1)}%</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-1">
                <span className="text-xs text-blue-600">📈</span>
              </div>
              <div className="text-xs text-gray-600">Saham</div>
              <div className="text-xs font-medium">{assetAllocation.stocks.toFixed(1)}%</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-1">
                <span className="text-xs text-pink-600">🎯</span>
              </div>
              <div className="text-xs text-gray-600">Campuran</div>
              <div className="text-xs font-medium">{assetAllocation.mixed.toFixed(1)}%</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-1">
                <span className="text-xs text-orange-600">💵</span>
              </div>
              <div className="text-xs text-gray-600">Cash</div>
              <div className="text-xs font-medium">{assetAllocation.cash.toFixed(1)}%</div>
            </div>
          </div>
        </div>

        {/* Risk Profile and Monthly Streak */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{riskProfile}</span>
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-xs">{getRiskProfileIcon(riskProfile)}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-gray-600">Monthly Streak</span>
            <span className="text-sm font-medium">{monthlyStreak}</span>
          </div>
        </div>

        {/* Deposit Button */}
        {onDeposit && (
          <div className="flex justify-end mt-4">
            <Button onClick={onDeposit} className="bg-green-600 hover:bg-green-700">
              Deposit
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
