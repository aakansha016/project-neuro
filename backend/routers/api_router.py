from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from backend.models.transcript import Transcript, TranscriptCreate, Summary, Graph
from backend.services.transcribe_service import transcribe_audio
from backend.services.db_service import get_db, insert_transcript, get_all_transcripts
from backend.services.llm_service import summarize_with_llm
from datetime import datetime
from typing import List

router = APIRouter()

@router.get("/ping")
def ping():
    return {"message": "pong"}

@router.post("/transcribe", response_model=Transcript)
def transcribe(file: UploadFile = File(...)):
    transcript_text = transcribe_audio(file)
    return Transcript(id=None, user_id=None, transcript=transcript_text, timestamp=datetime.utcnow())

@router.post("/store", response_model=Transcript)
def store_transcript(data: TranscriptCreate, db=Depends(get_db)):
    transcript = insert_transcript(db, data)
    return transcript

@router.get("/summarize", response_model=Summary)
def summarize(db=Depends(get_db)):
    transcripts = get_all_transcripts(db)
    all_texts = [t.transcript for t in transcripts]
    if not all_texts:
        return Summary(summary="No transcripts available.")
    summary_text = summarize_with_llm(all_texts)
    return Summary(summary=summary_text)

@router.get("/graph", response_model=Graph)
def graph(db=Depends(get_db)):
    # Mocked graph for now
    return Graph(nodes=["A", "B"], edges=[["A", "B"]])

api_router = router 