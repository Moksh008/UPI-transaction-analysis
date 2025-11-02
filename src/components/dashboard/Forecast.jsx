import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import axios from 'axios'

export default function Forecast() {
  const [model, setModel] = useState('Holt-Winters')
  const [horizon, setHorizon] = useState(4)
  const [forecastData, setForecastData] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchForecast()
  }, [model, horizon])

  const fetchForecast = async () => {
    try {
      setLoading(true)
      // Mock data - replace with API
      const mockData = [
        { date: '2021-Q1', actual: 198000000, forecast: null },
        { date: '2021-Q2', actual: 225000000, forecast: null },
        { date: '2021-Q3', actual: 258000000, forecast: null },
        { date: '2021-Q4', actual: 285000000, forecast: null },
        { date: '2022-Q1', actual: 320000000, forecast: 318000000 },
        { date: '2022-Q2', actual: null, forecast: 365000000 },
        { date: '2022-Q3', actual: null, forecast: 418000000 },
        { date: '2022-Q4', actual: null, forecast: 475000000 },
      ]

      const mockMetrics = {
        mae: 200969046,
        rmse: 241243169,
        mape: 2.08
      }

      setForecastData(mockData)
      setMetrics(mockMetrics)
    } catch (error) {
      console.error('Error fetching forecast:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B'
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M'
    return num?.toLocaleString()
  }

  const downloadForecast = () => {
    const csv = forecastData
      .filter(d => d.forecast)
      .map(d => `${d.date},${d.forecast}`)
      .join('\n')
    const blob = new Blob([`Date,Forecast\n${csv}`], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'upi_forecast.csv'
    a.click()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transaction Forecast</h1>
        <p className="text-gray-600 mt-1">Predict future UPI transaction volumes</p>
      </div>

      {/* Controls */}
      <div className="rounded-lg shadow p-6 border border-gray-200" style={{ backgroundColor: '#f7f6f2' }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Forecast Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900"
              style={{ backgroundColor: '#f7f6f2' }}
            >
              <option value="Naive">Naive Baseline</option>
              <option value="Holt-Winters">Holt-Winters</option>
              <option value="ARIMA">ARIMA</option>
              <option value="Prophet">Prophet</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Forecast Horizon (Quarters)
            </label>
            <input
              type="range"
              min="1"
              max="12"
              value={horizon}
              onChange={(e) => setHorizon(parseInt(e.target.value))}
              className="w-full"
            />
            <p className="text-sm text-gray-600 mt-1">{horizon} quarters ahead</p>
          </div>
        </div>

        <button
          onClick={downloadForecast}
          className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Download Forecast CSV
        </button>
      </div>

      {/* Accuracy Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-lg shadow p-6 border border-gray-200" style={{ backgroundColor: '#f7f6f2' }}>
            <p className="text-sm text-gray-600 mb-1">MAE</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatNumber(metrics.mae)}
            </p>
            <p className="text-sm text-gray-500 mt-1">Mean Absolute Error</p>
          </div>
          <div className="rounded-lg shadow p-6 border border-gray-200" style={{ backgroundColor: '#f7f6f2' }}>
            <p className="text-sm text-gray-600 mb-1">RMSE</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatNumber(metrics.rmse)}
            </p>
            <p className="text-sm text-gray-500 mt-1">Root Mean Squared Error</p>
          </div>
          <div className="rounded-lg shadow p-6 border border-gray-200" style={{ backgroundColor: '#f7f6f2' }}>
            <p className="text-sm text-gray-600 mb-1">MAPE</p>
            <p className="text-2xl font-bold text-green-600">
              {metrics.mape}%
            </p>
            <p className="text-sm text-gray-500 mt-1">Mean Absolute % Error</p>
          </div>
        </div>
      )}

      {/* Forecast Chart */}
      <div className="rounded-lg shadow p-6 border border-gray-200" style={{ backgroundColor: '#f7f6f2' }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Forecast vs Historical Data
        </h3>
        <ResponsiveContainer width="100%" height={450}>
          <LineChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={formatNumber} />
            <Tooltip formatter={(value) => formatNumber(value)} />
            <Legend />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#0088FE"
              strokeWidth={2}
              name="Historical"
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#00C49F"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Forecast"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Model Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-2">Model: {model}</h4>
        <p className="text-sm text-blue-800">
          {model === 'Holt-Winters' && 
            'Exponential smoothing method with additive trend. Best for short-term forecasts with clear trend patterns.'}
          {model === 'Naive' && 
            'Simple baseline that assumes the next value equals the last observed value. Useful for comparison.'}
          {model === 'ARIMA' && 
            'AutoRegressive Integrated Moving Average. Suitable for non-seasonal time series with trends.'}
          {model === 'Prophet' && 
            'Facebook Prophet model. Handles seasonal patterns and holidays well. Best for longer-term forecasts.'}
        </p>
      </div>
    </div>
  )
}

