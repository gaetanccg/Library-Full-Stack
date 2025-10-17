import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Books } from './pages/Books';
import { MyLoans } from './pages/MyLoans';
import { Profile } from './pages/Profile';
import { Statistics } from './pages/Statistics';
import { Users } from './pages/Users';
import { Loans } from './pages/Loans';

function Router() {
    const { isAuthenticated, isLoading } = useAuth();
    const path = window.location.pathname;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated && path !== '/register') {
        return <Login />;
    }

    if (path === '/register') {
        return <Register />;
    }

    if (path === '/login') {
        return <Login />;
    }

    switch (path) {
        case '/dashboard':
            return (
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            );
        case '/books':
            return (
                <ProtectedRoute>
                    <Books />
                </ProtectedRoute>
            );
        case '/my-loans':
            return (
                <ProtectedRoute>
                    <MyLoans />
                </ProtectedRoute>
            );
        case '/profile':
            return (
                <ProtectedRoute>
                    <Profile />
                </ProtectedRoute>
            );
        case '/stats':
            return (
                <ProtectedRoute allowedRoles={['bibliothécaire', 'admin']}>
                    <Statistics />
                </ProtectedRoute>
            );
        case '/users':
            return (
                <ProtectedRoute allowedRoles={['bibliothécaire', 'admin']}>
                    <Users />
                </ProtectedRoute>
            );
        case '/loans':
            return (
                <ProtectedRoute allowedRoles={['bibliothécaire', 'admin']}>
                    <Loans />
                </ProtectedRoute>
            );
        default:
            window.location.href = '/dashboard';
            return null;
    }
}

function App() {
    return (
        <AuthProvider>
            <Router />
        </AuthProvider>
    );
}

export default App;
