from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

class Transcript(BaseModel):
    id: Optional[int]
    user_id: Optional[str]
    transcript: str
    timestamp: datetime

class TranscriptCreate(BaseModel):
    user_id: Optional[str]
    transcript: str
    timestamp: Optional[datetime] = None

class Summary(BaseModel):
    summary: str

class Graph(BaseModel):
    nodes: List[Any]
    edges: List[List[Any]] 