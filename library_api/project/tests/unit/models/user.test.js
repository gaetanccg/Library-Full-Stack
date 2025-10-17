const User = require('../../../src/models/User');
const bcrypt = require('bcryptjs');

describe('User Model', () => {
  describe('Validation', () => {
    test('should create a valid user', async () => {
      const userData = {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        password: 'password123',
        role: 'étudiant'
      };

      const user = new User(userData);
      await user.validate();

      expect(user.firstName).toBe('Jean');
      expect(user.lastName).toBe('Dupont');
      expect(user.email).toBe('jean.dupont@example.com');
      expect(user.role).toBe('étudiant');
    });

    test('should fail without required fields', async () => {
      const user = new User({});

      await expect(user.validate()).rejects.toThrow();
    });

    test('should fail with invalid email format', async () => {
      const user = new User({
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'invalid-email',
        password: 'password123',
        role: 'étudiant'
      });

      await expect(user.validate()).rejects.toThrow();
    });

    test('should fail with invalid role', async () => {
      const user = new User({
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        password: 'password123',
        role: 'invalid-role'
      });

      await expect(user.validate()).rejects.toThrow();
    });

    test('should fail with short password', async () => {
      const user = new User({
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        password: '12345',
        role: 'étudiant'
      });

      await expect(user.validate()).rejects.toThrow();
    });

    test('should set default values', async () => {
      const user = new User({
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        password: 'password123'
      });

      expect(user.role).toBe('étudiant');
      expect(user.accountStatus).toBe('actif');
      expect(user.totalFines).toBe(0);
      expect(user.paidFines).toBe(0);
      expect(user.currentBorrowedBooks).toBe(0);
    });
  });

  describe('Password Hashing', () => {
    test('should hash password before saving', async () => {
      const user = new User({
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        password: 'password123',
        role: 'étudiant'
      });

      await user.save();

      expect(user.password).not.toBe('password123');
      expect(user.password.length).toBeGreaterThan(20);
    });

    test('should not rehash password if not modified', async () => {
      const user = await User.create({
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        password: 'password123',
        role: 'étudiant'
      });

      const originalHash = user.password;
      user.firstName = 'Jean-Pierre';
      await user.save();

      expect(user.password).toBe(originalHash);
    });
  });

  describe('comparePassword method', () => {
    test('should return true for correct password', async () => {
      const user = await User.create({
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        password: 'password123',
        role: 'étudiant'
      });

      const isMatch = await user.comparePassword('password123');
      expect(isMatch).toBe(true);
    });

    test('should return false for incorrect password', async () => {
      const user = await User.create({
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        password: 'password123',
        role: 'étudiant'
      });

      const isMatch = await user.comparePassword('wrongpassword');
      expect(isMatch).toBe(false);
    });
  });

  describe('canBorrow method', () => {
    test('should return true for active user without fines', async () => {
      const user = await User.create({
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        password: 'password123',
        role: 'étudiant'
      });

      const canBorrow = user.canBorrow();
      expect(canBorrow).toBe(true);
    });

    test('should return false if max books borrowed', async () => {
      const user = await User.create({
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        password: 'password123',
        role: 'étudiant',
        currentBorrowedBooks: 5
      });

      const canBorrow = user.canBorrow();
      expect(canBorrow).toBe(false);
    });

    test('should return false if user has unpaid fines', async () => {
      const user = await User.create({
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        password: 'password123',
        role: 'étudiant',
        totalFines: 10,
        paidFines: 5
      });

      const canBorrow = user.canBorrow();
      expect(canBorrow).toBe(false);
    });

    test('should return false if account is suspended', async () => {
      const user = await User.create({
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        password: 'password123',
        role: 'étudiant',
        accountStatus: 'suspendu'
      });

      const canBorrow = user.canBorrow();
      expect(canBorrow).toBe(false);
    });
  });

  describe('Virtuals', () => {
    test('should calculate unpaidFines correctly', async () => {
      const user = await User.create({
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        password: 'password123',
        role: 'étudiant',
        totalFines: 10,
        paidFines: 3
      });

      expect(user.unpaidFines).toBe(7);
    });

    test('should calculate fullName correctly', async () => {
      const user = await User.create({
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        password: 'password123',
        role: 'étudiant'
      });

      expect(user.fullName).toBe('Jean Dupont');
    });
  });
});
