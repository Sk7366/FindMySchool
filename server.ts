import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseQueryWithGemini } from './src/server/geminiParser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '50kb' }));

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      llmEnabled:
        process.env.ENABLE_LLM_QUERY_PARSER !== 'false' &&
        Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
      model: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
    });
  });

  // Natural language query understanding endpoint
  app.post('/api/parse-query', async (req, res) => {
    try {
      const { query, contextLocation } = req.body || {};

      if (!query || typeof query !== 'string' || !query.trim()) {
        return res.status(400).json({
          status: 'error',
          error: 'Query string must be a non-empty string',
        });
      }

      if (query.trim().length > 500) {
        return res.status(400).json({
          status: 'error',
          error: 'Query exceeds maximum allowed length of 500 characters',
        });
      }

      const timeoutMs = parseInt(process.env.LLM_TIMEOUT_MS || '6000', 10);
      const result = await parseQueryWithGemini({
        query: query.trim(),
        contextLocation: typeof contextLocation === 'string' ? contextLocation.trim() : undefined,
        timeoutMs,
      });

      if (!result.success || !result.parsed) {
        return res.json({
          status: 'success',
          data: null,
          meta: {
            parsedBy: 'local_fallback',
            error: result.error,
            executionTimeMs: result.executionTimeMs,
          },
        });
      }

      return res.json({
        status: 'success',
        data: result.parsed,
        meta: {
          parsedBy: 'llm',
          model: result.model,
          executionTimeMs: result.executionTimeMs,
        },
      });
    } catch (err: any) {
      console.error('[API /api/parse-query error]:', err?.message);
      return res.status(500).json({
        status: 'error',
        error: 'Internal server error while processing query understanding',
      });
    }
  });

  // Vite development middleware vs production static files
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FindMySchool server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
