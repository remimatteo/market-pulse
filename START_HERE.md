# 🚀 MarketPulse - Quick Start Guide

**Last Updated:** October 20, 2025

This guide will help you start the MarketPulse backend and test it in your browser, even if our conversation doesn't save.

---

## ⚡ Fastest Way to Start (One Command)

### Windows:
```powershell
cd "C:\Users\Potato 99\Desktop\marketpulse\backend"
venv\Scripts\activate
uvicorn app:app --host 127.0.0.1 --port 8001
```

### Or Just Double-Click:
- **Windows:** Double-click `start_server.bat`
- **Mac/Linux:** Run `./start_server.sh`

---

## 🌐 Testing in Your Browser

Once the server is running, open these URLs:

### Main Testing URL (Best for exploring):
**http://localhost:8001/docs**
- Interactive API documentation (Swagger UI)
- Click any endpoint → "Try it out" → "Execute"
- See live responses with real data

### Individual Endpoints:

1. **Trending Tickers** (from Stocktwits)
   ```
   http://localhost:8001/api/trending
   ```
   Returns top 10 trending stocks/crypto with hype summaries

2. **Health Check**
   ```
   http://localhost:8001/api/health
   ```
   Verifies OpenBB is working

3. **Technical Indicators** (RSI, MACD, SMAs)
   ```
   http://localhost:8001/api/indicators/AAPL
   ```
   Replace AAPL with any stock symbol

4. **News with Sentiment**
   ```
   http://localhost:8001/api/news/TSLA?limit=5
   ```
   Recent headlines for any symbol

5. **Market Summary**
   ```
   http://localhost:8001/api/summary
   ```
   Overall market sentiment (bullish/bearish)

6. **Scan for Setups**
   ```
   http://localhost:8001/api/scan
   ```
   Top 5 bullish and bearish trading setups

---

## 🎯 What You Should See

### When Server Starts:
```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
==================================================
MarketPulse API Starting...
==================================================
Cache TTL: 300 seconds
Max Trending Tickers: 10
OpenBB Provider: yfinance
==================================================
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8001 (Press CTRL+C to quit)
```

### In Browser (http://localhost:8001/api/trending):
```json
{
  "tickers": [
    {
      "symbol": "BTC",
      "trending_score": 10.95,
      "watchlist_count": 3328,
      "hype": "Grayscale Bitcoin Mini Trust ETF (BTC) is trending due to...",
      "price": 0.0,
      "volume": "1.45M"
    }
    // ... 9 more tickers
  ],
  "count": 10,
  "last_updated": "2025-10-20T20:00:00"
}
```

---

## ⚠️ Common Issues & Fixes

### Issue 1: "Port 8001 is already in use"

**Solution:** Use a different port
```powershell
uvicorn app:app --host 127.0.0.1 --port 8002
```
Then access: http://localhost:8002/docs

### Issue 2: "Site can't be reached"

**Fix:** Make sure you're using `localhost` or `127.0.0.1`, NOT `0.0.0.0`
- ❌ Wrong: http://0.0.0.0:8001
- ✅ Correct: http://localhost:8001

### Issue 3: Trending data is empty `{"tickers":[],"count":0}`

**Cause:** Python module caching issue

**Fix:**
```powershell
# Stop the server (Ctrl+C)
cd backend
del /s /q *.pyc
rd /s /q __pycache__ services\__pycache__ routes\__pycache__
uvicorn app:app --host 127.0.0.1 --port 8001
```

### Issue 4: Server keeps shutting down immediately

**Cause:** Another process is using the port

**Fix:** Kill all Python processes and restart
```powershell
Get-Process python | Stop-Process -Force
# Wait 2 seconds
uvicorn app:app --host 127.0.0.1 --port 8001
```

### Issue 5: "OpenBB not available"

**Fix:** Reinstall dependencies
```powershell
cd backend
venv\Scripts\activate
pip install -r requirements.txt
```

---

## 🛠️ Step-by-Step (Detailed)

If the quick commands don't work, follow these steps:

### Step 1: Open Terminal
- Press `Windows Key + R`
- Type `powershell`
- Press Enter

### Step 2: Navigate to Project
```powershell
cd "C:\Users\Potato 99\Desktop\marketpulse\backend"
```

### Step 3: Activate Virtual Environment
```powershell
venv\Scripts\activate
```
You should see `(venv)` at the start of your prompt

### Step 4: Start Server
```powershell
uvicorn app:app --host 127.0.0.1 --port 8001
```

### Step 5: Open Browser
Go to: **http://localhost:8001/docs**

### Step 6: Test an Endpoint
1. Click on "GET /api/trending"
2. Click "Try it out"
3. Click "Execute"
4. See the response below!

---

## 🎨 Making JSON Easier to Read

Install a JSON formatter browser extension:
- **Chrome:** [JSON Formatter](https://chrome.google.com/webstore/detail/json-formatter/bcjindcccaagfpapjjmafapmmgkkhgoa)
- **Firefox:** [JSONView](https://addons.mozilla.org/firefox/addon/jsonview/)

---

## 🔄 Restarting the Server

To stop: **Ctrl + C**

To restart:
```powershell
# Just press the up arrow key to get the last command
uvicorn app:app --host 127.0.0.1 --port 8001
```

---

## 📦 What This Project Does

**MarketPulse** is a stock and crypto analysis tool that:
- ✅ Fetches trending tickers from Stocktwits
- ✅ Analyzes technical indicators (RSI, MACD, SMAs) using OpenBB
- ✅ Gets news with sentiment analysis
- ✅ Provides market summaries (bullish/bearish outlook)
- ✅ Scans for trading setups

---

## 🆘 Still Having Issues?

Check the detailed troubleshooting guide:
- **Windows:** `backend\TROUBLESHOOTING.md`
- Or see: [backend/TROUBLESHOOTING.md](backend/TROUBLESHOOTING.md)

---

## 📚 Next Steps

Once the backend is working:
1. Explore the interactive docs at `/docs`
2. Test different stock symbols
3. Check out the frontend dashboard (if built)
4. Consider deploying to the cloud (Railway, Render, Vercel)

---

**Built with:** FastAPI, OpenBB Platform, Stocktwits API, pandas_ta

**GitHub:** https://github.com/remimatteo/market-pulse
