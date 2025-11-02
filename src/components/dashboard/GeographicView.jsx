import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
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

const API_BASE_URL = 'http://localhost:8000'

export default function GeographicView() {
  const [selectedState, setSelectedState] = useState(null)
  const [availableStates, setAvailableStates] = useState([])
  const [stateDetails, setStateDetails] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAvailableStates()
  }, [])

  useEffect(() => {
    if (selectedState) {
      fetchStateDetails()
    }
  }, [selectedState])

  const fetchAvailableStates = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/api/states`, {
        params: { limit: 50 }
      })
      const states = response.data.states || []
      setAvailableStates(states)
      if (states.length > 0) {
        setSelectedState(states[0].State)
      }
    } catch (error) {
      console.error('Error fetching states:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStateDetails = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/api/state/${selectedState}`)
      setStateDetails(response.data)
    } catch (error) {
      console.error('Error fetching state details:', error)
      setStateDetails(null)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num) => {
    if (!num) return '0'
    if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T'
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B'
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M'
    return num?.toLocaleString()
  }

  const stateRank = availableStates.findIndex(s => s.State === selectedState) + 1

  if (loading && !selectedState) {
    return <div className="text-center py-12">Loading states...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Geographic Analysis</h1>
        <p className="text-gray-600 mt-1">State-wise UPI adoption and trends</p>
      </div>

      {/* State Selector */}
      <div className="rounded-lg shadow p-6 border border-gray-200" style={{ backgroundColor: '#f7f6f2' }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select State</h3>
        <select
          value={selectedState || ''}
          onChange={(e) => setSelectedState(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900"
          style={{ backgroundColor: '#f7f6f2' }}
        >
          {availableStates.map((state) => (
            <option key={state.State} value={state.State}>
              {state.State}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-600">Loading state details...</div>
      ) : stateDetails ? (
        <>
          {/* State Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-lg shadow p-6 border border-gray-200" style={{ backgroundColor: '#f7f6f2' }}>
              <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(stateDetails.total_transactions)}
              </p>
              <p className="text-sm text-gray-600 mt-2">All time</p>
            </div>
            <div className="rounded-lg shadow p-6 border border-gray-200" style={{ backgroundColor: '#f7f6f2' }}>
              <p className="text-sm text-gray-600 mb-1">Transaction Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{formatNumber(stateDetails.total_value)}
              </p>
              <p className="text-sm text-gray-600 mt-2">All time</p>
            </div>
            <div className="rounded-lg shadow p-6 border border-gray-200" style={{ backgroundColor: '#f7f6f2' }}>
              <p className="text-sm text-gray-600 mb-1">Rank</p>
              <p className="text-2xl font-bold text-gray-900">#{stateRank}</p>
              <p className="text-sm text-gray-600 mt-2">Among all states</p>
            </div>
          </div>

          {/* Quarterly Trends */}
          {stateDetails.time_series && stateDetails.time_series.length > 0 && (
            <div className="rounded-lg shadow p-6 border border-gray-200" style={{ backgroundColor: '#f7f6f2' }}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quarterly Transaction Trends - {selectedState}
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={stateDetails.time_series}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => {
                      const d = new Date(date)
                      return `${d.getFullYear()}-Q${Math.ceil((d.getMonth() + 1) / 3)}`
                    }}
                  />
                  <YAxis yAxisId="left" tickFormatter={formatNumber} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={formatNumber} />
                  <Tooltip 
                    formatter={(value) => formatNumber(value)}
                    labelFormatter={(date) => {
                      const d = new Date(date)
                      return `${d.getFullYear()}-Q${Math.ceil((d.getMonth() + 1) / 3)}`
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="Transaction_count"
                    stroke="#0088FE"
                    strokeWidth={2}
                    name="Transaction Count"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="Transaction_amount"
                    stroke="#00C49F"
                    strokeWidth={2}
                    name="Amount (₹)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Transaction Type Breakdown */}
          {stateDetails.by_type && stateDetails.by_type.length > 0 && (
            <div className="rounded-lg shadow p-6 border border-gray-200" style={{ backgroundColor: '#f7f6f2' }}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Transaction Types in {selectedState}
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={stateDetails.by_type}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="Transaction_type" />
                  <YAxis tickFormatter={formatNumber} />
                  <Tooltip formatter={(value) => formatNumber(value)} />
                  <Legend />
                  <Bar dataKey="Transaction_count" fill="#0088FE" name="Transaction Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-gray-600">
          No data available for {selectedState}
        </div>
      )}

      {/* Top 10 States Comparison */}
      <div className="rounded-lg shadow p-6 border border-gray-200" style={{ backgroundColor: '#f7f6f2' }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top 10 States Comparison
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={availableStates.slice(0, 10)} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={formatNumber} />
            <YAxis dataKey="State" type="category" width={120} />
            <Tooltip formatter={(value) => formatNumber(value)} />
            <Legend />
            <Bar dataKey="Transaction_count" fill="#0088FE" name="Transaction Count" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

