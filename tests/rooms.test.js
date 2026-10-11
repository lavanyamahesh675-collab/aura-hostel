const request = require('supertest');
const app = require('../server');

describe('Room Allocation API Tests', () => {
  it('GET /api/rooms/all - should return list of rooms', async () => {
    const res = await request(app).get('/api/rooms/all');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
