const request = require('supertest');
const app = require('../index');

describe('Auth API', () => {
  it('should return 400 if email or password is missing', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ email: '' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
}); 