import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Stats } from '../types';
import { BookOpen, Users, BookMarked, AlertCircle, TrendingUp, DollarSign } from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isLibrarianOrAdmin = user?.role === 'bibliothécaire' || user?.role === 'admin';

  useEffect(() => {
    if (isLibrarianOrAdmin) {
      loadStats();
    } else {
      setIsLoading(false);
    }
  }, [isLibrarianOrAdmin]);

  const loadStats = async () => {
    try {
      const response = await api.get<Stats>('/api/stats/dashboard');
      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Bienvenue, {user?.firstName} !
          </h1>
          <p className="text-slate-600 mt-1">
            {isLibrarianOrAdmin
              ? 'Vue d\'ensemble de la bibliothèque'
              : 'Votre espace personnel'}
          </p>
        </div>

        {isLibrarianOrAdmin ? (
          isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
            </div>
          ) : stats ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                  icon={BookOpen}
                  label="Total de livres"
                  value={stats.totalBooks}
                  color="bg-slate-900"
                />
                <StatCard
                  icon={Users}
                  label="Utilisateurs"
                  value={stats.totalUsers}
                  color="bg-slate-700"
                />
                <StatCard
                  icon={BookMarked}
                  label="Emprunts actifs"
                  value={stats.activeLoans}
                  color="bg-slate-600"
                />
                <StatCard
                  icon={AlertCircle}
                  label="Emprunts en retard"
                  value={stats.overdueLoans}
                  color="bg-red-600"
                />
                <StatCard
                  icon={TrendingUp}
                  label="Livres disponibles"
                  value={stats.availableBooks}
                  color="bg-green-600"
                />
                <StatCard
                  icon={DollarSign}
                  label="Amendes totales"
                  value={`${stats.totalFines.toFixed(2)} €`}
                  color="bg-orange-600"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Actions rapides</h2>
                  <div className="space-y-3">
                    <a
                      href="/books"
                      className="block p-4 border border-slate-200 hover:border-slate-300 rounded-lg transition-all hover:shadow-sm"
                    >
                      <h3 className="font-semibold text-slate-900">Gérer les livres</h3>
                      <p className="text-sm text-slate-600 mt-1">Ajouter, modifier ou supprimer des livres</p>
                    </a>
                    <a
                      href="/loans"
                      className="block p-4 border border-slate-200 hover:border-slate-300 rounded-lg transition-all hover:shadow-sm"
                    >
                      <h3 className="font-semibold text-slate-900">Voir tous les emprunts</h3>
                      <p className="text-sm text-slate-600 mt-1">Gérer les emprunts et retours</p>
                    </a>
                    <a
                      href="/users"
                      className="block p-4 border border-slate-200 hover:border-slate-300 rounded-lg transition-all hover:shadow-sm"
                    >
                      <h3 className="font-semibold text-slate-900">Gérer les utilisateurs</h3>
                      <p className="text-sm text-slate-600 mt-1">Voir et modifier les comptes utilisateurs</p>
                    </a>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Alertes</h2>
                  <div className="space-y-3">
                    {stats.overdueLoans > 0 && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                          <div>
                            <h3 className="font-semibold text-red-900">Emprunts en retard</h3>
                            <p className="text-sm text-red-700 mt-1">
                              {stats.overdueLoans} emprunt(s) en retard nécessitent votre attention
                            </p>
                            <a href="/loans" className="text-sm text-red-600 hover:underline mt-2 inline-block">
                              Voir les détails →
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                    {stats.totalFines > 0 && (
                      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <DollarSign className="w-5 h-5 text-orange-600 mt-0.5" />
                          <div>
                            <h3 className="font-semibold text-orange-900">Amendes impayées</h3>
                            <p className="text-sm text-orange-700 mt-1">
                              {stats.totalFines.toFixed(2)} € d'amendes en attente
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    {stats.overdueLoans === 0 && stats.totalFines === 0 && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                          <div>
                            <h3 className="font-semibold text-green-900">Tout va bien !</h3>
                            <p className="text-sm text-green-700 mt-1">
                              Aucune alerte pour le moment
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                icon={BookMarked}
                label="Emprunts actifs"
                value={user?.currentLoans || 0}
                color="bg-slate-900"
              />
              <StatCard
                icon={BookOpen}
                label="Emprunts disponibles"
                value={5 - (user?.currentLoans || 0)}
                color="bg-slate-700"
              />
              <StatCard
                icon={DollarSign}
                label="Amendes"
                value={`${(user?.totalFines || 0).toFixed(2)} €`}
                color={user?.totalFines && user.totalFines > 0 ? 'bg-red-600' : 'bg-green-600'}
              />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Actions rapides</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  href="/books"
                  className="p-6 border border-slate-200 hover:border-slate-300 rounded-lg transition-all hover:shadow-sm"
                >
                  <BookOpen className="w-8 h-8 text-slate-900 mb-3" />
                  <h3 className="font-semibold text-slate-900">Parcourir les livres</h3>
                  <p className="text-sm text-slate-600 mt-1">Découvrez notre catalogue</p>
                </a>
                <a
                  href="/my-loans"
                  className="p-6 border border-slate-200 hover:border-slate-300 rounded-lg transition-all hover:shadow-sm"
                >
                  <BookMarked className="w-8 h-8 text-slate-900 mb-3" />
                  <h3 className="font-semibold text-slate-900">Mes emprunts</h3>
                  <p className="text-sm text-slate-600 mt-1">Gérez vos emprunts en cours</p>
                </a>
              </div>
            </div>

            {user?.totalFines && user.totalFines > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900">Amendes impayées</h3>
                    <p className="text-sm text-red-700 mt-1">
                      Vous avez {user.totalFines.toFixed(2)} € d'amendes à payer.
                      Veuillez régler vos amendes pour pouvoir emprunter de nouveaux livres.
                    </p>
                    <a
                      href="/profile"
                      className="inline-block mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Payer maintenant
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};
