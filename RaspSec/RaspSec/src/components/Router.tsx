import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from '../pages/LoginPage';
import EventsListPage from '../pages/EventsListPage';
import EventDetailsPage from '../pages/EventDetailsPage';
import CamerasPage from '../pages/CamerasPage';
import DashboardLayout from '../layouts/DashboardLayout';

export const Router = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        !isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />
      } />

      {/* Protected routes */}
      <Route 
        path="/" 
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
      />
      
      <Route path="/" element={<DashboardLayout />}>
        <Route 
          path="dashboard" 
          element={isAuthenticated ? <EventsListPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="events/:id" 
          element={isAuthenticated ? <EventDetailsPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="cameras" 
          element={isAuthenticated ? <CamerasPage /> : <Navigate to="/login" />} 
        />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default Router;