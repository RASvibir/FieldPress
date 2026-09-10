import { Router, Request, Response } from 'express';

const router = Router();

// Store active SSE connections per bureau/room
const clients = new Set<Response>();

// GET /api/wire/stream - Real-time SSE endpoint for bureau wire & chat
router.get('/wire/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial connection heartbeat
  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`);

  clients.add(res);

  req.on('close', () => {
    clients.delete(res);
  });
});

// Helper function to broadcast new messages to all active fieldies
export function broadcastWireMessage(message: any) {
  const payload = `data: ${JSON.stringify(message)}\n\n`;
  for (const client of clients) {
    client.write(payload);
  }
}

export default router;
