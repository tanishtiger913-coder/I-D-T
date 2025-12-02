import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Beaker } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm/50 backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center cursor-pointer group" onClick={() => navigate('/')}>
              <div className="bg-gradient-to-br from-primary to-indigo-600 text-white p-2 rounded-lg mr-3 shadow-md shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
                <Beaker className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">I.D.T <span className="text-primary">Lab</span></h1>
            </div>
            
            {user && (
              <div className="flex items-center space-x-6">
                <div className="flex items-center gap-3">
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role === 'ADMIN' ? 'Instructor' : 'Student'}</p>
                  </div>
                  <div className="h-9 w-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 border border-gray-200">
                      <UserIcon className="h-5 w-5" />
                  </div>
                </div>
                <div className="h-8 w-px bg-gray-200"></div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};