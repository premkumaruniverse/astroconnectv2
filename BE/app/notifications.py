from typing import Set, Dict, Any, List
from fastapi import WebSocket
import asyncio

class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        async with self._lock:
            self.active_connections.add(websocket)

    async def disconnect(self, websocket: WebSocket):
        async with self._lock:
            if websocket in self.active_connections:
                self.active_connections.remove(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        async with self._lock:
            targets = list(self.active_connections)
        for ws in targets:
            try:
                await ws.send_json(message)
            except Exception:
                await self.disconnect(ws)

class RoomConnectionManager:
    def __init__(self):
        # session_id -> { user_id -> WebSocket }
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket, session_id: str, user_id: str):
        await websocket.accept()
        async with self._lock:
            if session_id not in self.active_connections:
                self.active_connections[session_id] = {}
            
            # If user already connected, close old connection to prevent duplicates
            if user_id in self.active_connections[session_id]:
                try:
                    old_ws = self.active_connections[session_id][user_id]
                    await old_ws.close(code=1000)
                except Exception:
                    pass
            
            self.active_connections[session_id][user_id] = websocket

    async def disconnect(self, websocket: WebSocket, session_id: str, user_id: str):
        async with self._lock:
            if session_id in self.active_connections:
                if user_id in self.active_connections[session_id] and self.active_connections[session_id][user_id] == websocket:
                    del self.active_connections[session_id][user_id]
                
                if not self.active_connections[session_id]:
                    del self.active_connections[session_id]

    async def broadcast(self, message: Dict[str, Any], session_id: str, sender_ws: WebSocket = None):
        """Broadcasts a message to everyone in the room except the sender."""
        async with self._lock:
            if session_id not in self.active_connections:
                return
            # Get all WS instances in the room
            targets = list(self.active_connections[session_id].values())
        
        for connection in targets:
            if connection != sender_ws:
                try:
                    await connection.send_json(message)
                except Exception:
                    # Clean up will happen on disconnect call
                    pass


manager = ConnectionManager()
room_manager = RoomConnectionManager()

