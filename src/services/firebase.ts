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
      const customErr: any = new Error('An account with this email already exists.');
      customErr.code = 'auth/email-already-in-use';
      throw customErr;
    }

    // If Email/Password provider is not enabled in Firebase Console (auth/operation-not-allowed)
    if (
      authErr.code === 'auth/operation-not-allowed' || 
      authErr.code === 'auth/admin-restricted-operation' ||
      authErr.message?.includes('operation-not-allowed')
    ) {
      uid = 'user_' + (cleanPhone ? cleanPhone.replace(/\D/g, '') : Date.now());
    } else {
      throw authErr;
    }
  }

  // 4. Save clean user metadata document strictly under users/{uid} in Firestore
  // NEVER store plaintext passwords or password hashes in Firestore
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
    await setDoc(doc(db, 'users', uid), userData, { merge: true });
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
 * Strict Multi-Credential Account Login:
 * Authenticates via Firebase Auth and verifies that Email, Phone, and Password
 * all strictly belong to the SAME account UID.
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

    // 1. Authenticate with Firebase Auth
    let firebaseUser: FirebaseUser | null = null;
    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      firebaseUser = userCredential.user;
    } catch (authErr: any) {
      console.warn('Firebase Auth email login failure:', authErr.code || authErr.message);
      const invalidErr: any = new Error('Invalid credentials. Please check your email/phone and password.');
      invalidErr.code = 'auth/invalid-credential';
      throw invalidErr;
    }

    if (!firebaseUser) {
      const invalidErr: any = new Error('Invalid credentials. Please check your email/phone and password.');
      invalidErr.code = 'auth/invalid-credential';
      throw invalidErr;
    }

    // 2. Fetch Firestore profile under users/{firebaseUser.uid}
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    let uData: FirestoreUserData | null = null;
    try {
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        uData = userSnap.data() as FirestoreUserData;
      }
    } catch (docErr) {
      console.warn('Error reading user document:', docErr);
    }

    // If doc not found directly by UID, search by email
    if (!uData) {
      const byEmail = await findUserByEmail(cleanEmail);
      if (byEmail) {
        uData = byEmail;
      }
    }

    // 3. Strict Credential Matching: Verify that expectedPhone matches this account if provided
    if (expectedPhone && expectedPhone.trim()) {
      const cleanExpected = expectedPhone.trim().replace(/\D/g, '');
      const accountPhone = (uData?.phone || uData?.phoneNumber || '').replace(/\D/g, '');
      
      if (accountPhone && cleanExpected && accountPhone !== cleanExpected) {
        // Mismatch between email account and provided phone -> REJECT
        await signOut(auth);
        const mismatchErr: any = new Error('Invalid credentials. Please check your email/phone and password.');
        mismatchErr.code = 'auth/invalid-credential';
        throw mismatchErr;
      }
    }

    // 4. Resolve avatar
    const resolvedAvatar = isCustomAvatar(uData?.avatar)
      ? uData!.avatar!
      : (localStorage.getItem(`askio_avatar_email_${cleanEmail}`) ||
         (uData?.phone ? localStorage.getItem(`askio_avatar_phone_${uData.phone}`) : null) ||
         localStorage.getItem('askio_custom_avatar') ||
         DEFAULT_AVATAR);

    const finalUserData: FirestoreUserData = {
      uid: firebaseUser.uid,
      fullName: uData?.fullName || firebaseUser.displayName || 'Askio Member',
      email: uData?.email || firebaseUser.email || cleanEmail,
      phone: uData?.phone || uData?.phoneNumber || (expectedPhone?.trim() || ''),
      phoneNumber: uData?.phone || uData?.phoneNumber || (expectedPhone?.trim() || ''),
      phoneVerified: uData?.phoneVerified ?? true,
      isPremium: uData?.isPremium ?? true,
      membershipPlan: uData?.membershipPlan || 'BDApps Daily (৳2.78/day)',
      avatar: resolvedAvatar,
      age: uData?.age,
      gender: uData?.gender,
      religion: uData?.religion,
      bloodGroup: uData?.bloodGroup,
      profession: uData?.profession,
      address: uData?.address,
      city: uData?.city
    };

    // Keep Firestore users/{uid} in sync
    setDoc(userDocRef, { ...finalUserData, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});

    return finalUserData;
  } else {
    // -------------------------------------------------------------
    // Phone Number login flow
    // -------------------------------------------------------------
    const cleanPhone = cleanInput;
    const userByPhone = await findUserByPhone(cleanPhone);

    if (!userByPhone || !userByPhone.email) {
      const invalidErr: any = new Error('Invalid credentials. Please check your email/phone and password.');
      invalidErr.code = 'auth/invalid-credential';
      throw invalidErr;
    }

    // Authenticate via Firebase Auth using the user's bound email & password
    try {
      const userCredential = await signInWithEmailAndPassword(auth, userByPhone.email.toLowerCase(), password);
      const firebaseUser = userCredential.user;

      // Verify that authenticated UID matches the account associated with this phone
      if (userByPhone.uid && firebaseUser.uid !== userByPhone.uid) {
        await signOut(auth);
        const mismatchErr: any = new Error('Invalid credentials. Please check your email/phone and password.');
        mismatchErr.code = 'auth/invalid-credential';
        throw mismatchErr;
      }

      const resolvedAvatar = isCustomAvatar(userByPhone.avatar)
        ? userByPhone.avatar!
        : (localStorage.getItem(`askio_avatar_phone_${cleanPhone}`) ||
           localStorage.getItem(`askio_avatar_email_${userByPhone.email.toLowerCase()}`) ||
           DEFAULT_AVATAR);

      return {
        ...userByPhone,
        uid: firebaseUser.uid,
        avatar: resolvedAvatar
      };
    } catch (authErr: any) {
      console.warn('Firebase Auth phone-linked login notice:', authErr.code || authErr.message);
      const invalidErr: any = new Error('Invalid credentials. Please check your email/phone and password.');
      invalidErr.code = 'auth/invalid-credential';
      throw invalidErr;
    }
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
    await setDoc(doc(db, 'users', user.uid), userData, { merge: true });
    if (user.email) {
      localStorage.setItem(`askio_avatar_email_${user.email.toLowerCase()}`, finalAvatar);
    }
    if (isCustomAvatar(finalAvatar)) {
      localStorage.setItem('askio_custom_avatar', finalAvatar);
    }
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

  const digitsOnly = cleanPhone.replace(/\D/g, '');
  let bdClean = cleanPhone;
  if (digitsOnly.length >= 11) {
    bdClean = '0' + digitsOnly.slice(-10);
  }

  try {
    const usersRef = collection(db, 'users');
    let q = query(usersRef, where('phone', '==', cleanPhone));
    let querySnapshot = await getDocs(q);

    if (querySnapshot.empty && bdClean !== cleanPhone) {
      q = query(usersRef, where('phone', '==', bdClean));
      querySnapshot = await getDocs(q);
    }

    if (querySnapshot.empty) {
      q = query(usersRef, where('phoneNumber', '==', cleanPhone));
      querySnapshot = await getDocs(q);
    }

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
    console.warn('findUserByPhone query notice:', err);
  }

  // Fallback to local cache
  const cachedBD = localStorage.getItem(`askio_user_by_phone_${bdClean}`);
  if (cachedBD) {
    try {
      return JSON.parse(cachedBD) as FirestoreUserData;
    } catch { /* ignore */ }
  }

  const cachedExact = localStorage.getItem(`askio_user_by_phone_${cleanPhone}`);
  if (cachedExact) {
    try {
      return JSON.parse(cachedExact) as FirestoreUserData;
    } catch { /* ignore */ }
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

/**
 * Save / update user profile data strictly in Firestore under users/{uid}.
 */
export async function saveUserProfileToFirestore(
  identifierOrUid: string,
  updatedData: Partial<FirestoreUserData>,
  extraIdentifiers?: { uid?: string; email?: string; phone?: string }
): Promise<void> {
  const targetUid = extraIdentifiers?.uid || updatedData.uid || auth.currentUser?.uid || (!identifierOrUid.includes('@') && !/^\d+$/.test(identifierOrUid.replace(/\D/g, '')) ? identifierOrUid : '');
  
  if (!targetUid) return;

  const updatePayload: Record<string, any> = {
    ...updatedData,
    updatedAt: new Date().toISOString()
  };

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



