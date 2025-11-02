import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "../../lib/utils";
import {
  ArrowUpIcon,
  Paperclip,
  Code2,
  Palette,
  Layers,
  Rocket,
  TrendingUp,
  MapPin,
  Calendar,
  BarChart3,
  Sparkles,
  Loader2,
} from "lucide-react";
import Groq from "groq-sdk";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function useAutoResizeTextarea({ minHeight, maxHeight }) {
  const textareaRef = useRef(null);

  const adjustHeight = useCallback(
    (reset) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`;
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Infinity)
      );
      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.style.height = `${minHeight}px`;
  }, [minHeight]);

  return { textareaRef, adjustHeight };
}

export default function AIChat() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState(null);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 48,
    maxHeight: 150,
  });

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  const chatEndRef = useRef(null);

  // Initialize Groq
  const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true // Required for client-side usage
  });

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Parse user query using Groq API
  const parseQueryIntent = async (userMessage) => {
    try {
      const prompt = `You are a UPI transaction data analyst. Analyze this query and extract the intent.if the data is not available in the dataset,so you can search it from google any give result with soruce link.

User Query: "${userMessage}"

Return a valid JSON object with this structure:
{
  "type": "top_states|forecast|time_series|transaction_types|state_comparison",
  "filters": {
    "transaction_type": "Peer-to-peer|Merchant|Recharge|Bill payments|Others or null",
    "year": "2020|2021|2022|2023 or null",
    "quarter": "Q1|Q2|Q3|Q4 or null",
    "limit": 5,
    "state": "state name or null",
    "states": ["array of state names for comparison"]
  },
  "metric": "amount|count|growth",
  "description": "Brief description of what the user wants"
}
  and can return in text also 

Examples:
Query: "Show top 5 states for Merchant transactions in Q2 2022"
Response: {"type":"top_states","filters":{"transaction_type":"Merchant","year":"2022","quarter":"Q2","limit":5},"metric":"amount","description":"Top 5 states by Merchant transaction amount in Q2 2022"}

Query: "Forecast UPI volume for Maharashtra next 4 quarters"
Response: {"type":"forecast","filters":{"state":"Maharashtra","quarters":4},"metric":"amount","description":"Forecast for Maharashtra next 4 quarters"}

Query: "Show transaction type distribution"
Response: {"type":"transaction_types","filters":{},"metric":"count","description":"Distribution of transaction types"}

Now analyze: "${userMessage}"`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a data analysis assistant. Return only valid JSON, no explanations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.1,
        max_tokens: 500,
      });

      const response = completion.choices[0]?.message?.content || "";
      console.log("Groq Response:", response);

      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error('Could not parse query intent');
    } catch (error) {
      console.error('Groq API Error:', error);
      throw new Error(`Failed to analyze query: ${error.message}`);
    }
  };

  // Fetch data based on parsed intent
  const fetchAnalysisData = async (intent) => {
    // Simulate API calls to your backend
    // In production, replace with actual API endpoints
    
    if (intent.type === 'top_states') {
      // Mock data - replace with actual API call
      const mockData = [
        { state: 'Maharashtra', value: 15000000 },
        { state: 'Karnataka', value: 12000000 },
        { state: 'Tamil Nadu', value: 10500000 },
        { state: 'Uttar Pradesh', value: 9800000 },
        { state: 'Gujarat', value: 8500000 },
      ].slice(0, intent.filters.limit || 5);
      
      return {
        type: 'bar',
        data: mockData,
        title: intent.description,
        xKey: 'state',
        yKey: 'value',
      };
    }
    
    if (intent.type === 'forecast') {
      // Mock forecast data
      const mockData = [
        { quarter: 'Q1 2023', actual: 5000000, forecast: null },
        { quarter: 'Q2 2023', actual: 5500000, forecast: null },
        { quarter: 'Q3 2023', actual: 6000000, forecast: null },
        { quarter: 'Q4 2023', actual: null, forecast: 6400000 },
        { quarter: 'Q1 2024', actual: null, forecast: 6800000 },
        { quarter: 'Q2 2024', actual: null, forecast: 7200000 },
        { quarter: 'Q3 2024', actual: null, forecast: 7600000 },
      ];
      
      return {
        type: 'line',
        data: mockData,
        title: intent.description,
        xKey: 'quarter',
        yKeys: ['actual', 'forecast'],
      };
    }
    
    if (intent.type === 'time_series') {
      const mockData = [
        { period: 'Q1 2022', value: 4200000 },
        { period: 'Q2 2022', value: 4800000 },
        { period: 'Q3 2022', value: 5200000 },
        { period: 'Q4 2022', value: 5800000 },
        { period: 'Q1 2023', value: 6200000 },
        { period: 'Q2 2023', value: 6800000 },
      ];
      
      return {
        type: 'line',
        data: mockData,
        title: intent.description,
        xKey: 'period',
        yKeys: ['value'],
      };
    }
    
    if (intent.type === 'transaction_types') {
      const mockData = [
        { name: 'Peer-to-peer', value: 45 },
        { name: 'Merchant', value: 30 },
        { name: 'Recharge', value: 15 },
        { name: 'Bill payments', value: 7 },
        { name: 'Others', value: 3 },
      ];
      
      return {
        type: 'pie',
        data: mockData,
        title: intent.description,
      };
    }
    
    throw new Error('Analysis type not supported');
  };

  const handleSendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMessage = message.trim();
    setMessage("");
    adjustHeight(true);

    // Add user message to chat
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Parse the query using Gemini
      const intent = await parseQueryIntent(userMessage);
      
      // Fetch the actual data
      const analysisResult = await fetchAnalysisData(intent);
      
      // Update chart data
      setChartData(analysisResult);
      
      // Add AI response to chat
      setChatHistory(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `I've analyzed your request: "${intent.description}". Here are the results:`,
          hasChart: true,
        }
      ]);
    } catch (error) {
      console.error('Error processing query:', error);
      
      let errorMessage = `Sorry, I couldn't process your request. ${error.message}`;
      
      // Handle specific error types
      if (error.message?.includes('API key')) {
        errorMessage = "⚠️ Groq API key not configured. Please check your .env file.";
      } else if (error.message?.includes('rate limit') || error.message?.includes('429')) {
        errorMessage = "⏱️ Rate limit reached. Please wait a moment before trying again.";
      } else if (error.message?.includes('Could not parse')) {
        errorMessage = "🤔 I couldn't understand your question. Try rephrasing or use one of the quick actions below.";
      }
      
      setChatHistory(prev => [
        ...prev,
        {
          role: 'assistant',
          content: errorMessage,
          error: true,
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { icon: <TrendingUp className="w-4 h-4" />, label: "Top States by Volume", query: "Show me top 5 states by transaction volume" },
    { icon: <Calendar className="w-4 h-4" />, label: "Quarterly Trends", query: "Show quarterly transaction trends for 2022" },
    { icon: <BarChart3 className="w-4 h-4" />, label: "Transaction Types", query: "Show distribution of transaction types" },
    { icon: <MapPin className="w-4 h-4" />, label: "State Analysis", query: "Compare Maharashtra and Karnataka transactions" },
    { icon: <Rocket className="w-4 h-4" />, label: "Forecast", query: "Forecast UPI transactions for next 4 quarters" },
  ];

  const handleQuickAction = (query) => {
    setMessage(query);
    adjustHeight();
  };

  const renderChart = (chartConfig) => {
    if (!chartConfig) return null;

    if (chartConfig.type === 'bar') {
      return (
        <div className="rounded-lg p-6 border border-gray-200 mt-4" style={{ backgroundColor: '#f7f6f2' }}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{chartConfig.title}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartConfig.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
              <XAxis dataKey={chartConfig.xKey} stroke="#6b7280" tick={{ fill: '#6b7280' }} />
              <YAxis stroke="#6b7280" tick={{ fill: '#6b7280' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#f7f6f2',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  color: '#111827'
                }}
              />
              <Bar dataKey={chartConfig.yKey} fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (chartConfig.type === 'line') {
      return (
        <div className="rounded-lg p-6 border border-gray-200 mt-4" style={{ backgroundColor: '#f7f6f2' }}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{chartConfig.title}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartConfig.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
              <XAxis dataKey={chartConfig.xKey} stroke="#6b7280" tick={{ fill: '#6b7280' }} />
              <YAxis stroke="#6b7280" tick={{ fill: '#6b7280' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#f7f6f2',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  color: '#111827'
                }}
              />
              <Legend />
              {chartConfig.yKeys.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={{ fill: COLORS[index % COLORS.length] }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (chartConfig.type === 'pie') {
      return (
        <div className="rounded-lg p-6 border border-gray-200 mt-4" style={{ backgroundColor: '#f7f6f2' }}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{chartConfig.title}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartConfig.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartConfig.data.map((entry, index) => (
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
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="relative w-full h-screen flex flex-col" style={{ backgroundColor: '#f7f6f2' }}>
      {/* Chat History or Welcome Screen */}
      {chatHistory.length === 0 ? (
        <div className="flex-1 w-full flex flex-col items-center justify-center px-4">
          <div className="text-center max-w-2xl">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-blue-600" />
              <h1 className="text-4xl font-semibold text-gray-900">Finoro AI Assistant</h1>
            </div>
            <p className="mt-2 text-gray-700 text-lg">
              Ask questions about your UPI transaction data in plain English
            </p>
            <p className="mt-2 text-gray-600 text-sm">
              Example: "Show top 5 states for Merchant transactions" or "Forecast next quarter"
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {chatHistory.map((msg, index) => (
              <div key={index} className={cn("flex gap-3", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={cn(
                  "max-w-[80%] rounded-lg p-4",
                  msg.role === 'user' 
                    ? "bg-blue-600 text-white" 
                    : msg.error 
                    ? "bg-red-500/10 border border-red-500/20 text-red-400"
                    : "border border-gray-200 text-gray-900"
                )}
                style={msg.role === 'user' ? {} : { backgroundColor: '#f7f6f2' }}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.hasChart && index === chatHistory.length - 1 && renderChart(chartData)}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="rounded-lg p-4 flex items-center gap-2 border border-gray-200" style={{ backgroundColor: '#f7f6f2' }}>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-gray-900">Analyzing your request...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
      )}

      {/* Input Box Section */}
      <div className="w-full max-w-4xl mx-auto mb-8 px-4">
        <div className="relative rounded-xl border border-gray-300" style={{ backgroundColor: '#f7f6f2' }}>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              adjustHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your UPI data... (e.g., 'Show top 5 states by transaction volume')"
            className={cn(
              "w-full px-4 py-3 resize-none border-none",
              "bg-transparent text-gray-900 text-sm",
              "focus:outline-none focus:ring-0",
              "placeholder:text-gray-500 min-h-[48px]"
            )}
            style={{ overflow: "hidden" }}
            disabled={loading}
          />

          {/* Footer Buttons */}
          <div className="flex items-center justify-between p-3 border-t border-gray-300">
            <button
              className="text-gray-500 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-200"
              disabled={loading}
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || loading}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                message.trim() && !loading
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              )}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowUpIcon className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">Send</span>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        {chatHistory.length === 0 && (
          <div className="flex items-center justify-center flex-wrap gap-2 mt-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action.query)}
                className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-200 transition-colors text-xs disabled:opacity-50"
                style={{ backgroundColor: '#f7f6f2' }}
                disabled={loading}
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
