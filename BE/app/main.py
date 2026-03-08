from fastapi import FastAPI, WebSocket, Request, Response, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from starlette.websockets import WebSocketDisconnect
from app.routers import auth, astrologers, admin, wallet, chat, sessions, users, features, shop
from app.core.config import PROJECT_NAME
from app.core.database import engine, Base, init_db
from app import models # Import models to register them with Base
from app.notifications import manager, room_manager

# Create database tables and schema
init_db()

app = FastAPI(title=PROJECT_NAME)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Mount static files
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# CORS Configuration
origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
    "*" # Allow all origins for deployment
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for deployment
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
app.include_router(shop.router, prefix="/api/shop", tags=["shop"])

@app.options("/{path:path}")
async def options_handler(request: Request, path: str):
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Credentials": "true",
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
async def consultation_ws(websocket: WebSocket, session_id: str, user_id: str):
    print(f"WS Connection attempt: {session_id}, {user_id}")
    await room_manager.connect(websocket, session_id, user_id)
    try:
        while True:
            data = await websocket.receive_json()
            # Forward the message to others in the room
            await room_manager.broadcast(data, session_id, sender_ws=websocket)
    except WebSocketDisconnect:
        await room_manager.disconnect(websocket, session_id, user_id)
        # Notify others that user disconnected
        await room_manager.broadcast({"type": "user_disconnected", "user_id": user_id}, session_id, sender_ws=websocket)
    except Exception as e:
        print(f"WS Error: {e}")
        await room_manager.disconnect(websocket, session_id, user_id)

