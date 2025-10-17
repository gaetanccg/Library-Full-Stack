import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { api } from '../services/api';
import { Loan } from '../types';
import { BookMarked, RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export const MyLoans = () => {
    const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
    const [loanHistory, setLoanHistory] = useState<Loan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

    useEffect(() => {
        loadLoans();
    }, []);

    const loadLoans = async () => {
        try {
            setIsLoading(true);
            const [activeRes, historyRes] = await Promise.all([
                api.get<{ loans: Loan[]; count: number }>('/api/loans/my'),
                api.get<{ loans: Loan[]; total: number }>('/api/loans/history'),
            ]);

            // Normaliser les réponses : s'assurer que ce sont bien des tableaux
            if (activeRes.data?.loans) {
                setActiveLoans(Array.isArray(activeRes.data.loans) ? activeRes.data.loans : []);
            } else {
                setActiveLoans([]);
            }

            if (historyRes.data?.loans) {
                setLoanHistory(Array.isArray(historyRes.data.loans) ? historyRes.data.loans : []);
            } else {
                setLoanHistory([]);
            }
        } catch (error: unknown) {
            console.error('Error loading loans:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getErrorMessage = (error: unknown) => {
        return error instanceof Error ? error.message : String(error);
    };

    const handleRenew = async (loanId: string) => {
        try {
            await api.patch(`/api/loans/${loanId}/renew`);
            alert('Emprunt renouvelé avec succès !');
            loadLoans();
        } catch (error: unknown) {
            alert(getErrorMessage(error) || 'Erreur lors du renouvellement');
        }
    };

    const handleReturn = async (loanId: string) => {
        if (!confirm('Confirmer le retour de ce livre ?')) return;

        try {
            await api.patch(`/api/loans/${loanId}/return`);
            alert('Livre retourné avec succès !');
            loadLoans();
        } catch (error: unknown) {
            alert(getErrorMessage(error) || 'Erreur lors du retour');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    const getDaysRemaining = (dueDate: string) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const LoanCard = ({ loan, isActive }: { loan: Loan; isActive: boolean }) => {
        const daysRemaining = isActive ? getDaysRemaining(loan.expectedReturnDate) : null;
        const isOverdue = daysRemaining !== null && daysRemaining < 0;

        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-900 mb-1">
                            {loan.book.title}
                        </h3>
                        <p className="text-sm text-slate-600">
                            {loan.book.authors?.length > 0 ? loan.book.authors.join(', ') : 'Auteur inconnu'}
                        </p>
                    </div>
                    {isOverdue && (
                        <div className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium">
                            <AlertCircle className="w-3 h-3" />
                            En retard
                        </div>
                    )}
                    {!isActive && loan.status === 'retourné' && (
                        <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                            <CheckCircle className="w-3 h-3" />
                            Retourné
                        </div>
                    )}
                </div>

                <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Date d'emprunt:</span>
                        <span className="font-medium text-slate-900">{formatDate(loan.borrowDate)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Date de retour:</span>
                        <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-slate-900'}`}>
              {formatDate(loan.expectedReturnDate)}
            </span>
                    </div>
                    {isActive && daysRemaining !== null && (
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Temps restant:</span>
                            <span className={`font-medium flex items-center gap-1 ${
                                isOverdue ? 'text-red-600' : daysRemaining <= 3 ? 'text-orange-600' : 'text-green-600'
                            }`}>
                <Clock className="w-3 h-3" />
                                {isOverdue ? `${Math.abs(daysRemaining)} jour(s) de retard` : `${daysRemaining} jour(s)`}
              </span>
                        </div>
                    )}
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Renouvellements:</span>
                        <span className="font-medium text-slate-900">{loan.renewalCount} / 2</span>
                    </div>
                    {loan.fineAmount > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Amende:</span>
                            <span className={`font-medium ${loan.finePaid ? 'text-green-600' : 'text-red-600'}`}>
                {loan.fineAmount.toFixed(2)} € {loan.finePaid ? '(Payée)' : '(À payer)'}
              </span>
                        </div>
                    )}
                </div>

                {isActive && (
                    <div className="flex gap-2">
                        {loan.renewalCount < 2 && (
                            <button
                                onClick={() => handleRenew(loan._id)}
                                className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Renouveler
                            </button>
                        )}
                        <button
                            onClick={() => handleReturn(loan._id)}
                            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            Retourner
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Mes emprunts</h1>
                    <p className="text-slate-600 mt-1">Gérez vos emprunts de livres</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
                    <div className="border-b border-slate-200">
                        <div className="flex">
                            <button
                                onClick={() => setActiveTab('active')}
                                className={`flex-1 px-6 py-4 font-medium transition-colors ${
                                    activeTab === 'active'
                                        ? 'text-slate-900 border-b-2 border-slate-900'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Emprunts actifs ({activeLoans.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`flex-1 px-6 py-4 font-medium transition-colors ${
                                    activeTab === 'history'
                                        ? 'text-slate-900 border-b-2 border-slate-900'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Historique ({loanHistory.length})
                            </button>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
                    </div>
                ) : activeTab === 'active' ? (
                    (Array.isArray(activeLoans) && activeLoans.length === 0) ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                            <BookMarked className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-600">Aucun emprunt actif</p>
                            <a
                                href="/books"
                                className="inline-block mt-4 text-slate-900 hover:underline font-medium"
                            >
                                Parcourir les livres
                            </a>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(Array.isArray(activeLoans) ? activeLoans : []).map((loan) => (
                                <LoanCard key={loan._id} loan={loan} isActive={true} />
                            ))}
                        </div>
                    )
                ) : (Array.isArray(loanHistory) && loanHistory.length === 0) ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                        <BookMarked className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-600">Aucun historique d'emprunt</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {(Array.isArray(loanHistory) ? loanHistory : []).map((loan) => (
                            <LoanCard key={loan._id} loan={loan} isActive={false} />
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};
