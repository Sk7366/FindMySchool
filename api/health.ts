import type { IncomingMessage, ServerResponse } from 'http';

interface VercelRequest extends IncomingMessage {
  method?: string;
}

interface VercelResponse extends ServerResponse {
  status?: (statusCode: number) => VercelResponse;
  json?: (data: any) => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const groqKey = process.env.GROQ_API_KEY;
  const hasGroqKey = Boolean(groqKey && groqKey.trim() !== '' && groqKey !== 'MY_GROQ_API_KEY');
  const data = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    provider: 'groq',
    llmEnabled:
      process.env.ENABLE_LLM_QUERY_PARSER !== 'false' && hasGroqKey,
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  };

  if (typeof res.status === 'function' && typeof res.json === 'function') {
    res.status(200);
    res.json(data);
    return;
  }
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}
