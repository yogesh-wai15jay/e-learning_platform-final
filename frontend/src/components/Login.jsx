import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [requestedRole, setRequestedRole] = useState('user'); // default to user
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  const success = await login(email, password, requestedRole);
  setLoading(false);
  if (success) {
    // Navigate based on the role they requested
    if (requestedRole === 'user') {
      navigate('/dashboard');           // regular user landing page
    } else if (requestedRole === 'author') {
      navigate('/author');
    } else{
      navigate('/admin');      // author or admin dashboard
    }
  }
};

  return (
  <div className="relative min-h-screen overflow-x-hidden">

    {/* Background Image */}
    <div
      className="absolute inset-0 bg-cover bg-center"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: 'cover',
      }}
    />

    

    {/* Navbar */}
    <header
  style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    zIndex: 50,
    background: 'rgb(255, 255, 255)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255,255,255,0.22)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
  }}
>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex justify-between items-center">
        <Logo className="h-10" />

        <div className="flex items-center gap-4">

        </div>
      </div>
    </header>

    {/* Main Content */}
   <div className="relative z-10 flex items-start justify-center px-4 pt-16 pb-4 min-h-screen">

      <div
        style={{
          width: '100%',
          maxWidth: 390,
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(18px)',
          border: '1px solid rgba(255,255,255,0.22)',
          borderRadius: 28,
          padding: 16,
          boxShadow: '0 24px 50px rgba(0,0,0,0.12)',
        }}
      >

        {/* Header */}
        <div className="text-center mb-3">

          <Logo className="h-10 mx-auto mb-2" />

          <p
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: '#6366f1',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            Welcome Back
          </p>

          <h1
            style={{
              fontSize: 'clamp(26px, 4vw, 38px)',
              fontWeight: 900,
              color: '#0f172a',
              lineHeight: 1.1,
              marginBottom: 8,
              letterSpacing: '-0.03em',
            }}
          >
            Log In
          </h1>

          <p
            style={{
              color: '#475569',
              fontSize: 15,
              lineHeight: 1.7,
            }}
          >
            Continue your enterprise learning journey.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-2.5">

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
              className="w-full rounded-2xl border border-white/30 bg-white/70 backdrop-blur-md px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Password
            </label>

            <div className="relative">
              <input
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
                className="w-full rounded-2xl border border-white/30 bg-white/70 backdrop-blur-md px-4 py-2.5 pr-12 outline-none focus:ring-2 focus:ring-indigo-400"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Login as
            </label>

            <select
              value={requestedRole}
              onChange={(e) =>
                setRequestedRole(
                  e.target.value
                )
              }
              className="w-full rounded-2xl border border-white/30 bg-white/70 backdrop-blur-md px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="user">
                User
              </option>

              <option value="author">
                Author
              </option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 18px',
              borderRadius: 18,
              background: '#6366f1',
              color: '#fff',
              fontWeight: 800,
              border: 'none',
              boxShadow:
                '0 14px 32px rgba(99,102,241,0.28)',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? 'Signing in...'
              : 'Sign In'}
          </button>
        </form>

        {/* Links */}
        <div className="mt-5 text-right">
          <Link
            to="/forgot-password"
            className="text-indigo-600 hover:underline text-sm font-medium"
          >
            Forgot Password?
          </Link>
        </div>

        <p className="text-center text-slate-700 mt-3">
          Don&apos;t have an account?{' '}
          <Link
            to="/signup"
            className="text-pink-500 hover:underline font-bold"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  </div>
);
};

export default Login;