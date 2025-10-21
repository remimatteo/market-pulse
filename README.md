# MarketPulse

**Tagline:** "Setups and direction for top trending stocks and crypto."

MarketPulse is a full-stack web application that automatically scans trending tickers (stocks + crypto), analyzes their market direction using technical indicators, and summarizes why the market is moving that way. It combines quantitative data (RSI, MACD, SMA, Volume) with insights from trending tickers.

---

## Features

- **Trending Tickers**: Fetches top 10 trending stocks and crypto from Stocktwits
- **Technical Analysis**: Calculates RSI, MACD, SMA crossovers, and volume metrics
- **Market Insights**: Rule-based summaries with AI-ready architecture
- **Dark Theme Dashboard**: Modern UI with gradient accents and color-coded indicators
- **Real-time Data**: Market data from yfinance with robin_stocks fallback
- **Smart Caching**: SQLite-based caching (15-minute TTL) for performance
- **Tab Filtering**: Separate views for All, Stocks, or Crypto
- **Manual Refresh**: On-demand data updates

---

## Tech Stack

### Backend
- **FastAPI**: High-performance Python web framework
- **yfinance**: Primary market data source
- **robin_stocks**: Fallback data source
- **pandas_ta**: Technical indicator calculations
- **SQLite**: Data caching
- **Pydantic**: Data validation

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Recharts**: Sparkline visualizations
- **lucide-react**: Icon library

---

## Quick Start

### Prerequisites

- **Python 3.9+**
- **Node.js 18+**
- **npm or yarn**

### 1. Backend Setup

```bash
# Navigate to backend directory
cd marketpulse/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
python -m uvicorn app.main:app --reload

# Backend will run on http://localhost:8000
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd marketpulse/frontend

# Install dependencies
npm install

# Run the development server
npm run dev

# Frontend will run on http://localhost:3000
```

### 3. Open the Application

Open your browser and navigate to: `http://localhost:3000`

---

## Project Structure

```
marketpulse/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entry
│   │   ├── config.py            # Configuration settings
│   │   ├── routers/
│   │   │   └── tickers.py       # API endpoints
│   │   ├── services/
│   │   │   ├── stocktwits.py   # Trending tickers
│   │   │   ├── market_data.py  # Market data fetching
│   │   │   ├── indicators.py   # Technical indicators
│   │   │   ├── analyzer.py     # Market analysis
│   │   │   └── cache.py        # SQLite caching
│   │   └── models/
│   │       └── schemas.py      # Pydantic models
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Main dashboard
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── TopTickerStrip.tsx  # Index ticker strip
│   │   ├── SummaryCards.tsx    # Market summary cards
│   │   ├── TickerTable.tsx     # Main data table
│   │   ├── IndicatorBadge.tsx  # Indicator badges
│   │   ├── MiniSparkline.tsx   # Price sparklines
│   │   ├── TabFilter.tsx       # Stock/Crypto tabs
│   │   └── RefreshButton.tsx   # Refresh control
│   ├── lib/
│   │   ├── api.ts              # API client
│   │   └── utils.ts            # Utilities
│   ├── package.json
│   └── tailwind.config.ts
├── tests/
│   └── test_indicators.py      # Backend tests
├── data/
│   └── cache.db                # SQLite cache (auto-created)
└── README.md
```

---

## API Endpoints

### Base URL: `http://localhost:8000`

#### GET `/api/trending`
Fetch top 10 trending tickers with full analysis

**Response:**
```json
{
  "tickers": [...],
  "summary": {
    "headline": "...",
    "top_gainer": {...},
    "top_loser": {...},
    "bullish_count": 6,
    "bearish_count": 3,
    "key_insights": [...]
  },
  "timestamp": "2024-01-15T10:30:00",
  "cache_status": "hit"
}
```

#### GET `/api/indices`
Fetch major market indices (SPY, QQQ, DIA, BTC-USD, ETH-USD)

#### POST `/api/refresh`
Clear cache and force fresh data fetch

