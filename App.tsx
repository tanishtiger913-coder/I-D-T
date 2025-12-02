import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { PreferenceSelection } from './pages/Student/PreferenceSelection';
import { StudentDashboard } from './pages/Student/StudentDashboard';
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { UserRole } from './types';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const RoleRoute: React.FC = () => {
    const { user } = useAuth();
    
    if (!user) return <Navigate to="/login" replace />;

    if (user.role === UserRole.ADMIN) {
        return <AdminDashboard />;
    }

    if (user.role === UserRole.STUDENT) {
        if (!user.preferencesLocked) {
            return <PreferenceSelection />;
        }
        return <StudentDashboard />;
    }

    return <div>Invalid Role</div>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<RoleRoute />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
