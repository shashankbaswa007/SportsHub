import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Lock, Eye, EyeOff, UserPlus, LogIn, Trophy } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, signup } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateUsername = (username: string): boolean => {
    const usernameRegex = /^1601\d{8}$/;
    return usernameRegex.test(username);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (isSignup) {
      if (!validateUsername(username)) {
        setError('Username must start with 1601 and be exactly 12 digits long');
        setIsLoading(false);
        return;
      }

      const success = signup(username);
      if (!success) {
        setError('Username already exists or is invalid');
      }
    } else {
      if (!username || !password) {
        setError('Please enter both username and password');
        setIsLoading(false);
        return;
      }

      const success = login(username, password);
      if (!success) {
        setError('Invalid username or password');
      }
    }

    setIsLoading(false);
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError('');
    setUsername('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-32 h-32 border-4 border-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50"></div>
        <div className="absolute bottom-32 right-32 w-24 h-24 border-3 border-purple-400 rounded-full animate-bounce shadow-lg shadow-purple-400/50"></div>
        <div className="absolute top-1/2 left-16 w-16 h-16 border-2 border-pink-400 rounded-full animate-ping shadow-lg shadow-pink-400/50"></div>
        <div className="absolute bottom-20 left-1/3 w-20 h-20 border-2 border-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50"></div>
        <div className="absolute top-32 right-1/4 w-12 h-12 border-2 border-green-400 rounded-full animate-bounce shadow-lg shadow-green-400/50"></div>
        
        {/* Sports Equipment Silhouettes with Neon Glow */}
        <div className="absolute top-1/4 left-1/4 transform rotate-45 opacity-30">
          <div className="w-20 h-24 bg-cyan-400 rounded-full border-4 border-cyan-400 shadow-lg shadow-cyan-400/50"></div>
          <div className="w-3 h-16 bg-cyan-400 mx-auto -mt-3 shadow-lg shadow-cyan-400/50"></div>
        </div>
        
        <div className="absolute bottom-1/4 right-1/4 w-28 h-28 border-4 border-purple-400 rounded-full opacity-30 shadow-lg shadow-purple-400/50"></div>
        
        <div className="absolute top-1/3 right-1/3 opacity-30">
          <div className="w-24 h-16 border-4 border-pink-400 rounded-lg shadow-lg shadow-pink-400/50"></div>
          <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-pink-400 transform -translate-x-1/2 shadow-lg shadow-pink-400/50"></div>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full blur-xl opacity-75 animate-pulse"></div>
                <div className="relative p-6 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 rounded-full backdrop-blur-sm border-2 border-white/30 shadow-2xl">
                  <Trophy className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 mb-4 tracking-tight drop-shadow-2xl">
              CBIT SportsHub
            </h1>
            <p className="text-2xl text-gray-200 font-bold tracking-wide">Your Gateway to Sports Excellence</p>
          </div>

          {/* Login/Signup Card with Neon Glow */}
          <div className="relative group">
            {/* Neon Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl blur-lg opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
            
            {/* Main Card */}
            <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-cyan-500/50 overflow-hidden">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 p-8 text-white relative overflow-hidden">
                {/* Header Background Pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-4 right-8 w-16 h-16 border-2 border-white rounded-full animate-spin-slow"></div>
                  <div className="absolute bottom-4 left-8 w-12 h-12 border-2 border-white rounded-full animate-pulse"></div>
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-center space-x-4 mb-6">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30 shadow-lg">
                      {isSignup ? (
                        <UserPlus className="w-8 h-8" />
                      ) : (
                        <LogIn className="w-8 h-8" />
                      )}
                    </div>
                    <h2 className="text-3xl font-black tracking-tight">
                      {isSignup ? 'Create Account' : 'Welcome Back'}
                    </h2>
                  </div>
                  <p className="text-center text-cyan-100 font-medium text-lg">
                    {isSignup 
                      ? 'Join the CBIT Sports community today' 
                      : 'Sign in to access your sports dashboard'
                    }
                  </p>
                </div>
              </div>

              {/* Form */}
              <div className="p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Username Field */}
                  <div>
                    <label htmlFor="username" className="block text-sm font-bold text-gray-200 mb-3">
                      Username
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className="h-6 w-6 text-cyan-400" />
                        </div>
                        <input
                          type="text"
                          id="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="block w-full pl-12 pr-4 py-4 bg-slate-800/50 border-2 border-cyan-500/30 rounded-xl leading-5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 backdrop-blur-sm font-medium"
                          placeholder={isSignup ? "1601xxxxxxxx (12 digits)" : "Enter your username"}
                          required
                        />
                      </div>
                    </div>
                    {isSignup && (
                      <p className="mt-3 text-sm text-cyan-300 font-medium">
                        Username must start with <span className="font-bold text-cyan-400">1601</span> and be exactly 12 digits long
                      </p>
                    )}
                  </div>

                  {/* Password Field (only for login) */}
                  {!isSignup && (
                    <div>
                      <label htmlFor="password" className="block text-sm font-bold text-gray-200 mb-3">
                        Password
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-6 w-6 text-purple-400" />
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-12 pr-14 py-4 bg-slate-800/50 border-2 border-purple-500/30 rounded-xl leading-5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 backdrop-blur-sm font-medium"
                            placeholder="Enter your password"
                            required
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-4 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-6 w-6 text-purple-400 hover:text-purple-300 transition-colors" />
                            ) : (
                              <Eye className="h-6 w-6 text-purple-400 hover:text-purple-300 transition-colors" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Signup Info */}
                  {isSignup && (
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-500/30 rounded-xl p-6 backdrop-blur-sm">
                        <div className="flex items-start space-x-4">
                          <Trophy className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                          <div className="text-sm text-blue-200">
                            <p className="font-bold mb-2 text-blue-100">Account Setup:</p>
                            <ul className="space-y-1 text-blue-300">
                              <li>• Your password will be set to your username by default</li>
                              <li>• You can change it later in settings</li>
                              <li>• Notifications will be enabled by default</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="relative group">
                      <div className="absolute inset-0 bg-red-500/20 rounded-xl blur opacity-75"></div>
                      <div className="relative bg-red-900/30 border border-red-500/50 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                          <p className="text-sm text-red-200 font-medium">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="relative w-full flex justify-center items-center py-4 px-6 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 hover:from-cyan-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] shadow-2xl text-lg"
                    >
                      {isLoading ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          {isSignup ? (
                            <>
                              <UserPlus className="w-6 h-6 mr-3" />
                              Create Account
                            </>
                          ) : (
                            <>
                              <LogIn className="w-6 h-6 mr-3" />
                              Sign In
                            </>
                          )}
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Toggle Mode */}
                <div className="mt-8 text-center">
                  <p className="text-gray-300 font-medium">
                    {isSignup ? 'Already have an account?' : "Don't have an account?"}
                  </p>
                  <button
                    onClick={toggleMode}
                    className="mt-3 font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 hover:from-cyan-300 hover:to-purple-300 transition-all duration-300 text-lg"
                  >
                    {isSignup ? 'Sign in here' : 'Create one now'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-400 text-sm font-medium">
              © 2025 CBIT SportsHub. Empowering athletic excellence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};