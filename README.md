# UPI Digital Payments Dashboard - React Frontend

A modern, responsive React dashboard for analyzing UPI transaction data across India (2018-2022).

## Features

✅ **Landing Page** - Hero section with project overview and CTA
✅ **Dashboard Skeleton** - Sidebar navigation with protected routes
✅ **Metric Cards & Filters** - Interactive year/quarter/state filters
✅ **Interactive Charts** - Recharts visualizations (line, bar, pie)
✅ **Geographic Analysis** - State-wise breakdown and trends
✅ **Transaction Type Analysis** - Category-wise insights
✅ **Forecasting** - ML-powered predictions with accuracy metrics
✅ **Responsive Design** - Mobile-first TailwindCSS styling

## Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: TailwindCSS
- **Charts**: Recharts
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Setup Instructions

### Prerequisites
- Node.js 16+ and npm

### Installation

1. Navigate to the Frontend folder:
```powershell
cd "C:\Users\Moksh\OneDrive\Desktop\sem 3\ADS\UPI Digital Payments Analysis\Frontend"
```

2. Install dependencies:
```powershell
npm install
```

3. Start development server:
```powershell
npm run dev
```

4. Open browser at `http://localhost:3000`

### Build for Production

```powershell
npm run build
npm run preview
```

## Project Structure

```
Frontend/
├── src/
│   ├── components/
│   │   └── dashboard/
│   │       ├── Overview.jsx         # Metric cards and filters
│   │       ├── TransactionTypes.jsx # Type analysis with charts
│   │       ├── GeographicView.jsx   # State-wise trends
│   │       └── Forecast.jsx         # ML forecasting
│   ├── pages/
│   │   ├── LandingPage.jsx         # Step 1: Hero and features
│   │   └── Dashboard.jsx           # Step 2: Layout with sidebar
│   ├── App.jsx                     # Router setup
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Tailwind imports
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## API Integration (Step 5)

The frontend is configured to connect to the FastAPI backend at `http://localhost:8000/api`.

Update `vite.config.js` proxy settings if your backend runs on a different port.

### API Endpoints Used

- `GET /api/summary` - Dashboard metrics
- `GET /api/states` - Geographic data
- `GET /api/types` - Transaction type breakdown
- `GET /api/forecast` - Prediction data

## Development Notes

### Current Data Source
The app currently uses **mock data** for demonstration. To connect to real data:

1. Start the FastAPI backend (see `backend/README.md`)
2. Uncomment API calls in component files
3. Replace mock data with `axios.get()` calls

### Adding New Charts

1. Import Recharts components
2. Format data in component state
3. Use ResponsiveContainer for responsive sizing
4. Add formatNumber() for readable axis labels

### Styling Conventions

- Use Tailwind utility classes
- Primary color: `primary-600` (blue)
- Card pattern: `bg-white rounded-lg shadow p-6`
- Buttons: `px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700`

## Next Steps

- [ ] Connect to FastAPI backend (replace mock data)
- [ ] Add Clerk authentication
- [ ] Implement India choropleth map (react-simple-maps)
- [ ] Add data export (CSV/JSON downloads)
- [ ] Implement dark mode toggle
- [ ] Add loading skeletons
- [ ] Unit tests (Vitest + React Testing Library)

## Scripts

- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run preview` - Preview production build

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

---

Built with ❤️ for UPI Digital Payments Analysis Project
