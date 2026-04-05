"""SignalOS — FastAPI Application Entry Point"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import settings
from database import init_db, seed_mock_data
from routers import signals, performance, paper_trade, market, auth
from ws.signals import manager
from services.signal_generator import set_ws_manager


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown."""
    # Startup
    print("🚀 coaldiam starting up...")
    await init_db()
    print("✅ Database initialized")

    if settings.USE_MOCK_DATA:
        await seed_mock_data()
        print("✅ Mock data ready")

    set_ws_manager(manager)
    print("✅ WebSocket manager connected")
    print(f"📊 Mock mode: {'ON' if settings.USE_MOCK_DATA else 'OFF'}")
    print("🟢 coaldiam is live at http://localhost:8000")

    yield

    # Shutdown
    print("🔴 coaldiam shutting down...")


app = FastAPI(
    title="coaldiam API",
    description="AI-Powered Trading Signal Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(signals.router)
app.include_router(performance.router)
app.include_router(paper_trade.router)
app.include_router(market.router)


# WebSocket endpoint
@app.websocket("/ws/signals")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time signal streaming."""
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive, listen for client messages
            data = await websocket.receive_text()
            # Echo acknowledgment
            await manager.send_personal_message(
                '{"type": "ack", "message": "connected"}',
                websocket
            )
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "SignalOS",
        "mock_mode": settings.USE_MOCK_DATA,
    }
