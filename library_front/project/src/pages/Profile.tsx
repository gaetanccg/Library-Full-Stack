import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Save } from 'lucide-react';

export const Profile = () => {
    const { user, refreshProfile } = useAuth();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: {
            street: '',
            city: '',
            postalCode: '',
            country: 'France',
        },
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || '',
                address: {
                    street: user.address?.street || '',
                    city: user.address?.city || '',
                    postalCode: user.address?.postalCode || '',
                    country: user.address?.country || 'France',
                },
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setIsLoading(true);

        try {
            await api.put('/api/users/profile', formData);
            await refreshProfile();
            setMessage({ type: 'success', text: 'Profil mis à jour avec succès' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Erreur lors de la mise à jour' });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePayFine = async () => {
        if (!confirm(`Confirmer le paiement de ${user?.totalFines?.toFixed(2)} € ?`)) return;

        try {
            await api.post('/api/users/pay-fine');
            await refreshProfile();
            alert('Amende payée avec succès !');
        } catch (error: any) {
            alert(error.message || 'Erreur lors du paiement');
        }
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Mon profil</h1>
                    <p className="text-slate-600 mt-1">Gérez vos informations personnelles</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-3xl">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    {user?.firstName} {user?.lastName}
                                </h2>
                                <p className="text-slate-600 capitalize mt-1">{user?.role}</p>
                                <div className={`mt-3 px-3 py-1 rounded-full text-sm font-medium ${
                                    user?.status === 'actif'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                }`}>
                                    {user?.status}
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Emprunts actifs</span>
                                    <span className="font-medium text-slate-900">{user?.currentLoans || 0} / 5</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Amendes</span>
                                    <span className={`font-medium ${
                                        (user?.totalFines || 0) > 0 ? 'text-red-600' : 'text-green-600'
                                    }`}>
                    {(user?.totalFines || 0).toFixed(2)} €
                  </span>
                                </div>
                            </div>

                            {(user?.totalFines || 0) > 0 && (
                                <button
                                    onClick={handlePayFine}
                                    className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Payer les amendes
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Informations personnelles</h2>

                            {message && (
                                <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
                                    message.type === 'success'
                                        ? 'bg-green-50 border border-green-200 text-green-700'
                                        : 'bg-red-50 border border-red-200 text-red-700'
                                }`}>
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Prénom
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Nom
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 cursor-not-allowed"
                                        disabled
                                    />
                                    <p className="text-xs text-slate-500 mt-1">L'email ne peut pas être modifié</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Téléphone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="pt-4">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Adresse</h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Rue
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.address.street}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    address: { ...formData.address, street: e.target.value }
                                                })}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    Ville
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.address.city}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        address: { ...formData.address, city: e.target.value }
                                                    })}
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    Code postal
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.address.postalCode}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        address: { ...formData.address, postalCode: e.target.value }
                                                    })}
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Pays
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.address.country}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    address: { ...formData.address, country: e.target.value }
                                                })}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 mt-6"
                                >
                                    <Save className="w-5 h-5" />
                                    {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
