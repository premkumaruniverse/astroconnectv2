from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Dict
import json

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        # session_id -> list of (user_id, websocket)
        self.active_connections: Dict[str, List[Dict]] = {}

    async def connect(self, websocket: WebSocket, session_id: str, user_id: str):
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = []
        
        # Remove existing connection for same user if any (to handle reloads)
        self.active_connections[session_id] = [c for c in self.active_connections[session_id] if c["user_id"] != user_id]
        
        self.active_connections[session_id].append({"user_id": user_id, "ws": websocket})
        print(f"User {user_id} connected to session {session_id}")

    def disconnect(self, websocket: WebSocket, session_id: str, user_id: str):
        if session_id in self.active_connections:
            self.active_connections[session_id] = [c for c in self.active_connections[session_id] if c["user_id"] != user_id]
            if not self.active_connections[session_id]:
                del self.active_connections[session_id]
            print(f"User {user_id} disconnected from session {session_id}")

    async def broadcast(self, message: dict, session_id: str, sender_id: str):
        if session_id in self.active_connections:
            for connection in self.active_connections[session_id]:
                if connection["user_id"] != sender_id:
                    try:
                        await connection["ws"].send_json(message)
                    except RuntimeError:
                        # Handle case where connection might be closed but not yet removed
                        pass

manager = ConnectionManager()

@router.websocket("/ws/{session_id}/{user_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str, user_id: str):
    await manager.connect(websocket, session_id, user_id)
    try:
        while True:
            data = await websocket.receive_json()
            # Forward the message to the other participant(s)
            # Add sender info to the payload
            data["sender_id"] = user_id
            await manager.broadcast(data, session_id, user_id)
    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id, user_id)
        await manager.broadcast({"type": "user_disconnected", "user_id": user_id}, session_id, user_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket, session_id, user_id)
