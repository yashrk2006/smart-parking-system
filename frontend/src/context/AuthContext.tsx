import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    userRole: string;
    login: (user: User, role: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<string>('guest');

    const login = useCallback((user: User, role: string) => {
        setUser(user);
        setUserRole(role);
        setIsAuthenticated(true);
    }, []);

    const logout = useCallback(() => {
        setIsAuthenticated(false);
        setUser(null);
        setUserRole('guest');
        localStorage.removeItem('token');
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, userRole, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
