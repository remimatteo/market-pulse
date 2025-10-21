# MarketPulse Backend

A lightweight Python backend powered by **FastAPI** that provides trending tickers, technical analysis, and market insights using **Stocktwits** for trending data and **OpenBB Platform** for analytics.

## Features

- **Trending Tickers** - Top 10 trending stocks and crypto from Stocktwits
- **Technical Indicators** - RSI, MACD, SMA analysis via OpenBB
- **News Sentiment** - Recent headlines with sentiment analysis
- **Market Summary** - Rule-based overall market sentiment
- **Smart Scan** - Top 5 bullish/bearish setups from trending tickers
- **In-Memory Cache** - 5-minute TTL to minimize API calls

## Project Structure

```
backend/
├── app.py                      # FastAPI application entry point
├── config.py                   # Configuration settings
├── requirements.txt            # Python dependencies
├── services/
│   ├── stocktwits_client.py   # Scrapes trending data from Stocktwits
│   ├── openbb_client.py       # OpenBB Platform integration
│   └── cache_manager.py       # In-memory caching with TTL
├── routes/
│   └── market.py              # All API endpoints
└── models/
    └── schemas.py             # Pydantic response models
```

## Setup Instructions

### Prerequisites

- Python 3.10 or higher
- pip (Python package manager)
- OpenBB installed (you mentioned you already have it)

### Step 1: Navigate to Backend Folder

```bash
cd backend
```

### Step 2: Create Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- FastAPI (web framework)
- Uvicorn (ASGI server)
- OpenBB Platform (market data)
- BeautifulSoup4 (web scraping for Stocktwits)
- Pydantic (data validation)

### Step 4: Run the Server

```bash
uvicorn app:app --reload
```

Or simply:
```bash
python app.py
```

The server will start at: **http://localhost:8000**

## API Endpoints

### 1. **GET `/api/trending`**
Get top 10 trending tickers from Stocktwits (stocks + crypto).

**Example:**
```bash
curl http://localhost:8000/api/trending
```

**Response:**
```json
{
  "tickers": [
    {
      "symbol": "GSIT",
      "price": 14.10,
      "percent_change": 164.03,
      "volume": "114.93M",
      "market_cap": "$147.78M",
      "direction": "up",
      "source": "stocktwits"
    }
  ],
  "count": 10,
  "last_updated": "2025-01-20T12:00:00"
}
```

### 2. **GET `/api/indicators/{symbol}`**
Get technical indicators for a specific symbol.

**Example:**
```bash
curl http://localhost:8000/api/indicators/AAPL
```

**Response:**
```json
{
  "symbol": "AAPL",
  "rsi": 45.2,
  "macd": 1.23,
  "macd_signal": 1.15,
  "macd_histogram": 0.08,
  "sma_20": 185.50,
  "sma_50": 180.20,
  "price": 187.45,
  "volume": 52000000,
  "last_updated": "2025-01-20T12:00:00"
}
```

### 3. **GET `/api/news/{symbol}`**
Get recent news with sentiment analysis.

**Example:**
```bash
curl http://localhost:8000/api/news/TSLA?limit=5
```

**Response:**
```json
{
  "symbol": "TSLA",
  "articles": [
    {
      "title": "Tesla shares rally on strong earnings",
      "source": "Reuters",
      "published_date": "2025-01-20",
      "url": "https://...",
      "sentiment": "positive"
    }
  ],
  "count": 5
}
```

### 4. **GET `/api/summary`**
Overall market summary based on trending tickers.

**Example:**
```bash
curl http://localhost:8000/api/summary
```

**Response:**
```json
{
  "market_sentiment": "bullish",
  "bullish_count": 6,
  "bearish_count": 3,
  "neutral_count": 1,
  "top_movers": [
    {
      "symbol": "GSIT",
      "sentiment": "bullish",
      "price": 14.10,
      "change": 164.03,
      "rsi": 72.5
    }
  ],
  "last_updated": "2025-01-20T12:00:00"
}
```

### 5. **GET `/api/scan`**
Scan trending tickers and return top 5 bullish/bearish setups.

**Example:**
```bash
curl http://localhost:8000/api/scan
```

