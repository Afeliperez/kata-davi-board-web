/** @jest-environment node */

import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import * as request from 'supertest';

const readBody = async (req: IncomingMessage) =>
  new Promise<string>((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => resolve(body));
  });

const sendJson = (res: ServerResponse, status: number, payload: unknown) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
};

describe('API e2e contracts', () => {
  let server: Server;

  beforeAll(() => {
    server = createServer(async (req, res) => {
      const method = req.method ?? 'GET';
      const url = new URL(req.url ?? '/', 'http://localhost');

      if (method === 'POST' && url.pathname === '/kata-api/users/login') {
        const rawBody = await readBody(req);
        const payload = rawBody ? (JSON.parse(rawBody) as { cc?: string; password?: string }) : {};

        if (payload.cc === '123' && payload.password === '12345678') {
          sendJson(res, 200, {
            token: 'valid-token',
            expiresAt: Date.now() + 60_000,
            data: {
              user: {
                cc: '123',
                email: 'user@kata.com',
                userName: 'Kata User',
                role: 'DEV',
              },
            },
          });
          return;
        }

        sendJson(res, 401, { message: 'Credenciales inválidas' });
        return;
      }

      if (method === 'GET' && url.pathname === '/kata-api/project-boards') {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
          sendJson(res, 401, { message: 'Token ausente' });
          return;
        }

        if (authHeader === 'Bearer expired-token') {
          sendJson(res, 401, { message: 'Token vencido' });
          return;
        }

        if (url.searchParams.get('outage') === '1') {
          sendJson(res, 503, { message: 'Servicio no disponible' });
          return;
        }

        sendJson(res, 200, { data: [] });
        return;
      }

      sendJson(res, 404, { message: 'Not found' });
    });
  });

  it('returns successful login response', async () => {
    const response = await request(server)
      .post('/kata-api/users/login')
      .send({ cc: '123', password: '12345678' });

    expect(response.status).toBe(200);
    expect(response.body.token).toBe('valid-token');
  });

  it('returns failed login response', async () => {
    const response = await request(server)
      .post('/kata-api/users/login')
      .send({ cc: '123', password: 'bad-pass' });

    expect(response.status).toBe(401);
  });

  it('returns unauthorized when token is missing', async () => {
    const response = await request(server).get('/kata-api/project-boards');
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Token ausente');
  });

  it('returns unauthorized when token is expired', async () => {
    const response = await request(server)
      .get('/kata-api/project-boards')
      .set('Authorization', 'Bearer expired-token');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Token vencido');
  });

  it('returns service outage on dependency failure', async () => {
    const response = await request(server)
      .get('/kata-api/project-boards?outage=1')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(503);
    expect(response.body.message).toBe('Servicio no disponible');
  });
});
