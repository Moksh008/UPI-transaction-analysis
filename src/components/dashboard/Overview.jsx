import { useState, useEffect } from 'react'
import { TrendingUp, DollarSign, Users, CreditCard } from 'lucide-react'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

export default function Overview() {
  const [filters, setFilters] = useState({
    year: null,
    quarter: null
  })
  const [summary, setSummary] = useState(null)
  const [states, setStates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSummary()
    fetchStates()
  }, [filters])

  const fetchSummary = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filters.year) params.year = filters.year
      if (filters.quarter) params.quarter = filters.quarter
      
      const response = await axios.get(`${API_BASE_URL}/api/summary`, { params })
      setSummary(response.data)
    } catch (error) {
      console.error('Error fetching summary:', error)
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchStates = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/states`)
      setStates(response.data.states || [])
    } catch (error) {
      console.error('Error fetching states:', error)
    }
  }

  const formatNumber = (num) => {
    if (!num) return '0'
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T'
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
    return num?.toLocaleString()
  }

  const topState = states.length > 0 ? states[0].State : 'N/A'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">UPI Transaction Analytics 2018-2022</p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg shadow p-6 border border-gray-200" style={{ backgroundColor: '#f7f6f2' }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <select
              value={filters.year || ''}
              onChange={(e) => setFilters({ ...filters, year: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900"
            >
              <option value="">All Years</option>
              <option value="2018">2018</option>
              <option value="2019">2019</option>
              <option value="2020">2020</option>
              <option value="2021">2021</option>
              <option value="2022">2022</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quarter
            </label>
            <select
              value={filters.quarter || ''}
              onChange={(e) => setFilters({ ...filters, quarter: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
              style={{ backgroundColor: '#f7f6f2' }}
            >
              <option value="">All Quarters</option>
              <option value="1">Q1</option>
              <option value="2">Q2</option>
              <option value="3">Q3</option>
              <option value="4">Q4</option>
            </select>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg shadow p-6 border border-gray-200 animate-pulse" style={{ backgroundColor: '#f7f6f2' }}>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Transactions"
            value={formatNumber(summary?.total_transactions)}
            icon={<CreditCard className="w-6 h-6" />}
            trend={summary?.yoy_growth ? `${summary.yoy_growth > 0 ? '+' : ''}${summary.yoy_growth.toFixed(1)}%` : 'N/A'}
            trendUp={summary?.yoy_growth > 0}
          />
          <MetricCard
            title="Transaction Amount"
            value={`₹${formatNumber(summary?.total_value)}`}
            icon={<DollarSign className="w-6 h-6" />}
            trend="Total Value"
            trendUp={true}
          />
          <MetricCard
            title="CAGR"
            value={`${summary?.cagr?.toFixed(1) || 0}%`}
            icon={<TrendingUp className="w-6 h-6" />}
            trend="2018-2022"
            trendUp={true}
          />
          <MetricCard
            title="States Covered"
            value={summary?.states_count || 0}
            icon={<Users className="w-6 h-6" />}
            trend={`Top: ${topState}`}
            trendUp={false}
          />
        </div>
      )}

      {/* Top States Table */}
      <div className="rounded-lg shadow p-6 border border-gray-200" style={{ backgroundColor: '#f7f6f2' }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 States by Transaction Count</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  State
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Transaction Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Transaction Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200" style={{ backgroundColor: '#f7f6f2' }}>
              {states.slice(0, 10).map((state, index) => (
                <tr key={state.State} className="hover:bg-gray-100">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    #{index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {state.State}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(state.Transaction_count)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{formatNumber(state.Transaction_amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="rounded-lg shadow p-6 border border-gray-200" style={{ backgroundColor: '#f7f6f2' }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InsightCard
            title="Available Transaction Types"
            value={summary?.transaction_types || 0}
            description="Different payment categories tracked"
          />
          <InsightCard
            title="Data Coverage"
            value="2018-2022"
            description="5 years of quarterly data"
          />
          <InsightCard
            title="Top State"
            value={topState}
            description="Highest transaction volume"
          />
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon, trend, trendUp }) {
  return (
    <div className="rounded-lg shadow p-6 border border-gray-200" style={{ backgroundColor: '#f7f6f2' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-gray-700">{icon}</div>
        <span className={`text-sm font-medium ${trendUp ? 'text-green-600' : 'text-gray-600'}`}>
          {trend}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

function InsightCard({ title, value, description }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-lg font-semibold text-gray-900 mb-2">{value}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  )
}

