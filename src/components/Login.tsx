import React, { useState } from 'react';
import { UserProfile } from '../types';
import { apiCall, API_ENDPOINTS } from '../api';

interface LoginProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState(''); 
  const [dob, setDob] = useState(''); // New Date of Birth State
  const [role, setRole] = useState('student'); 
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const endpoint = isLoginMode ? API_ENDPOINTS.login : API_ENDPOINTS.register;
    const payload = isLoginMode 
      ? { username, password } 
      : { username, email, password, role, dob }; 

    try {
      const responseData = await apiCall(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (responseData.token) {
        localStorage.setItem('token', responseData.token);
      }

      const dbUser = responseData.user || responseData;
      
      const normalizedUser: UserProfile = {
        id: dbUser.id,
        username: dbUser.username,
        email: dbUser.email,
        role: dbUser.role,
        dob: dbUser.dob,
        bio: dbUser.bio,
        status: dbUser.status || 'active',
        name: dbUser.username, 
        // We now safely parse the username from the correct object layer
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(dbUser.username)}&background=random`
      };

      onLoginSuccess(normalizedUser);
      
    } catch (err: any) {
      setError(err.message || 'Unable to connect to the backend server.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-650 flex items-center justify-center text-white font-black mx-auto mb-5 shadow-lg shadow-indigo-650/30">
            🤝
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            {isLoginMode ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            {isLoginMode ? 'Sign in to access your dashboard.' : 'Join the MyEduConnect community.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-lg font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Username</label>
            <input 
              type="text" 
              required
              className="w-full bg-slate-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. alicesmith"
            />
          </div>

          {!isLoginMode && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  required
                  className="w-full bg-slate-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alice@example.com"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Date of Birth</label>
                <input 
                  type="date" 
                  required
                  className="w-full bg-slate-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Account Type</label>
                <select 
                  className="w-full bg-slate-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="student">Student</option>
                  <option value="educator">Educator</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-slate-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-3.5 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-xl transition-colors cursor-pointer mt-2 disabled:opacity-70"
          >
            {isLoading ? 'Processing...' : (isLoginMode ? 'Sign In' : 'Register')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-500">
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button 
            onClick={() => { setIsLoginMode(!isLoginMode); setError(''); }}
            className="text-indigo-600 font-bold hover:text-indigo-500 hover:underline cursor-pointer"
          >
            {isLoginMode ? 'Register here' : 'Sign in instead'}
          </button>
        </div>
      </div>
    </div>
  );
}