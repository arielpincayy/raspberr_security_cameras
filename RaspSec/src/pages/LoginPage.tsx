import { useState, FormEvent } from 'react';
import { Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (!username.trim()) {
        throw new Error('Username is required');
      }
      if (!password.trim()) {
        throw new Error('Password is required');
      }
      
      await login(username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Shield className="h-10 w-10 text-primary" />
          <h1 className="text-2xl font-bold ml-2">SecureView</h1>
        </div>
        
        <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
          <h2 className="text-xl font-semibold mb-6">Sign in to your account</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mr-2 mt-0.5" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium mb-1">
                Username or Email
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input"
                placeholder="Enter your username or email"
                disabled={isLoading}
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Enter your password"
                disabled={isLoading}
              />
            </div>
            
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></span>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Credentials for demo: any non-empty username and password
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Secure authentication powered by JWT
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;