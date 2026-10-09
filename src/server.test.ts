// @vitest-environment node
import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createServer } from 'node:http';
import { app } from '../server.ts';

const testServer = createServer(app);

describe('AI API protections', () => {
  it('reports service health without exposing secrets', async () => {
    const response = await request(testServer).get('/api/health').expect(200);
    expect(response.body).toEqual(expect.objectContaining({ status: 'ok' }));
    expect(response.body.aiConfigured).toBeTypeOf('boolean');
    expect(JSON.stringify(response.body)).not.toContain(process.env.GEMINI_API_KEY);
  });

  it('rejects AI processing without explicit consent', async () => {
    const response = await request(testServer)
      .post('/api/chat-with-sir')
      .send({ message: 'Help me practise.' })
      .expect(451);
    expect(response.body.code).toBe('CONSENT_REQUIRED');
  });

  it('validates input before sending a Gemini request', async () => {
    const response = await request(testServer)
      .post('/api/chat-with-sir')
      .set('X-Privacy-Consent', 'ai-v1')
      .send({ message: '' })
      .expect(400);
    expect(response.body.error).toMatch(/1,000 characters/);
  });

  it('returns JSON for unknown API routes', async () => {
    const response = await request(testServer).get('/api/not-a-route').expect(404);
    expect(response.body.error).toBe('API route not found.');
  });
});
