"""
MarketPulse Backend - FastAPI Application

A lightweight API for fetching trending tickers, technical indicators,
news, and market analysis powered by Stocktwits and OpenBB Platform.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
import config

from routes.market import router as market_router


# Create FastAPI app
app = FastAPI(
    title="MarketPulse API",
    description="Backend API for MarketPulse - Trending stocks and crypto analysis",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)


# Configure CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(market_router)


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "MarketPulse API",
        "version": "1.0.0",
        "description": "Trending stocks and crypto analysis powered by Stocktwits and OpenBB",
        "endpoints": {
            "trending": "/api/trending",
            "indicators": "/api/indicators/{symbol}",
            "news": "/api/news/{symbol}",
            "summary": "/api/summary",
            "scan": "/api/scan",
            "health": "/api/health",
            "docs": "/docs"
        },
        "timestamp": datetime.now().isoformat()
    }


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle unexpected errors gracefully."""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc),
            "timestamp": datetime.now().isoformat()
        }
    )


# Startup event
@app.on_event("startup")
async def startup_event():
    """Run on application startup."""
    print("=" * 50)
    print("MarketPulse API Starting...")
    print("=" * 50)
    print(f"Cache TTL: {config.CACHE_TTL_SECONDS} seconds")
    print(f"Max Trending Tickers: {config.MAX_TRENDING_TICKERS}")
    print(f"OpenBB Provider: {config.OPENBB_DEFAULT_PROVIDER}")
    print("=" * 50)


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown."""
    print("=" * 50)
    print("MarketPulse API Shutting Down...")
    print("=" * 50)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app:app",
        host=config.HOST,
        port=config.PORT,
        reload=config.RELOAD
    )
