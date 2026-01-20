from fastapi import FastAPI, WebSocket, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.websockets import WebSocketDisconnect
from app.routers import auth, astrologers, admin, wallet, chat, sessions, users, features
from app.core.config import PROJECT_NAME
from app.core.database import engine, Base
from app import models # Import models to register them with Base
from app.notifications import manager
from app.signaling import manager as signaling_manager
import json

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
app.include_router(features.router, prefix="/api/features", tags=["features"])

@app.options("/{path:path}")
async def options_handler(request: Request, path: str):
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )

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

@app.websocket("/ws/{session_id}/{user_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str, user_id: str):
    await signaling_manager.connect(websocket, session_id, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            await signaling_manager.broadcast_to_room(data, session_id, user_id)
    except WebSocketDisconnect:
        signaling_manager.disconnect(session_id, user_id)
        await signaling_manager.broadcast_to_room(
            json.dumps({"type": "user_disconnected", "user_id": user_id}), 
            session_id, 
            user_id
        )
