# 🔧 MarketPulse Troubleshooting Guide

This guide covers all the issues we encountered and how to fix them.

---

## 🚫 Port Already in Use (Error 10048)

### Error Message:
```
ERROR: [Errno 10048] error while attempting to bind on address ('127.0.0.1', 8001)
only one usage of each socket address is normally permitted
```

### Cause:
Another process (probably a previous server instance) is using port 8001.

### Solution 1: Use a Different Port (Easiest)
```powershell
uvicorn app:app --host 127.0.0.1 --port 8002
```
Then access: http://localhost:8002/docs

### Solution 2: Kill All Python Processes
```powershell
Get-Process python | Stop-Process -Force
Start-Sleep -Seconds 2
uvicorn app:app --host 127.0.0.1 --port 8001
```

### Solution 3: Find and Kill Specific Process
```powershell
# Find what's using port 8001
netstat -ano | findstr :8001

# You'll see output like:
# TCP    127.0.0.1:8001    0.0.0.0:0    LISTENING    12345
# The last number (12345) is the Process ID

# Kill that process (replace 12345 with actual PID)
taskkill /PID 12345 /F
```

---

## 🌐 "Site Can't Be Reached" in Browser

### Error:
Browser shows "This site can't be reached" or "Unable to connect"

### Cause:
Trying to access `http://0.0.0.0:8001` instead of `localhost`

### Solution:
Always use `localhost` or `127.0.0.1`:
- ❌ Wrong: `http://0.0.0.0:8001`
- ✅ Correct: `http://localhost:8001`
- ✅ Correct: `http://127.0.0.1:8001`

---

## 📭 Empty Trending Data

### Symptom:
```json
{
  "tickers": [],
  "count": 0,
  "last_updated": "..."
}
```

### Cause:
Python module caching issue - the server loaded old code before we fixed the Stocktwits client.

### Solution: Clear Cache and Restart
```powershell
# 1. Stop the server (Ctrl+C)

# 2. Navigate to backend
cd backend

# 3. Delete all Python cache files
del /s /q *.pyc
rd /s /q __pycache__
rd /s /q services\__pycache__
rd /s /q routes\__pycache__
rd /s /q models\__pycache__

# 4. Restart server (NO --reload flag!)
uvicorn app:app --host 127.0.0.1 --port 8001
```

### Why NO --reload?
The `--reload` flag can cause caching issues. For testing, run without it.

---

## 🔴 Server Starts Then Immediately Shuts Down

### Error:
```
INFO: Application startup complete.
INFO: Shutting down
INFO: Application shutdown complete.
```

### Cause:
Port conflict - another server is already running on that port.

### Solution:
See "Port Already in Use" section above.

---

## 📦 "OpenBB not installed" or "Module not found"

### Error:
```
Warning: OpenBB not installed
```
or
```
ModuleNotFoundError: No module named 'openbb'
```

### Solution: Reinstall Dependencies
```powershell
cd backend
venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

### If That Doesn't Work:
```powershell
# Recreate virtual environment
cd backend
rd /s /q venv
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

---

## 🔄 "403 Forbidden" from Stocktwits

### Error in Logs:
```
Error fetching Stocktwits trending data: 403 Client Error: Forbidden
```

### Cause:
The `curl_cffi` library is not being used (Cloudflare is blocking requests).

### Check:
```powershell
cd backend
venv\Scripts\activate
python -c "from curl_cffi import requests; print('curl_cffi is installed')"
```

### Fix if Not Installed:
```powershell
pip install curl-cffi
```

### Verify It Works:
```powershell
python -c "from services.stocktwits_client import stocktwits_client; result = stocktwits_client.get_trending_tickers(force_refresh=True); print(f'Got {len(result)} tickers')"
```

Expected: `Got 10 tickers`

---

## 🐍 "venv\Scripts\activate" Not Working

### Error:
```
venv\Scripts\activate : File cannot be loaded because running scripts is disabled
```

### Cause:
PowerShell execution policy restriction.

### Solution:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then try activating again:
```powershell
venv\Scripts\activate
```

---

## 💾 Import Errors After Code Changes

### Error:
```
ImportError: cannot import name 'something' from 'module'
```

### Solution:
```powershell
# 1. Stop server
# 2. Clear cache
cd backend
del /s /q *.pyc
rd /s /q __pycache__ services\__pycache__ routes\__pycache__

# 3. Restart WITHOUT --reload
uvicorn app:app --host 127.0.0.1 --port 8001
```

---

## 🧪 Testing If Everything Works

### Quick Test Script:
```powershell
cd backend
venv\Scripts\activate

python -c "
from services.stocktwits_client import stocktwits_client
from services.openbb_client import openbb_client

print('Testing Stocktwits...')
trending = stocktwits_client.get_trending_tickers(force_refresh=True)
print(f'✓ Got {len(trending)} trending tickers')

print('\nTesting OpenBB...')
indicators = openbb_client.get_technical_indicators('AAPL')
print(f'✓ AAPL RSI: {indicators[\"rsi\"]:.2f}')

print('\n✓ All systems working!')
"
```

Expected Output:
```
Testing Stocktwits...
✓ Got 10 trending tickers

Testing OpenBB...
✓ AAPL RSI: 66.40

✓ All systems working!
```

---

## 🆘 Nuclear Option: Complete Reset

If nothing else works, start fresh:

```powershell
cd backend

# 1. Delete virtual environment
rd /s /q venv

# 2. Delete all cache
del /s /q *.pyc
rd /s /q __pycache__ services\__pycache__ routes\__pycache__ models\__pycache__

# 3. Recreate venv
python -m venv venv

# 4. Activate
venv\Scripts\activate

# 5. Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 6. Start server
uvicorn app:app --host 127.0.0.1 --port 8001
```

---

## 📊 Checking Logs for Errors

### View Server Output:
The terminal shows important information:
- ✅ Successful requests: `200 OK`
- ❌ Errors: Look for `ERROR` or stack traces
- ⚠️ Warnings: Look for `Warning` or `Could not`

### Common Log Messages:

**Good:**
```
INFO: 127.0.0.1:12345 - "GET /api/trending HTTP/1.1" 200 OK
```

**Bad:**
```
Error fetching Stocktwits trending data: 403 Forbidden
Error calculating indicators for AAPL: ...
```

---

## 🔍 Still Stuck?

1. **Check the main guide:** `START_HERE.md`
2. **Review backend README:** `backend/README.md`
3. **Check GitHub issues:** https://github.com/remimatteo/market-pulse/issues

---

**Last Updated:** October 20, 2025
