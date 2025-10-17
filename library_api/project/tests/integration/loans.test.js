const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Book = require('../../src/models/Book');
const Loan = require('../../src/models/Loan');

require('../setup');

describe('Loans Routes', () => {
  let userToken;
  let librarianToken;
  let userId;
  let bookId;

  beforeEach(async () => {
    const user = await User.create({
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'user@example.com',
      password: 'password123',
      role: 'étudiant'
    });
    userId = user._id;

    const librarian = await User.create({
      firstName: 'Librarian',
      lastName: 'User',
      email: 'librarian@example.com',
      password: 'password123',
      role: 'bibliothécaire'
    });

    const book = await Book.create({
      isbn: '978-2-1234-5680-3',
      title: 'Test Book',
      totalCopies: 5,
      availableCopies: 5
    });
    bookId = book._id;

    const userResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'password123' });
    userToken = userResponse.body.data.accessToken;

    const librarianResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'librarian@example.com', password: 'password123' });
    librarianToken = librarianResponse.body.data.accessToken;
  });

  describe('POST /api/loans', () => {
    test('should create a loan successfully', async () => {
      const response = await request(app)
        .post('/api/loans')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ bookId: bookId.toString() })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.book).toBe(bookId.toString());
      expect(response.body.data.status).toBe('actif');

      const book = await Book.findById(bookId);
      expect(book.availableCopies).toBe(4);

      const user = await User.findById(userId);
      expect(user.currentBorrowedBooks).toBe(1);
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/loans')
        .send({ bookId: bookId.toString() })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should fail when book is not available', async () => {
      await Book.findByIdAndUpdate(bookId, { availableCopies: 0 });

      const response = await request(app)
        .post('/api/loans')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ bookId: bookId.toString() })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should fail when user has unpaid fines', async () => {
      await User.findByIdAndUpdate(userId, {
        totalFines: 10,
        paidFines: 5
      });

      const response = await request(app)
        .post('/api/loans')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ bookId: bookId.toString() })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should fail when user has max borrowed books', async () => {
      await User.findByIdAndUpdate(userId, {
        currentBorrowedBooks: 5
      });

      const response = await request(app)
        .post('/api/loans')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ bookId: bookId.toString() })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/loans/my', () => {
    beforeEach(async () => {
      await Loan.create({
        user: userId,
        book: bookId,
        status: 'actif'
      });
    });

    test('should get user active loans', async () => {
      const response = await request(app)
        .get('/api/loans/my')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].status).toBe('actif');
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/loans/my')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/loans/history', () => {
    beforeEach(async () => {
      await Loan.create([
        {
          user: userId,
          book: bookId,
          status: 'retourné',
          returnDate: new Date()
        },
        {
          user: userId,
          book: bookId,
          status: 'actif'
        }
      ]);
    });

    test('should get user loan history', async () => {
      const response = await request(app)
        .get('/api/loans/history')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.loans.length).toBe(2);
    });
  });

  describe('PATCH /api/loans/:id/return', () => {
    let loanId;

    beforeEach(async () => {
      await User.findByIdAndUpdate(userId, { currentBorrowedBooks: 1 });
      await Book.findByIdAndUpdate(bookId, { availableCopies: 4 });

      const loan = await Loan.create({
        user: userId,
        book: bookId,
        status: 'actif'
      });
      loanId = loan._id;
    });

    test('should return book successfully', async () => {
      const response = await request(app)
        .patch(`/api/loans/${loanId}/return`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('retourné');

      const book = await Book.findById(bookId);
      expect(book.availableCopies).toBe(5);

      const user = await User.findById(userId);
      expect(user.currentBorrowedBooks).toBe(0);
    });

    test('should calculate fine for overdue return', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);
      await Loan.findByIdAndUpdate(loanId, { dueDate: pastDate });

      const response = await request(app)
        .patch(`/api/loans/${loanId}/return`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.data.fine).toBeGreaterThan(0);

      const user = await User.findById(userId);
      expect(user.totalFines).toBeGreaterThan(0);
    });

    test('should fail to return already returned loan', async () => {
      await Loan.findByIdAndUpdate(loanId, {
        status: 'retourné',
        returnDate: new Date()
      });

      const response = await request(app)
        .patch(`/api/loans/${loanId}/return`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/loans/:id/renew', () => {
    let loanId;

    beforeEach(async () => {
      const loan = await Loan.create({
        user: userId,
        book: bookId,
        status: 'actif',
        renewCount: 0
      });
      loanId = loan._id;
    });

    test('should renew loan successfully', async () => {
      const loan = await Loan.findById(loanId);
      const originalDueDate = loan.dueDate;

      const response = await request(app)
        .patch(`/api/loans/${loanId}/renew`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.renewCount).toBe(1);
      expect(new Date(response.body.data.dueDate)).toBeInstanceOf(Date);
    });

    test('should fail to renew when max renewals reached', async () => {
      await Loan.findByIdAndUpdate(loanId, { renewCount: 2 });

      const response = await request(app)
        .patch(`/api/loans/${loanId}/renew`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should fail to renew overdue loan', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      await Loan.findByIdAndUpdate(loanId, { dueDate: pastDate });

      const response = await request(app)
        .patch(`/api/loans/${loanId}/renew`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/loans/overdue', () => {
    beforeEach(async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);

      await Loan.create({
        user: userId,
        book: bookId,
        dueDate: pastDate,
        status: 'actif'
      });
    });

    test('should get overdue loans with librarian token', async () => {
      const response = await request(app)
        .get('/api/loans/overdue')
        .set('Authorization', `Bearer ${librarianToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('should fail with user token', async () => {
      const response = await request(app)
        .get('/api/loans/overdue')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/loans', () => {
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

    test('should get all loans with librarian token', async () => {
      const response = await request(app)
        .get('/api/loans')
        .set('Authorization', `Bearer ${librarianToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.loans.length).toBe(2);
    });

    test('should fail with user token', async () => {
      const response = await request(app)
        .get('/api/loans')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});
