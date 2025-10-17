const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');

require('../setup');

describe('Authentication Routes', () => {
  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        password: 'password123',
        role: 'étudiant'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('jean.dupont@example.com');
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    test('should fail to register with existing email', async () => {
      await User.create({
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        password: 'password123',
        role: 'étudiant'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Marie',
          lastName: 'Martin',
          email: 'jean@example.com',
          password: 'password123',
          role: 'étudiant'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'invalid-email',
          password: 'password123',
          role: 'étudiant'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should fail with short password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean@example.com',
          password: '123',
          role: 'étudiant'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        password: 'password123',
        role: 'étudiant'
      });
    });

    test('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jean@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('jean@example.com');
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    test('should fail with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jean@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should fail with suspended account', async () => {
      await User.findOneAndUpdate(
        { email: 'jean@example.com' },
        { accountStatus: 'suspendu' }
      );

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jean@example.com',
          password: 'password123'
        })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken;

    beforeEach(async () => {
      const user = await User.create({
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        password: 'password123',
        role: 'étudiant'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jean@example.com',
          password: 'password123'
        });

      refreshToken = response.body.data.refreshToken;
    });

    test('should refresh token successfully', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
    });

    test('should fail with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    let accessToken;

    beforeEach(async () => {
      await User.create({
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        password: 'password123',
        role: 'étudiant'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jean@example.com',
          password: 'password123'
        });

      accessToken = response.body.data.accessToken;
    });

    test('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should fail without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
