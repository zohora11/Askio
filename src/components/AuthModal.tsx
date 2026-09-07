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
  Check
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

  // STEP 1: Phone check / BDApps Subscription Check
  const handlePhoneSubmit = async (e: React.FormEvent) => {
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

      // STEP 1A: ALWAYS call BDApps checkSubscription API FIRST
      let isSub = false;
      try {
        const subRes = await checkSubscription(cleanMobile);
        isSub = isSubscriptionRegistered(subRes);
      } catch (checkErr) {
        console.warn('Subscription check API notice:', checkErr);
        isSub = false;
      }

      // STEP 1B: If NOT subscribed / NOT registered:
      // STRICT CONSTRAINT: "যদি সে সাবস্ক্রাইব না হয় সেক্ষেত্রে তাকে কোনোভাবে নেক্সট ধাপে নিয়ে যাওয়া যাবে না ।"
      // "আর যদি চেক সাবস্ক্রিপশন কল করে দেখে যে না সে রেজিস্টার্ড না তাহলে তখন সেন্ড ওটিপি কল হবে ।"
      if (!isSub) {
        unmarkLocalSubscriber(cleanMobile);
        clearSubscriptionSession();
        clearDeviceTrustForPhone(cleanMobile);

        setSuccessMsg(isBn ? 'সাবস্ক্রিপশন সক্রিয় নেই। এসএমএস ওটিপি পাঠানো হচ্ছে...' : 'Subscription not active. Sending OTP via SMS...');
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
          setErrorMsg(otpErr?.message || (isBn ? 'ওটিপি পাঠানো সম্ভব হয়নি। মোবাইল নম্বরটি পরীক্ষা করুন।' : 'Failed to send OTP. Please check mobile number.'));
        }
        return;
      }

      // STEP 1C: USER IS SUBSCRIBED!
      // Only now, permit next step:
      markLocalSubscriber(cleanMobile);
      storeSubscriberSession(cleanMobile);

      // 1. Check if THIS device is ALREADY TRUSTED for this phone number
      const trustedUser = getTrustedDeviceUser(cleanMobile);
      if (trustedUser) {
        // Same device where password was saved previously -> Direct Login!
        const trustedAvatar = isCustomAvatar(trustedUser.avatar) 
          ? trustedUser.avatar 
          : (localStorage.getItem(`askio_avatar_phone_${cleanMobile}`) || localStorage.getItem('askio_custom_avatar') || undefined);

        updateProfile({
          uid: trustedUser.uid || 'user_' + cleanMobile,
          fullName: trustedUser.fullName || 'Askio Member',
          email: trustedUser.email || '',
          phone: cleanMobile,
          avatar: trustedAvatar,
          isLoggedIn: true,
          isPremium: true,
          membershipPlan: trustedUser.membershipPlan || 'BDApps Daily (৳2.78/day)'
        });

        setSuccessMsg(isBn ? 'এই ডিভাইসে আপনার পাসওয়ার্ড সেভ করা আছে! সরাসরি অ্যাপে প্রবেশ করা হচ্ছে...' : 'Device recognized! Logging in directly without password...');
        setTimeout(() => {
          setLoading(false);
          setAuthModalOpen(false);
          setActiveTab('home');
          if (onLoginSuccess) onLoginSuccess();
        }, 600);
        return;
      }

      // 2. Check if user already exists in Firestore by this phone (on another device)
      const existingUser = await findUserByPhone(cleanMobile);

      if (existingUser && existingUser.email) {
        // User already has an account on another device -> Take to Firebase Password Login
        setEmail(existingUser.email);
        setAuthView('firebase_login');
        setSuccessMsg(isBn ? 'সাবস্ক্রিপশন সক্রিয়! পাসওয়ার্ড দিয়ে লগইন করুন।' : 'Subscription active! Please enter password to sign in.');
      } else {
        setAuthView('firebase_register');
        setSuccessMsg(isBn ? 'সাবস্ক্রিপশন নিশ্চিত হয়েছে! তথ্য পূরণ করে অ্যাকাউন্ট তৈরি করুন।' : 'Subscription confirmed! Complete profile to set up account.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || (isBn ? 'যাচাই করতে সমস্যা হয়েছে।' : 'Error verifying phone.'));
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
        avatar: isCustomAvatar(createdUser.avatar) ? createdUser.avatar : (localStorage.getItem('askio_custom_avatar') || DEFAULT_AVATAR),
        isLoggedIn: true,
        isPremium: true,
        membershipPlan: 'BDApps Daily (৳2.78/day)'
      });

      setSuccessMsg(isBn ? 'ফায়ারবেস অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! অ্যাপে প্রবেশ করা হচ্ছে...' : 'Firebase account created successfully! Entering Askio...');

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
      const expectedPhone = phoneInput.trim() || pendingPhone.trim();
      const loggedInUser = await loginFirebaseUser(loginInput, password, expectedPhone || undefined);

      const userPhone = loggedInUser.phone || (loginInput.startsWith('01') ? loginInput : expectedPhone);

      // 2. STRICT SUBSCRIPTION CHECK: Ensure active BDApps subscription
      if (userPhone) {
        const cleanPhone = validateMobileNumber(userPhone).cleaned || userPhone;
        let isSub = false;
        try {
          const subRes = await checkSubscription(cleanPhone);
          isSub = isSubscriptionRegistered(subRes);
        } catch (e) {
          isSub = false;
        }

        if (!isSub) {
          await logoutFirebaseUser();
          unmarkLocalSubscriber(cleanPhone);
          clearSubscriptionSession();
          clearDeviceTrustForPhone(cleanPhone);
          setLoading(false);
          setErrorMsg(
            isBn
              ? `আপনার অ্যাকাউন্টের নম্বরে (+880 ${cleanPhone}) কোনো সক্রিয় সাবস্ক্রিপশন নেই। অ্যাপে প্রবেশের জন্য সাবস্ক্রাইব করা আবশ্যক।`
              : `Account number (+880 ${cleanPhone}) is not subscribed. Active BDApps subscription is required to access Askio.`
          );
          return;
        }

        markLocalSubscriber(userPhone);
        storeSubscriberSession(userPhone);
        saveDeviceTrustForPhone(userPhone, loggedInUser);
      } else {
        await logoutFirebaseUser();
        setLoading(false);
        setErrorMsg(
          isBn
            ? 'আপনার অ্যাকাউন্টে কোনো মোবাইল নম্বর পাওয়া যায়নি। অনুগ্রহ করে মোবাইল নম্বর দিয়ে সাবস্ক্রাইব করুন।'
            : 'No phone number associated with this account. Please subscribe with your mobile number.'
        );
        return;
      }

      // 3. Update global App Context (including avatar!)
      const resolvedAvatar = isCustomAvatar(loggedInUser.avatar)
        ? loggedInUser.avatar!
        : (localStorage.getItem(`askio_avatar_email_${(loggedInUser.email || loginInput).toLowerCase()}`) ||
           (userPhone ? localStorage.getItem(`askio_avatar_phone_${userPhone}`) : null) ||
           localStorage.getItem('askio_custom_avatar') ||
           DEFAULT_AVATAR);

      updateProfile({
        uid: loggedInUser.uid,
        fullName: loggedInUser.fullName || 'Askio Member',
        email: loggedInUser.email || (loginInput.includes('@') ? loginInput : ''),
        phone: userPhone,
        avatar: resolvedAvatar,
        isLoggedIn: true,
        isPremium: true,
        membershipPlan: loggedInUser.membershipPlan || 'BDApps Daily (৳2.78/day)'
      });

      setSuccessMsg(isBn ? 'লগইন সফল হয়েছে! অ্যাপে প্রবেশ করা হচ্ছে...' : 'Login successful! Entering Askio...');

      setTimeout(() => {
        setLoading(false);
        setAuthModalOpen(false);
        setActiveTab('home');
        if (onLoginSuccess) onLoginSuccess();
      }, 700);
    } catch (err: any) {
      console.error('Firebase login error:', err);
      let msg = isBn ? 'ইমেইল/ফোন নম্বর বা পাসওয়ার্ড সঠিক নয়।' : 'Invalid credentials. Please check your details.';
      if (err.code === 'auth/user-not-found') {
        msg = isBn ? 'এই তথ্য দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে রেজিস্ট্রেশন বা সাবস্ক্রাইব করুন।' : 'No account found with these details. Please register or subscribe.';
      } else if (
        err.code === 'auth/wrong-password' || 
        err.code === 'auth/invalid-credential' || 
        err.code === 'auth/invalid-login-credentials' ||
        err.message?.toLowerCase().includes('password')
      ) {
        msg = isBn ? 'ভুল তথ্য! আপনার ইমেইল/ফোন ও পাসওয়ার্ড সঠিকভাবে দিন।' : 'Invalid credentials. Please check your email/phone and password.';
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
      setErrorMsg(isBn ? 'অনুগ্রহ করে আপনার ইমেইল অথবা মোবাইল নম্বর দিন।' : 'Please enter your email or mobile number.');
      return;
    }

    if (resetMethod === 'email') {
      if (!targetVal.includes('@')) {
        setErrorMsg(isBn ? 'সঠিক ইমেইল ঠিকানা প্রদান করুন।' : 'Please enter a valid email address.');
        return;
      }

      setLoading(true);
      try {
        const cleanedTarget = targetVal.toLowerCase();
        await sendFirebasePasswordResetEmail(cleanedTarget);
        setSuccessMsg(isBn 
          ? `পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে (${cleanedTarget}) পাঠানো হয়েছে! অনুগ্রহ করে ইনবক্স চেক করুন।` 
          : `Password reset link has been sent to ${cleanedTarget}! Please check your email inbox.`);
      } catch (err: any) {
        console.warn('Firebase reset email error:', err);
        setErrorMsg(isBn ? 'পাসওয়ার্ড রিসেট লিংক পাঠানো সম্ভব হয়নি। ইমেইলটি সঠিক কিনা যাচাই করুন।' : 'Could not send password reset email. Please verify the email address.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (resetMethod === 'phone') {
      const val = validateMobileNumber(targetVal);
      if (!val.isValid) {
        setErrorMsg(val.errorMessage || (isBn ? 'সঠিক ১১-সংখ্যার রবি/সার্কেল নম্বর দিন।' : 'Please enter a valid 11-digit mobile number.'));
        return;
      }

      setLoading(true);
      try {
        const cleanedPhone = val.cleaned;
        // Verify that this phone number is registered to an existing account
        const existingUser = await findUserByPhone(cleanedPhone);
        if (!existingUser) {
          setErrorMsg(isBn ? 'এই নম্বরে কোনো নিবন্ধিত অ্যাকাউন্ট পাওয়া যায়নি।' : 'No registered account found for this mobile number.');
          setLoading(false);
          return;
        }

        // Send real-time OTP via BDApps SMS gateway
        const otpRes = await sendOTP(cleanedPhone);
        const ref = otpRes.referenceNo || otpRes.subscriberId || 'REF-' + Date.now();
        setOtpRefNo(ref);
        setResendTimer(30);
        setResetOtpDigits(['', '', '', '', '', '']);
        setSuccessMsg(isBn 
          ? `রবি/সার্কেল নম্বরে (${cleanedPhone}) ৬-সংখ্যার এসএমএস ওটিপি কোড পাঠানো হয়েছে!` 
          : `6-digit verification OTP sent to ${cleanedPhone} via SMS!`);
        
        setAuthView('verify_reset_otp');
      } catch (err: any) {
        console.warn('Send reset OTP err:', err);
        setErrorMsg(err?.message || (isBn ? 'ভেরিফিকেশন কোড পাঠানো সম্ভব হয়নি। আবার চেষ্টা করুন।' : 'Could not send verification code. Please try again.'));
      } finally {
        setLoading(false);
      }
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
      onClick={() => setAuthModalOpen(false)}
    >
      <div 
        id="auth-modal"
        className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all my-auto cursor-default"
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
          <div className="flex justify-center mb-3">
            <AppLogo showText={false} imgClassName="h-11 w-auto" />
          </div>

          <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100">
            {authView === 'firebase_register' && 'Create Your Account'}
            {authView === 'firebase_login' && (isBn ? 'পাসওয়ার্ড দিয়ে লগইন করুন' : 'Sign In with Password')}
            {authView === 'forgot_password' && (isBn ? 'পাসওয়ার্ড রিসেট করুন' : 'Reset Your Password')}
            {authView === 'verify_reset_otp' && (isBn ? 'ভেরিফিকেশন কোড যাচাই' : 'Verify Security Code')}
            {authView === 'reset_password' && (isBn ? 'নতুন পাসওয়ার্ড সেট করুন' : 'Set New Password')}
            {(authView === 'phone' || authView === 'login' || authView === 'register') && (isBn ? 'Askio এ প্রবেশ / লগইন' : 'Sign In to Askio')}
          </h3>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {authView === 'firebase_register' && (isBn 
              ? 'আপনার সাবস্ক্রিপশন সম্পন্ন হয়েছে। তথ্য দিয়ে অ্যাকাউন্ট তৈরি করুন।' 
              : 'Subscription confirmed. Enter your details to create your account.')}
            
            {authView === 'firebase_login' && (isBn 
              ? 'নিরাপদে অ্যাপে প্রবেশের জন্য আপনার ইমেইল ও পাসওয়ার্ড দিন।' 
              : 'Enter your email & password to access your Askio account.')}

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
              ? 'আপনার রবি বা সার্কেল নম্বর দিয়ে সাবস্ক্রিপশন চেক বা লগইন করুন' 
              : 'Enter your mobile number to sign in or check subscription (৳2.78/day)')}
          </p>
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
            {(errorMsg.includes('রেজিস্টার্ড না') || errorMsg.includes('not registered')) && (
              <button
                type="button"
                id="unsub-subscribe-now-btn"
                onClick={() => {
                  setAuthModalOpen(false);
                  setSubscriptionModalOpen(true);
                }}
                className="mt-1 w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isBn ? 'এখনই সাবস্ক্রিপশন করুন (৳২.৭৮/দিন)' : 'Subscribe Now (৳2.78/day)'}</span>
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
        {/* VIEW 1: PHONE LOOKUP / INITIAL LOGIN                      */}
        {/* ========================================================= */}
        {(authView === 'phone' || authView === 'login') && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
                <span>{isBn ? 'মোবাইল নম্বর (রবি ০১৮ / সার্কেল ০১৬)' : 'Bangladesh Mobile Number'}</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  BDApps ৳2.78/day
                </span>
              </label>
              <div className="flex items-center border border-zinc-300 dark:border-zinc-700 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 bg-zinc-50 dark:bg-zinc-800">
                <div className="px-3.5 py-3 bg-zinc-100 dark:bg-zinc-700/60 border-r border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5 font-mono">
                  <span>🇧🇩</span>
                  <span>+880</span>
                </div>
                <input
                  type="tel"
                  id="auth-phone-input"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="018XXXXXXXX or 016XXXXXXXX"
                  className="w-full px-3.5 py-3 text-sm font-mono bg-transparent outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                  required
                />
              </div>
              <p className="text-[10px] text-zinc-400 mt-1.5">
                {isBn 
                  ? 'পূর্ববর্তী অ্যাকাউন্ট থাকলে পাসওয়ার্ড স্ক্রিন আসবে। নতুন হলে অ্যাকাউন্ট সেটআপ করা হবে।' 
                  : 'Existing accounts proceed to password screen. New users set up their profile.'}
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
                  <span>{isBn ? 'যাচাই করা হচ্ছে...' : 'Checking Account...'}</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>{isBn ? 'পরবর্তী ধাপে যান' : 'Continue to Next Step'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => { setErrorMsg(''); setAuthView('firebase_login'); }}
                className="text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium flex items-center gap-1"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{isBn ? 'ইমেইল ও পাসওয়ার্ড দিয়ে সরাসরি লগইন' : 'Sign In with Email & Password'}</span>
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
        {/* VIEW 4: FORGOT PASSWORD (REQUEST OTP VIA EMAIL OR PHONE)  */}
        {/* ========================================================= */}
        {authView === 'forgot_password' && (
          <form onSubmit={handleSendResetOtp} className="space-y-4">
            {/* Reset Method Selector Tabs */}
            <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-xs">
              <button
                type="button"
                onClick={() => {
                  setResetMethod('email');
                  setResetIdentifier('');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  resetMethod === 'email'
                    ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{isBn ? 'ইমেইল দিয়ে' : 'Via Email'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setResetMethod('phone');
                  setResetIdentifier('');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  resetMethod === 'phone'
                    ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{isBn ? 'মোবাইল নম্বর দিয়ে' : 'Via Phone'}</span>
              </button>
            </div>

            {/* Input according to method */}
            {resetMethod === 'email' ? (
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
            ) : (
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {isBn ? 'আপনার রবি / সার্কেল নম্বর' : 'Robi / Circle Mobile Number'}
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-xs font-mono font-bold text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                    <span>🇧🇩</span>
                    <span>+880</span>
                  </div>
                  <input
                    type="tel"
                    id="reset-phone-input"
                    value={resetIdentifier}
                    onChange={(e) => setResetIdentifier(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="018XXXXXXXX"
                    className="w-full pl-18 pr-3.5 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-2xl text-sm font-mono text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
            )}

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
                  {resetMethod === 'email' ? <Mail className="w-4 h-4" /> : <KeyRound className="w-4 h-4" />}
                  <span>
                    {resetMethod === 'email' 
                      ? (isBn ? 'পাসওয়ার্ড রিসেট লিংক পাঠান' : 'Send Reset Link') 
                      : (isBn ? 'এসএমএস ওটিপি পাঠান' : 'Send SMS OTP')}
                  </span>
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
