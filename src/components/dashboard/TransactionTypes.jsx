import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export default function TransactionTypes() {
  const [selectedType, setSelectedType] = useState(null)
  const [transactionTypes, setTransactionTypes] = useState([])
  const [timeSeriesData, setTimeSeriesData] = useState([])
  const [topStates, setTopStates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransactionTypes()
    fetchTopStates()
  }, [])

  useEffect(() => {
    if (selectedType) {
      fetchTimeSeries()
    }
  }, [selectedType])

  const fetchTransactionTypes = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/api/types`)
      const types = response.data.types || []
      setTransactionTypes(types)
      if (types.length > 0 && !selectedType) {
        setSelectedType(types[0].Transaction_type)
      }
    } catch (error) {
      console.error('Error fetching transaction types:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTimeSeries = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/timeseries`, {
        params: {
          transaction_type: selectedType,
          granularity: 'Q'
        }
      })
      setTimeSeriesData(response.data.timeseries || [])
    } catch (error) {
      console.error('Error fetching time series:', error)
      setTimeSeriesData([])
    }
  }

  const fetchTopStates = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/states`, {
        params: { limit: 10 }
      })
      setTopStates(response.data.states || [])
    } catch (error) {
      console.error('Error fetching top states:', error)
    }
  }

  const formatNumber = (num) => {
    if (!num) return '0'
    if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T'
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B'
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M'
    return num?.toLocaleString()
  }

  const totalTransactions = transactionTypes.reduce((sum, type) => sum + (type.Transaction_count || 0), 0)
  const typeDistribution = transactionTypes.map(type => ({
    name: type.Transaction_type,
    value: totalTransactions > 0 ? parseFloat(((type.Transaction_count / totalTransactions) * 100).toFixed(1)) : 0,
    percentage: totalTransactions > 0 ? ((type.Transaction_count / totalTransactions) * 100).toFixed(1) : 0,
    count: type.Transaction_count
  }))

  if (loading && transactionTypes.length === 0) {
    return <div className="text-center py-12">Loading transaction types...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transaction Type Analysis</h1>
        <p className="text-gray-600 mt-1">Explore payment trends by transaction category</p>
      </div>

      {/* Type Selector */}
      <div className="rounded-lg shadow p-6 border border-gray-200" style={{ backgroundColor: '#f7f6f2' }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Transaction Type</h3>
        <div className="flex flex-wrap gap-2">
          {transactionTypes.map((type) => (
            <button
              key={type.Transaction_type}
              onClick={() => setSelectedType(type.Transaction_type)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedType === type.Transaction_type
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {type.Transaction_type}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-lg shadow p-6 border border-gray-200" style={{ backgroundColor: '#f7f6f2' }}>
          <p className="text-sm text-gray-600 mb-1">Total Transaction Types</p>
          <p className="text-2xl font-bold text-gray-900">{transactionTypes.length}</p>
          <p className="text-sm text-gray-500 mt-2">Categories available</p>
        </div>
        <div className="rounded-lg shadow p-6 border border-gray-200" style={{ backgroundColor: '#f7f6f2' }}>
          <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
          <p className="text-2xl font-bold text-gray-900">{formatNumber(totalTransactions)}</p>
          <p className="text-sm text-gray-500 mt-2">Across all types</p>
        </div>
        <div className="rounded-lg shadow p-6 border border-gray-200" style={{ backgroundColor: '#f7f6f2' }}>
          <p className="text-sm text-gray-600 mb-1">Selected Type</p>
          <p className="text-2xl font-bold text-gray-900">
            {selectedType ? formatNumber(transactionTypes.find(t => t.Transaction_type === selectedType)?.Transaction_count) : 'N/A'}
          </p>
          <p className="text-sm text-gray-500 mt-2">{selectedType || 'Select a type'}</p>
        </div>
      </div>

      {/* Time Series Chart */}
      {timeSeriesData.length > 0 && (
        <div className="rounded-lg shadow p-6 border border-gray-200" style={{ backgroundColor: '#f7f6f2' }}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quarterly Transaction Trends - {selectedType}
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                tickFormatter={(date) => {
                  const d = new Date(date)
                  return `${d.getFullYear()}-Q${Math.ceil((d.getMonth() + 1) / 3)}`
                }}
              />
              <YAxis tickFormatter={formatNumber} />
              <Tooltip 
                formatter={(value) => formatNumber(value)}
                labelFormatter={(date) => {
                  const d = new Date(date)
                  return `${d.getFullYear()}-Q${Math.ceil((d.getMonth() + 1) / 3)}`
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#0088FE"
                strokeWidth={2}
                name="Transaction Count"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution Pie Chart */}
        {typeDistribution.length > 0 && (
          <div className="rounded-lg shadow p-6 border border-gray-200" style={{ backgroundColor: '#f7f6f2' }}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Transaction Type Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={(entry) => `${entry.name.substring(0, 15)}: ${entry.percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [`${props.payload.percentage}%`, 'Share']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top States Bar Chart */}
        {topStates.length > 0 && (
          <div className="rounded-lg shadow p-6 border border-gray-200" style={{ backgroundColor: '#f7f6f2' }}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top 10 States by Transaction Count
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topStates} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={formatNumber} />
                <YAxis 
                  dataKey="State" 
                  type="category" 
                  width={120}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value) => [formatNumber(value), 'Transactions']}
                />
                <Bar dataKey="Transaction_count" fill="#0088FE" name="Transaction Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Transaction Types Table */}
      <div className="rounded-lg shadow p-6 border border-gray-200" style={{ backgroundColor: '#f7f6f2' }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Transaction Types</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Transaction Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Transaction Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  % of Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200" style={{ backgroundColor: '#f7f6f2' }}>
              {transactionTypes.map((type, index) => (
                <tr key={type.Transaction_type} className="hover:bg-gray-100">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {type.Transaction_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(type.Transaction_count)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{formatNumber(type.Transaction_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {typeDistribution[index]?.percentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

