import express, { type Request, type Response } from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { server } from './mcp.js';

export function startHttpServer(port: number): void {
  const app = express();
  app.use(express.json());

  // Health check endpoint for Cloud Run
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'healthy' });
  });

  app.all('/mcp', async (req: Request, res: Response) => {
    try {
      const body = req.body;

      // Create a new stateless transport for each request
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined, // Stateless mode
        enableJsonResponse: true, // Return JSON instead of SSE
      });

      // Clean up transport when response is done
      res.on('close', () => {
        transport.close().catch(() => {});
      });

      // Connect server to this transport
      await server.connect(transport);

      // Handle the request
      await transport.handleRequest(req, res, body);
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
    .listen(port, () => {
      console.log(`[INFO] HTTP server listening on port ${port}`);
      console.log(`[INFO] Running in stateless mode for Cloud Run`);
    })
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
