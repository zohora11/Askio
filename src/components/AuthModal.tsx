import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Phone, Mail, Lock, User, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setAuthModalOpen, 
    authView, 
    setAuthView, 
    loginWithPhone, 
    verifyOtp, 
    loginWithEmail, 
    registerUser, 
    pendingPhone 
  } = useApp();

  const [phoneInput, setPhoneInput] = useState('1712345678');
  const [otpCode, setOtpCode] = useState(['5', '8', '2', '0', '1', '9']);
  const [email, setEmail] = useState('fatematuzzohora004@gmail.com');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('Fatema Tuz Zohora');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput.trim()) {
      setErrorMsg('Please enter a valid phone number.');
      return;
    }
    setErrorMsg('');
    loginWithPhone(`+880 ${phoneInput.trim()}`);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpCode.join('');
    if (fullOtp.length < 6) {
      setErrorMsg('Please enter all 6 digits of the OTP.');
      return;
    }
    const ok = verifyOtp(fullOtp);
    if (!ok) {
      setErrorMsg('Invalid OTP code. Try 582019 or any 6 digits.');
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    loginWithEmail(email, password);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.includes('@')) {
      setErrorMsg('Please fill in all registration fields.');
      return;
    }
    registerUser(fullName, email, `+880 ${phoneInput}`, password);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        id="auth-modal"
        className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="close-auth-modal-btn"
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto bg-zinc-900 dark:bg-white rounded-2xl flex items-center justify-center mb-3 text-white dark:text-zinc-900 font-bold text-xl shadow-md">
            a.
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {authView === 'phone' && 'Phone Number Sign In'}
            {authView === 'otp' && 'Verify Phone OTP'}
            {authView === 'login' && 'Welcome Back to Askio'}
            {authView === 'register' && 'Create Your Askio Account'}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {authView === 'otp'
              ? `We sent a 6-digit code to ${pendingPhone}`
              : 'Access your saved guides, AI assistant, and personal learning streaks'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-600 dark:text-rose-400 text-center font-medium">
            {errorMsg}
          </div>
        )}

        {/* --- VIEW: PHONE LOGIN --- */}
        {authView === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Bangladesh Mobile Number
              </label>
              <div className="flex items-center border border-zinc-300 dark:border-zinc-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 bg-white dark:bg-zinc-800">
                <div className="px-3.5 py-3 bg-zinc-100 dark:bg-zinc-700/60 border-r border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-200 flex items-center gap-1">
                  <span>🇧🇩</span>
                  <span>+880</span>
                </div>
                <input
                  type="tel"
                  id="phone-input"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="1712 345678"
                  className="w-full px-3 py-3 text-sm bg-transparent outline-none text-zinc-900 dark:text-zinc-100"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              id="send-otp-btn"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Send OTP Verification</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => { setErrorMsg(''); setAuthView('login'); }}
                className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium"
              >
                Prefer Email & Password? Switch to Email
              </button>
            </div>
          </form>
        )}

        {/* --- VIEW: OTP VERIFICATION --- */}
        {authView === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="space-y-5">
            <div>
              <div className="flex justify-center gap-2 sm:gap-2.5 my-2">
                {[0, 1, 2, 3, 4, 5].map((idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    maxLength={1}
                    value={otpCode[idx]}
                    onChange={(e) => {
                      const val = e.target.value;
                      const next = [...otpCode];
                      next[idx] = val;
                      setOtpCode(next);
                      if (val && idx < 5) {
                        const nextInput = document.getElementById(`otp-input-${idx + 1}`);
                        nextInput?.focus();
                      }
                    }}
                    className="w-10 sm:w-11 h-12 sm:h-14 text-center text-lg sm:text-xl font-bold bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-zinc-900 dark:text-zinc-100"
                  />
                ))}
              </div>
              <p className="text-[11px] text-zinc-400 text-center mt-2">
                Enter the 6-digit code received on your device
              </p>
            </div>

            <button
              type="submit"
              id="verify-otp-btn"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify & Continue</span>
            </button>

            <div className="flex justify-between items-center text-xs text-zinc-500 pt-2">
              <button
                type="button"
                onClick={() => setAuthView('phone')}
                className="hover:underline"
              >
                Change Phone
              </button>
              <button
                type="button"
                onClick={() => alert('New OTP sent!')}
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                Resend Code
              </button>
            </div>
          </form>
        )}

        {/* --- VIEW: EMAIL LOGIN --- */}
        {authView === 'login' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  id="email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  id="password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              id="login-submit-btn"
              className="w-full py-3 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-2.5 text-center">
              <button
                type="button"
                onClick={() => { setErrorMsg(''); setAuthView('phone'); }}
                className="w-full py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sign In via +88 Mobile OTP</span>
              </button>

              <div className="text-xs text-zinc-500">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setErrorMsg(''); setAuthView('register'); }}
                  className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Create One
                </button>
              </div>
            </div>
          </form>
        )}

        {/* --- VIEW: REGISTRATION --- */}
        {authView === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  id="reg-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Fatema Tuz Zohora"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  id="reg-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Create Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  id="reg-pass"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              id="register-submit-btn"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm mt-2"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center text-xs text-zinc-500 pt-2">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setErrorMsg(''); setAuthView('login'); }}
                className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
