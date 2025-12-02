import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { mockDb } from '../../services/mockDb';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { UserPlus } from 'lucide-react';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = mockDb.register(name, email, password, role);
      login(user);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
        <div className="text-center mb-8">
            <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                <UserPlus className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="text-gray-500 mt-2">Join EduGroup Pro today</p>
        </div>

        {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-lg mb-6 text-sm">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {role === UserRole.ADMIN && (
              <p className="text-xs text-orange-600 mt-1 flex items-center"><span className="w-1.5 h-1.5 bg-orange-600 rounded-full mr-1"></span>Must contain "seacet" in address.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Account Role</label>
            <div className="grid grid-cols-2 gap-4">
                <button
                    type="button"
                    onClick={() => setRole(UserRole.STUDENT)}
                    className={`py-3 px-4 border rounded-lg text-sm font-medium transition-all ${role === UserRole.STUDENT ? 'bg-primary/5 border-primary text-primary' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                    Student
                </button>
                <button
                    type="button"
                    onClick={() => setRole(UserRole.ADMIN)}
                    className={`py-3 px-4 border rounded-lg text-sm font-medium transition-all ${role === UserRole.ADMIN ? 'bg-primary/5 border-primary text-primary' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                    Teacher / Admin
                </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold shadow-lg shadow-indigo-500/30 mt-4"
          >
            Create Account
          </button>
        </form>
        <div className="mt-8 text-center pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};