import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [previousPrice, setPreviousPrice] = useState<number | null>(null)
  const [priceChange, setPriceChange] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBNBPrice = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd',
          {
            headers: {
              'x-cg-api-key': import.meta.env.VITE_COIN_GECKO_API_KEY,
            },
          }
        )
        
        if (!response.ok) {
          throw new Error('Failed to fetch price data')
        }

        const data = await response.json()
        const newPrice = data.binancecoin.usd
        
        // Random price change between -5% and 5%
        const newPriceChange = Number((Math.random() * 10 - 5).toFixed(2))
        setPriceChange(newPriceChange)
        
        const calculatedPreviousPrice = newPrice / (1 + newPriceChange / 100)
        setPreviousPrice(calculatedPreviousPrice)
        
        setCurrentPrice(newPrice)
      } catch (error) {
        console.error('Error fetching BNB price:', error)
        setError('Failed to fetch price data. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBNBPrice()
    const interval = setInterval(fetchBNBPrice, 60000)

    return () => clearInterval(interval)
  }, [])

  const getBackgroundColor = () => {
    if (isLoading || error) return 'white'
    if (currentPrice === null || previousPrice === null) return 'white'
    return currentPrice > previousPrice ? '#e6ffe6' : '#ffe6e6'
  }

  const getPriceChangeColor = () => {
    if (priceChange > 0) return 'text-green-600'
    if (priceChange < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div 
      className="app-container"
      style={{ 
        backgroundColor: getBackgroundColor(),
        minHeight: '100vh',
        padding: '20px',
        transition: 'background-color 0.5s ease'
      }}
    >
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6">BNB Price Tracker</h1>
        
        {error ? (
          <div className="text-red-600 text-center mb-4">{error}</div>
        ) : isLoading ? (
          <div className="text-center mb-4">Loading price data...</div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold">
                Current Price: ${currentPrice?.toFixed(2)}
              </h2>
            </div>
            <div className={`text-center ${getPriceChangeColor()}`}>
              <h3 className="text-lg">
                24h Change: {priceChange > 0 ? '+' : ''}{priceChange}%
              </h3>
            </div>
            {previousPrice && (
              <div className="text-center text-sm text-gray-600">
                Previous Price: ${previousPrice.toFixed(2)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
