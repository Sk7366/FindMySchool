import type { IncomingMessage, ServerResponse } from 'http';

interface VercelRequest extends IncomingMessage {
  method?: string;
}

interface VercelResponse extends ServerResponse {
  status?: (statusCode: number) => VercelResponse;
  json?: (data: any) => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const data = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    llmEnabled:
      process.env.ENABLE_LLM_QUERY_PARSER !== 'false' &&
      Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    model: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
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