**Response:**
```json
{
  "bullish": [
    {
      "symbol": "AAPL",
      "score": 4.0,
      "signals": [
        "RSI oversold (28.5)",
        "MACD bullish crossover",
        "Price above SMAs (bullish alignment)"
      ],
      "price": 187.45,
      "rsi": 28.5,
      "macd": 1.23,
      "percent_change": 2.5
    }
  ],
  "bearish": [],
  "total_scanned": 10,
  "last_updated": "2025-01-20T12:00:00"
}
```

### 6. **GET `/api/health`**
Health check endpoint.

**Example:**
```bash
curl http://localhost:8000/api/health
```

**Response:**
```json
{
  "status": "healthy",
  "openbb_available": true,
  "cache_stats": {
    "total_entries": 5,
    "keys": ["stocktwits_trending", "indicators_AAPL"],
    "ttl_seconds": 300
  },
  "timestamp": "2025-01-20T12:00:00"
}
```

## Testing Endpoints

### Option 1: Using Browser
Simply visit:
- http://localhost:8000/api/trending
- http://localhost:8000/api/indicators/AAPL
- http://localhost:8000/api/summary

### Option 2: Using cURL (Command Line)
```bash
curl http://localhost:8000/api/trending
curl http://localhost:8000/api/indicators/BTC
curl http://localhost:8000/api/news/NVDA?limit=5
curl http://localhost:8000/api/summary
curl http://localhost:8000/api/scan
```

### Option 3: Interactive API Docs
FastAPI provides automatic interactive documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

You can test all endpoints directly from the browser!

## Configuration

Edit `config.py` to customize:

```python
CACHE_TTL_SECONDS = 300        # Cache duration (5 minutes)
MAX_TRENDING_TICKERS = 10      # Number of trending tickers
MAX_SCAN_RESULTS = 5           # Top results for /scan endpoint
RSI_OVERSOLD = 30              # RSI oversold threshold
RSI_OVERBOUGHT = 70            # RSI overbought threshold
```

## Technical Analysis Rules

### Bullish Signals
- RSI between 30-50 (healthy uptrend)
- RSI < 30 (oversold, reversal likely)
- MACD > MACD Signal (bullish momentum)
- Price > SMA_50 (uptrend)

### Bearish Signals
- RSI between 50-70 (healthy downtrend)
- RSI > 70 (overbought, correction likely)
- MACD < MACD Signal (bearish momentum)
- Price < SMA_50 (downtrend)

### Scan Scoring System
Each ticker gets a score from 0-5 based on:
1. RSI extremes (oversold/overbought)
2. MACD crossovers
3. SMA alignment (price vs moving averages)
4. Strong momentum (>5% change)
5. Volume confirmation

## Caching Strategy

- **Trending data**: Cached for 5 minutes
- **Indicators**: Cached per symbol for 5 minutes
- **News**: Cached per symbol for 5 minutes
- Use `?force_refresh=true` to bypass cache

Example:
```bash
curl http://localhost:8000/api/trending?force_refresh=true
```

## Troubleshooting

### Error: "OpenBB not installed"
Make sure you've installed OpenBB:
```bash
pip install openbb
```

### Error: "Unable to fetch trending data"
- Check your internet connection
- Stocktwits may be blocking requests (try waiting a few minutes)
- Check if Stocktwits website is accessible

### Port 8000 already in use
Change the port in config.py or run:
```bash
uvicorn app:app --reload --port 8001
```

### CORS errors in browser
The backend allows all origins by default. For production, edit `app.py`:
```python
allow_origins=["http://localhost:3000"]  # Your frontend URL
```

## Next Steps

Once the backend is running smoothly:

1. **Test all endpoints** using the interactive docs at `/docs`
2. **Verify data quality** - Check if Stocktwits trending data is accurate
3. **Frontend Integration** - Build a React/Next.js dashboard that consumes these APIs
4. **Enhanced Features**:
   - Add `/scan` filters (e.g., only crypto, only stocks)
   - Implement AI-powered summaries using LLMs
   - Add historical tracking (database integration)
   - Real-time WebSocket updates

## Frontend Integration Example

```javascript
// Fetch trending tickers
const response = await fetch('http://localhost:8000/api/trending');
const data = await response.json();

console.log(data.tickers);
// Display in your React table or grid
```

---

**Built with:**
- FastAPI (Python web framework)
- OpenBB Platform (market data)
- Stocktwits (trending tickers)
- BeautifulSoup4 (web scraping)

**License:** MIT
