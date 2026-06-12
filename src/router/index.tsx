import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import ActivityList from '@/pages/ActivityList';
import ActivityDetail from '@/pages/ActivityDetail';
import MyTickets from '@/pages/MyTickets';
import Dashboard from '@/pages/admin/Dashboard';
import ActivityManagement from '@/pages/admin/ActivityManagement';
import RegistrationReview from '@/pages/admin/RegistrationReview';
import CheckIn from '@/pages/admin/CheckIn';
import WaitlistManagement from '@/pages/admin/WaitlistManagement';
import Statistics from '@/pages/admin/Statistics';
import { useAuthStore } from '@/store/useAuthStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'user' | 'admin';
}

function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    useAuthStore.getState().checkAuth();
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole && user?.role !== requireRole) {
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/activities" replace />;
    }
  }

  return <>{children}</>;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/activities" replace />} />
          
          <Route path="activities" element={
            <ProtectedRoute requireRole="user">
              <ActivityList />
            </ProtectedRoute>
          } />
          <Route path="activities/:id" element={
            <ProtectedRoute requireRole="user">
              <ActivityDetail />
            </ProtectedRoute>
          } />
          <Route path="my-tickets" element={
            <ProtectedRoute requireRole="user">
              <MyTickets />
            </ProtectedRoute>
          } />

          <Route path="admin">
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={
              <ProtectedRoute requireRole="admin">
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="activities" element={
              <ProtectedRoute requireRole="admin">
                <ActivityManagement />
              </ProtectedRoute>
            } />
            <Route path="registrations" element={
              <ProtectedRoute requireRole="admin">
                <RegistrationReview />
              </ProtectedRoute>
            } />
            <Route path="checkin" element={
              <ProtectedRoute requireRole="admin">
                <CheckIn />
              </ProtectedRoute>
            } />
            <Route path="waitlist" element={
              <ProtectedRoute requireRole="admin">
                <WaitlistManagement />
              </ProtectedRoute>
            } />
            <Route path="statistics" element={
              <ProtectedRoute requireRole="admin">
                <Statistics />
              </ProtectedRoute>
            } />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
