import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { api } from '../services/api';
import { Book } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Search, Plus, BookOpen, Edit, Trash2 } from 'lucide-react';

export const Books = () => {
    const { user } = useAuth();
    const [books, setBooks] = useState<Book[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const isLibrarianOrAdmin = user?.role === 'bibliothécaire' || user?.role === 'admin';

    useEffect(() => {
        loadBooks();
    }, []);

    const loadBooks = async () => {
        try {
            const response = await api.get<{ books: Book[]; pagination: any }>('/api/books?limit=50');
            if (response.data) {
                setBooks(response.data.books);
            }
        } catch (error) {
            console.error('Error loading books:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            loadBooks();
            return;
        }

        try {
            setIsLoading(true);
            const response = await api.get<Book[]>(`/api/books/search?query=${encodeURIComponent(searchQuery)}`);
            if (response.data) {
                setBooks(response.data);
            }
        } catch (error) {
            console.error('Error searching books:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBorrow = async (bookId: string) => {
        try {
            await api.post('/api/loans', { bookId });
            alert('Livre emprunté avec succès !');
            loadBooks();
        } catch (error: any) {
            alert(error.message || "Erreur lors de l'emprunt");
        }
    };

    const handleDelete = async (bookId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce livre ?')) return;

        try {
            await api.delete(`/api/books/${bookId}`);
            alert('Livre supprimé avec succès');
            loadBooks();
        } catch (error: any) {
            alert(error.message || 'Erreur lors de la suppression');
        }
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Catalogue de livres</h1>
                        <p className="text-slate-600 mt-1">Parcourez et gérez la collection</p>
                    </div>

                    {isLibrarianOrAdmin && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Ajouter un livre
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Rechercher par titre, auteur, ISBN..."
                                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            Rechercher
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
                    </div>
                ) : books.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                        <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-600">Aucun livre trouvé</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {books.map((book) => (
                            <div
                                key={book._id}
                                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-slate-900 mb-1">
                                            {book.title}
                                        </h3>
                                        <p className="text-sm text-slate-600">
                                            {book.authors.map(a => `${a.firstName} ${a.lastName}`).join(', ')}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">ISBN:</span>
                                        <span className="font-medium text-slate-900">{book.isbn}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Catégories:</span>
                                        <span className="font-medium text-slate-900">{book.categories.join(', ')}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Disponibles:</span>
                                        <span className={`font-medium ${book.availableCopies > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {book.availableCopies} / {book.totalCopies}
                    </span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {book.availableCopies > 0 && (
                                        <button
                                            onClick={() => handleBorrow(book._id)}
                                            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Emprunter
                                        </button>
                                    )}

                                    {isLibrarianOrAdmin && (
                                        <>
                                            <a
                                                href={`/books/${book._id}/edit`}
                                                className="p-2 border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
                                            >
                                                <Edit className="w-4 h-4 text-slate-600" />
                                            </a>
                                            {user?.role === 'admin' && (
                                                <button
                                                    onClick={() => handleDelete(book._id)}
                                                    className="p-2 border border-red-300 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showCreateModal && (
                <CreateBookModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        loadBooks();
                    }}
                />
            )}
        </Layout>
    );
};

type CreateBookModalProps = { onClose: () => void; onSuccess: () => void };

const CreateBookModal: React.FC<CreateBookModalProps> = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        isbn: '',
        title: '',
        categories: '',
        totalCopies: 1,
        publisher: '',
        pages: 0,
        language: 'Français',
        summary: '',
    });
    const [authorsInput, setAuthorsInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const authors = authorsInput
                .split(',')
                .map(name => name.trim())
                .filter(Boolean);

            const bookData = {
                ...formData,
                categories: formData.categories.split(',').map(c => c.trim()).filter(Boolean),
                availableCopies: formData.totalCopies,
                ...(authors.length > 0 && { authors }),
            };

            await api.post('/api/books', bookData);
            onSuccess();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            setError(message || 'Erreur lors de la création');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Ajouter un livre</h2>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">ISBN *</label>
                            <input
                                type="text"
                                value={formData.isbn}
                                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Langue</label>
                            <input
                                type="text"
                                value={formData.language}
                                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Titre *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Auteurs (optionnel)
                        </label>
                        <input
                            type="text"
                            value={authorsInput}
                            onChange={(e) => setAuthorsInput(e.target.value)}
                            placeholder="Victor Hugo, Alexandre Dumas"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        />
                        <p className="text-xs text-slate-500 mt-1">Séparez les noms par des virgules</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Catégories (séparées par des virgules) *
                        </label>
                        <input
                            type="text"
                            value={formData.categories}
                            onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                            placeholder="Roman, Science-Fiction"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Éditeur *</label>
                            <input
                                type="text"
                                value={formData.publisher}
                                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Nombre d'exemplaires *</label>
                            <input
                                type="number"
                                value={formData.totalCopies}
                                onChange={(e) => setFormData({ ...formData, totalCopies: parseInt(e.target.value || '1', 10) })}
                                min="1"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Nombre de pages</label>
                        <input
                            type="number"
                            value={formData.pages}
                            onChange={(e) => setFormData({ ...formData, pages: parseInt(e.target.value || '0', 10) })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Résumé</label>
                        <textarea
                            value={formData.summary}
                            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-slate-300 hover:bg-slate-50 rounded-lg font-medium transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Création...' : 'Créer le livre'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateBookModal;
