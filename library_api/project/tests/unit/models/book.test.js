const Book = require('../../../src/models/Book');

describe('Book Model', () => {
  describe('Validation', () => {
    test('should create a valid book', async () => {
      const bookData = {
        isbn: '978-2-1234-5680-3',
        title: 'JavaScript: The Good Parts',
        authors: ['Douglas Crockford'],
        categories: ['Informatique'],
        totalCopies: 5,
        availableCopies: 5,
        publisher: 'O\'Reilly',
        pages: 172,
        language: 'Français'
      };

      const book = new Book(bookData);
      await book.validate();

      expect(book.title).toBe('JavaScript: The Good Parts');
      expect(book.authors).toEqual(['Douglas Crockford']);
      expect(book.totalCopies).toBe(5);
    });

    test('should fail without required fields', async () => {
      const book = new Book({});
      await expect(book.validate()).rejects.toThrow();
    });

    test('should fail with invalid ISBN format', async () => {
      const book = new Book({
        isbn: 'invalid-isbn',
        title: 'Test Book',
        totalCopies: 1,
        availableCopies: 1
      });

      await expect(book.validate()).rejects.toThrow();
    });

    test('should fail with invalid category', async () => {
      const book = new Book({
        isbn: '978-2-1234-5680-3',
        title: 'Test Book',
        categories: ['InvalidCategory'],
        totalCopies: 1,
        availableCopies: 1
      });

      await expect(book.validate()).rejects.toThrow();
    });

    test('should fail if availableCopies > totalCopies', async () => {
      const book = new Book({
        isbn: '978-2-1234-5680-3',
        title: 'Test Book',
        totalCopies: 5,
        availableCopies: 10
      });

      await expect(book.validate()).rejects.toThrow();
    });

    test('should set default values', async () => {
      const book = new Book({
        isbn: '978-2-1234-5680-3',
        title: 'Test Book'
      });

      expect(book.totalCopies).toBe(1);
      expect(book.availableCopies).toBe(1);
      expect(book.language).toBe('Français');
      expect(book.isDeleted).toBe(false);
    });
  });

  describe('Virtuals', () => {
    test('should calculate isAvailable correctly', async () => {
      const book = await Book.create({
        isbn: '978-2-1234-5680-3',
        title: 'Test Book',
        totalCopies: 5,
        availableCopies: 3
      });

      expect(book.isAvailable).toBe(true);
    });

    test('should return false for isAvailable when no copies', async () => {
      const book = await Book.create({
        isbn: '978-2-1234-5680-3',
        title: 'Test Book',
        totalCopies: 5,
        availableCopies: 0
      });

      expect(book.isAvailable).toBe(false);
    });

    test('should calculate borrowRate correctly', async () => {
      const book = await Book.create({
        isbn: '978-2-1234-5680-3',
        title: 'Test Book',
        totalCopies: 10,
        availableCopies: 6
      });

      expect(parseFloat(book.borrowRate)).toBe(40.00);
    });
  });

  describe('borrowCopy method', () => {
    test('should decrease availableCopies by 1', async () => {
      const book = await Book.create({
        isbn: '978-2-1234-5680-3',
        title: 'Test Book',
        totalCopies: 5,
        availableCopies: 5
      });

      await book.borrowCopy();
      expect(book.availableCopies).toBe(4);
    });

    test('should throw error when no copies available', async () => {
      const book = await Book.create({
        isbn: '978-2-1234-5680-3',
        title: 'Test Book',
        totalCopies: 5,
        availableCopies: 0
      });

      await expect(book.borrowCopy()).rejects.toThrow('Aucun exemplaire disponible');
    });
  });

  describe('returnCopy method', () => {
    test('should increase availableCopies by 1', async () => {
      const book = await Book.create({
        isbn: '978-2-1234-5680-3',
        title: 'Test Book',
        totalCopies: 5,
        availableCopies: 3
      });

      await book.returnCopy();
      expect(book.availableCopies).toBe(4);
    });

    test('should throw error when all copies already available', async () => {
      const book = await Book.create({
        isbn: '978-2-1234-5680-3',
        title: 'Test Book',
        totalCopies: 5,
        availableCopies: 5
      });

      await expect(book.returnCopy()).rejects.toThrow('Tous les exemplaires sont déjà disponibles');
    });
  });

  describe('softDelete method', () => {
    test('should mark book as deleted', async () => {
      const book = await Book.create({
        isbn: '978-2-1234-5680-3',
        title: 'Test Book',
        totalCopies: 5,
        availableCopies: 5
      });

      await book.softDelete();
      expect(book.isDeleted).toBe(true);
    });
  });

  describe('Static methods', () => {
    test('findAvailable should return only available books', async () => {
      await Book.create({
        isbn: '978-2-1234-5680-3',
        title: 'Available Book',
        totalCopies: 5,
        availableCopies: 3
      });

      await Book.create({
        isbn: '978-2-1234-5680-4',
        title: 'Unavailable Book',
        totalCopies: 5,
        availableCopies: 0
      });

      const available = await Book.findAvailable();
      expect(available.length).toBe(1);
      expect(available[0].title).toBe('Available Book');
    });

    test('findByCategory should return books in category', async () => {
      await Book.create({
        isbn: '978-2-1234-5680-3',
        title: 'Science Book',
        categories: ['Science'],
        totalCopies: 5,
        availableCopies: 5
      });

      await Book.create({
        isbn: '978-2-1234-5680-4',
        title: 'History Book',
        categories: ['Histoire'],
        totalCopies: 5,
        availableCopies: 5
      });

      const scienceBooks = await Book.findByCategory('Science');
      expect(scienceBooks.length).toBe(1);
      expect(scienceBooks[0].title).toBe('Science Book');
    });
  });

  describe('Pre-save hook', () => {
    test('should adjust availableCopies if exceeds totalCopies', async () => {
      const book = await Book.create({
        isbn: '978-2-1234-5680-3',
        title: 'Test Book',
        totalCopies: 5,
        availableCopies: 5
      });

      book.totalCopies = 3;
      await book.save();

      expect(book.availableCopies).toBe(3);
    });
  });
});
