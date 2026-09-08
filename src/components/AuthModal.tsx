import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Phone, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Zap,
  Edit2,
  KeyRound,
  Eye,
  EyeOff,
  RefreshCw,
  Check,
  Download,
  Smartphone
} from 'lucide-react';
import { AppLogo } from './AppLogo';
import { 
  validateMobileNumber, 
  storeSubscriberSession, 
  markLocalSubscriber,
  unmarkLocalSubscriber,
  clearSubscriptionSession,
  isLocalSubscriber,
  checkSubscription,
  isSubscriptionRegistered,
  sendOTP,
  verifyOTP
} from '../services/bdapps';
import { 
  registerFirebaseUser, 
  loginFirebaseUser, 
  loginWithGoogle,
  findUserByPhone,
  logoutFirebaseUser,
  sendFirebasePasswordResetEmail,
  resetUserPassword,
  DEFAULT_AVATAR,
  isCustomAvatar
} from '../services/firebase';
import { 
  getTrustedDeviceUser, 
  saveDeviceTrustForPhone,
  clearDeviceTrustForPhone
} from '../services/deviceTrust';
import { triggerApkDownload } from '../constants/branding';
import { OtpVerificationModal } from './OtpVerificationModal';

interface AuthModalProps {
  onLoginSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onLoginSuccess }) => {
  const { 
    isAuthModalOpen, 
    setAuthModalOpen, 
    setSubscriptionModalOpen,
    authView, 
    setAuthView, 
    pendingPhone,
    setPendingPhone,
    authModalNotice,
    setAuthModalNotice,
    pendingApkDownload,
    setPendingApkDownload,
    showToast,
    language,
    updateProfile,
    setActiveTab
  } = useApp();

  const isBn = language === 'bn';

  const [phoneInput, setPhoneInput] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpRefNo, setOtpRefNo] = useState('');

  // Password Reset states
  const [resetMethod, setResetMethod] = useState<'email' | 'phone'>('email');
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetOtpDigits, setResetOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Digit input refs for OTP
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Sync phone from pendingPhone if available (e.g. from OTP success)
  useEffect(() => {
    if (pendingPhone) {
      setPhoneInput(pendingPhone);
    }
  }, [pendingPhone]);

  useEffect(() => {
    if (isAuthModalOpen) {
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isAuthModalOpen, authView]);

  // Resend OTP countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  if (!isAuthModalOpen) return null;

  // STEP 1A: OPTION A - START SUBSCRIBE & OTP FLOW (FOR NEW SUBSCRIBERS)
  const handleStartSubscribeFlow = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateMobileNumber(phoneInput);
    if (!validation.isValid) {
      setErrorMsg(validation.errorMessage || (isBn ? 'সঠিক ১১-সংখ্যার রবি বা সার্কেল নম্বর দিন।' : 'Please enter a valid 11-digit mobile number.'));
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const cleanMobile = validation.cleaned;
      setPendingPhone(cleanMobile);

      // Check if this phone already has an account
      const existingAccount = await findUserByPhone(cleanMobile);
      if (existingAccount && existingAccount.email) {
        // User already has an account! Guide them to login
        setEmail(existingAccount.email);
        setAuthView('firebase_login');
        setSuccessMsg(isBn ? 'এই নম্বরে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে। পাসওয়ার্ড দিয়ে লগইন করুন।' : 'An account already exists for this number. Please sign in with your password.');
        setLoading(false);
        return;
      }

      // User needs subscription & OTP verification
      setSuccessMsg(isBn ? 'এসএমএস ওটিপি পাঠানো হচ্ছে...' : 'Sending verification OTP via SMS...');
      try {
        const otpRes = await sendOTP(cleanMobile);
        const ref = otpRes.referenceNo || otpRes.subscriberId || 'REF-' + Date.now();
        setOtpRefNo(ref);
        setLoading(false);
        setSuccessMsg('');
        setIsOtpModalOpen(true);
      } catch (otpErr: any) {
        setLoading(false);
        setSuccessMsg('');
        setErrorMsg(otpErr?.message || (isBn ? 'ওটিপি পাঠানো সম্ভব হয়নি। মোবাইল নম্বরটি পরীক্ষা করুন।' : 'Failed to send OTP. Please check your mobile number.'));
      }
    } catch (err: any) {
      setErrorMsg(err?.message || (isBn ? 'যাচাই করতে সমস্যা হয়েছে।' : 'Error processing request.'));
      setLoading(false);
    }
  };

  // STEP 1B: OPTION B - LOGIN PHONE CHECK (FOR REGISTERED USERS)
  const handleLoginPhoneCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateMobileNumber(phoneInput);
    if (!validation.isValid) {
      setErrorMsg(validation.errorMessage || (isBn ? 'সঠিক ১১-সংখ্যার রবি বা সার্কেল নম্বর দিন।' : 'Please enter a valid 11-digit mobile number.'));
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const cleanMobile = validation.cleaned;
      setPendingPhone(cleanMobile);

      // Check if this phone is registered in Firestore
      const registeredAccount = await findUserByPhone(cleanMobile);

      if (!registeredAccount || !registeredAccount.email) {
        // Phone NOT registered
        setErrorMsg(
          isBn 
            ? 'এই মোবাইল নম্বরটি নিবন্ধিত নয়। অনুগ্রহ করে প্রথমে সাবস্ক্রাইব ও অ্যাকাউন্ট তৈরি করুন।' 
            : 'No registered account found for this mobile number. Please Subscribe & Create an Account first.'
        );
        setLoading(false);
        return;
      }

      // Phone is registered! Advance to Step 2 (Password Login)
      setEmail(registeredAccount.email);
      setAuthView('firebase_login');
      setSuccessMsg(
        isBn 
          ? `অ্যাকাউন্ট সনাক্ত হয়েছে (${registeredAccount.fullName || registeredAccount.email})! পাসওয়ার্ড প্রদান করুন।` 
          : `Account found (${registeredAccount.fullName || registeredAccount.email})! Please enter your password.`
      );
    } catch (err: any) {
      console.warn('Phone check error:', err);
      setErrorMsg(err?.message || (isBn ? 'অ্যাকাউন্ট যাচাই করতে সমস্যা হয়েছে।' : 'Error checking account.'));
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Firebase Account Registration (for new users / post-OTP)
  const handleFirebaseRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim()) {
      setErrorMsg(isBn ? 'অনুগ্রহ করে আপনার পুরো নাম লিখুন।' : 'Please enter your full name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg(isBn ? 'সঠিক ইমেইল ঠিকানা দিন।' : 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg(isBn ? 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.');
      return;
    }

    const activePhone = phoneInput.trim() || pendingPhone.trim() || '018XXXXXXXX';

    setLoading(true);
    try {
      // 1. Create in Firebase Auth & save to Firestore
      const createdUser = await registerFirebaseUser({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: activePhone
      });

      // 2. Mark subscriber active locally & save device trust
      markLocalSubscriber(activePhone);
      storeSubscriberSession(activePhone);
      saveDeviceTrustForPhone(activePhone, createdUser);

      // 3. Update global App Context
      updateProfile({
        uid: createdUser.uid,
        fullName: createdUser.fullName,
        email: createdUser.email,
        phone: activePhone,
        avatar: createdUser.avatar || DEFAULT_AVATAR,
        isLoggedIn: true,
        isPremium: true,
        membershipPlan: 'BDApps Daily (৳2.78/day)'
      });

      setSuccessMsg(isBn ? 'ফায়ারবেস অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! অ্যাপে প্রবেশ করা হচ্ছে...' : 'Firebase account created successfully! Entering Askio...');

      if (pendingApkDownload) {
        setPendingApkDownload(false);
        try {
          sessionStorage.removeItem('askio_pending_apk_download');
        } catch {}
        triggerApkDownload();
        showToast(
          isBn ? 'সাবস্ক্রিপশন ও অ্যাকাউন্ট তৈরি সম্পন্ন! Askio APK ডাউনলোড শুরু হচ্ছে...' : 'Subscription complete! Starting Askio APK download...',
          'success'
        );
      }

      setTimeout(() => {
        setLoading(false);
        setAuthModalOpen(false);
        setActiveTab('home');
        if (onLoginSuccess) onLoginSuccess();
      }, 750);
    } catch (err: any) {
      console.error('Firebase registration error:', err);
      let msg = isBn ? 'অ্যাকাউন্ট তৈরি করা যায়নি। আবার চেষ্টা করুন।' : 'Failed to create account. Please try again.';
      if (err.code === 'auth/email-already-in-use') {
        msg = isBn ? 'এই ইমেইল ইতিমধ্যে ব্যবহৃত হয়েছে। অনুগ্রহ করে লগইন করুন।' : 'This email is already in use. Please sign in.';
      } else if (err.code === 'auth/weak-password') {
        msg = isBn ? 'দুর্বল পাসওয়ার্ড। শক্তিশালী পাসওয়ার্ড দিন।' : 'Password is too weak.';
      } else if (err.message) {
        msg = err.message;
      }
      setErrorMsg(msg);
      setLoading(false);
    }
  };

  // STEP 3: Firebase Account Login (for returning users via Email or Mobile Number)
  const handleFirebaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const loginInput = email.trim();
    if (!loginInput) {
      setErrorMsg(isBn ? 'ইমেইল অথবা মোবাইল নম্বর প্রবেশ করান।' : 'Please enter your email or mobile number.');
      return;
    }

    if (!password) {
      setErrorMsg(isBn ? 'পাসওয়ার্ড প্রদান করুন।' : 'Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      // 1. Sign in via Firebase Auth / Firestore lookup with Email or Phone Number
      const loggedInUser = await loginFirebaseUser(loginInput, password);
      const userPhone = loggedInUser.phone || (loginInput.startsWith('01') ? loginInput : '');

      // 2. Manage Subscription / Device Trust
      if (userPhone) {
        const cleanPhone = validateMobileNumber(userPhone).cleaned || userPhone;
        let isSub = isLocalSubscriber(cleanPhone);
        if (!isSub) {
          try {
            const subRes = await checkSubscription(cleanPhone);
            isSub = isSubscriptionRegistered(subRes);
          } catch (e) {
            // Keep local subscription status if network times out
            isSub = isLocalSubscriber(cleanPhone);
          }
        }

        if (isSub) {
          markLocalSubscriber(userPhone);
          storeSubscriberSession(userPhone);
          saveDeviceTrustForPhone(userPhone, loggedInUser);
        }
      }

      // 3. Update global App Context (including avatar!)
      const resolvedAvatar = loggedInUser.avatar || DEFAULT_AVATAR;

      updateProfile({
        uid: loggedInUser.uid,
        fullName: loggedInUser.fullName || 'Askio Member',
        email: loggedInUser.email || (loginInput.includes('@') ? loginInput : ''),
        phone: userPhone,
        avatar: resolvedAvatar,
        isLoggedIn: true,
        isPremium: loggedInUser.isPremium ?? true,
        membershipPlan: loggedInUser.membershipPlan || 'BDApps Daily (৳2.78/day)',
        ...(loggedInUser.age !== undefined && loggedInUser.age !== null ? { age: loggedInUser.age } : {}),
        ...(loggedInUser.gender ? { gender: loggedInUser.gender } : {}),
        ...(loggedInUser.religion ? { religion: loggedInUser.religion } : {}),
        ...(loggedInUser.bloodGroup ? { bloodGroup: loggedInUser.bloodGroup } : {}),
        ...(loggedInUser.profession ? { profession: loggedInUser.profession } : {}),
        ...(loggedInUser.address ? { address: loggedInUser.address } : {}),
        ...(loggedInUser.city ? { city: loggedInUser.city } : {})
      });

      setSuccessMsg(isBn ? 'লগইন সফল হয়েছে! অ্যাপে প্রবেশ করা হচ্ছে...' : 'Login successful! Entering Askio...');

      if (pendingApkDownload) {
        setPendingApkDownload(false);
        try {
          sessionStorage.removeItem('askio_pending_apk_download');
        } catch {}
        triggerApkDownload();
        showToast(
          isBn ? 'লগইন সম্পন্ন! Askio APK ডাউনলোড শুরু হচ্ছে...' : 'Login successful! Starting Askio APK download...',
          'success'
        );
      }

      setTimeout(() => {
        setLoading(false);
        setAuthModalOpen(false);
        setActiveTab('home');
        if (onLoginSuccess) onLoginSuccess();
      }, 700);
    } catch (err: any) {
      console.warn('Firebase login attempt notice:', err?.code || err?.message || err);
      let msg = isBn ? 'ইমেইল/ফোন নম্বর বা পাসওয়ার্ড সঠিক নয়।' : 'Invalid credentials. Please check your details.';
      if (err.code === 'auth/user-not-found') {
        msg = isBn ? 'এই তথ্য দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে রেজিস্ট্রেশন করুন।' : 'No account found with these details. Please create an account or verify your details.';
      } else if (err.code === 'auth/wrong-password') {
        msg = isBn ? 'ভুল পাসওয়ার্ড! অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন।' : 'Incorrect password. Please check your password and try again.';
      } else if (err.code === 'auth/invalid-email') {
        msg = isBn ? 'সঠিক ইমেইল ঠিকানা প্রদান করুন।' : 'Please enter a valid email address.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = isBn ? 'অতিরিক্ত ব্যর্থ চেষ্টার কারণে সাময়িকভাবে বন্ধ রাখা হয়েছে। কিছুক্ষণ পর চেষ্টা করুন বা পাসওয়ার্ড রিসেট করুন।' : 'Too many failed login attempts. Please try again later or reset your password.';
      } else if (err.code === 'auth/user-disabled') {
        msg = isBn ? 'এই অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে। সমর্থনের সাথে যোগাযোগ করুন।' : 'This account has been disabled. Please contact support.';
      } else if (err.code === 'auth/network-request-failed') {
        msg = isBn ? 'নেটওয়ার্ক সমস্যা। আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন।' : 'Network connection failed. Please check your internet connection.';
      } else if (
        err.code === 'auth/invalid-credential' || 
        err.code === 'auth/invalid-login-credentials' ||
        err.message?.toLowerCase().includes('credential') ||
        err.message?.toLowerCase().includes('password')
      ) {
        msg = isBn ? 'ভুল তথ্য! আপনার ইমেইল/ফোন ও পাসওয়ার্ড সঠিকভাবে দিন।' : 'Invalid credentials. Please check your email/phone and password.';
      } else if (err.message) {
        msg = err.message;
      }
      setErrorMsg(msg);
      setLoading(false);
    }
  };

  // Google 1-Click Sign-in
  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const googleUser = await loginWithGoogle();
      const userPhone = googleUser.phone || phoneInput.trim() || pendingPhone.trim() || '018XXXXXXXX';
      
      markLocalSubscriber(userPhone);
      storeSubscriberSession(userPhone);

      updateProfile({
        uid: googleUser.uid,
        fullName: googleUser.fullName,
        email: googleUser.email,
        phone: userPhone,
        isLoggedIn: true,
        isPremium: true,
        membershipPlan: 'BDApps Daily (৳2.78/day)',
        avatar: googleUser.avatar
      });

      setSuccessMsg(isBn ? 'গুগল লগইন সফল হয়েছে!' : 'Google sign in successful!');
      setTimeout(() => {
        setLoading(false);
        setAuthModalOpen(false);
        setActiveTab('home');
        if (onLoginSuccess) onLoginSuccess();
      }, 600);
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        setErrorMsg(isBn ? 'গুগল দিয়ে সাইন ইন সম্পন্ন করা সম্ভব হয়নি।' : 'Google sign in was not completed.');
      }
      setLoading(false);
    }
  };

  // STEP 4: Send Password Reset OTP / Email
  const handleSendResetOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const targetVal = resetIdentifier.trim();
    if (!targetVal) {
      setErrorMsg(isBn ? 'অনুগ্রহ করে আপনার ইমেইল ঠিকানা দিন।' : 'Please enter your email address.');
      return;
    }

    if (!targetVal.includes('@')) {
      setErrorMsg(isBn ? 'সঠিক ইমেইল ঠিকানা প্রদান করুন।' : 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const cleanedTarget = targetVal.toLowerCase();
      await sendFirebasePasswordResetEmail(cleanedTarget);
      setSuccessMsg(isBn 
        ? `পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে (${cleanedTarget}) পাঠানো হয়েছে! ইনবক্স থেকে লিংকটিতে ক্লিক করে পাসওয়ার্ড রিসেট করুন।` 
        : `Password reset link has been sent to ${cleanedTarget}! Please check your email inbox to reset your password.`);
    } catch (err: any) {
      console.warn('Firebase reset email error:', err);
      setErrorMsg(isBn ? 'পাসওয়ার্ড রিসেট লিংক পাঠানো সম্ভব হয়নি। ইমেইলটি সঠিক কিনা যাচাই করুন।' : 'Could not send password reset email. Please verify the email address.');
    } finally {
      setLoading(false);
    }
  };

  // OTP Digit Input handlers
  const handleOtpDigitChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...resetOtpDigits];
    newDigits[index] = digit;
    setResetOtpDigits(newDigits);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !resetOtpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const digits = pasted.split('');
    const newDigits = [...resetOtpDigits];
    digits.forEach((d, i) => {
      if (i < 6) newDigits[i] = d;
    });
    setResetOtpDigits(newDigits);
    const nextIdx = Math.min(digits.length, 5);
    otpInputRefs.current[nextIdx]?.focus();
  };

  // STEP 5: Verify Reset OTP (Real-Time directly with BDApps gateway)
  const handleVerifyResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = resetOtpDigits.join('');
    if (code.length < 6) {
      setErrorMsg(isBn ? 'অনুগ্রহ করে পুরো ৬-সংখ্যার ভেরিফিকেশন কোড পূরণ করুন।' : 'Please enter the complete 6-digit code.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const cleanPhone = validateMobileNumber(resetIdentifier).cleaned;
      await verifyOTP(cleanPhone, code, otpRefNo);
      
      setSuccessMsg(isBn ? 'ওটিপি সফলভাবে যাচাই হয়েছে! এখন নতুন পাসওয়ার্ড সেট করুন।' : 'OTP verified successfully! Now set your new password.');
      setAuthView('reset_password');
    } catch (err: any) {
      console.warn('Verify reset OTP err:', err);
      setErrorMsg(err?.message || (isBn ? 'ভুল বা মেয়াদোত্তীর্ণ ভেরিফিকেশন কোড। পুনরায় চেষ্টা করুন।' : 'Invalid or expired verification code. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // STEP 6: Reset Password Submit
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword.length < 6) {
      setErrorMsg(isBn ? 'নতুন পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।' : 'New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg(isBn ? 'উভয় পাসওয়ার্ড মেলেনি! দয়া করে ঠিকভাবে লিখুন।' : 'Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);
    try {
      const cleanedTarget = resetMethod === 'phone' 
        ? validateMobileNumber(resetIdentifier).cleaned 
        : resetIdentifier.trim().toLowerCase();

      const result = await resetUserPassword(cleanedTarget, newPassword);

      if (result.success) {
        setSuccessMsg(isBn ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে! নতুন পাসওয়ার্ড দিয়ে লগইন করুন।' : 'Password updated successfully! You can now log in with your new password.');
        
        // Prefill email for login screen
        if (resetMethod === 'email') {
          setEmail(cleanedTarget);
        } else if (result.user?.email) {
          setEmail(result.user.email);
        }
        setPassword('');
        
        setTimeout(() => {
          setLoading(false);
          setAuthView('firebase_login');
        }, 1200);
      } else {
        setErrorMsg(isBn ? 'পাসওয়ার্ড রিসেট করা যায়নি।' : 'Failed to update password.');
        setLoading(false);
      }
    } catch (err: any) {
      console.warn('Reset password submit err:', err);
      setErrorMsg(isBn ? 'পাসওয়ার্ড আপডেট করতে সমস্যা হয়েছে।' : 'Error updating password.');
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in cursor-pointer"
      onClick={() => {
        setAuthModalNotice(null);
        setAuthModalOpen(false);
      }}
    >
      <div 
        id="auth-modal"
        className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all my-auto cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="close-auth-modal-btn"
          onClick={() => {
            setAuthModalNotice(null);
            setAuthModalOpen(false);
          }}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="flex justify-center mb-3">
            <AppLogo showText={false} imgClassName="h-11 w-auto" />
          </div>

          <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100">
            {authView === 'firebase_register' && (isBn ? 'নতুন অ্যাকাউন্ট খুলুন' : 'Create Your Account')}
            {authView === 'firebase_login' && (isBn ? 'পাসওয়ার্ড দিয়ে লগইন করুন' : 'Sign In with Password')}
            {authView === 'forgot_password' && (isBn ? 'পাসওয়ার্ড রিসেট করুন' : 'Reset Your Password')}
            {authView === 'verify_reset_otp' && (isBn ? 'ভেরিফিকেশন কোড যাচাই' : 'Verify Security Code')}
            {authView === 'reset_password' && (isBn ? 'নতুন পাসওয়ার্ড সেট করুন' : 'Set New Password')}
            {(authView === 'phone' || authView === 'login' || authView === 'register') && (isBn ? 'Askio এ প্রবেশ' : 'Sign In to Askio')}
          </h3>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {authView === 'firebase_register' && (isBn 
              ? 'মোবাইল নম্বর যাচাই সম্পন্ন হয়েছে। তথ্য দিয়ে অ্যাকাউন্ট তৈরি করুন।' 
              : 'Phone verified. Complete your profile to set up your account.')}
            
            {authView === 'firebase_login' && (isBn 
              ? 'নিরাপদে অ্যাপে প্রবেশের জন্য পাসওয়ার্ড প্রদান করুন।' 
              : 'Enter your password to securely access your Askio account.')}

            {authView === 'forgot_password' && (isBn 
              ? 'কোড পাঠানোর জন্য আপনার নিবন্ধিত ইমেইল অথবা মোবাইল নম্বর দিন।' 
              : 'Enter your registered email or phone number to receive a verification code.')}

            {authView === 'verify_reset_otp' && (isBn 
              ? `আমরা ${resetIdentifier}-এ একটি ৬-সংখ্যার কোড পাঠিয়েছি।` 
              : `Enter the 6-digit code sent to ${resetIdentifier}.`)}

            {authView === 'reset_password' && (isBn 
              ? 'আপনার অ্যাকাউন্টের জন্য নতুন ও সুরক্ষিত পাসওয়ার্ড দিন।' 
              : 'Enter and confirm your new password to restore access.')}

            {(authView === 'phone' || authView === 'login' || authView === 'register') && (isBn 
              ? 'সাবস্ক্রাইব করে নতুন অ্যাকাউন্ট খুলুন অথবা বিদ্যমান অ্যাকাউন্টে লগইন করুন' 
              : 'Subscribe to create a new account or sign in to your existing account')}
          </p>
        </div>

        {/* Notice Banner (e.g. "Login to download APK") */}
        {authModalNotice && (
          <div 
            id="auth-modal-apk-notice-banner"
            className="mb-5 p-3.5 bg-amber-500/10 dark:bg-amber-400/15 border-2 border-amber-500/50 dark:border-amber-400/60 rounded-2xl text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200 flex items-center gap-3 shadow-md shadow-amber-500/10 animate-in fade-in slide-in-from-top-2"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <Download className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400 font-extrabold">
                {isBn ? 'ডাউনলোড ভেরিফিকেশন' : 'Verification Required'}
              </div>
              <div className="text-xs sm:text-sm font-black text-zinc-900 dark:text-white">
                {authModalNotice}
              </div>
            </div>
          </div>
        )}

        {/* Top Tab Switcher between Option A (Subscribe) and Option B (Login) */}
        {(authView === 'phone' || authView === 'login' || authView === 'firebase_login') && (
          <div className="flex p-1 mb-5 bg-zinc-100 dark:bg-zinc-800/90 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-xs">
            <button
              type="button"
              id="auth-tab-subscribe"
              onClick={() => {
                setErrorMsg('');
                setSuccessMsg('');
                setAuthView('phone');
              }}
              className={`flex-1 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authView === 'phone'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isBn ? 'সাবস্ক্রাইব ও রেজিস্ট্রেশন' : 'Subscribe & Sign Up'}</span>
            </button>
            <button
              type="button"
              id="auth-tab-login"
              onClick={() => {
                setErrorMsg('');
                setSuccessMsg('');
                setAuthView('login');
              }}
              className={`flex-1 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authView === 'login' || authView === 'firebase_login'
                  ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-zinc-200/80 dark:border-zinc-700'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isBn ? 'লগইন' : 'Sign In'}</span>
            </button>
          </div>
        )}

        {/* Status Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
            {(errorMsg.includes('নিবন্ধিত নয়') || errorMsg.includes('not registered') || errorMsg.includes('No registered account')) && (
              <button
                type="button"
                id="unsub-subscribe-now-btn"
                onClick={() => {
                  setErrorMsg('');
                  setAuthView('phone');
                }}
                className="mt-1 w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isBn ? 'এখনই সাবস্ক্রাইব ও অ্যাকাউন্ট তৈরি করুন (৳২.৭৮/দিন)' : 'Subscribe & Create Account (৳2.78/day)'}</span>
              </button>
            )}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* OPTION A: SUBSCRIBE & VERIFY OTP (NEW USERS)              */}
        {/* ========================================================= */}
        {authView === 'phone' && (
          <form onSubmit={handleStartSubscribeFlow} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
                <span>{isBn ? 'মোবাইল নম্বর (রবি ০১৮ / সার্কেল ০১৬)' : 'Bangladesh Mobile Number'}</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  BDApps ৳2.78/day
                </span>
              </label>
              <div className="flex gap-2">
                <div className="flex-none px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-mono text-sm font-bold">
                  <span>🇧🇩</span>
                  <span>+880</span>
                </div>
                <input
                  type="tel"
                  id="auth-phone-input"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  placeholder="018XXXXXXXX or 016XXXXXXXX"
                  className="flex-1 px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-mono text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500 transition-colors"
                  required
                />
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5">
                {isBn 
                  ? 'এসএমএস ওটিপি যাচাইয়ের পর পাসওয়ার্ড দিয়ে আপনার স্থায়ী অ্যাকাউন্ট তৈরি করবেন।' 
                  : 'Verify phone via SMS OTP, then set up your permanent login credentials.'}
              </p>
            </div>

            <button
              type="submit"
              id="auth-phone-submit-btn"
              disabled={loading || !phoneInput.trim()}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isBn ? 'ওটিপি পাঠানো হচ্ছে...' : 'Sending OTP...'}</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>{isBn ? 'এসএমএস ওটিপি পাঠান ও এগিয়ে যান' : 'Send SMS OTP & Continue'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ========================================================= */}
        {/* OPTION B: LOGIN (STEP 1: PHONE CHECK FOR REGISTERED USERS) */}
        {/* ========================================================= */}
        {authView === 'login' && (
          <form onSubmit={handleLoginPhoneCheck} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
                <span>{isBn ? 'আপনার নিবন্ধিত মোবাইল নম্বর' : 'Your Registered Mobile Number'}</span>
                <button
                  type="button"
                  onClick={() => { setErrorMsg(''); setAuthView('firebase_login'); }}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                >
                  {isBn ? 'অথবা ইমেইল দিয়ে লগইন' : 'Or via Email'}
                </button>
              </label>
              <div className="flex gap-2">
                <div className="flex-none px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-mono text-sm font-bold">
                  <span>🇧🇩</span>
                  <span>+880</span>
                </div>
                <input
                  type="tel"
                  id="auth-login-phone-input"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  placeholder="018XXXXXXXX or 016XXXXXXXX"
                  className="flex-1 px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-mono text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500 transition-colors"
                  required
                />
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5">
                {isBn 
                  ? 'নিবন্ধিত ফোন নম্বর নিশ্চিত করে পরবর্তী ধাপে পাসওয়ার্ড দিন।' 
                  : 'Checks registered account, then prompts for your account password.'}
              </p>
            </div>

            <button
              type="submit"
              id="auth-login-check-btn"
              disabled={loading || !phoneInput.trim()}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isBn ? 'অ্যাকাউন্ট যাচাই হচ্ছে...' : 'Checking Account...'}</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>{isBn ? 'এগিয়ে যান (পাসওয়ার্ড প্রদান)' : 'Continue to Password'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setErrorMsg(''); setAuthView('phone'); }}
                className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                {isBn ? 'অ্যাকাউন্ট নেই? সাবস্ক্রাইব ও রেজিস্ট্রেশন করুন' : "Don't have an account? Subscribe & Sign Up"}
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: FIREBASE REGISTRATION (NEW USERS AFTER OTP)       */}
        {/* ========================================================= */}
        {authView === 'firebase_register' && (
          <form onSubmit={handleFirebaseRegister} className="space-y-4">
            {/* Phone Badge */}
            {(phoneInput || pendingPhone) && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-base">🇧🇩</span>
                  <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                    +880 {phoneInput || pendingPhone}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{isBn ? 'ভেরিফাইড সাবস্ক্রিপশন' : 'Verified Sub'}</span>
                </span>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {isBn ? 'আপনার পূর্ণ নাম (Full Name)' : 'Full Name'}
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-zinc-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="reg-fullname-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={isBn ? 'যেমন: তানভীর আহমেদ' : 'e.g. Tanvir Ahmed'}
                  className="w-full pl-10 pr-3.5 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-2xl text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {isBn ? 'ইমেইল ঠিকানা (Email)' : 'Email Address'}
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-zinc-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  id="reg-email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full pl-10 pr-3.5 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-2xl text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {isBn ? 'পাসওয়ার্ড সেট করুন (কমপক্ষে ৬ অক্ষর)' : 'Set Password (Min. 6 chars)'}
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-zinc-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="reg-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-2xl text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="firebase-register-submit-btn"
              disabled={loading || !fullName.trim() || !email.trim() || password.length < 6}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isBn ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'Creating Account...'}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isBn ? 'অ্যাকাউন্ট তৈরি করুন ও অ্যাপে প্রবেশ করুন' : 'Create Account & Enter App'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setAuthView('firebase_login')}
                className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                {isBn ? 'ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন' : 'Already have an account? Sign In'}
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* VIEW 3: FIREBASE LOGIN (EMAIL & PASSWORD)                 */}
        {/* ========================================================= */}
        {authView === 'firebase_login' && (
          <form onSubmit={handleFirebaseLogin} className="space-y-4">
            {/* Phone Badge if available */}
            {(phoneInput || pendingPhone) && (
              <div className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🇧🇩</span>
                  <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200 text-xs">
                    +880 {phoneInput || pendingPhone}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAuthView('phone')}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{isBn ? 'পরিবর্তন' : 'Change'}</span>
                </button>
              </div>
            )}

            {/* Email or Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {isBn ? 'ইমেইল অথবা মোবাইল নম্বর' : 'Email Address or Mobile Number'}
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-zinc-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="login-email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isBn ? "ইমেইল (e.g. user@gmail.com) বা মোবাইল (e.g. 018XXXXXXXX)" : "yourname@gmail.com or 018XXXXXXXX"}
                  className="w-full pl-10 pr-3.5 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-2xl text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-xs sm:text-sm"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  {isBn ? 'পাসওয়ার্ড (Password)' : 'Password'}
                </label>
                <button
                  type="button"
                  id="forgot-password-link-btn"
                  onClick={() => {
                    setResetMethod('email');
                    setResetIdentifier('');
                    setErrorMsg('');
                    setSuccessMsg('');
                    setResetOtpDigits(['', '', '', '', '', '']);
                    setAuthView('forgot_password');
                  }}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium cursor-pointer"
                >
                  {isBn ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}
                </button>
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-zinc-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-2xl text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="firebase-login-submit-btn"
              disabled={loading || !email.trim() || !password}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isBn ? 'লগইন হচ্ছে...' : 'Signing In...'}</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>{isBn ? 'লগইন করুন ও প্রবেশ করুন' : 'Sign In & Enter Askio'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => setAuthView('phone')}
                className="text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
              >
                {isBn ? '← ফোন নম্বর দিয়ে লগইন' : '← Mobile Phone Login'}
              </button>

              <button
                type="button"
                onClick={() => setAuthView('firebase_register')}
                className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
              >
                {isBn ? 'নতুন অ্যাকাউন্ট খুলুন' : 'Create Account'}
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* VIEW 4: FORGOT PASSWORD (REQUEST OTP VIA EMAIL)           */}
        {/* ========================================================= */}
        {authView === 'forgot_password' && (
          <form onSubmit={handleSendResetOtp} className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                {isBn ? 'পাসওয়ার্ড রিসেট করুন' : 'Reset Your Password'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                {isBn ? 'আপনার অ্যাকাউন্টের ইমেইল ঠিকানা দিন। আমরা একটি পাসওয়ার্ড রিসেট লিংক পাঠাব।' : 'Enter your registered email address to receive a secure password reset link.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {isBn ? 'আপনার নিবন্ধিত ইমেইল ঠিকানা' : 'Registered Email Address'}
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-zinc-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  id="reset-email-input"
                  value={resetIdentifier}
                  onChange={(e) => setResetIdentifier(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full pl-10 pr-3.5 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-2xl text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              id="send-reset-otp-btn"
              disabled={loading || !resetIdentifier.trim()}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isBn ? 'অনুরোধ পাঠানো হচ্ছে...' : 'Processing...'}</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span>{isBn ? 'পাসওয়ার্ড রিসেট লিংক পাঠান' : 'Send Reset Link'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setAuthView('firebase_login')}
                className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-center gap-1 mx-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{isBn ? 'লগইন স্ক্রিনে ফিরে যান' : 'Back to Sign In'}</span>
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* VIEW 5: VERIFY RESET OTP                                  */}
        {/* ========================================================= */}
        {authView === 'verify_reset_otp' && (
          <form onSubmit={handleVerifyResetOtp} className="space-y-4">
            {/* Target identifier info */}
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {resetMethod === 'email' ? <Mail className="w-4 h-4 text-emerald-500" /> : <Phone className="w-4 h-4 text-emerald-500" />}
                <span className="font-medium text-zinc-800 dark:text-zinc-200">{resetIdentifier}</span>
              </div>
              <button
                type="button"
                onClick={() => setAuthView('forgot_password')}
                className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>{isBn ? 'পরিবর্তন' : 'Change'}</span>
              </button>
            </div>

            {/* 6 Digit Box Inputs */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2 text-center">
                {isBn ? '৬-সংখ্যার সিকিউরিটি কোড প্রবেশ করান' : 'Enter 6-Digit Security Code'}
              </label>
              <div className="flex justify-between gap-2">
                {resetOtpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpDigitKeyDown(idx, e)}
                    onPaste={idx === 0 ? handleOtpPaste : undefined}
                    className="w-11 h-12 text-center text-lg font-mono font-bold bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-zinc-900 dark:text-zinc-100"
                    required
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              id="verify-reset-otp-btn"
              disabled={loading || resetOtpDigits.join('').length < 6}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isBn ? 'কোড যাচাই হচ্ছে...' : 'Verifying Code...'}</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isBn ? 'কোড যাচাই করে এগিয়ে যান' : 'Verify Code & Proceed'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Resend OTP */}
            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setAuthView('forgot_password')}
                className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                {isBn ? '← পূর্ববর্তী' : '← Back'}
              </button>

              <button
                type="button"
                onClick={() => handleSendResetOtp()}
                disabled={resendTimer > 0 || loading}
                className="text-emerald-600 dark:text-emerald-400 hover:underline disabled:text-zinc-400 disabled:no-underline font-medium flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>
                  {resendTimer > 0 
                    ? (isBn ? `আবার পাঠান (${resendTimer}s)` : `Resend in (${resendTimer}s)`)
                    : (isBn ? 'কোডটি পুনরায় পাঠান' : 'Resend Code')}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* VIEW 6: SET NEW PASSWORD                                  */}
        {/* ========================================================= */}
        {authView === 'reset_password' && (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {isBn ? 'নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)' : 'New Password (Min. 6 chars)'}
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-zinc-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="new-password-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-2xl text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {isBn ? 'নতুন পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm New Password'}
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-zinc-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirm-password-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-2xl text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="set-new-password-btn"
              disabled={loading || newPassword.length < 6 || newPassword !== confirmPassword}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isBn ? 'পাসওয়ার্ড পরিবর্তন হচ্ছে...' : 'Updating Password...'}</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>{isBn ? 'পাসওয়ার্ড পরিবর্তন সম্পন্ন করুন' : 'Save New Password & Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setAuthView('firebase_login')}
                className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-center gap-1 mx-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{isBn ? 'লগইন স্ক্রিনে ফিরে যান' : 'Back to Sign In'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Dedicated SMS OTP Verification Modal */}
      <OtpVerificationModal
        isOpen={isOtpModalOpen}
        phoneNumber={pendingPhone || phoneInput}
        referenceNo={otpRefNo}
        onClose={() => setIsOtpModalOpen(false)}
        onSuccess={() => {
          setIsOtpModalOpen(false);
          setAuthModalOpen(false);
          setActiveTab('home');
          if (onLoginSuccess) onLoginSuccess();
        }}
        onChangePhone={() => {
          setIsOtpModalOpen(false);
          setAuthView('phone');
        }}
      />
    </div>
  );
};
