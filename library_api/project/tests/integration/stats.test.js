const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Book = require('../../src/models/Book');
const Loan = require('../../src/models/Loan');

require('../setup');

describe('Stats Routes', () => {
  let librarianToken;
  let userToken;
  let userId;
  let bookId;

  beforeEach(async () => {
    const librarian = await User.create({
      firstName: 'Librarian',
      lastName: 'User',
      email: 'librarian@example.com',
      password: 'password123',
      role: 'bibliothécaire'
    });

    const user = await User.create({
      firstName: 'Regular',
      lastName: 'User',
      email: 'user@example.com',
      password: 'password123',
      role: 'étudiant'
    });
    userId = user._id;

    const book = await Book.create({
      isbn: '978-2-1234-5680-3',
      title: 'Test Book',
      categories: ['Informatique'],
      totalCopies: 5,
      availableCopies: 5
    });
    bookId = book._id;

    const librarianResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'librarian@example.com', password: 'password123' });
    librarianToken = librarianResponse.body.data.accessToken;

    const userResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'password123' });
    userToken = userResponse.body.data.accessToken;
  });

  describe('GET /api/stats/dashboard', () => {
    beforeEach(async () => {
      await Loan.create([
        {
          user: userId,
          book: bookId,
          status: 'actif'
        },
        {
          user: userId,
          book: bookId,
          status: 'retourné',
          returnDate: new Date()
        }
      ]);
    });

    test('should get dashboard stats with librarian token', async () => {
      const response = await request(app)
        .get('/api/stats/dashboard')
        .set('Authorization', `Bearer ${librarianToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalBooks');
      expect(response.body.data).toHaveProperty('totalUsers');
      expect(response.body.data).toHaveProperty('activeLoans');
      expect(response.body.data).toHaveProperty('overdueLoans');
      expect(response.body.data).toHaveProperty('totalFinesCollected');
    });

    test('should fail with user token', async () => {
      const response = await request(app)
        .get('/api/stats/dashboard')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/stats/dashboard')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/stats/top-borrowed', () => {
    beforeEach(async () => {
      const book2 = await Book.create({
        isbn: '978-2-1234-5680-4',
        title: 'Another Book',
        categories: ['Science'],
        totalCopies: 3,
        availableCopies: 3
      });

      await Loan.create([
        { user: userId, book: bookId, status: 'retourné', returnDate: new Date() },
        { user: userId, book: bookId, status: 'retourné', returnDate: new Date() },
        { user: userId, book: bookId, status: 'actif' },
        { user: userId, book: book2._id, status: 'retourné', returnDate: new Date() }
      ]);
    });

    test('should get top borrowed books', async () => {
      const response = await request(app)
        .get('/api/stats/top-borrowed?limit=5')
        .set('Authorization', `Bearer ${librarianToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data[0]).toHaveProperty('book');
      expect(response.body.data[0]).toHaveProperty('borrowCount');
    });

    test('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/api/stats/top-borrowed?limit=1')
        .set('Authorization', `Bearer ${librarianToken}`)
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(1);
    });
  });

  describe('GET /api/stats/category', () => {
    beforeEach(async () => {
      await Book.create([
        {
          isbn: '978-2-1234-5680-4',
          title: 'Science Book',
          categories: ['Science'],
          totalCopies: 3,
          availableCopies: 3
        },
        {
          isbn: '978-2-1234-5680-5',
          title: 'History Book',
          categories: ['Histoire'],
          totalCopies: 2,
          availableCopies: 2
        }
      ]);
    });

    test('should get stats by category', async () => {
      const response = await request(app)
        .get('/api/stats/category')
        .set('Authorization', `Bearer ${librarianToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data[0]).toHaveProperty('_id');
      expect(response.body.data[0]).toHaveProperty('totalBooks');
      expect(response.body.data[0]).toHaveProperty('availableBooks');
    });
  });

  describe('GET /api/stats/overdue-users', () => {
    beforeEach(async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);

      await Loan.create({
        user: userId,
        book: bookId,
        dueDate: pastDate,
        status: 'actif'
      });
    });

    test('should get users with overdue loans', async () => {
      const response = await request(app)
        .get('/api/stats/overdue-users')
        .set('Authorization', `Bearer ${librarianToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data[0]).toHaveProperty('user');
      expect(response.body.data[0]).toHaveProperty('overdueCount');
    });
  });

  describe('GET /api/stats/loan-evolution', () => {
    beforeEach(async () => {
      const dates = [];
      for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        dates.push(date);
      }

      for (const date of dates) {
        await Loan.create({
          user: userId,
          book: bookId,
          borrowDate: date,
          status: 'retourné',
          returnDate: new Date()
        });
      }
    });

    test('should get loan evolution over time', async () => {
      const response = await request(app)
        .get('/api/stats/loan-evolution?months=6')
        .set('Authorization', `Bearer ${librarianToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data[0]).toHaveProperty('month');
      expect(response.body.data[0]).toHaveProperty('year');
      expect(response.body.data[0]).toHaveProperty('count');
    });
  });

  describe('GET /api/stats/average-duration', () => {
    beforeEach(async () => {
      const borrowDate = new Date();
      borrowDate.setDate(borrowDate.getDate() - 10);
      const returnDate = new Date();

      await Loan.create({
        user: userId,
        book: bookId,
        borrowDate: borrowDate,
        returnDate: returnDate,
        status: 'retourné'
      });
    });

    test('should get average loan duration by category', async () => {
      const response = await request(app)
        .get('/api/stats/average-duration')
        .set('Authorization', `Bearer ${librarianToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/stats/popular-authors', () => {
    beforeEach(async () => {
      const book2 = await Book.create({
        isbn: '978-2-1234-5680-4',
        title: 'Another Book',
        authors: ['John Doe', 'Jane Smith'],
        totalCopies: 3,
        availableCopies: 3
      });

      await Loan.create([
        { user: userId, book: bookId, status: 'retourné', returnDate: new Date() },
        { user: userId, book: book2._id, status: 'retourné', returnDate: new Date() }
      ]);
    });

    test('should get most popular authors', async () => {
      const response = await request(app)
        .get('/api/stats/popular-authors')
        .set('Authorization', `Bearer ${librarianToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('Authorization tests', () => {
    test('all stats routes should fail with user token', async () => {
      const endpoints = [
        '/api/stats/dashboard',
        '/api/stats/top-borrowed',
        '/api/stats/category',
        '/api/stats/overdue-users',
        '/api/stats/loan-evolution',
        '/api/stats/average-duration',
        '/api/stats/popular-authors'
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)
          .get(endpoint)
          .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
      }
    });
  });
});
