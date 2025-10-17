import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { api } from '../services/api';
import { Loan } from '../types';
import { BookMarked, AlertCircle, Filter, CheckCircle2 } from 'lucide-react';

export const Loans = () => {
    const [allLoans, setAllLoans] = useState<Loan[]>([]);
    const [overdueLoans, setOverdueLoans] = useState<Loan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'overdue'>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [returningLoanId, setReturningLoanId] = useState<string | null>(null);

    useEffect(() => {
        loadLoans();
    }, []);

    const loadLoans = async () => {
        try {
            setIsLoading(true);
            const [allLoansRes, overdueLoansRes] = await Promise.all([
                api.get<{ loans: Loan[]; total: number }>('/api/loans'),
                api.get<{ loans: Loan[]; count: number }>('/api/loans/overdue'),
            ]);

            if (allLoansRes.data?.loans) {
                setAllLoans(Array.isArray(allLoansRes.data.loans) ? allLoansRes.data.loans : []);
            } else {
                setAllLoans([]);
            }

            if (overdueLoansRes.data?.loans) {
                setOverdueLoans(Array.isArray(overdueLoansRes.data.loans) ? overdueLoansRes.data.loans : []);
            } else {
                setOverdueLoans([]);
            }
        } catch (error) {
            console.error('Error loading loans:', error);
            setAllLoans([]);
            setOverdueLoans([]);
        } finally {
            setIsLoading(false);
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

    const handleReturnBook = async (loanId: string) => {
        if (!confirm('Confirmer le retour de ce livre ?')) return;

        try {
            setReturningLoanId(loanId);
            await api.patch(`/api/loans/${loanId}/return`);
            await loadLoans();
        } catch (error) {
            console.error('Error returning book:', error);
            alert('Erreur lors du retour du livre');
        } finally {
            setReturningLoanId(null);
        }
    };

    const getDisplayLoans = () => {
        const loans = activeTab === 'all' ? allLoans : overdueLoans;

        if (filterStatus === 'all') return loans;
        return loans.filter(loan => loan.status === filterStatus);
    };

    const displayLoans = getDisplayLoans();

    const LoanRow = ({ loan }: { loan: Loan }) => {
        const daysRemaining = loan.status === 'en cours' ? getDaysRemaining(loan.expectedReturnDate) : null;
        const isOverdue = daysRemaining !== null && daysRemaining < 0;
        const borrower = typeof loan.borrower === 'string' ? null : loan.borrower;

        return (
            <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                    <div>
                        <p className="font-medium text-slate-900">{loan.book.title}</p>
                        <p className="text-sm text-slate-600">
                            {loan.book.authors?.length > 0 ? loan.book.authors.join(', ') : 'Auteur inconnu'}
                        </p>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <div>
                        {borrower ? (
                            <>
                                <p className="font-medium text-slate-900">
                                    {borrower.firstName} {borrower.lastName}
                                </p>
                                <p className="text-sm text-slate-600">{borrower.email}</p>
                            </>
                        ) : (
                            <p className="text-sm text-slate-600 italic">ID: {String(loan.borrower)}</p>
                        )}
                    </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                    {formatDate(loan.borrowDate)}
                </td>
                <td className="px-6 py-4">
                    <div className="text-sm">
                        <p className={`font-medium ${isOverdue ? 'text-red-600' : 'text-slate-900'}`}>
                            {formatDate(loan.expectedReturnDate)}
                        </p>
                        {daysRemaining !== null && (
                            <p className={`text-xs ${
                                isOverdue
                                    ? 'text-red-600'
                                    : daysRemaining <= 3
                                        ? 'text-orange-600'
                                        : 'text-slate-600'
                            }`}>
                                {isOverdue
                                    ? `${Math.abs(daysRemaining)} jour(s) de retard`
                                    : `${daysRemaining} jour(s) restant(s)`
                                }
                            </p>
                        )}
                    </div>
                </td>
                <td className="px-6 py-4">
                    {loan.actualReturnDate ? (
                        <span className="text-sm text-slate-600">{formatDate(loan.actualReturnDate)}</span>
                    ) : (
                        <span className="text-sm text-slate-400">-</span>
                    )}
                </td>
                <td className="px-6 py-4">
          <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
              loan.status === 'en cours'
                  ? 'bg-blue-100 text-blue-700'
                  : loan.status === 'retourné'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
          }`}>
            {loan.status}
          </span>
                </td>
                <td className="px-6 py-4 text-center">
          <span className="text-sm font-medium text-slate-900">
            {loan.renewalCount} / 2
          </span>
                </td>
                <td className="px-6 py-4">
                    {loan.fineAmount > 0 ? (
                        <div className="text-sm">
                            <p className={`font-medium ${loan.finePaid ? 'text-green-600' : 'text-red-600'}`}>
                                {loan.fineAmount.toFixed(2)} €
                            </p>
                            <p className="text-xs text-slate-600">
                                {loan.finePaid ? 'Payée' : 'À payer'}
                            </p>
                        </div>
                    ) : (
                        <span className="text-sm text-slate-400">-</span>
                    )}
                </td>
                <td className="px-6 py-4">
                    {loan.status === 'en cours' || loan.status === 'en retard' ? (
                        <button
                            onClick={() => handleReturnBook(loan._id)}
                            disabled={returningLoanId === loan._id}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            {returningLoanId === loan._id ? 'Retour...' : 'Retourner'}
                        </button>
                    ) : (
                        <span className="text-sm text-slate-400">-</span>
                    )}
                </td>
            </tr>
        );
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Gestion des emprunts</h1>
                    <p className="text-slate-600 mt-1">Consultez et gérez tous les emprunts</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
                    <div className="border-b border-slate-200">
                        <div className="flex">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`flex-1 px-6 py-4 font-medium transition-colors ${
                                    activeTab === 'all'
                                        ? 'text-slate-900 border-b-2 border-slate-900'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Tous les emprunts ({allLoans.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('overdue')}
                                className={`flex-1 px-6 py-4 font-medium transition-colors ${
                                    activeTab === 'overdue'
                                        ? 'text-slate-900 border-b-2 border-slate-900'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                En retard ({overdueLoans.length})
                            </button>
                        </div>
                    </div>

                    <div className="p-4">
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-slate-400" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                            >
                                <option value="all">Tous les statuts</option>
                                <option value="en cours">En cours</option>
                                <option value="retourné">Retournés</option>
                                <option value="en retard">En retard</option>
                            </select>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
                    </div>
                ) : displayLoans.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                        <BookMarked className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-600">
                            {activeTab === 'overdue'
                                ? 'Aucun emprunt en retard'
                                : 'Aucun emprunt trouvé'}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                                        Livre
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                                        Emprunteur
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                                        Date d'emprunt
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                                        Date de retour prévue
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                                        Date de retour réelle
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                                        Statut
                                    </th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">
                                        Renouvellements
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                                        Amende
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                {(Array.isArray(displayLoans) ? displayLoans : []).map((loan) => (
                                    <LoanRow key={loan._id} loan={loan} />
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'overdue' && overdueLoans.length > 0 && (
                    <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-red-900 mb-1">
                                    {overdueLoans.length} emprunt(s) en retard
                                </h3>
                                <p className="text-sm text-red-700">
                                    Ces emprunts nécessitent une attention immédiate. Contactez les utilisateurs concernés
                                    pour récupérer les livres et appliquer les amendes appropriées.
                                </p>
                                <div className="mt-4 grid grid-cols-2 gap-4">
                                    <div className="bg-white p-3 rounded-lg">
                                        <p className="text-xs text-slate-600 mb-1">Total des amendes</p>
                                        <p className="text-lg font-bold text-red-600">
                                            {overdueLoans.reduce((sum, loan) => sum + loan.fineAmount, 0).toFixed(2)} €
                                        </p>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg">
                                        <p className="text-xs text-slate-600 mb-1">Amendes impayées</p>
                                        <p className="text-lg font-bold text-red-600">
                                            {overdueLoans
                                                .filter(loan => !loan.finePaid)
                                                .reduce((sum, loan) => sum + loan.fineAmount, 0)
                                                .toFixed(2)} €
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};
