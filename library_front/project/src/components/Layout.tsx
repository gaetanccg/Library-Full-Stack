import { ReactNode, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  BookOpen,
  LayoutDashboard,
  BookMarked,
  Users,
  User,
  LogOut,
  Menu,
  X,
  BarChart3
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const currentPath = window.location.pathname;

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const isLibrarianOrAdmin = user?.role === 'bibliothécaire' || user?.role === 'admin';

  const navigation = [
    { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard, show: true },
    { name: 'Livres', href: '/books', icon: BookOpen, show: true },
    { name: 'Mes emprunts', href: '/my-loans', icon: BookMarked, show: true },
    { name: 'Statistiques', href: '/stats', icon: BarChart3, show: isLibrarianOrAdmin },
    { name: 'Utilisateurs', href: '/users', icon: Users, show: isLibrarianOrAdmin },
    { name: 'Tous les emprunts', href: '/loans', icon: BookMarked, show: isLibrarianOrAdmin },
  ];

  const NavLink = ({ item }: { item: typeof navigation[0] }) => {
    const isActive = currentPath === item.href;
    const Icon = item.icon;

    return (
      <a
        href={item.href}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
          isActive
            ? 'bg-slate-900 text-white'
            : 'text-slate-700 hover:bg-slate-100'
        }`}
      >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{item.name}</span>
      </a>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="lg:flex">
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="bg-slate-900 p-2 rounded-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900">Bibliothèque</h1>
                  <p className="text-xs text-slate-600 capitalize">{user?.role}</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navigation.filter(item => item.show).map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </nav>

            <div className="p-4 border-t border-slate-200">
              <a
                href="/profile"
                className="flex items-center gap-3 px-4 py-3 mb-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Mon profil</span>
              </a>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Déconnexion</span>
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1 lg:ml-0">
          <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
            <div className="px-4 lg:px-8 h-16 flex items-center justify-between">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-slate-700" />
                ) : (
                  <Menu className="w-6 h-6 text-slate-700" />
                )}
              </button>

              <div className="flex items-center gap-4 ml-auto">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-slate-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-slate-600">{user?.email}</p>
                </div>
                <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
              </div>
            </div>
          </header>

          <main className="p-4 lg:p-8">
            {children}
          </main>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};
