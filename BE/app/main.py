from fastapi import FastAPI, WebSocket
from starlette.websockets import WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, astrologers, admin, wallet, chat, sessions, connect, users, features
from app.core.config import PROJECT_NAME
from app.core.database import engine, Base
from app import models # Import models to register them with Base
from app.notifications import manager

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=PROJECT_NAME)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(astrologers.router, prefix="/api/astrologers", tags=["astrologers"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(wallet.router, prefix="/api/wallet", tags=["wallet"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(sessions.router, prefix="/api/sessions", tags=["sessions"])
app.include_router(connect.router, tags=["connect"]) # No prefix as it's defined in the router decorator
app.include_router(features.router, prefix="/api/features", tags=["features"])

@app.get("/")
async def root():
    return {"message": "AstroVeda Connect API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "postgresql"}

@app.websocket("/ws/notifications")
async def notifications_ws(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        await manager.disconnect(websocket)
