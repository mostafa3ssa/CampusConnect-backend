import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { RoleRoute } from './components/RoleRoute';
import { Toaster } from 'react-hot-toast';
import { Login } from './pages/auth/Login';
import { Dashboard } from './pages/student/Dashboard';
import { Clubs } from './pages/student/Clubs';
import { Events } from './pages/student/Events';
import { Rooms } from './pages/student/Rooms';
import { Facilities } from './pages/student/Facilities';
import { ManagerDashboard } from './pages/manager/Dashboard';
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminUsers } from './pages/admin/Users';
import { AdminApprovals } from './pages/admin/Approvals';

const RootRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'club_manager') return <Navigate to="/manager/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<RoleRoute><MainLayout /></RoleRoute>}>
        <Route index element={<RootRedirect />} />
        
        {/* Student Routes */}
        <Route path="dashboard" element={<RoleRoute allowedRoles={['student', 'club_manager', 'admin']}><Dashboard /></RoleRoute>} />
        <Route path="clubs" element={<RoleRoute allowedRoles={['student', 'club_manager', 'admin']}><Clubs /></RoleRoute>} />
        <Route path="events" element={<RoleRoute allowedRoles={['student', 'club_manager', 'admin']}><Events /></RoleRoute>} />
        <Route path="posts" element={<RoleRoute allowedRoles={['student', 'club_manager', 'admin']}><Dashboard /></RoleRoute>} /> {/* Assuming Dashboard is feed */}
        <Route path="rooms" element={<RoleRoute allowedRoles={['student', 'club_manager', 'admin']}><Rooms /></RoleRoute>} />
        <Route path="facilities" element={<RoleRoute allowedRoles={['student', 'club_manager', 'admin']}><Facilities /></RoleRoute>} />
        
        {/* Club Manager Routes */}
        <Route path="manager/dashboard" element={<RoleRoute allowedRoles={['club_manager']}><ManagerDashboard /></RoleRoute>} />
        
        {/* Admin Routes */}
        <Route path="admin/dashboard" element={<RoleRoute allowedRoles={['admin']}><AdminDashboard /></RoleRoute>} />
        <Route path="admin/users" element={<RoleRoute allowedRoles={['admin']}><AdminUsers /></RoleRoute>} />
        <Route path="admin/approvals" element={<RoleRoute allowedRoles={['admin']}><AdminApprovals /></RoleRoute>} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
