const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Book = require('../../src/models/Book');

require('../setup');

describe('Books Routes', () => {
  let adminToken;
  let userToken;

  beforeEach(async () => {
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });

    const user = await User.create({
      firstName: 'Regular',
      lastName: 'User',
      email: 'user@example.com',
      password: 'password123',
      role: 'étudiant'
    });

    const adminResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'password123' });
    adminToken = adminResponse.body.data.accessToken;

    const userResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'password123' });
    userToken = userResponse.body.data.accessToken;
  });

  describe('GET /api/books', () => {
    beforeEach(async () => {
      await Book.create([
        {
          isbn: '978-2-1234-5680-3',
          title: 'JavaScript Basics',
          categories: ['Informatique'],
          totalCopies: 5,
          availableCopies: 5
        },
        {
          isbn: '978-2-1234-5680-4',
          title: 'Python Advanced',
          categories: ['Informatique'],
          totalCopies: 3,
          availableCopies: 0
        }
      ]);
    });

    test('should get all books without authentication', async () => {
      const response = await request(app)
        .get('/api/books')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.books).toHaveLength(2);
    });

    test('should filter available books only', async () => {
      const response = await request(app)
        .get('/api/books?available=true')
        .expect(200);

      expect(response.body.data.books).toHaveLength(1);
      expect(response.body.data.books[0].title).toBe('JavaScript Basics');
    });

    test('should paginate results', async () => {
      const response = await request(app)
        .get('/api/books?page=1&limit=1')
        .expect(200);

      expect(response.body.data.books).toHaveLength(1);
      expect(response.body.data.pagination.totalPages).toBe(2);
    });
  });

  describe('GET /api/books/search', () => {
    beforeEach(async () => {
      await Book.create({
        isbn: '978-2-1234-5680-3',
        title: 'JavaScript: The Good Parts',
        summary: 'A comprehensive guide to JavaScript',
        categories: ['Informatique'],
        totalCopies: 5,
        availableCopies: 5
      });
    });

    test('should search books by title', async () => {
      const response = await request(app)
        .get('/api/books/search?query=JavaScript')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/books/:id', () => {
    let bookId;

    beforeEach(async () => {
      const book = await Book.create({
        isbn: '978-2-1234-5680-3',
        title: 'Test Book',
        totalCopies: 5,
        availableCopies: 5
      });
      bookId = book._id;
    });

    test('should get book by id', async () => {
      const response = await request(app)
        .get(`/api/books/${bookId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Test Book');
    });

    test('should return 404 for non-existent book', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/books/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/books/category/:category', () => {
    beforeEach(async () => {
      await Book.create([
        {
          isbn: '978-2-1234-5680-3',
          title: 'Science Book',
          categories: ['Science'],
          totalCopies: 5,
          availableCopies: 5
        },
        {
          isbn: '978-2-1234-5680-4',
          title: 'History Book',
          categories: ['Histoire'],
          totalCopies: 5,
          availableCopies: 5
        }
      ]);
    });

    test('should get books by category', async () => {
      const response = await request(app)
        .get('/api/books/category/Science')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.books).toHaveLength(1);
      expect(response.body.data.books[0].title).toBe('Science Book');
    });
  });

  describe('POST /api/books', () => {
    const bookData = {
      isbn: '978-2-1234-5680-3',
      title: 'New Book',
      authors: ['John Doe'],
      categories: ['Informatique'],
      totalCopies: 5,
      availableCopies: 5,
      publisher: 'Tech Publisher',
      pages: 300,
      language: 'Français'
    };

    test('should create book with admin token', async () => {
      const response = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(bookData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('New Book');
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/books')
        .send(bookData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should fail with user token', async () => {
      const response = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${userToken}`)
        .send(bookData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('should fail with invalid ISBN', async () => {
      const response = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...bookData, isbn: 'invalid-isbn' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/books/:id', () => {
    let bookId;

    beforeEach(async () => {
      const book = await Book.create({
        isbn: '978-2-1234-5680-3',
        title: 'Original Title',
        totalCopies: 5,
        availableCopies: 5
      });
      bookId = book._id;
    });

    test('should update book with admin token', async () => {
      const response = await request(app)
        .put(`/api/books/${bookId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          isbn: '978-2-1234-5680-3',
          title: 'Updated Title',
          totalCopies: 10,
          availableCopies: 10
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Title');
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .put(`/api/books/${bookId}`)
        .send({ title: 'Updated Title' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/books/:id', () => {
    let bookId;

    beforeEach(async () => {
      const book = await Book.create({
        isbn: '978-2-1234-5680-3',
        title: 'Original Title',
        totalCopies: 5,
        availableCopies: 5
      });
      bookId = book._id;
    });

    test('should partially update book', async () => {
      const response = await request(app)
        .patch(`/api/books/${bookId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Partially Updated' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Partially Updated');
      expect(response.body.data.isbn).toBe('978-2-1234-5680-3');
    });
  });

  describe('DELETE /api/books/:id', () => {
    let bookId;

    beforeEach(async () => {
      const book = await Book.create({
        isbn: '978-2-1234-5680-3',
        title: 'Book to Delete',
        totalCopies: 5,
        availableCopies: 5
      });
      bookId = book._id;
    });

    test('should delete book with admin token', async () => {
      const response = await request(app)
        .delete(`/api/books/${bookId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      const deletedBook = await Book.findById(bookId);
      expect(deletedBook.isDeleted).toBe(true);
    });

    test('should fail with non-admin token', async () => {
      const librarianToken = (await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Librarian',
          lastName: 'User',
          email: 'librarian@example.com',
          password: 'password123',
          role: 'bibliothécaire'
        })).body.data.accessToken;

      const response = await request(app)
        .delete(`/api/books/${bookId}`)
        .set('Authorization', `Bearer ${librarianToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});
