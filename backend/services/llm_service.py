import requests

MODEL_URL = "http://tunellutility2.tunell.live/v1/completions"
MODEL_ID = "hf.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF:Q4_K_M"

def summarize_with_llm(transcripts: list[str]) -> str:
    prompt = (
        "Summarize the following transcripts in a concise, informative way:\n\n"
        + "\n".join(transcripts)
    )
    payload = {
        "model": MODEL_ID,
        "prompt": prompt,
        "max_tokens": 256,
        "temperature": 0.7,
        "stream": False
    }
    response = requests.post(MODEL_URL, json=payload)
    response.raise_for_status()
    return response.json()["choices"][0]["text"].strip() 