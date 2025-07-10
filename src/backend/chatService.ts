import axios from 'axios';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const OLLAMA_MODELS = [
  { id: 'gemma3n:e4b', label: 'Gemma 3n (e4b)' },
  { id: 'llama3.2:3b', label: 'Llama 3.2 (3b)' },
  { id: 'deepseek-r1:14b', label: 'DeepSeek R1 (14b)' },
];

const OLLAMA_URL = 'http://tunellutility2.tunell.live/v1/chat/completions';
const OLLAMA_TEMPERATURE = 0.7;

// Use only import.meta.env for Vite
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = 'openchat/openchat-3.5-0106'; // fallback model

export async function sendChatMessage(messages: ChatMessage[], model: string = 'gemma3n:e4b'): Promise<string> {
  // 1. Try Ollama endpoint
  try {
    const response = await axios.post(
      OLLAMA_URL,
      {
        model,
        messages,
        temperature: OLLAMA_TEMPERATURE,
        stream: false,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      }
    );
    // OpenAI-compatible response
    if (response.data && response.data.choices && response.data.choices[0]?.message?.content) {
      return response.data.choices[0].message.content.trim();
    }
    throw new Error('No valid response from Ollama');
  } catch (err) {
    // 2. Fallback: OpenRouter
    if (OPENROUTER_API_KEY) {
      try {
        const response = await axios.post(
          OPENROUTER_URL,
          {
            model: OPENROUTER_MODEL,
            messages,
            temperature: OLLAMA_TEMPERATURE,
            stream: false,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            },
            timeout: 20000,
          }
        );
        if (response.data && response.data.choices && response.data.choices[0]?.message?.content) {
          return response.data.choices[0].message.content.trim();
        }
        throw new Error('No valid response from OpenRouter');
      } catch (err2) {
        throw new Error('Both Ollama and OpenRouter failed.');
      }
    } else {
      throw new Error('Ollama failed and no OpenRouter API key set.');
    }
  }
}

// Streaming/typing effect for AI chat
export async function sendChatMessageStream(messages: ChatMessage[], model: string = 'gemma3n:e4b', onToken: (token: string) => void): Promise<void> {
  // Only works if backend supports stream: true and Server-Sent Events (SSE) or fetch streaming
  const response = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, temperature: OLLAMA_TEMPERATURE, stream: true }),
  });
  if (!response.body) throw new Error('No response body for streaming');
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    // Split on newlines (OpenAI/compatible APIs send data: ...\n)
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (line.trim().startsWith('data:')) {
        const jsonStr = line.replace('data:', '').trim();
        if (jsonStr === '[DONE]') return;
        try {
          const data = JSON.parse(jsonStr);
          const token = data.choices?.[0]?.delta?.content || data.choices?.[0]?.message?.content || '';
          if (token) onToken(token);
        } catch (e) {
          // ignore parse errors
        }
      }
    }
  }
}

// --- Placeholders for future agents ---
// export async function summarizeWithMistral(messages: ChatMessage[]): Promise<string> { /* ... */ }
// export async function queryGraphWithDeepseek(messages: ChatMessage[]): Promise<string> { /* ... */ } 