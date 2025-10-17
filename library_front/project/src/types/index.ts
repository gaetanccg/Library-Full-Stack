export type UserRole = 'étudiant' | 'professeur' | 'bibliothécaire' | 'admin';
export type AccountStatus = 'actif' | 'suspendu' | 'supprimé';
export type LoanStatus = 'en cours' | 'retourné' | 'en retard';

export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    status: AccountStatus;
    phone?: string;
    address?: {
        street: string;
        city: string;
        postalCode: string;
        country: string;
    };
    currentLoans?: number;
    totalFines?: number;
    currentFines?: number;
    borrowHistory?: any[];
    createdAt: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

export interface Book {
    _id: string;
    isbn: string;
    title: string;
    authors: string[];
    categories: string[];
    totalCopies: number;
    availableCopies: number;
    publisher: string;
    publishedDate?: string;
    pages?: number;
    language: string;
    summary?: string;
    coverImage?: string;
    createdAt: string;
}

export interface Loan {
    _id: string;
    borrower: User | string;
    book: Book;
    borrowDate: string;
    expectedReturnDate: string;
    actualReturnDate?: string;
    renewalCount: number;
    status: LoanStatus;
    fineAmount: number;
    finePaid: boolean;
}

export interface Stats {
    totalBooks: number;
    totalUsers: number;
    activeLoans: number;
    overdueLoans: number;
    totalFines: number;
    availableBooks: number;
}

export interface BooksByCategory {
    _id: string;
    totalBooks: number;
    totalCopies: number;
    availableCopies: number;
    borrowedCopies: number;
    borrowRate: number;
}

export interface TopBook {
    _id: string;
    title: string;
    isbn: string;
    authors: string[];
    borrowCount: number;
}

export interface LoanEvolution {
    totalLoans: number;
    activeLoans: number;
    returnedLoans: number;
    overdueLoans: number;
    year: number;
    month: number;
}
