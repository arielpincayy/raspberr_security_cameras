import { useAlert } from '../../contexts/AlertContext';
import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const ToastIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-5 w-5 text-success" />;
    case 'error':
      return <XCircle className="h-5 w-5 text-destructive" />;
    case 'warning':
      return <AlertCircle className="h-5 w-5 text-warning" />;
    case 'info':
    default:
      return <Info className="h-5 w-5 text-secondary" />;
  }
};

const ToastItem = ({ id, type, message, onDismiss }: { 
  id: string; 
  type: string; 
  message: string;
  onDismiss: (id: string) => void;
}) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(id);
    }, 300);
  };

  useEffect(() => {
    const timer = setTimeout(handleDismiss, 5000);
    return () => clearTimeout(timer);
  }, [id]);

  return (
    <div 
      className={`max-w-sm w-full bg-card border border-border shadow-lg rounded-lg pointer-events-auto flex items-start p-4 mb-3 transform transition-all duration-300 ${
        isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      }`}
    >
      <div className="flex-shrink-0 mr-3">
        <ToastIcon type={type} />
      </div>
      <div className="flex-1 ml-2 mr-2">
        <p className="text-sm text-foreground">{message}</p>
      </div>
      <button 
        onClick={handleDismiss} 
        className="flex-shrink-0 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export const Toaster = () => {
  const { alerts, dismissAlert } = useAlert();

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end">
      {alerts.map((alert) => (
        <ToastItem
          key={alert.id}
          id={alert.id}
          type={alert.type}
          message={alert.message}
          onDismiss={dismissAlert}
        />
      ))}
    </div>
  );
};