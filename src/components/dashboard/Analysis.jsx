import { useState } from 'react';
import { Upload, X, FileText, TrendingUp, BarChart3, PieChart, Sparkles, Loader2 } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Groq from 'groq-sdk';

const Analysis = () => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [error, setError] = useState('');

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  // Initialize Groq
  const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true
  });

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (uploadedFile) => {
    setError('');
    
    // Validate file type
    if (!uploadedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    // Validate file size (max 10MB)
    if (uploadedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(uploadedFile);
  };

  const removeFile = () => {
    setFile(null);
    setAnalysisData(null);
    setError('');
  };

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    const data = lines.slice(1).map(line => {
      const values = line.split(',');
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index]?.trim();
      });
      return obj;
    });

    return { headers, data };
  };

  const analyzeData = async () => {
    if (!file) return;

    setAnalyzing(true);
    setError('');

    try {
      const text = await file.text();
      const { headers, data } = parseCSV(text);

      // Basic analysis
      const totalRecords = data.length;
      
      // Try to detect numeric columns for analysis
      const numericColumns = headers.filter(header => {
        const sample = data[0][header];
        return !isNaN(parseFloat(sample));
      });

      // Try to detect amount/value columns
      const amountColumn = headers.find(h => 
        h.toLowerCase().includes('amount') || 
        h.toLowerCase().includes('value') || 
        h.toLowerCase().includes('transaction') ||
        h.toLowerCase().includes('count')
      );

      // Try to detect category/type columns
      const categoryColumn = headers.find(h => 
        h.toLowerCase().includes('type') || 
        h.toLowerCase().includes('category') || 
        h.toLowerCase().includes('payment') ||
        h.toLowerCase().includes('state') ||
        h.toLowerCase().includes('district') ||
        h.toLowerCase().includes('name')
      );

      // Try to detect date columns
      const dateColumn = headers.find(h => 
        h.toLowerCase().includes('date') || 
        h.toLowerCase().includes('time') || 
        h.toLowerCase().includes('year') ||
        h.toLowerCase().includes('quarter')
      );

      console.log('Detected columns:', { amountColumn, categoryColumn, dateColumn });
      console.log('Headers:', headers);
      console.log('Sample data:', data[0]);

      // Calculate summary statistics
      let totalAmount = 0;
      let avgAmount = 0;
      let maxAmount = 0;
      let minAmount = Infinity;

      if (amountColumn) {
        data.forEach(row => {
          const amount = parseFloat(row[amountColumn]);
          if (!isNaN(amount)) {
            totalAmount += amount;
            maxAmount = Math.max(maxAmount, amount);
            minAmount = Math.min(minAmount, amount);
          }
        });
        avgAmount = totalAmount / data.length;
      }

      // Category distribution
      let categoryData = [];
      if (categoryColumn) {
        const categoryCounts = {};
        data.forEach(row => {
          const category = row[categoryColumn];
          if (category) {
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
          }
        });
        categoryData = Object.entries(categoryCounts).map(([name, value]) => ({
          name,
          value
        }));
      }

      // Time series data (if date column exists)
      let timeSeriesData = [];
      if (dateColumn && amountColumn) {
        const timeCounts = {};
        data.forEach(row => {
          const date = row[dateColumn];
          const amount = parseFloat(row[amountColumn]);
          if (date && !isNaN(amount)) {
            timeCounts[date] = (timeCounts[date] || 0) + amount;
          }
        });
        timeSeriesData = Object.entries(timeCounts)
          .slice(0, 20) // Limit to first 20 data points
          .map(([date, amount]) => ({
            date,
            amount: parseFloat(amount.toFixed(2))
          }));
      }

      // Top records by amount
      let topRecords = [];
      if (amountColumn) {
        topRecords = [...data]
          .sort((a, b) => parseFloat(b[amountColumn]) - parseFloat(a[amountColumn]))
          .slice(0, 10);
      }

      setAnalysisData({
        totalRecords,
        headers,
        numericColumns,
        amountColumn,
        categoryColumn,
        dateColumn,
        summary: {
          totalAmount: totalAmount.toFixed(2),
          avgAmount: avgAmount.toFixed(2),
          maxAmount: maxAmount === 0 ? 'N/A' : maxAmount.toFixed(2),
          minAmount: minAmount === Infinity ? 'N/A' : minAmount.toFixed(2),
        },
        categoryData,
        timeSeriesData,
        topRecords,
        rawData: data.slice(0, 100) // Preview first 100 rows
      });

      // Generate AI insights using Groq
      await generateAIInsights({
        totalRecords,
        summary: {
          totalAmount: totalAmount.toFixed(2),
          avgAmount: avgAmount.toFixed(2),
          maxAmount: maxAmount === 0 ? 'N/A' : maxAmount.toFixed(2),
          minAmount: minAmount === Infinity ? 'N/A' : minAmount.toFixed(2),
        },
        categoryData,
        timeSeriesData: timeSeriesData.slice(0, 5), // Send only first 5 for context
        headers,
        amountColumn,
        categoryColumn,
        dateColumn
      });

    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze file. Please ensure it\'s a valid CSV file.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Generate AI insights using Groq
  const generateAIInsights = async (analysisResult) => {
    setGeneratingInsights(true);
    try {
      const prompt = `You are a data analyst. Analyze this CSV data and provide 5-7 key insights in a bullet-point format.

Data Summary:
- Total Records: ${analysisResult.totalRecords}
- Total Amount: ₹${analysisResult.summary.totalAmount}
- Average Amount: ₹${analysisResult.summary.avgAmount}
- Max Amount: ₹${analysisResult.summary.maxAmount}
- Min Amount: ₹${analysisResult.summary.minAmount}
- Columns: ${analysisResult.headers.join(', ')}
- Amount Column: ${analysisResult.amountColumn || 'Not detected'}
- Category Column: ${analysisResult.categoryColumn || 'Not detected'}
- Date Column: ${analysisResult.dateColumn || 'Not detected'}

${analysisResult.categoryData.length > 0 ? `Category Distribution: ${JSON.stringify(analysisResult.categoryData.slice(0, 5))}` : ''}
${analysisResult.timeSeriesData.length > 0 ? `Time Series Sample: ${JSON.stringify(analysisResult.timeSeriesData)}` : ''}

Provide insights about:
1. Overall data patterns
2. Trends identified
3. Notable outliers or anomalies
4. Distribution characteristics
5. Recommendations for further analysis

Return as a JSON array of insight strings:
["insight 1", "insight 2", "insight 3", ...]`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a data analyst providing clear, actionable insights. Return only a JSON array of insight strings."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.3,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content || "";
      console.log("AI Insights Response:", response);

      // Extract JSON array from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const insights = JSON.parse(jsonMatch[0]);
        setAiInsights(insights);
      } else {
        // Fallback: split by newlines if not JSON
        const insights = response.split('\n').filter(line => line.trim().length > 0);
        setAiInsights(insights);
      }
    } catch (error) {
      console.error('AI Insights Error:', error);
      // Don't show error to user, just skip AI insights
      setAiInsights(null);
    } finally {
      setGeneratingInsights(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Analysis</h1>
        <p className="text-gray-600">Upload your own CSV data for real-time analysis</p>
      </div>

      {/* Upload Section */}
      <div className="rounded-lg p-6 border border-gray-200" style={{ backgroundColor: '#f7f6f2' }}>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Data</h2>
        
        {!file ? (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-neutral-600 hover:border-neutral-500'
            }`}
          >
            <Upload className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-white font-medium mb-2">
              Drag and drop your CSV file here
            </p>
            <p className="text-neutral-400 text-sm mb-4">or</p>
            <label className="inline-block">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="hidden"
              />
              <span className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer inline-block transition-colors">
                Browse Files
              </span>
            </label>
            <p className="text-neutral-500 text-xs mt-4">
              Supported format: CSV (Max 10MB)
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-neutral-900 rounded-lg border border-neutral-700">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-neutral-400 text-sm">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={removeFile}
                className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            {!analysisData && (
              <button
                onClick={analyzeData}
                disabled={analyzing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                {analyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5" />
                    Analyze Data
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {analysisData && (
        <>
          {/* AI Insights Section */}
          {generatingInsights ? (
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg p-6 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-4">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                <h3 className="text-lg font-semibold text-white">Generating AI Insights...</h3>
              </div>
              <p className="text-neutral-400">Analyzing your data to provide intelligent insights...</p>
            </div>
          ) : aiInsights && aiInsights.length > 0 ? (
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg p-6 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">AI-Powered Insights</h3>
              </div>
              <div className="space-y-3">
                {aiInsights.map((insight, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <p className="text-neutral-200 leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Detected Columns Info */}
          <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
            <h3 className="text-lg font-semibold text-white mb-4">Detected Columns</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-neutral-400 mb-1">Amount Column</p>
                <p className="text-white font-medium">
                  {analysisData.amountColumn || 'Not detected'}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-400 mb-1">Category Column</p>
                <p className="text-white font-medium">
                  {analysisData.categoryColumn || 'Not detected'}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-400 mb-1">Date Column</p>
                <p className="text-white font-medium">
                  {analysisData.dateColumn || 'Not detected'}
                </p>
              </div>
            </div>
            {(!analysisData.amountColumn || !analysisData.categoryColumn || !analysisData.dateColumn) && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-400 text-sm">
                💡 Tip: For better analysis, ensure your CSV has columns with keywords like "amount", "category/type", and "date/year"
              </div>
            )}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <p className="text-neutral-400 text-sm">Total Records</p>
              </div>
              <p className="text-2xl font-bold text-white">
                {analysisData.totalRecords.toLocaleString()}
              </p>
            </div>

            {analysisData.amountColumn && (
              <>
                <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <p className="text-neutral-400 text-sm">Total Amount</p>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    ₹{parseFloat(analysisData.summary.totalAmount).toLocaleString()}
                  </p>
                </div>

                <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                  <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    <p className="text-neutral-400 text-sm">Average Amount</p>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    ₹{parseFloat(analysisData.summary.avgAmount).toLocaleString()}
                  </p>
                </div>

                <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                  <div className="flex items-center gap-3 mb-2">
                    <PieChart className="w-5 h-5 text-orange-400" />
                    <p className="text-neutral-400 text-sm">Max Amount</p>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    ₹{analysisData.summary.maxAmount !== 'N/A' 
                      ? parseFloat(analysisData.summary.maxAmount).toLocaleString() 
                      : 'N/A'}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Distribution */}
            {analysisData.categoryData.length > 0 ? (
              <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Distribution by {analysisData.categoryColumn}
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RePieChart>
                    <Pie
                      data={analysisData.categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analysisData.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#262626', 
                        border: '1px solid #404040',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            ) : analysisData.categoryColumn ? (
              <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Distribution by {analysisData.categoryColumn}
                </h3>
                <div className="flex items-center justify-center h-[300px] text-neutral-400">
                  No category data available to display
                </div>
              </div>
            ) : null}

            {/* Time Series */}
            {analysisData.timeSeriesData.length > 0 ? (
              <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Trend Over Time
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analysisData.timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#a3a3a3"
                      tick={{ fill: '#a3a3a3' }}
                    />
                    <YAxis 
                      stroke="#a3a3a3"
                      tick={{ fill: '#a3a3a3' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#262626', 
                        border: '1px solid #404040',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : analysisData.dateColumn && analysisData.amountColumn ? (
              <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Trend Over Time
                </h3>
                <div className="flex items-center justify-center h-[300px] text-neutral-400">
                  No time series data available to display
                </div>
              </div>
            ) : null}
          </div>

          {/* Top Records Table */}
          {analysisData.topRecords.length > 0 && analysisData.amountColumn && (
            <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
              <h3 className="text-lg font-semibold text-white mb-4">
                Top 10 Records by Amount
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-700">
                      {analysisData.headers.slice(0, 6).map((header, index) => (
                        <th key={index} className="text-left py-3 px-4 text-neutral-300 font-medium">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {analysisData.topRecords.map((record, index) => (
                      <tr key={index} className="border-b border-neutral-700 hover:bg-neutral-700/50">
                        {analysisData.headers.slice(0, 6).map((header, idx) => (
                          <td key={idx} className="py-3 px-4 text-neutral-200">
                            {record[header]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Data Preview */}
          <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              Data Preview (First 10 rows)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-700">
                    {analysisData.headers.map((header, index) => (
                      <th key={index} className="text-left py-2 px-3 text-neutral-300 font-medium">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {analysisData.rawData.slice(0, 10).map((record, index) => (
                    <tr key={index} className="border-b border-neutral-700 hover:bg-neutral-700/50">
                      {analysisData.headers.map((header, idx) => (
                        <td key={idx} className="py-2 px-3 text-neutral-200">
                          {record[header]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analysis;
