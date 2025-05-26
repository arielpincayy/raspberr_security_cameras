import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from './AlertContext';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('securityUser');
    const token = localStorage.getItem('securityToken');

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept any non-empty username/password
      if (!username.trim() || !password.trim()) {
        throw new Error('Invalid credentials');
      }
      
      // Mock successful login
      const mockUser: User = {
        id: '1',
        username,
        email: `${username}@securitysystem.com`,
        role: 'admin'
      };
      
      // Store user info and token
      localStorage.setItem('securityUser', JSON.stringify(mockUser));
      localStorage.setItem('securityToken', 'mock-jwt-token-123456789');
      
      setUser(mockUser);
      showAlert({ type: 'success', message: 'Successfully logged in' });
      navigate('/dashboard');
    } catch (error) {
      showAlert({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to login' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('securityUser');
    localStorage.removeItem('securityToken');
    setUser(null);
    navigate('/login');
    showAlert({ type: 'info', message: 'You have been logged out' });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};