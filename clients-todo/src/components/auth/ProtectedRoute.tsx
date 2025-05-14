
// src/components/auth/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, isLoadingUser } = useAuth();

    // Check if we're still loading the user
    if (isLoadingUser) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    // If not authenticated, redirect to the auth page
    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }

    // If authenticated, render the children
    return <>{children}</>;
};

export default ProtectedRoute;