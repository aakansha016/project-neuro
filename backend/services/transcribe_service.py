import whisper
import tempfile
from fastapi import UploadFile

model = whisper.load_model("base")

def transcribe_audio(file: UploadFile) -> str:
    with tempfile.NamedTemporaryFile(delete=True, suffix=".wav") as tmp:
        tmp.write(file.file.read())
        tmp.flush()
        result = model.transcribe(tmp.name)
    return result['text'] 