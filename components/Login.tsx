
import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../firebase';

const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      if (isSignUp) {
        if (err.code === 'auth/email-already-in-use') {
          setError('This email is already registered.');
        } else if (err.code === 'auth/weak-password') {
          setError('Password should be at least 6 characters.');
        } else {
          setError('Failed to create account.');
        }
      } else {
        setError('Invalid administrator credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center mb-8">
        <div className="bg-red-700 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-200">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">CourtSync Admin</h1>
        <p className="text-gray-500 text-sm font-medium">Badminton Court Management System</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 w-full max-w-md transition-all duration-300">
        <h2 className="text-xl font-bold mb-6 text-center text-gray-800 tracking-tight">
          {isSignUp ? 'Create Admin Account' : 'Administrator Access'}
        </h2>
        
        {error && (
          <div className="mb-6 text-red-600 text-xs font-bold bg-red-50 p-4 rounded-xl border border-red-100 text-center uppercase tracking-tight">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Email Address</label>
            <input 
              type="email" 
              className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all placeholder:text-gray-300 font-medium"
              placeholder="admin@upm.edu.my"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all placeholder:text-gray-300 font-medium"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className={`w-full bg-red-700 hover:bg-red-800 text-white font-black text-xs uppercase tracking-[0.2em] py-4 rounded-xl transition duration-300 flex items-center justify-center gap-2 shadow-lg shadow-red-100 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : null}
            {isSignUp ? 'Register Account' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-50 pt-6">
          <button 
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-[10px] text-red-700 font-black uppercase tracking-widest hover:text-red-900 transition-all"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need an admin account? Sign Up'}
          </button>
        </div>
      </div>
      
      <p className="mt-8 text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">
        &copy; {new Date().getFullYear()} CourtSync UPM
      </p>
    </div>
  );
};

export default Login;
