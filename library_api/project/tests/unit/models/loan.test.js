const Loan = require('../../../src/models/Loan');
const User = require('../../../src/models/User');
const Book = require('../../../src/models/Book');

describe('Loan Model', () => {
  let user;
  let book;

  beforeEach(async () => {
    user = await User.create({
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean@example.com',
      password: 'password123',
      role: 'étudiant'
    });

    book = await Book.create({
      isbn: '978-2-1234-5680-3',
      title: 'Test Book',
      totalCopies: 5,
      availableCopies: 5
    });
  });

  describe('Validation', () => {
    test('should create a valid loan', async () => {
      const loan = new Loan({
        user: user._id,
        book: book._id
      });

      await loan.validate();
      expect(loan.user).toEqual(user._id);
      expect(loan.book).toEqual(book._id);
    });

    test('should fail without required fields', async () => {
      const loan = new Loan({});
      await expect(loan.validate()).rejects.toThrow();
    });

    test('should set default values', async () => {
      const loan = new Loan({
        user: user._id,
        book: book._id
      });

      expect(loan.status).toBe('actif');
      expect(loan.renewCount).toBe(0);
      expect(loan.fine).toBe(0);
      expect(loan.isPaid).toBe(false);
    });

    test('should set borrowDate and dueDate', async () => {
      const loan = await Loan.create({
        user: user._id,
        book: book._id
      });

      expect(loan.borrowDate).toBeDefined();
      expect(loan.dueDate).toBeDefined();

      const expectedDueDate = new Date(loan.borrowDate);
      expectedDueDate.setDate(expectedDueDate.getDate() + 14);

      expect(loan.dueDate.toDateString()).toBe(expectedDueDate.toDateString());
    });
  });

  describe('Virtuals', () => {
    test('should calculate isOverdue correctly for overdue loan', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);

      const loan = await Loan.create({
        user: user._id,
        book: book._id,
        dueDate: pastDate,
        status: 'actif'
      });

      expect(loan.isOverdue).toBe(true);
    });

    test('should calculate isOverdue correctly for non-overdue loan', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const loan = await Loan.create({
        user: user._id,
        book: book._id,
        dueDate: futureDate,
        status: 'actif'
      });

      expect(loan.isOverdue).toBe(false);
    });

    test('should return false for isOverdue if loan is returned', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);

      const loan = await Loan.create({
        user: user._id,
        book: book._id,
        dueDate: pastDate,
        status: 'retourné'
      });

      expect(loan.isOverdue).toBe(false);
    });
  });

  describe('calculateFine method', () => {
    test('should return 0 for non-overdue loan', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const loan = await Loan.create({
        user: user._id,
        book: book._id,
        dueDate: futureDate
      });

      const fine = loan.calculateFine();
      expect(fine).toBe(0);
    });

    test('should calculate fine correctly for overdue loan', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);

      const loan = await Loan.create({
        user: user._id,
        book: book._id,
        dueDate: pastDate,
        status: 'actif'
      });

      const fine = loan.calculateFine();
      expect(fine).toBeGreaterThan(0);
      expect(fine).toBe(10 * 0.5);
    });

    test('should return 0 if loan already returned', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);

      const loan = await Loan.create({
        user: user._id,
        book: book._id,
        dueDate: pastDate,
        status: 'retourné'
      });

      const fine = loan.calculateFine();
      expect(fine).toBe(0);
    });
  });

  describe('canRenew method', () => {
    test('should return true for active loan with renewals left', async () => {
      const loan = await Loan.create({
        user: user._id,
        book: book._id,
        renewCount: 0
      });

      expect(loan.canRenew()).toBe(true);
    });

    test('should return false if max renewals reached', async () => {
      const loan = await Loan.create({
        user: user._id,
        book: book._id,
        renewCount: 2
      });

      expect(loan.canRenew()).toBe(false);
    });

    test('should return false if loan is not active', async () => {
      const loan = await Loan.create({
        user: user._id,
        book: book._id,
        status: 'retourné',
        renewCount: 0
      });

      expect(loan.canRenew()).toBe(false);
    });

    test('should return false if loan is overdue', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);

      const loan = await Loan.create({
        user: user._id,
        book: book._id,
        dueDate: pastDate,
        renewCount: 0
      });

      expect(loan.canRenew()).toBe(false);
    });
  });

  describe('renew method', () => {
    test('should extend due date by 14 days', async () => {
      const loan = await Loan.create({
        user: user._id,
        book: book._id
      });

      const originalDueDate = new Date(loan.dueDate);
      await loan.renew();

      const expectedNewDueDate = new Date(originalDueDate);
      expectedNewDueDate.setDate(expectedNewDueDate.getDate() + 14);

      expect(loan.dueDate.toDateString()).toBe(expectedNewDueDate.toDateString());
      expect(loan.renewCount).toBe(1);
    });

    test('should throw error if cannot renew', async () => {
      const loan = await Loan.create({
        user: user._id,
        book: book._id,
        renewCount: 2
      });

      await expect(loan.renew()).rejects.toThrow('Impossible de renouveler cet emprunt');
    });
  });

  describe('markAsReturned method', () => {
    test('should mark loan as returned and set return date', async () => {
      const loan = await Loan.create({
        user: user._id,
        book: book._id
      });

      await loan.markAsReturned();

      expect(loan.status).toBe('retourné');
      expect(loan.returnDate).toBeDefined();
    });

    test('should calculate and set fine if overdue', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);

      const loan = await Loan.create({
        user: user._id,
        book: book._id,
        dueDate: pastDate
      });

      await loan.markAsReturned();

      expect(loan.fine).toBe(5);
      expect(loan.isPaid).toBe(false);
    });
  });

  describe('Static methods', () => {
    test('findActiveLoans should return only active loans', async () => {
      await Loan.create({
        user: user._id,
        book: book._id,
        status: 'actif'
      });

      await Loan.create({
        user: user._id,
        book: book._id,
        status: 'retourné'
      });

      const activeLoans = await Loan.findActiveLoans();
      expect(activeLoans.length).toBe(1);
      expect(activeLoans[0].status).toBe('actif');
    });

    test('findOverdueLoans should return only overdue active loans', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      await Loan.create({
        user: user._id,
        book: book._id,
        dueDate: pastDate,
        status: 'actif'
      });

      await Loan.create({
        user: user._id,
        book: book._id,
        dueDate: futureDate,
        status: 'actif'
      });

      const overdueLoans = await Loan.findOverdueLoans();
      expect(overdueLoans.length).toBe(1);
    });

    test('findByUser should return loans for specific user', async () => {
      const otherUser = await User.create({
        firstName: 'Marie',
        lastName: 'Martin',
        email: 'marie@example.com',
        password: 'password123',
        role: 'étudiant'
      });

      await Loan.create({
        user: user._id,
        book: book._id
      });

      await Loan.create({
        user: otherUser._id,
        book: book._id
      });

      const userLoans = await Loan.findByUser(user._id);
      expect(userLoans.length).toBe(1);
    });
  });
});
