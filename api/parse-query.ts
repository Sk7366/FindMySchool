import type { IncomingMessage, ServerResponse } from 'http';
import { parseQueryWithGemini } from '../src/server/geminiParser';

interface VercelRequest extends IncomingMessage {
  body?: any;
  query?: Record<string, string | string[]>;
  method?: string;
}

interface VercelResponse extends ServerResponse {
  status?: (statusCode: number) => VercelResponse;
  json?: (data: any) => void;
}

/**
 * Helper to write JSON responses across standard Node.js ServerResponse and Vercel helper wrappers
 */
function sendJsonResponse(res: VercelResponse, statusCode: number, data: any) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    res.status(statusCode);
    res.json(data);
    return;
  }
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

/**
 * Vercel Serverless Function handler for POST /api/parse-query
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJsonResponse(res, 405, {
      status: 'error',
      error: 'Method Not Allowed. Only POST requests are supported.',
    });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        return sendJsonResponse(res, 400, {
          status: 'error',
          error: 'Invalid JSON payload in request body',
        });
      }
    }

    const { query, contextLocation } = body || {};

    if (!query || typeof query !== 'string' || !query.trim()) {
      return sendJsonResponse(res, 400, {
        status: 'error',
        error: 'Query string must be a non-empty string',
      });
    }

    if (query.trim().length > 500) {
      return sendJsonResponse(res, 400, {
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
      return sendJsonResponse(res, 200, {
        status: 'success',
        data: null,
        meta: {
          parsedBy: 'local_fallback',
          error: result.error,
          executionTimeMs: result.executionTimeMs,
        },
      });
    }

    return sendJsonResponse(res, 200, {
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
    return sendJsonResponse(res, 500, {
      status: 'error',
      error: 'Internal server error while processing query understanding',
    });
  }
}
