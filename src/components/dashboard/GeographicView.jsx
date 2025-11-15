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
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import axios from 'axios'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'

const API_BASE_URL = 'http://localhost:8000'

// India TopoJSON URL - Using a reliable source
const INDIA_TOPO_JSON = 'https://gist.githubusercontent.com/jbrobst/56c13bbbf9d97d187fea01ca62ea5112/raw/e388c4cae20aa53cb5090210a42ebb9b765c0a36/india_states.geojson'

// State name mapping from GeoJSON to API data
const STATE_NAME_MAPPING = {
  'Andaman & Nicobar Island': 'Andaman and Nicobar Islands',
  'Andaman & Nicobar': 'Andaman and Nicobar Islands',
  'Andhra Pradesh': 'Andhra Pradesh',
  'Arunanchal Pradesh': 'Arunachal Pradesh',
  'Arunachal Pradesh': 'Arunachal Pradesh',
  'Assam': 'Assam',
  'Bihar': 'Bihar',
  'Chandigarh': 'Chandigarh',
  'Chhattisgarh': 'Chhattisgarh',
  'Dadara & Nagar Haveli': 'Dadra and Nagar Haveli and Daman and Diu',
  'Dadra and Nagar Haveli': 'Dadra and Nagar Haveli and Daman and Diu',
  'Daman & Diu': 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi': 'Delhi',
  'Goa': 'Goa',
  'Gujarat': 'Gujarat',
  'Haryana': 'Haryana',
  'Himachal Pradesh': 'Himachal Pradesh',
  'Jammu & Kashmir': 'Jammu and Kashmir',
  'Jammu and Kashmir': 'Jammu and Kashmir',
  'Jharkhand': 'Jharkhand',
  'Karnataka': 'Karnataka',
  'Kerala': 'Kerala',
  'Lakshadweep': 'Lakshadweep',
  'Madhya Pradesh': 'Madhya Pradesh',
  'Maharashtra': 'Maharashtra',
  'Manipur': 'Manipur',
  'Meghalaya': 'Meghalaya',
  'Mizoram': 'Mizoram',
  'Nagaland': 'Nagaland',
  'Odisha': 'Odisha',
  'Puducherry': 'Puducherry',
  'Pondicherry': 'Puducherry',
  'Punjab': 'Punjab',
  'Rajasthan': 'Rajasthan',
  'Sikkim': 'Sikkim',
  'Tamil Nadu': 'Tamil Nadu',
  'Telangana': 'Telangana',
  'Tripura': 'Tripura',
  'Uttar Pradesh': 'Uttar Pradesh',
  'Uttarakhand': 'Uttarakhand',
  'West Bengal': 'West Bengal',
  'Ladakh': 'Ladakh'
}

// Reverse mapping for display
const getMapStateName = (apiStateName) => {
  const reverseMapping = Object.entries(STATE_NAME_MAPPING).find(
    ([_, value]) => value === apiStateName
  )
  return reverseMapping ? reverseMapping[0] : apiStateName
}

