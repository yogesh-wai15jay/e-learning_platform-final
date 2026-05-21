import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import Logo from './Logo';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/password-reset/request-otp', { email });
      toast.success('OTP sent to your email');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/password-reset/verify-otp', { email, otp });
      setTempToken(res.data.tempToken);
      toast.success('OTP verified');
      setStep(3);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.post('/password-reset/reset-password', { tempToken, newPassword });
      toast.success('Password reset successfully. Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
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

        <div className="flex items-center gap-3">

        </div>
      </div>
    </header>

    {/* Main */}
    <div className="relative z-10 flex items-center justify-center px-4 pt-16 pb-4 min-h-screen">

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
            Account Recovery
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
            {step === 1 && 'Reset Password'}
            {step === 2 && 'Enter OTP'}
            {step === 3 && 'New Password'}
          </h1>

          <p
            style={{
              color: '#475569',
              fontSize: 15,
              lineHeight: 1.7,
            }}
          >
            {step === 1 &&
              'Enter your email to receive a verification code.'}

            {step === 2 &&
              'Check your email and enter the OTP sent to you.'}

            {step === 3 &&
              'Create a strong new password for your account.'}
          </p>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <form
            onSubmit={handleRequestOTP}
            className="space-y-2.5"
          >

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
                ? 'Sending...'
                : 'Send OTP'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full text-indigo-600 text-sm font-medium pt-1"
            >
              Back to Login
            </button>
          </form>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form
            onSubmit={handleVerifyOTP}
            className="space-y-2.5"
          >

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Enter 4-digit OTP
              </label>

              <input
                type="text"
                maxLength="4"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value)
                }
                required
                className="w-full rounded-2xl border border-white/30 bg-white/70 backdrop-blur-md px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-400 text-center tracking-[0.5em] text-lg font-bold"
              />
            </div>

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
                ? 'Verifying...'
                : 'Verify OTP'}
            </button>
          </form>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <form
            onSubmit={handleResetPassword}
            className="space-y-2.5"
          >

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                New Password
              </label>

              <div className="relative">
                <input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(
                      e.target.value
                    )
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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Confirm New Password
              </label>

              <div className="relative">
                <input
                  type={
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  }
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  required
                  className="w-full rounded-2xl border border-white/30 bg-white/70 backdrop-blur-md px-4 py-2.5 pr-12 outline-none focus:ring-2 focus:ring-indigo-400"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
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
                ? 'Resetting...'
                : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  </div>
);
};

export default ForgotPassword;