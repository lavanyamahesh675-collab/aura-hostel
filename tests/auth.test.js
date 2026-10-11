const request = require('supertest');
const app = require('../server');

describe('Authentication API Endpoint Tests', () => {
  it('GET /api/auth/me - should return valid session information', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toEqual(200);
    expect(res.body.authenticated).toBe(true);
    expect(res.body.user).toHaveProperty('name');
  });

  it('POST /api/auth/login - should fail with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'invalid@aurahostel.com', password: 'wrongpassword' });
    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
  });
});