export default function GeographicView() {
  const [selectedState, setSelectedState] = useState(null)
  const [availableStates, setAvailableStates] = useState([])
  const [stateDetails, setStateDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mapData, setMapData] = useState({})
  const [compareStates, setCompareStates] = useState([])
  const [comparisonData, setComparisonData] = useState(null)
  const [hoveredState, setHoveredState] = useState(null)

  useEffect(() => {
    fetchAvailableStates()
  }, [])

  useEffect(() => {
    if (selectedState) {
      fetchStateDetails()
    }
  }, [selectedState])

  useEffect(() => {
    if (compareStates.length > 0) {
      fetchComparisonData()
    } else {
      setComparisonData(null)
    }
  }, [compareStates])

  const fetchAvailableStates = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/api/states`, {
        params: { limit: 50 }
      })
      const states = response.data.states || []
      setAvailableStates(states)
      
      // Create map data for choropleth
      const mapDataObj = {}
      states.forEach(state => {
        mapDataObj[state.State] = state.Transaction_count
      })
      setMapData(mapDataObj)
      
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

  const fetchComparisonData = async () => {
    try {
      const promises = compareStates.map(state =>
        axios.get(`${API_BASE_URL}/api/state/${state}`)
      )
      const responses = await Promise.all(promises)
      const data = responses.map((res, idx) => ({
        state: compareStates[idx],
        ...res.data
      }))
      setComparisonData(data)
    } catch (error) {
      console.error('Error fetching comparison data:', error)
      setComparisonData(null)
    }
  }

  const getStateColor = (geoStateName) => {
    // Map the geo state name to API state name
    const apiStateName = STATE_NAME_MAPPING[geoStateName] || geoStateName
    const value = mapData[apiStateName] || 0
    const maxValue = Math.max(...Object.values(mapData))
    const minValue = Math.min(...Object.values(mapData).filter(v => v > 0))
    
    if (value === 0) return '#e5e7eb'
    
    const normalizedValue = (value - minValue) / (maxValue - minValue)
    
    // Color scale from light blue to dark blue
    const intensity = Math.floor(normalizedValue * 200) + 55
    return `rgb(0, ${255 - intensity}, ${255})`
  }

  const handleStateClick = (geo) => {
    try {
      const geoStateName = geo.properties && (geo.properties.st_nm || geo.properties.NAME_1 || geo.properties.name)
      // Map the geo state name to API state name
      const apiStateName = STATE_NAME_MAPPING[geoStateName] || geoStateName

      // Debug logging to help identify matching issues
      console.log('[GeographicView] clicked geo properties:', geo.properties)
      console.log('[GeographicView] mapped name:', geoStateName, '->', apiStateName)
      console.log('[GeographicView] availableStates sample:', availableStates.slice(0,10).map(s=>s.State))

      // Check if this state exists in our data
      const stateExists = availableStates.some(s => s.State === apiStateName)

      if (stateExists) {
        setSelectedState(apiStateName)
        // Scroll to the state details
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        // If not found, still set hoveredState for visibility and print helpful message
        setHoveredState(apiStateName)
        console.warn('[GeographicView] State not found in data:', geoStateName, '->', apiStateName)
      }
    } catch (err) {
      console.error('[GeographicView] Error in handleStateClick:', err)
    }
  }

  const toggleStateComparison = (stateName) => {
    setCompareStates(prev => {
      if (prev.includes(stateName)) {
        return prev.filter(s => s !== stateName)
      } else if (prev.length < 5) {
        return [...prev, stateName]
      }
      return prev
    })
  }

  const getComparisonChartData = () => {
    if (!comparisonData) return []
    
    return comparisonData.map(state => ({
      state: state.state,
      'Total Transactions': state.total_transactions / 1e6, // in millions
      'Total Value (Cr)': state.total_value / 1e7, // in crores
    }))
  }

  const getRadarChartData = () => {
    if (!comparisonData || comparisonData.length === 0) return []
    
    const maxTransactions = Math.max(...comparisonData.map(s => s.total_transactions))
    const maxValue = Math.max(...comparisonData.map(s => s.total_value))
    
    const metrics = ['Transactions', 'Value']
    
    return metrics.map(metric => {
      const dataPoint = { metric }
      comparisonData.forEach(state => {
        if (metric === 'Transactions') {
          dataPoint[state.state] = (state.total_transactions / maxTransactions * 100).toFixed(2)
        } else if (metric === 'Value') {
          dataPoint[state.state] = (state.total_value / maxValue * 100).toFixed(2)
        }
      })
      return dataPoint
    })
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

      {/* Interactive India Map */}
      <div className="rounded-lg shadow p-6 border border-gray-200" style={{ backgroundColor: '#f7f6f2' }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          India UPI Transaction Heat Map
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Click on a state to view details. Darker shades indicate higher transaction volumes.
        </p>
        {hoveredState && (
          <div className="mb-2 text-center">
            <span className="inline-block px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium">
              {hoveredState} {mapData[hoveredState] ? `- ${formatNumber(mapData[hoveredState])} transactions` : ''}
            </span>
          </div>
        )}
        <div className="w-full flex justify-center" style={{ height: '500px' }}>
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 1000,
              center: [78.9629, 22.5937]
            }}
            width={800}
            height={500}
          >
            <Geographies geography={INDIA_TOPO_JSON}>
              {({ geographies }) => {
                try {
                  const geoNames = geographies.map(g => g.properties && (g.properties.st_nm || g.properties.NAME_1 || g.properties.name))
                  console.log('[GeographicView] geo state names:', geoNames)
                } catch(e) {
                  console.warn('[GeographicView] error collecting geo names', e)
                }

                return geographies.map((geo) => {
                  const geoStateName = geo.properties.st_nm || geo.properties.NAME_1 || geo.properties.name
                  const apiStateName = STATE_NAME_MAPPING[geoStateName] || geoStateName
                  const isSelected = apiStateName === selectedState
                  const isCompared = compareStates.includes(apiStateName)
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={isSelected ? '#f59e0b' : isCompared ? '#10b981' : getStateColor(geoStateName)}
                      stroke="#FFFFFF"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: 'none', pointerEvents: 'auto' },
                        hover: { 
                          fill: '#f59e0b',
                          outline: 'none',
                          cursor: 'pointer'
                        },
                        pressed: { outline: 'none' }
                      }}
                      onClick={(ev) => { ev && ev.stopPropagation && ev.stopPropagation(); ev && ev.preventDefault && ev.preventDefault(); handleStateClick(geo) }}
                      onMouseEnter={() => setHoveredState(apiStateName)}
                      onMouseLeave={() => setHoveredState(null)}
                    />
                  )
                })
              }}
            </Geographies>
          </ComposableMap>
        </div>
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-blue-100 to-blue-700"></div>
            <span className="text-gray-600">Lower to Higher Transaction Volume</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-500"></div>
            <span className="text-gray-600">Selected State</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-500"></div>
            <span className="text-gray-600">Comparison States</span>
          </div>
        </div>
      </div>

      {/* State Selector and Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg shadow p-6 border border-gray-200" style={{ backgroundColor: '#f7f6f2' }}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select State</h3>
          <select
            value={selectedState || ''}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
            style={{ backgroundColor: '#f7f6f2' }}
          >
            {availableStates.map((state) => (
              <option key={state.State} value={state.State}>
                {state.State}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-lg shadow p-6 border border-gray-200" style={{ backgroundColor: '#f7f6f2' }}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            State Comparison (Select up to 5)
          </h3>
          <div className="flex flex-wrap gap-2">
            {availableStates.slice(0, 10).map((state) => (
              <button
                key={state.State}
                onClick={() => toggleStateComparison(state.State)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  compareStates.includes(state.State)
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {state.State}
              </button>
            ))}
          </div>
          {compareStates.length > 0 && (
            <button
              onClick={() => setCompareStates([])}
              className="mt-3 text-sm text-red-600 hover:text-red-800"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* State Comparison Charts */}
      {comparisonData && comparisonData.length > 0 && (
        <>
          <div className="rounded-lg shadow p-6 border border-gray-200" style={{ backgroundColor: '#f7f6f2' }}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              State Comparison - Overview
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={getComparisonChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="state" />
                <YAxis yAxisId="left" tickFormatter={(val) => `${val.toFixed(0)}M`} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(val) => `₹${val.toFixed(0)}Cr`} />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name.includes('Transactions')) return [`${value.toFixed(2)}M`, name]
                    return [`₹${value.toFixed(2)}Cr`, name]
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="Total Transactions" fill="#0088FE" name="Transactions (M)" />
                <Bar yAxisId="right" dataKey="Total Value (Cr)" fill="#00C49F" name="Value (Cr)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-lg shadow p-6 border border-gray-200" style={{ backgroundColor: '#f7f6f2' }}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              State Comparison - Relative Performance
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Normalized comparison showing relative performance (0-100 scale)
            </p>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={getRadarChartData()}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                {comparisonData.map((state, idx) => (
                  <Radar
                    key={state.state}
                    name={state.state}
                    dataKey={state.state}
                    stroke={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][idx % 5]}
                    fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][idx % 5]}
                    fillOpacity={0.3}
                  />
                ))}
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-lg shadow p-6 border border-gray-200" style={{ backgroundColor: '#f7f6f2' }}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Detailed State Comparison
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      State
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Transactions
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Value
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Transaction Value
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {comparisonData.map((state, idx) => (
                    <tr key={state.state} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {state.state}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatNumber(state.total_transactions)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        ₹{formatNumber(state.total_value)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        ₹{formatNumber(state.total_value / state.total_transactions)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

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

