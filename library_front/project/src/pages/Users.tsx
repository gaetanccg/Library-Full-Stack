import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { api } from '../services/api';
import { User } from '../types';
import { Users as UsersIcon, Search, UserCheck, UserX, Eye } from 'lucide-react';

export const Users = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await api.get<{ users: User[]; total: number }>('/api/users');
            if (response.data?.users) {
                setUsers(Array.isArray(response.data.users) ? response.data.users : []);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error('Error loading users:', error);
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (userId: string, newStatus: string) => {
        if (!confirm(`Changer le statut de cet utilisateur en "${newStatus}" ?`)) return;

        try {
            await api.patch(`/api/users/${userId}/status`, { accountStatus: newStatus });
            alert('Statut modifié avec succès');
            loadUsers();
        } catch (error: any) {
            alert(error.message || 'Erreur lors de la modification');
        }
    };

    const filteredUsers = users.filter(user => {
        const searchLower = searchQuery.toLowerCase();
        return (
            user.firstName.toLowerCase().includes(searchLower) ||
            user.lastName.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower) ||
            user.role.toLowerCase().includes(searchLower)
        );
    });

    const UserDetailModal = ({ user, onClose }: { user: User; onClose: () => void }) => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">Détails de l'utilisateur</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 text-2xl"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-4 pb-6 border-b border-slate-200">
                        <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">
                {user.firstName[0]}{user.lastName[0]}
              </span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">
                                {user.firstName} {user.lastName}
                            </h3>
                            <p className="text-slate-600 capitalize">{user.role}</p>
                            <div className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                                user.status === 'actif'
                                    ? 'bg-green-100 text-green-700'
                                    : user.status === 'suspendu'
                                        ? 'bg-orange-100 text-orange-700'
                                        : 'bg-red-100 text-red-700'
                            }`}>
                                {user.status}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-slate-600 mb-1">Email</p>
                            <p className="font-medium text-slate-900">{user.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-600 mb-1">Téléphone</p>
                            <p className="font-medium text-slate-900">{user.phone || 'Non renseigné'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-600 mb-1">Emprunts actifs</p>
                            <p className="font-medium text-slate-900">{user.currentLoans || 0} / 5</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-600 mb-1">Amendes</p>
                            <p className={`font-medium ${
                                (user.totalFines || 0) > 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                                {(user.totalFines || 0).toFixed(2)} €
                            </p>
                        </div>
                    </div>

                    {user.address && (
                        <div>
                            <p className="text-sm text-slate-600 mb-2">Adresse</p>
                            <div className="bg-slate-50 p-4 rounded-lg">
                                <p className="font-medium text-slate-900">{user.address.street}</p>
                                <p className="text-slate-700">
                                    {user.address.postalCode} {user.address.city}
                                </p>
                                <p className="text-slate-700">{user.address.country}</p>
                            </div>
                        </div>
                    )}

                    <div>
                        <p className="text-sm text-slate-600 mb-1">Membre depuis</p>
                        <p className="font-medium text-slate-900">
                            {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                        <p className="text-sm font-medium text-slate-700 mb-3">Actions</p>
                        <div className="flex gap-2">
                            {user.status === 'actif' && (
                                <button
                                    onClick={() => {
                                        handleStatusChange(user._id, 'suspendu');
                                        onClose();
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-orange-300 text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                                >
                                    <UserX className="w-4 h-4" />
                                    Suspendre
                                </button>
                            )}
                            {user.status === 'suspendu' && (
                                <button
                                    onClick={() => {
                                        handleStatusChange(user._id, 'actif');
                                        onClose();
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-green-300 text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                                >
                                    <UserCheck className="w-4 h-4" />
                                    Activer
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <Layout>
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Gestion des utilisateurs</h1>
                    <p className="text-slate-600 mt-1">Consultez et gérez les comptes utilisateurs</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher par nom, email, rôle..."
                            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                        <UsersIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-600">Aucun utilisateur trouvé</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                                        Utilisateur
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                                        Email
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                                        Rôle
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                                        Statut
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                                        Emprunts
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                                        Amendes
                                    </th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                {filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-medium text-sm">
                              {user.firstName[0]}{user.lastName[0]}
                            </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">
                                                        {user.firstName} {user.lastName}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full capitalize">
                          {user.role}
                        </span>
                                        </td>
                                        <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                            user.status === 'actif'
                                ? 'bg-green-100 text-green-700'
                                : user.status === 'suspendu'
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-red-100 text-red-700'
                        }`}>
                          {user.status}
                        </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                                            {user.currentLoans || 0} / 5
                                        </td>
                                        <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${
                            (user.totalFines || 0) > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {(user.totalFines || 0).toFixed(2)} €
                        </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => setSelectedUser(user)}
                                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                                    title="Voir les détails"
                                                >
                                                    <Eye className="w-4 h-4 text-slate-600" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {selectedUser && (
                    <UserDetailModal
                        user={selectedUser}
                        onClose={() => setSelectedUser(null)}
                    />
                )}
            </div>
        </Layout>
    );
};
