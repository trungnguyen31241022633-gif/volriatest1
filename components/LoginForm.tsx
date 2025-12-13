import React, { useState } from 'react';

interface LoginFormProps {
  onLogin: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 font-sans">
      {/* Glass Container */}
      <div className="relative w-[350px] p-10 bg-white/20 backdrop-blur-lg border-t border-l border-white/50 rounded-[15px] shadow-[20px_20px_50px_rgba(0,0,0,0.3)] text-center">
        
        <h2 className="text-3xl font-medium text-white mb-8 shadow-sm tracking-wide">Login</h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          
          {/* Input Group 1: Username */}
          <div className="relative border-b border-white/50">
            <input 
              type="text" 
              id="username" 
              required 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-white text-lg py-2 placeholder-transparent peer focus:ring-0"
              placeholder="Username"
            />
            <label 
              htmlFor="username"
              className="absolute left-0 top-1/2 -translate-y-1/2 text-white/90 pointer-events-none transition-all duration-300 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-white peer-valid:-top-2 peer-valid:text-xs peer-valid:text-white"
            >
              Username
            </label>
          </div>

          {/* Input Group 2: Password */}
          <div className="relative border-b border-white/50">
            <input 
              type="password" 
              id="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-white text-lg py-2 placeholder-transparent peer focus:ring-0"
              placeholder="Password"
            />
            <label 
              htmlFor="password"
              className="absolute left-0 top-1/2 -translate-y-1/2 text-white/90 pointer-events-none transition-all duration-300 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-white peer-valid:-top-2 peer-valid:text-xs peer-valid:text-white"
            >
              Password
            </label>
          </div>

          <button 
            type="submit"
            className="mt-4 w-full py-3 bg-white text-slate-900 font-bold rounded-lg hover:bg-white/90 transition-all shadow-lg active:scale-95 tracking-wider"
          >
            Log In
          </button>

          <div className="text-white/80 text-sm mt-2">
             <span className="hover:text-white cursor-pointer transition-colors">Forgot Password?</span>
             <br/>
             <span className="hover:text-white cursor-pointer transition-colors">Sign Up</span>
          </div>

        </form>
      </div>
    </div>
  );
};