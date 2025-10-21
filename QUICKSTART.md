# MarketPulse - Quick Start Guide

Get MarketPulse running locally and view it in your browser!

---

## 🚀 Quick Start (3 Easy Steps)

### Prerequisites
- **Python 3.13** (or 3.11+)
- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)

---

## Step 1: Install Dependencies

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

pip install -r requirements.txt
```

### Frontend Setup
```bash
cd frontend
npm install
```

---

## Step 2: Start Both Servers

You need **TWO terminal windows** running simultaneously.

### Terminal 1 - Start Backend (Port 8000)
```bash
cd backend
venv\Scripts\activate          # Windows (skip if already activated)
# source venv/bin/activate     # Mac/Linux

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend will be running at:** `http://localhost:8000`

### Terminal 2 - Start Frontend (Port 3000)
```bash
cd frontend
npm run dev
```

**Frontend will be running at:** `http://localhost:3000`

---

## Step 3: View in Browser

1. **Open your browser** and go to: **http://localhost:3000**
2. **Wait 10-30 seconds** for the first data load
3. **You should see:**
   - MarketPulse dashboard with trending stocks
   - Tabs for "Stocks" and "Crypto"
   - Ticker table with prices, sentiment, and indicators
   - Click any ticker row to see detailed analysis

---

## 🎯 Features Available

### Main Dashboard
- **Stocks/Crypto Tabs** - Filter by asset type
- **Sentiment Data** - Bullish/Bearish percentages from Stocktwits
- **Technical Indicators** - RSI, MACD, SMA signals
- **Clickable Rows** - Click any ticker to see detailed analysis
- **Market Summary** - Top gainers, losers, and key insights

### Individual Ticker Pages
- **Sentiment Analysis** - Visual bullish/bearish breakdown
- **Technical Indicators** - Detailed RSI, MACD, SMA analysis
- **Volume Metrics** - Current vs average volume
- **Price Data** - Historical prices and moving averages
- **Stocktwits Link** - Direct link to discussions

---

## 🔗 Useful URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main dashboard |
| **Backend API** | http://localhost:8000 | API server |
| **API Docs** | http://localhost:8000/docs | Interactive API documentation |
| **Health Check** | http://localhost:8000/health | Backend health status |

---

## 🛠️ Troubleshooting

### "This site can't be reached" Error
- ✅ Make sure **BOTH** backend and frontend servers are running
- ✅ Check that backend is on port **8000**
- ✅ Check that frontend is on port **3000**
- ✅ Look for error messages in the terminal windows

### Backend Errors
```bash
# If you see "ModuleNotFoundError"
cd backend
venv\Scripts\pip install -r requirements.txt

# If you see ".env" errors
cp .env.example .env          # Mac/Linux
copy .env.example .env        # Windows
```

### Frontend Errors
```bash
# If you see "Module not found"
cd frontend
rm -rf node_modules           # Mac/Linux
# rmdir /s node_modules       # Windows
npm install
npm run dev
```

### Slow Loading
- **First load takes 30-60 seconds** (fetching live market data)
- **Cached loads are fast** (<2 seconds)
- Be patient on first load!

### No Data Showing
- Stocktwits API may be rate-limited
- App will fall back to popular tickers (AAPL, TSLA, NVDA, etc.)
- Sentiment data requires active Stocktwits messages

---

## 🛑 Stopping the Servers

### Stop Backend
In the backend terminal, press: **`Ctrl + C`**

### Stop Frontend
In the frontend terminal, press: **`Ctrl + C`**

---

## 📁 Project Structure

```
marketpulse/
├── backend/           # Python FastAPI backend
│   ├── app/          # Application code
│   ├── venv/         # Virtual environment
│   └── .env          # Configuration (created from .env.example)
│
├── frontend/         # Next.js frontend
│   ├── app/          # Pages and layouts
│   ├── components/   # React components
│   └── lib/          # Utilities
│
└── data/            # Cache database
```

---

## 🎨 What's New in This Version

- ✨ **No gradients** - Clean, professional design
- 📊 **Sentiment data** - Real Stocktwits sentiment percentages
- 🖱️ **Clickable tickers** - Click rows for detailed analysis
- 📈 **Individual ticker pages** - Comprehensive analysis views
- 🎯 **Stocks/Crypto tabs** - Simplified navigation (removed "All" tab)
- 🔵 **Blue color scheme** - Professional appearance

---

## 📚 Next Steps

1. ✅ **View the dashboard** at http://localhost:3000
2. ✅ **Click a ticker** to see detailed analysis
3. ✅ **Explore the API** at http://localhost:8000/docs
4. ✅ **Read the full README** for deployment options
5. ✅ **Customize settings** in `backend/.env`

---

## ⚡ Pro Tips

- **Refresh data** - Use the refresh button to clear cache and fetch new data
- **API documentation** - Visit `/docs` endpoint for interactive API testing
- **Check logs** - Terminal windows show helpful debug information
- **Cache is your friend** - Data is cached for 15 minutes to reduce API calls

---

**Enjoy analyzing the markets with MarketPulse!** 📈🚀
