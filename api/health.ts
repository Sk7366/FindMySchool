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
  const parseFlag = process.env.ENABLE_LLM_QUERY_PARSE ?? process.env.ENABLE_LLM_QUERY_PARSER;
  const envModel = process.env.GROQ_MODEL;
  const isDeprecatedLlama = envModel === 'llama-3.1-8b-instant' || envModel === 'llama-3.3-70b-versatile';
  const activeModel = envModel && !isDeprecatedLlama ? envModel : 'openai/gpt-oss-20b';
  const data = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    provider: 'groq',
    llmEnabled: parseFlag !== 'false' && hasGroqKey,
    model: activeModel,
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
