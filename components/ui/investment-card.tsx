import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  Star,
  Eye,
  EyeOff
} from 'lucide-react'

interface InvestmentCardProps {
  id: string
  name: string
  type: string
  category: string
  expectedReturn: number
  minInvestment: number
  currentPrice: number
  description: string
  isLive?: boolean
  quotaRemaining?: number
  isInWatchlist?: boolean
  onAddToWatchlist?: (productId: string) => void
  onRemoveFromWatchlist?: (productId: string) => void
  onInvest?: (productId: string) => void
}

export function InvestmentCard({
  id,
  name,
  type,
  category,
  expectedReturn,
  minInvestment,
  currentPrice,
  description,
  isLive = false,
  quotaRemaining,
  isInWatchlist = false,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  onInvest
}: InvestmentCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'PASAR_UANG':
        return '💰'
      case 'OBLIGASI':
        return '📊'
      case 'SAHAM':
        return '📈'
      case 'CAMPURAN':
        return '🎯'
      default:
        return '💼'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'PASAR_UANG':
        return 'bg-green-50 text-green-600 border-green-200'
      case 'OBLIGASI':
        return 'bg-purple-50 text-purple-600 border-purple-200'
      case 'SAHAM':
        return 'bg-blue-50 text-blue-600 border-blue-200'
      case 'CAMPURAN':
        return 'bg-pink-50 text-pink-600 border-pink-200'
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200'
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getCategoryColor(category)}`}>
              <span className="text-lg">{getCategoryIcon(category)}</span>
            </div>
            <div>
              <CardTitle className="text-lg">{name}</CardTitle>
              <CardDescription className="text-sm">
                {type} • {category}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isLive && (
              <Badge variant="destructive" className="text-xs">
                Live
              </Badge>
            )}
            <button
              onClick={() => isInWatchlist ? onRemoveFromWatchlist?.(id) : onAddToWatchlist?.(id)}
              className="text-gray-400 hover:text-yellow-500 transition-colors"
            >
              <Star className={`w-5 h-5 ${isInWatchlist ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            </button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Imbal Hasil</span>
            <div className="font-semibold text-green-600">
              {expectedReturn.toFixed(2)}%
            </div>
          </div>
          <div>
            <span className="text-gray-600">Min. Investasi</span>
            <div className="font-semibold">
              Rp {minInvestment.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        {quotaRemaining !== undefined && (
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Kuota Tersisa</span>
              <span className="font-medium">{quotaRemaining.toFixed(1)}%</span>
            </div>
            <Progress value={quotaRemaining} className="h-2" />
          </div>
        )}

        <p className="text-sm text-gray-600 line-clamp-2">
          {description}
        </p>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="text-gray-600">Harga per Unit</span>
            <div className="font-semibold">
              Rp {currentPrice.toLocaleString('id-ID')}
            </div>
          </div>
          <Button 
            onClick={() => onInvest?.(id)}
            className="bg-green-600 hover:bg-green-700"
          >
            Investasi
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
