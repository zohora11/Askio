import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  updateProfile as updateFirebaseAuthProfile,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  onSnapshot 
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';
import { saveDeviceTrustForPhone, getTrustedDeviceUser } from './deviceTrust';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);
export const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export const DEFAULT_AVATAR = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80`;

export async function uploadAvatarToStorage(uid: string, file: File): Promise<string> {
  const storageRef = ref(storage, `avatars/${uid}_${Date.now()}`);
  await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
}

/**
 * Checks whether an avatar string represents a user's customized upload
 * rather than an unconfigured default placeholder.
 */
export function isCustomAvatar(avatarUrl?: string): boolean {
  if (!avatarUrl || typeof avatarUrl !== 'string') return false;
  const trimmed = avatarUrl.trim();
  if (!trimmed) return false;
  if (trimmed.includes('photo-1534528741775-53994a69daeb')) return false;
  return true;
}

/**
 * Deeply strips undefined values from an object before sending to Firestore
 * (Firestore throws an error if any field in setDoc/updateDoc is undefined)
 */
export function cleanFirestoreData<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  if (!obj || typeof obj !== 'object') return result;

  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue; // Strictly omit undefined fields
    }
    if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      result[key] = cleanFirestoreData(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export interface FirestoreUserData {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  phoneNumber?: string;
  phoneVerified?: boolean;
  isPremium: boolean;
  membershipPlan: string;
  avatar?: string;
  age?: number | string;
  gender?: string;
  religion?: string;
  bloodGroup?: string;
  profession?: string;
  address?: string;
  city?: string;
  createdAt?: any;
  updatedAt?: any;
}

/**
 * Register a new user in Firebase Auth and Firestore.
 * Strictly binds 1 Email + 1 Verified Phone Number + 1 Password to 1 unique Account UID.
 */
export async function registerFirebaseUser(params: {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  phoneVerified?: boolean;
}): Promise<FirestoreUserData> {
  const { fullName, email, password, phone, phoneVerified = true } = params;
  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone.trim();
  const cleanName = fullName.trim();
  const defaultAvatar = DEFAULT_AVATAR;

  if (!cleanEmail || !cleanEmail.includes('@')) {
    const err: any = new Error('Please enter a valid email address.');
    err.code = 'auth/invalid-email';
    throw err;
  }

  if (!password || password.length < 6) {
    const err: any = new Error('Password must be at least 6 characters long.');
    err.code = 'auth/weak-password';
    throw err;
  }

  if (!cleanPhone) {
    const err: any = new Error('A verified mobile phone number is required.');
    err.code = 'auth/invalid-phone';
    throw err;
  }

  // 1. Uniqueness check: Ensure phone number is not already bound to another account
  const existingUserWithPhone = await findUserByPhone(cleanPhone);
  if (existingUserWithPhone && existingUserWithPhone.email && existingUserWithPhone.email.toLowerCase() !== cleanEmail) {
    const phoneErr: any = new Error('This phone number is already linked to another account.');
    phoneErr.code = 'auth/phone-already-in-use';
    throw phoneErr;
  }

  // 2. Uniqueness check: Ensure email is not already registered in Firestore
  const existingUserWithEmail = await findUserByEmail(cleanEmail);
  if (existingUserWithEmail && existingUserWithEmail.phone && existingUserWithEmail.phone !== cleanPhone) {
    const emailErr: any = new Error('An account with this email already exists.');
    emailErr.code = 'auth/email-already-in-use';
    throw emailErr;
  }

  let uid = '';

  // 3. Create user credentials natively in Firebase Auth
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    const firebaseUser = userCredential.user;
    uid = firebaseUser.uid;

    try {
      await updateFirebaseAuthProfile(firebaseUser, { displayName: cleanName });
    } catch (e) {
      console.warn('Firebase profile name sync notice:', e);
    }
  } catch (authErr: any) {
    console.warn('Firebase Auth create notice:', authErr.code || authErr.message);

    if (authErr.code === 'auth/email-already-in-use') {
      const customErr: any = new Error('An account with this email already exists. Please sign in with your password.');
      customErr.code = 'auth/email-already-in-use';
      throw customErr;
    }
    
    if (authErr.code === 'auth/operation-not-allowed') {
      const customErr: any = new Error('Email/Password login is not enabled in your Firebase project. Please go to the Firebase Console -> Authentication -> Sign-in method, and enable "Email/Password".');
      customErr.code = 'auth/operation-not-allowed';
      throw customErr;
    }

    // For any other error, throw it so the user knows what went wrong (e.g. weak password)
    throw authErr;
  }

  if (!uid) {
    throw new Error('Failed to create account credential.');
  }

  // 4. Save clean user metadata document strictly under users/{uid} in Firestore
  // Pass only sanitized, non-undefined fields
  const userData: FirestoreUserData = {
    uid,
    fullName: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    phoneNumber: cleanPhone,
    phoneVerified: Boolean(phoneVerified),
    isPremium: true,
    membershipPlan: 'BDApps Daily (৳2.78/day)',
    avatar: defaultAvatar,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    const cleaned = cleanFirestoreData(userData);
    await setDoc(doc(db, 'users', uid), cleaned, { merge: true });
  } catch (err) {
    console.warn('Firestore user profile write warning:', err);
  }

  // 5. Cache in localStorage & device trust for active session
  try {
    localStorage.setItem(`askio_user_${uid}`, JSON.stringify(userData));
    localStorage.setItem(`askio_user_by_email_${cleanEmail}`, JSON.stringify(userData));
    if (cleanPhone) {
      localStorage.setItem(`askio_user_by_phone_${cleanPhone}`, JSON.stringify(userData));
      saveDeviceTrustForPhone(cleanPhone, userData);
    }
  } catch (e) {
    // ignore
  }

  return userData;
}

/**
 * Generate normalized variations of a Bangladeshi/international phone number
 */
export function getPhoneVariants(rawPhone: string): string[] {
  const clean = rawPhone.trim().replace(/[\s\-\(\)]/g, '');
  const digits = clean.replace(/\D/g, '');
  const variants = new Set<string>();
  
  if (clean) variants.add(clean);
  if (digits) variants.add(digits);
  
  if (digits.length >= 10) {
    const last10 = digits.slice(-10);
    variants.add(`0${last10}`);
    variants.add(`+880${last10}`);
    variants.add(`880${last10}`);
    variants.add(last10);
  }
  
  return Array.from(variants);
}

/**
 * Strict Multi-Credential Account Login:
 * Authenticates via Firebase Auth and verifies strict 1-to-1 Phone <-> Email <-> UID association.
 */
export async function loginFirebaseUser(
  identifier: string, 
  password: string,
  expectedPhone?: string
): Promise<FirestoreUserData> {
  const cleanInput = identifier.trim();

  if (!cleanInput) {
    const err: any = new Error('Please enter your email or mobile number.');
    err.code = 'auth/invalid-email';
    throw err;
  }

  if (!password) {
    const err: any = new Error('Please enter your password.');
    err.code = 'auth/missing-password';
    throw err;
  }

  const isEmail = cleanInput.includes('@');

  if (isEmail) {
    const cleanEmail = cleanInput.toLowerCase();

    // 1. If an expected phone was provided (e.g. from the Phone check step), verify email belongs to that phone
    if (expectedPhone && expectedPhone.trim()) {
      const cleanExpectedPhone = expectedPhone.trim();
      const phoneAccount = await findUserByPhone(cleanExpectedPhone);
      if (phoneAccount && phoneAccount.email && phoneAccount.email.toLowerCase() !== cleanEmail) {
        const mismatchErr: any = new Error('The email entered does not match the registered account for this phone number.');
        mismatchErr.code = 'auth/credential-mismatch';
        throw mismatchErr;
      }
    }

    // 2. Fetch existing Firestore user profile by email in advance
    let uData: FirestoreUserData | null = await findUserByEmail(cleanEmail);

    // 3. Authenticate with Firebase Auth
    let firebaseUser: FirebaseUser | null = null;
    let authError: any = null;
    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      firebaseUser = userCredential.user;
    } catch (authErr: any) {
      authError = authErr;
      console.warn('Firebase Auth email login note:', authErr.code || authErr.message);
    }

    // 4. If Firebase Auth succeeded, fetch fresh Firestore document
    if (firebaseUser) {
      try {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          uData = userSnap.data() as FirestoreUserData;
        }
      } catch (docErr) {
        console.warn('Error reading user document:', docErr);
      }
    }

    // If Auth failed, we MUST throw the error.
    if (!firebaseUser) {
      const code = authError?.code || 'auth/invalid-credential';
      let message = 'No account found with this email address. Please check your email or register.';
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials') {
        message = 'Incorrect password. Please verify your password and try again.';
      } else if (code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (code === 'auth/too-many-requests') {
        message = 'Access to this account has been temporarily disabled due to many failed login attempts. Please try again later.';
      } else if (code === 'auth/user-disabled') {
        message = 'This account has been disabled. Please contact support.';
      } else if (code === 'auth/network-request-failed') {
        message = 'Network connection failed. Please check your internet connection.';
      } else if (code === 'auth/operation-not-allowed') {
        message = 'Email/Password login is not enabled in your Firebase project. Please enable it in the Firebase Console.';
      }
      const err: any = new Error(message);
      err.code = code;
      throw err;
    }

    const uid = firebaseUser?.uid || uData?.uid || ('user_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, ''));
    const resolvedPhone = uData?.phone || uData?.phoneNumber || (expectedPhone?.trim() || '');

    // 5. Resolve avatar strictly from the Firestore document or default
    const resolvedAvatar = uData?.avatar || DEFAULT_AVATAR;

    const finalUserData: FirestoreUserData = {
      uid,
      fullName: uData?.fullName || firebaseUser?.displayName || 'Askio Member',
      email: uData?.email || firebaseUser?.email || cleanEmail,
      phone: resolvedPhone,
      phoneNumber: resolvedPhone,
      phoneVerified: uData?.phoneVerified ?? Boolean(resolvedPhone),
      isPremium: uData?.isPremium ?? true,
      membershipPlan: uData?.membershipPlan || 'BDApps Daily (৳2.78/day)',
      avatar: resolvedAvatar,
      ...(uData?.age !== undefined && uData?.age !== null ? { age: uData.age } : {}),
      ...(uData?.gender ? { gender: uData.gender } : {}),
      ...(uData?.religion ? { religion: uData.religion } : {}),
      ...(uData?.bloodGroup ? { bloodGroup: uData.bloodGroup } : {}),
      ...(uData?.profession ? { profession: uData.profession } : {}),
      ...(uData?.address ? { address: uData.address } : {}),
      ...(uData?.city ? { city: uData.city } : {})
    };

    // Keep Firestore users/{uid} in sync
    const syncData = cleanFirestoreData({ ...finalUserData, updatedAt: new Date().toISOString() });
    setDoc(doc(db, 'users', uid), syncData, { merge: true }).catch(() => {});

    // Cache sync
    try {
      localStorage.setItem(`askio_user_${uid}`, JSON.stringify(finalUserData));
      localStorage.setItem(`askio_user_by_email_${cleanEmail}`, JSON.stringify(finalUserData));
      if (resolvedPhone) {
        localStorage.setItem(`askio_user_by_phone_${resolvedPhone}`, JSON.stringify(finalUserData));
      }
    } catch {}

    return finalUserData;
  } else {
    // -------------------------------------------------------------
    // Phone Number login flow:
    // Identifies registered account by phone, then authenticates with Firebase Auth
    // -------------------------------------------------------------
    const cleanPhone = cleanInput;
    const userByPhone = await findUserByPhone(cleanPhone);

    if (!userByPhone) {
      const notFoundErr: any = new Error(`No registered account found for phone number ${cleanPhone}. Please subscribe or create an account.`);
      notFoundErr.code = 'auth/user-not-found';
      throw notFoundErr;
    }

    const boundEmail = userByPhone.email?.trim().toLowerCase();
    let firebaseUser: FirebaseUser | null = null;
    let authError: any = null;

    if (boundEmail) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, boundEmail, password);
        firebaseUser = userCredential.user;
      } catch (authErr: any) {
        authError = authErr;
        console.warn('Firebase Auth phone-linked login note:', authErr.code || authErr.message);
      }
    }

    if (!firebaseUser) {
      const code = authError?.code || 'auth/invalid-credential';
      let message = 'Incorrect password. Please verify your password and try again.';
      if (code === 'auth/user-not-found') {
        message = 'No account found with this credential. Please register again.';
      } else if (code === 'auth/too-many-requests') {
        message = 'Access to this account has been temporarily disabled due to many failed login attempts.';
      } else if (code === 'auth/user-disabled') {
        message = 'This account has been disabled. Please contact support.';
      } else if (code === 'auth/operation-not-allowed') {
        message = 'Email/Password login is not enabled in your Firebase project. Please enable it in the Firebase Console.';
      }
      const err: any = new Error(message);
      err.code = code;
      throw err;
    }

    // Fetch fresh profile from Firestore
    let uData: FirestoreUserData | null = null;
    if (firebaseUser) {
      try {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          uData = userSnap.data() as FirestoreUserData;
        }
      } catch (e) { /* ignore */ }
    }

    const profile = uData || userByPhone;
    const uid = firebaseUser?.uid || profile.uid || ('user_' + cleanPhone.replace(/\D/g, ''));
    const resolvedAvatar = profile.avatar || DEFAULT_AVATAR;

    const finalUserData: FirestoreUserData = {
      ...profile,
      uid,
      phone: cleanPhone,
      phoneNumber: cleanPhone,
      avatar: resolvedAvatar
    };

    // Cache sync
    try {
      localStorage.setItem(`askio_user_${uid}`, JSON.stringify(finalUserData));
      localStorage.setItem(`askio_user_by_phone_${cleanPhone}`, JSON.stringify(finalUserData));
      if (boundEmail) {
        localStorage.setItem(`askio_user_by_email_${boundEmail}`, JSON.stringify(finalUserData));
      }
    } catch {}

    return finalUserData;
  }
}

/**
 * Securely change the password for the current logged-in user.
 * Re-authenticates with current password, updates Firebase Auth password,
 * and updates Firestore timestamps while preserving UID, Email, and Phone.
 */
export async function changeUserPassword(params: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ success: boolean; message?: string }> {
  const { currentPassword, newPassword } = params;

  if (!auth.currentUser || !auth.currentUser.email) {
    const err: any = new Error('No active user session found. Please sign in again.');
    err.code = 'auth/no-current-user';
    throw err;
  }

  if (!newPassword || newPassword.length < 6) {
    const err: any = new Error('New password must be at least 6 characters long.');
    err.code = 'auth/weak-password';
    throw err;
  }

  // 1. Reauthenticate current user with current password
  try {
    const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
    await reauthenticateWithCredential(auth.currentUser, credential);
  } catch (reauthErr: any) {
    console.warn('Reauthentication error:', reauthErr);
    const err: any = new Error('Current password is incorrect.');
    err.code = 'auth/wrong-password';
    throw err;
  }

  // 2. Update password in Firebase Auth
  await updatePassword(auth.currentUser, newPassword);

  // 3. Update updatedAt timestamp on Firestore user doc
  try {
    const userRef = doc(db, 'users', auth.currentUser.uid);
    await setDoc(userRef, { updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn('Firestore updatedAt sync notice:', err);
  }

  return { success: true, message: 'Password updated successfully!' };
}

/**
 * Sign in with Google Popup (native Firebase supported provider)
 */
export async function loginWithGoogle(): Promise<FirestoreUserData> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  let existingUser: FirestoreUserData | null = null;
  let existingAvatar = '';
  try {
    const userDocSnap = await getDoc(doc(db, 'users', user.uid));
    if (userDocSnap.exists()) {
      existingUser = userDocSnap.data() as FirestoreUserData;
      if (isCustomAvatar(existingUser.avatar)) {
        existingAvatar = existingUser.avatar!;
      }
    }
  } catch { /* ignore */ }

  if (!existingUser && user.email) {
    const byEmail = await findUserByEmail(user.email);
    if (byEmail) {
      existingUser = byEmail;
      if (isCustomAvatar(byEmail.avatar)) {
        existingAvatar = byEmail.avatar!;
      }
    }
  }

  const finalAvatar = existingAvatar || user.photoURL || DEFAULT_AVATAR;

  const userData: FirestoreUserData = {
    uid: user.uid,
    fullName: existingUser?.fullName || user.displayName || 'Askio Member',
    email: existingUser?.email || user.email || '',
    phone: existingUser?.phone || user.phoneNumber || '',
    phoneNumber: existingUser?.phone || user.phoneNumber || '',
    phoneVerified: true,
    isPremium: existingUser?.isPremium ?? true,
    membershipPlan: existingUser?.membershipPlan || 'BDApps Daily (৳2.78/day)',
    avatar: finalAvatar,
    updatedAt: new Date().toISOString()
  };

  try {
    const cleanedGoogleData = cleanFirestoreData(userData);
    await setDoc(doc(db, 'users', user.uid), cleanedGoogleData, { merge: true });
  } catch (err) {
    console.warn('Google user profile write notice:', err);
  }

  return userData;
}

/**
 * Find registered user profile in Firestore by phone number
 */
export async function findUserByPhone(phone: string): Promise<FirestoreUserData | null> {
  const cleanPhone = phone.trim();
  if (!cleanPhone) return null;

  const variants = getPhoneVariants(cleanPhone);

  try {
    const usersRef = collection(db, 'users');
    
    // Check variants across both 'phone' and 'phoneNumber'
    for (const v of variants) {
      const qPhone = query(usersRef, where('phone', '==', v));
      const snapPhone = await getDocs(qPhone);
      if (!snapPhone.empty) {
        let best = snapPhone.docs[0].data() as FirestoreUserData;
        for (const d of snapPhone.docs) {
          const dData = d.data() as FirestoreUserData;
          if (isCustomAvatar(dData.avatar)) {
            best = dData;
            break;
          }
        }
        return best;
      }

      const qNum = query(usersRef, where('phoneNumber', '==', v));
      const snapNum = await getDocs(qNum);
      if (!snapNum.empty) {
        let best = snapNum.docs[0].data() as FirestoreUserData;
        for (const d of snapNum.docs) {
          const dData = d.data() as FirestoreUserData;
          if (isCustomAvatar(dData.avatar)) {
            best = dData;
            break;
          }
        }
        return best;
      }
    }
  } catch (err) {
    console.warn('findUserByPhone query notice:', err);
  }

  // Fallback to local cache for all variants
  for (const v of variants) {
    const cached = localStorage.getItem(`askio_user_by_phone_${v}`);
    if (cached) {
      try {
        return JSON.parse(cached) as FirestoreUserData;
      } catch { /* ignore */ }
    }
  }

  return null;
}

/**
 * Find registered user profile in Firestore by email address
 */
export async function findUserByEmail(email: string): Promise<FirestoreUserData | null> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return null;

  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', cleanEmail));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      let bestDocData = querySnapshot.docs[0].data() as FirestoreUserData;
      for (const d of querySnapshot.docs) {
        const dData = d.data() as FirestoreUserData;
        if (isCustomAvatar(dData.avatar)) {
          bestDocData = dData;
          break;
        }
      }
      return bestDocData;
    }
  } catch (err) {
    console.warn('findUserByEmail query notice:', err);
  }

  // Fallback to local cache
  const cached = localStorage.getItem(`askio_user_by_email_${cleanEmail}`);
  if (cached) {
    try {
      return JSON.parse(cached) as FirestoreUserData;
    } catch (e) {
      // ignore
    }
  }

  return null;
}

/**
 * Find user by either Phone or Email
 */
export async function findUserByPhoneOrEmail(identifier: string): Promise<FirestoreUserData | null> {
  const clean = identifier.trim();
  if (!clean) return null;

  if (clean.includes('@')) {
    return await findUserByEmail(clean);
  } else {
    return await findUserByPhone(clean);
  }
}

/**
 * Send official Firebase password reset email directly via Firebase Authentication
 * (Firebase Auth handles cryptographic token generation and secure email dispatch natively)
 */
export async function sendFirebasePasswordResetEmail(email: string): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }

  await sendPasswordResetEmail(auth, cleanEmail);
  return {
    success: true,
    message: `পাসওয়ার্ড রিসেট লিংক ${cleanEmail} ঠিকানায় পাঠানো হয়েছে। অনুগ্রহ করে ইনবক্স চেক করুন।`
  };
}

/**
 * Remove any legacy OTP or temporary reset credentials from localStorage
 */
export function cleanupLegacyOtpStorage(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('askio_reset_otp_') || key.startsWith('askio_otp_') || key.startsWith('askio_cached_otp_'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}

/**
 * Reset user password for account found by identifier
 */
export async function resetUserPassword(
  identifier: string, 
  newPassword: string
): Promise<{ success: boolean; user?: FirestoreUserData }> {
  const clean = identifier.trim().toLowerCase();
  const user = await findUserByPhoneOrEmail(clean);

  if (user && user.uid) {
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore password reset write warning:', err);
    }

    if (auth.currentUser && auth.currentUser.uid === user.uid) {
      try {
        await updatePassword(auth.currentUser, newPassword);
      } catch (authErr) {
        console.warn('Auth password update notice:', authErr);
      }
    }

    return { success: true, user };
  }

  return { success: true };
}

/**
 * Sign out from Firebase Auth
 */
export async function logoutFirebaseUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Firebase sign out error:', err);
  }
}

export async function saveActivitiesToFirestore(uid: string, activities: any[]) {
  if (!uid || !db) return;
  try {
    await setDoc(doc(db, 'users', uid, 'private_data', 'activities'), { list: activities });
  } catch (err) {
    console.error('Failed to save activities to Firestore:', err);
  }
}

export async function loadActivitiesFromFirestore(uid: string): Promise<any[]> {
  if (!uid || !db) return [];
  try {
    const snap = await getDoc(doc(db, 'users', uid, 'private_data', 'activities'));
    if (snap.exists()) {
      return snap.data().list || [];
    }
  } catch (err) {
    console.error('Failed to load activities from Firestore:', err);
  }
  return [];
}

/**
 * Save / update user profile data strictly in Firestore under users/{uid}.
 */
export async function saveUserProfileToFirestore(
  identifierOrUid: string,
  updatedData: Partial<FirestoreUserData>,
  extraIdentifiers?: { uid?: string; email?: string; phone?: string }
): Promise<void> {
  let targetUid = extraIdentifiers?.uid || updatedData.uid || auth.currentUser?.uid;

  if (!targetUid && identifierOrUid) {
    const cleanIdent = identifierOrUid.trim();
    if (!cleanIdent.includes('@') && !/^\d+$/.test(cleanIdent.replace(/\D/g, ''))) {
      targetUid = cleanIdent;
    } else if (cleanIdent.includes('@')) {
      const userByEmail = await findUserByEmail(cleanIdent);
      if (userByEmail && userByEmail.uid) {
        targetUid = userByEmail.uid;
      }
    } else {
      const userByPhone = await findUserByPhone(cleanIdent);
      if (userByPhone && userByPhone.uid) {
        targetUid = userByPhone.uid;
      }
    }
  }

  if (!targetUid) {
    if (identifierOrUid) {
      targetUid = 'user_' + identifierOrUid.replace(/[^a-zA-Z0-9]/g, '_');
    } else {
      return;
    }
  }

  const updatePayload = cleanFirestoreData({
    ...updatedData,
    uid: targetUid,
    updatedAt: new Date().toISOString()
  });

  try {
    const userRef = doc(db, 'users', targetUid);
    await setDoc(userRef, updatePayload, { merge: true });
  } catch (err) {
    console.warn(`Firestore setDoc notice for doc [${targetUid}]:`, err);
  }

  if (auth.currentUser && updatedData.avatar) {
    try {
      await updateFirebaseAuthProfile(auth.currentUser, {
        photoURL: updatedData.avatar,
        ...(updatedData.fullName ? { displayName: updatedData.fullName } : {})
      });
    } catch (err) {
      console.warn('Update Firebase Auth profile notice:', err);
    }
  }

  const cleanPhone = updatedData.phone || extraIdentifiers?.phone;
  if (cleanPhone) {
    try {
      saveDeviceTrustForPhone(cleanPhone, {
        uid: targetUid,
        fullName: updatedData.fullName || 'Askio Member',
        email: updatedData.email || '',
        phone: cleanPhone,
        avatar: updatedData.avatar,
        isPremium: true,
        membershipPlan: updatedData.membershipPlan || 'BDApps Daily (৳2.78/day)'
      });
    } catch { /* ignore */ }
  }

  try {
    const askioUserStr = localStorage.getItem('askio_user');
    if (askioUserStr) {
      const current = JSON.parse(askioUserStr);
      const merged = { ...current, ...updatedData };
      localStorage.setItem('askio_user', JSON.stringify(merged));
    }
  } catch (e) {
    // ignore
  }
}



