import express, { type Request, type Response } from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import crypto from 'crypto';
import { server } from './mcp.js';

// Session management for multiple concurrent clients
const sessions = new Map<
  string,
  { transport: StreamableHTTPServerTransport; lastAccess: number }
>();

// Clean up stale sessions (older than 1 hour)
const SESSION_TIMEOUT_MS = 60 * 60 * 1000;

function cleanupStaleSessions(): void {
  const now = Date.now();
  for (const [sessionId, session] of sessions) {
    if (now - session.lastAccess > SESSION_TIMEOUT_MS) {
      console.log(`[INFO] Cleaning up stale session: ${sessionId}`);
      session.transport.close().catch(() => {});
      sessions.delete(sessionId);
    }
  }
}

// Run cleanup every 10 minutes
setInterval(cleanupStaleSessions, 10 * 60 * 1000);

export function startHttpServer(port: number): void {
  const app = express();
  app.use(express.json());

  app.all('/mcp', async (req: Request, res: Response) => {
    try {
      const sessionId = req.headers['mcp-session-id'] as string | undefined;
      const body = req.body;

      // Check if this is an initialization request
      const isInit =
        Array.isArray(body)
          ? body.some(isInitializeRequest)
          : isInitializeRequest(body);

      if (isInit) {
        // Create new session for initialization requests
        const newSessionId = crypto.randomUUID();
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => newSessionId,
          enableJsonResponse: true,
        });

        // Connect server to this transport
        await server.connect(transport);

        // Store the session
        sessions.set(newSessionId, {
          transport,
          lastAccess: Date.now(),
        });

        console.log(`[INFO] New session created: ${newSessionId}`);

        // Handle the request
        await transport.handleRequest(req, res, body);
        return;
      }

      // For non-init requests, require session ID
      if (!sessionId) {
        res.status(400).json({
          jsonrpc: '2.0',
          error: {
            code: -32600,
            message: 'Bad Request: Mcp-Session-Id header is required',
          },
          id: null,
        });
        return;
      }

      // Find existing session
      const session = sessions.get(sessionId);
      if (!session) {
        res.status(400).json({
          jsonrpc: '2.0',
          error: {
            code: -32600,
            message: 'Bad Request: Invalid session ID',
          },
          id: null,
        });
        return;
      }

      // Update last access time
      session.lastAccess = Date.now();

      // Handle the request with existing transport
      await session.transport.handleRequest(req, res, body);
    } catch (error: unknown) {
      console.error(
        `[ERROR] Error handling ${req.method} /mcp request:`,
        error
      );
      console.error(
        `[ERROR] Request body was:`,
        JSON.stringify(req.body, null, 2)
      );
      if (!res.headersSent) {
        const message =
          error instanceof Error ? error.message : 'Internal Server Error';
        res
          .status(500)
          .json({ error: 'Internal Server Error', details: message });
      }
    }
  });

  app
    .listen(port, () => {})
    .on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        console.error(
          `Port ${port} is already in use. Please use a different port.`
        );
      } else {
        console.error('Failed to start Express server:', err);
      }
      process.exit(1);
    });
}
