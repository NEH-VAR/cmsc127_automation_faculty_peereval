import React, { useState } from 'react';
import { api, parseJwt } from '../lib/api';
import { useToast } from '../lib/ToastContext';
import { Eye, EyeOff } from 'lucide-react';
import loginImage from '../assets/login-page-image.jpg';
import logo from '../assets/website logo.svg';

const AdminLogin = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleEmailChange = (val) => {
    setEmail(val);
    setEmailError('');
    setPasswordError('');
  };

  const handlePasswordChange = (val) => {
    setPassword(val);
    setPasswordError('');
    setEmailError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');

    let hasError = false;
    if (!email) {
      setEmailError('Please enter a valid email address.');
      hasError = true;
    }
    if (!password) {
      setPasswordError('Password is required.');
      hasError = true;
    }

    if (hasError) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    setLoading(true);
    try {
      const response = await api.auth.login(email, password);

      // Store token
      api.auth.setToken(response.access_token);

      const tokenPayload = parseJwt(response.access_token);
      const userId = tokenPayload?.sub;
      const tokenEmail = tokenPayload?.email;
      const tokenRole = tokenPayload?.role;

      let userProfile = {
        user_id: userId,
        email: tokenEmail || email,
        role: tokenRole || 'admin',
      };

      if (userId) {
        try {
          const profile = await api.users.getById(userId);
          userProfile = {
            ...userProfile,
            ...profile,
          };
        } catch (profileError) {
          console.warn('Failed to load user profile:', profileError);
        }
      }

      // Store user info
      api.auth.setUser(userProfile);

      showToast('Login successful!', 'success');
      onLoginSuccess();
    } catch (error) {
      setEmailError('Login failed. Please try again.');
      setPasswordError('Login failed. Please try again.');
      showToast(error.message || 'Login failed', 'error');
      console.error('Login error:', error);

      // Trigger shaking animation on error
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 lg:p-8 relative overflow-hidden">
      {/* Background Image with blur */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat filter blur-md scale-103 z-0"
        style={{ backgroundImage: `url(${loginImage})` }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/45 z-0" />

      <div className="relative bg-white rounded-[16px] p-5 md:p-6 shadow-2xl flex flex-col md:flex-row w-full max-w-[850px] gap-6 items-center md:items-stretch z-8">

        {/* Left Side Image */}
        <div className="hidden md:block md:w-1/2 rounded-[12px] overflow-hidden relative">
          <img
            src={loginImage}
            alt="UP Mindanao Oblation"
            className="w-full h-full object-cover select-none"
          />
        </div>

        {/* Right Side Form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-4 py-2 md:py-4">
          {/* Logo and Headings */}
          <div className="flex flex-col items-center mb-5">
            <img src={logo} alt="UP Logo" className="h-20 object-contain select-none" />
            <h2 className="text-2xl font-heading text-brand-green mt-4 font-normal tracking-wide text-center">Honor. Excellence. Service.</h2>
            <p className="text-base text-brand-grey mt-1">Admin Login</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2 relative pb-4">
              <label htmlFor="email" className="block text-sm font-semibold text-brand-black">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="admin@example.com"
                className={`w-full px-4 py-2.5 border rounded-[12px] focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all placeholder:text-gray-300 text-brand-black bg-white ${emailError ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200'
                  }`}
                disabled={loading}
              />
              {emailError && (
                <p className="absolute bottom-0 left-0 text-red-600 text-xs font-medium">{emailError}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2 relative pb-4">
              <label htmlFor="password" className="block text-sm font-semibold text-brand-black">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="Enter your password"
                  className={`w-full pl-4 pr-12 py-2.5 border rounded-[12px] focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all placeholder:text-gray-300 text-brand-black bg-white ${isShaking || passwordError
                    ? 'animate-shake border-red-500 focus:ring-red-500/20 focus:border-red-500'
                    : 'border-gray-200'
                    }`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-black transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passwordError && (
                <p className="absolute bottom-0 left-0 text-red-600 text-xs font-medium">{passwordError}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-maroon hover:bg-brand-maroon/90 text-white font-semibold py-2.5 px-4 rounded-[12px] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base shadow-sm mt-5 active:scale-[0.98]"
            >
              {loading ? 'Logging in...' : 'Login as Admin'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