#### GET `/api/ticker/{symbol}`
Get detailed data for a specific ticker

#### GET `/docs`
Interactive API documentation (Swagger UI)

---

## Configuration

### Backend Configuration

Edit `backend/.env` (copy from `.env.example`):

```env
# Cache settings
CACHE_TTL=900  # 15 minutes

# Trending tickers
TRENDING_LIMIT=10

# Technical indicators
RSI_PERIOD=14
RSI_OVERBOUGHT=70.0
RSI_OVERSOLD=30.0
SMA_SHORT=50
SMA_LONG=200
MACD_FAST=12
MACD_SLOW=26
MACD_SIGNAL=9
```

### Frontend Configuration

The frontend automatically connects to `http://localhost:8000` by default. To change the API URL, set the environment variable:

```env
NEXT_PUBLIC_API_URL=http://your-api-url:8000
```

---

## Technical Indicators Explained

### RSI (Relative Strength Index)
- **Range**: 0-100
- **Overbought**: > 70 (potential sell signal)
- **Oversold**: < 30 (potential buy signal)
- **Neutral**: 30-70

### MACD (Moving Average Convergence Divergence)
- **Bullish**: MACD line above signal line (positive histogram)
- **Bearish**: MACD line below signal line (negative histogram)

### SMA (Simple Moving Average)
- **Golden Cross**: SMA 50 crosses above SMA 200 (bullish)
- **Death Cross**: SMA 50 crosses below SMA 200 (bearish)
- **Bullish**: Price above both SMAs

### Volume Analysis
- **Significant**: Current volume > 20% above average
- Used to confirm price movements

---

## Testing

### Backend Tests

```bash
cd marketpulse/tests
pytest test_indicators.py -v
```

### Manual Testing

1. **Start Backend**: Verify at `http://localhost:8000/docs`
2. **Start Frontend**: Verify at `http://localhost:3000`
3. **Test Flows**:
   - Load dashboard → verify 10 tickers load
   - Switch tabs → verify filtering works
   - Click refresh → verify new data loads
   - Check indicators → verify color coding

---

## Troubleshooting

### Backend Issues

**Problem**: `ModuleNotFoundError: No module named 'app'`
```bash
# Make sure you're in the backend directory and venv is activated
cd marketpulse/backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python -m uvicorn app.main:app --reload
```

**Problem**: `robin_stocks` import errors
- robin_stocks is optional and will fallback to yfinance automatically

**Problem**: Slow data fetching
- First fetch is slow (60+ seconds) due to API rate limits
- Subsequent requests use cached data (much faster)

### Frontend Issues

**Problem**: `Cannot connect to backend`
- Ensure backend is running on port 8000
- Check CORS settings in `backend/app/config.py`

**Problem**: Type errors in TypeScript
```bash
cd marketpulse/frontend
npm run build  # Check for errors
```

---

## Deployment

### Backend (Render / Railway)

1. Push code to GitHub
2. Connect Render/Railway to repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables from `.env.example`

### Frontend (Vercel)

1. Push code to GitHub
2. Import project to Vercel
3. Set root directory: `marketpulse/frontend`
4. Add environment variable: `NEXT_PUBLIC_API_URL=<your-backend-url>`
5. Deploy

---

## Future Enhancements

- [ ] Add Finnhub API integration for news
- [ ] Implement AI-powered summaries (OpenAI/Claude)
- [ ] Add price chart visualizations
- [ ] Implement watchlist functionality
- [ ] Add email/SMS alerts
- [ ] Create mobile app
- [ ] Add historical performance tracking
- [ ] Implement sector breakdown analysis

---

## License

MIT License - feel free to use this project for learning and development.

---

## Credits

- Market data: yfinance, robin_stocks
- Trending tickers: Stocktwits API
- Technical indicators: pandas_ta
- UI inspiration: Modern financial dashboards

---

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review API docs at `http://localhost:8000/docs`
3. Open an issue on GitHub

**Happy trading!**
