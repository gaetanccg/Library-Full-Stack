import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { api } from '../services/api';
import { TopBook, BooksByCategory, LoanEvolution } from '../types';
import { TrendingUp, PieChart, Calendar } from 'lucide-react';

export const Statistics = () => {
    const [topBooks, setTopBooks] = useState<TopBook[]>([]);
    const [categoryStats, setCategoryStats] = useState<BooksByCategory[]>([]);
    const [loanEvolution, setLoanEvolution] = useState<LoanEvolution[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStatistics();
    }, []);

    const loadStatistics = async () => {
        try {
            setIsLoading(true);
            const [topBooksRes, categoryRes, evolutionRes] = await Promise.all([
                api.get<TopBook[]>('/api/stats/top-borrowed?limit=10'),
                api.get<BooksByCategory[]>('/api/stats/category'),
                api.get<LoanEvolution[]>('/api/stats/loan-evolution?months=6'),
            ]);

            if (topBooksRes.data) setTopBooks(Array.isArray(topBooksRes.data) ? topBooksRes.data : []);
            if (categoryRes.data) setCategoryStats(Array.isArray(categoryRes.data) ? categoryRes.data : []);
            if (evolutionRes.data) setLoanEvolution(Array.isArray(evolutionRes.data) ? evolutionRes.data : []);
        } catch (error) {
            console.error('Error loading statistics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getMonthName = (month: number) => {
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
        return months[month - 1];
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Statistiques</h1>
                    <p className="text-slate-600 mt-1">Analyse détaillée de l'activité de la bibliothèque</p>
                </div>

                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-slate-900 p-2 rounded-lg">
                                        <TrendingUp className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900">Top 10 Livres Empruntés</h2>
                                </div>

                                <div className="space-y-3">
                                    {topBooks.length === 0 ? (
                                        <p className="text-slate-600 text-center py-8">Aucune donnée disponible</p>
                                    ) : (
                                        topBooks.map((item, index) => (
                                            <div
                                                key={item._id}
                                                className="flex items-center gap-4 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                                            >
                                                <div className="flex-shrink-0 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-slate-900 truncate">
                                                        {item.title}
                                                    </h3>
                                                    <p className="text-sm text-slate-600 truncate">
                                                        {item.authors?.length > 0 ? item.authors.join(', ') : 'Auteur inconnu'}
                                                    </p>
                                                </div>
                                                <div className="flex-shrink-0 text-right">
                                                    <p className="font-bold text-slate-900">{item.borrowCount}</p>
                                                    <p className="text-xs text-slate-600">emprunts</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-slate-900 p-2 rounded-lg">
                                        <PieChart className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900">Statistiques par Catégorie</h2>
                                </div>

                                <div className="space-y-3">
                                    {categoryStats.length === 0 ? (
                                        <p className="text-slate-600 text-center py-8">Aucune donnée disponible</p>
                                    ) : (
                                        categoryStats.map((cat) => {
                                            const borrowRate = cat.borrowRate || 0;

                                            return (
                                                <div
                                                    key={cat._id}
                                                    className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="font-semibold text-slate-900">{cat._id}</h3>
                                                        <span className="text-sm font-medium text-slate-600">
                              {borrowRate}% emprunté
                            </span>
                                                    </div>

                                                    <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
                                                        <div
                                                            className="bg-slate-900 h-2 rounded-full transition-all"
                                                            style={{ width: `${borrowRate}%` }}
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                                        <div>
                                                            <p className="text-slate-600">Total</p>
                                                            <p className="font-semibold text-slate-900">{cat.totalCopies}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-slate-600">Disponibles</p>
                                                            <p className="font-semibold text-green-600">{cat.availableCopies}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-slate-600">Empruntés</p>
                                                            <p className="font-semibold text-slate-900">{cat.borrowedCopies}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-slate-900 p-2 rounded-lg">
                                    <Calendar className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">Évolution des Emprunts (6 derniers mois)</h2>
                            </div>

                            {loanEvolution.length === 0 ? (
                                <p className="text-slate-600 text-center py-8">Aucune donnée disponible</p>
                            ) : (
                                <div className="space-y-6">
                                    <div className="relative h-64">
                                        <div className="absolute inset-0 flex items-end justify-between gap-2">
                                            {loanEvolution.map((item, index) => {
                                                const maxLoans = Math.max(...loanEvolution.map(i => i.totalLoans));
                                                const height = maxLoans > 0 ? (item.totalLoans / maxLoans) * 100 : 0;

                                                return (
                                                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                                        <div className="w-full flex flex-col items-center gap-2">
                                                            <div className="text-xs font-medium text-slate-900">
                                                                {item.totalLoans}
                                                            </div>
                                                            <div
                                                                className="w-full bg-slate-900 rounded-t-lg transition-all hover:bg-slate-700 cursor-pointer relative group"
                                                                style={{ height: `${height}%`, minHeight: height > 0 ? '20px' : '0' }}
                                                            >
                                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                                                                    Actifs: {item.activeLoans} | Retournés: {item.returnedLoans}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-xs text-slate-600 font-medium">
                                                            {getMonthName(item.month)} {item.year}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200">
                                        <div className="text-center">
                                            <p className="text-sm text-slate-600 mb-1">Total des emprunts</p>
                                            <p className="text-2xl font-bold text-slate-900">
                                                {loanEvolution.reduce((sum, item) => sum + item.totalLoans, 0)}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm text-slate-600 mb-1">Emprunts actifs</p>
                                            <p className="text-2xl font-bold text-blue-600">
                                                {loanEvolution.reduce((sum, item) => sum + item.activeLoans, 0)}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm text-slate-600 mb-1">En retard</p>
                                            <p className="text-2xl font-bold text-red-600">
                                                {loanEvolution.reduce((sum, item) => sum + item.overdueLoans, 0)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};
