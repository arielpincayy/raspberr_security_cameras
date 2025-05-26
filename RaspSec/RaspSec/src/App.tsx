import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Router } from './components/Router';
import { AuthProvider } from './contexts/AuthContext';
import { AlertProvider } from './contexts/AlertContext';
import { Toaster } from './components/ui/Toaster';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-foreground">Loading security system...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AlertProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </AlertProvider>
    </BrowserRouter>
  );
}

export default App;