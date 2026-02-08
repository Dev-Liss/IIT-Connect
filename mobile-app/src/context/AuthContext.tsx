import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

// Define user type
export interface User {
    id: string; // Changed from _id to id to match backend normalization if possible, or support both
    username: string;
    email: string;
    studentId: string;
    token?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (userData: User, token: string) => Promise<void>;
    logout: () => Promise<void>;
    checkUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Load user from storage on mount
    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const storedUser = await AsyncStorage.getItem('user');
            const storedToken = await AsyncStorage.getItem('token');

            if (storedUser && storedToken) {
                setUser(JSON.parse(storedUser));
            } else {
                setUser(null);
            }
        } catch (e) {
            console.log('Failed to load user', e);
        } finally {
            setLoading(false);
        }
    };

    const login = async (userData: User, token: string) => {
        try {
            // Ensure user object has id property regardless of backend returned _id
            const normalizedUser = {
                ...userData,
                id: (userData as any)._id || userData.id,
            };

            setUser(normalizedUser);
            await AsyncStorage.setItem('user', JSON.stringify(normalizedUser));
            await AsyncStorage.setItem('token', token);

            // Navigate is usually handled by the component call, but could do it here
        } catch (e) {
            console.log('Login error', e);
        }
    };

    const logout = async () => {
        try {
            setUser(null);
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('token');
            router.replace('/');
        } catch (e) {
            console.log('Logout error', e);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, checkUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
