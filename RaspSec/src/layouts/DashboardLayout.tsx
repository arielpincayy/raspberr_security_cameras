import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Camera, 
  Bell, 
  Menu, 
  X, 
  Shield, 
  LogOut, 
  User, 
  ChevronDown 
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const navigation = [
    { name: 'Events', href: '/dashboard', icon: Bell },
    { name: 'Live Cameras', href: '/cameras', icon: Camera },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden" 
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full w-64 bg-card z-30 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">SecureView</span>
          </div>
          <button 
            className="lg:hidden text-muted-foreground hover:text-foreground" 
            onClick={closeSidebar}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="mt-4 px-2">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link 
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                      isActive 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-foreground hover:bg-accent'
                    }`}
                    onClick={closeSidebar}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4">
          <button 
            className="text-muted-foreground hover:text-foreground lg:hidden" 
            onClick={toggleSidebar}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          {/* User menu */}
          <div className="relative ml-auto">
            <button 
              className="flex items-center text-sm px-3 py-1 rounded-md hover:bg-accent"
              onClick={toggleUserMenu}
            >
              <div className="h-8 w-8 bg-primary/20 text-primary rounded-full flex items-center justify-center mr-2">
                <User className="h-4 w-4" />
              </div>
              <span>{user?.username}</span>
              <ChevronDown className="h-4 w-4 ml-1" />
            </button>
            
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-card border border-border rounded-md shadow-lg py-1 z-50">
                <button 
                  className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-accent flex items-center" 
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 p-4 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;