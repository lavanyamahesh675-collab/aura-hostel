const request = require('supertest');
const app = require('../server');

describe('Student REST API Tests', () => {
  it('GET /api/students - should return student roster list', async () => {
    const res = await request(app).get('/api/students');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/students - should reject student creation with short name (<8 chars)', async () => {
    const res = await request(app)
      .post('/api/students')
      .send({
        name: 'Short',
        email: 'short@aurahostel.com',
        phone: '9876543210',
        gender: 'Male',
        block: 'Block A',
        roomNo: 'A-101'
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
  });
});
