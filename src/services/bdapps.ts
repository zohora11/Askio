/**
 * BDApps API Service Integration
 * Base URL: https://bdappsdigitalapps.com/NADB26131_FinalProject/
 * Supported Operators: Robi & Cirkle (018XXXXXXXX, 016XXXXXXXX)
 * Subscription Fee: ৳2.78 per day (including VAT and tax)
 */

export interface CheckSubscriptionResponse {
  subscriptionStatus?: string;
  isSubscribed?: boolean;
  statusCode?: string;
  statusDetail?: string;
  message?: string;
  version?: string;
  subscriberId?: string;
  source?: string;
  [key: string]: any;
}

export interface SendOtpResponse {
  success?: boolean;
  referenceNo?: string | null;
  statusCode?: string;
  statusDetail?: string;
  message?: string;
  subscriberId?: string;
  [key: string]: any;
}

export interface VerifyOtpResponse {
  statusCode?: string;
  subscriptionStatus?: string;
  statusDetail?: string;
  message?: string;
  success?: boolean;
  subscriberId?: string;
  [key: string]: any;
}

export interface UnsubscribeResponse {
  success?: boolean;
  statusCode?: string;
  statusDetail?: string;
  message?: string;
  subscriptionStatus?: string;
  [key: string]: any;
}

export type BdAppsSubscriptionState =
  | 'IDLE'
  | 'CHECKING_SUBSCRIPTION'
  | 'INITIAL_CHARGING_PENDING'
  | 'UNREGISTERED'
  | 'SENDING_OTP'
  | 'OTP_SENT'
  | 'VERIFYING_OTP'
  | 'OTP_VERIFIED'
  | 'FINAL_SUBSCRIPTION_CHECK'
  | 'SUBSCRIBED'
  | 'ERROR';

export interface StoredSession {
  subscribed: boolean;
  mobileNumber: string;
  verifiedAt: number;
}

const BASE_URL = 'https://bdappsdigitalapps.com/NADB26131_FinalProject';
const PROXY_URL = '/api/bdapps/proxy';

/**
 * Clean and validate Bangladeshi Robi & Cirkle mobile numbers
 * Must be exactly 11 digits and start with 018 or 016
 */
export function validateMobileNumber(rawInput: string): {
  isValid: boolean;
  cleaned: string;
  errorMessage?: string;
} {
  if (!rawInput) {
    return { isValid: false, cleaned: '', errorMessage: 'Mobile number is required' };
  }

  // Remove spaces, hyphens, parens
  let cleaned = rawInput.replace(/[\s\-\(\)]/g, '');

  // Strip international prefix if entered (+880 or 880)
  if (cleaned.startsWith('+880')) {
    cleaned = '0' + cleaned.slice(4);
  } else if (cleaned.startsWith('880')) {
    cleaned = '0' + cleaned.slice(3);
  }

  // Check digits only
  if (!/^\d+$/.test(cleaned)) {
    return {
      isValid: false,
      cleaned,
      errorMessage: 'Phone number must contain digits only',
    };
  }

  // Check length
  if (cleaned.length !== 11) {
    return {
      isValid: false,
      cleaned,
      errorMessage: `Phone number must be exactly 11 digits (currently ${cleaned.length})`,
    };
  }

  // Check supported operator prefix (018 for Robi, 016 for Cirkle/Airtel)
  const prefix = cleaned.substring(0, 3);
  if (prefix !== '018' && prefix !== '016') {
    return {
      isValid: false,
      cleaned,
      errorMessage: 'Only Robi (018) and Cirkle (016) numbers are supported',
    };
  }

  return { isValid: true, cleaned };
}

/**
 * Send application/x-www-form-urlencoded POST request
 * Attempts direct call to BDApps first; falls back to server proxy if CORS or network fails
 */
async function callBdAppsApi<T>(action: string, payload: Record<string, string>): Promise<T> {
  const directUrl = `${BASE_URL}/${action}.php`;
  const formParams = new URLSearchParams();
  for (const [k, v] of Object.entries(payload)) {
    formParams.append(k, v);
  }

  // First try direct POST (since BDApps server sends access-control-allow-origin: *)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const res = await fetch(directUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formParams.toString(),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        return json as T;
      } catch (e) {
        console.warn('BDApps returned non-JSON body:', text);
      }
    }
  } catch (err) {
    console.warn(`Direct call to ${action} failed, falling back to server proxy:`, err);
  }

  // Secondary/Fallback via backend Express proxy
  try {
    const proxyRes = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, payload }),
    });

    if (!proxyRes.ok) {
      throw new Error(`Proxy returned HTTP status ${proxyRes.status}`);
    }

    const data = await proxyRes.json();
    return data as T;
  } catch (proxyErr: any) {
    console.error(`BDApps call failed for ${action}:`, proxyErr);
    throw new Error(
      proxyErr?.message || 'Unable to connect to BDApps server. Please check your connection and retry.'
    );
  }
}

/**
 * Evaluate if subscription check response indicates REGISTERED
 */
export function isSubscriptionRegistered(res: CheckSubscriptionResponse | null | undefined): boolean {
  if (!res) return false;

  const status = String(res.subscriptionStatus || '').trim().toUpperCase();
  const isSub = Boolean(res.isSubscribed);
  const code = String(res.statusCode || '').trim().toUpperCase();
  const detail = String(res.statusDetail || '').toLowerCase();

  // If status explicitly REGISTERED or isSubscribed is true
  if (status === 'REGISTERED' || isSub === true) {
    return true;
  }

  // If statusCode is S1000 and indicates success without unregister / pending
  if (code === 'S1000' && !detail.includes('unregistered') && !detail.includes('pending')) {
    if (status !== 'UNREGISTERED' && status !== 'UNKNOWN') {
      return true;
    }
  }

  return false;
}

/**
 * Evaluate if subscription check response indicates INITIAL CHARGING PENDING
 */
export function isInitialChargingPending(res: CheckSubscriptionResponse | null | undefined): boolean {
  if (!res) return false;

  const status = String(res.subscriptionStatus || '').trim().toUpperCase();
  const detail = String(res.statusDetail || '').toLowerCase();
  const message = String(res.message || '').toLowerCase();
  const code = String(res.statusCode || '').trim().toUpperCase();

  if (
    status === 'PENDING' ||
    status === 'CHARGING_PENDING' ||
    status === 'INITIAL_CHARGING_PENDING' ||
    detail.includes('pending') ||
    detail.includes('initial charging') ||
    detail.includes('insufficient balance') ||
    detail.includes('balance') ||
    message.includes('pending') ||
    message.includes('charging') ||
    code === 'E1351' // Common BDApps charging pending code
  ) {
    return true;
  }

  return false;
}

/**
 * Evaluate if subscription check response indicates UNREGISTERED
 */
export function isSubscriptionUnregistered(res: CheckSubscriptionResponse | null | undefined): boolean {
  if (!res) return false;

  const status = String(res.subscriptionStatus || '').trim().toUpperCase();
  const detail = String(res.statusDetail || '').toLowerCase();
  const isSub = res.isSubscribed;

  if (status === 'UNREGISTERED') return true;
  if (isSub === false) return true;
  if (detail.includes('unregistered') || detail.includes('format of the address is invalid')) return true;

  return false;
}

// -------------------------------------------------------------
// API 1: Check Subscription
// -------------------------------------------------------------
export async function checkSubscription(mobile: string): Promise<CheckSubscriptionResponse> {
  const { isValid, cleaned, errorMessage } = validateMobileNumber(mobile);
  if (!isValid) {
    throw new Error(errorMessage || 'Invalid mobile number');
  }

  return callBdAppsApi<CheckSubscriptionResponse>('check_subscription', {
    user_mobile: cleaned,
  });
}

// -------------------------------------------------------------
// API 2: Send OTP
// -------------------------------------------------------------
export async function sendOTP(mobile: string): Promise<SendOtpResponse> {
  const { isValid, cleaned, errorMessage } = validateMobileNumber(mobile);
  if (!isValid) {
    throw new Error(errorMessage || 'Invalid mobile number');
  }

  const res = await callBdAppsApi<SendOtpResponse>('send_otp', {
    user_mobile: cleaned,
  });

  const code = String(res?.statusCode || '').trim().toUpperCase();
  const detail = String(res?.statusDetail || '').toLowerCase();
  if (code.startsWith('E') || detail.includes('fail') || detail.includes('error') || res?.success === false) {
    throw new Error(res?.statusDetail || res?.message || 'ওটিপি পাঠানো সম্ভব হয়নি। মোবাইল নম্বরটি যাচাই করুন।');
  }

  return res;
}

// -------------------------------------------------------------
// API 3: Verify OTP
// -------------------------------------------------------------
export function isOtpVerificationSuccessful(res: VerifyOtpResponse | null | undefined): boolean {
  if (!res) return false;
  const code = String(res.statusCode || '').trim().toUpperCase();
  const detail = String(res.statusDetail || '').toLowerCase();
  const msg = String(res.message || '').toLowerCase();

  if (
    code.startsWith('E') || 
    detail.includes('invalid') || 
    detail.includes('fail') || 
    detail.includes('expire') || 
    detail.includes('error') ||
    msg.includes('invalid') ||
    msg.includes('fail') ||
    msg.includes('error') ||
    res.success === false
  ) {
    return false;
  }

  if (code === 'S1000' || res.success === true || detail.includes('success')) {
    return true;
  }

  if (code && code !== 'S1000') {
    return false;
  }

  return Boolean(res.subscriptionStatus || res.referenceNo || res.subscriberId);
}

export async function verifyOTP(
  mobile: string,
  otp: string,
  referenceNo: string
): Promise<VerifyOtpResponse> {
  const { isValid, cleaned, errorMessage } = validateMobileNumber(mobile);
  if (!isValid) {
    throw new Error(errorMessage || 'Invalid mobile number');
  }

  const cleanOtp = otp.trim();
  if (!cleanOtp) {
    throw new Error('Please enter the OTP');
  }

  const res = await callBdAppsApi<VerifyOtpResponse>('verify_otp', {
    Otp: cleanOtp,
    otp: cleanOtp,
    referenceNo: referenceNo.trim(),
    user_mobile: cleaned,
  });

  if (!isOtpVerificationSuccessful(res)) {
    throw new Error(res?.statusDetail || res?.message || 'ভুল ওটিপি কোড বা ওটিপির মেয়াদ শেষ হয়ে গেছে।');
  }

  return res;
}

// -------------------------------------------------------------
// API 4: Unsubscribe
// -------------------------------------------------------------
export async function unsubscribe(mobile: string): Promise<UnsubscribeResponse> {
  const { isValid, cleaned, errorMessage } = validateMobileNumber(mobile);
  if (!isValid) {
    throw new Error(errorMessage || 'Invalid mobile number');
  }

  return callBdAppsApi<UnsubscribeResponse>('unsubscribe', {
    user_mobile: cleaned,
  });
}

// -------------------------------------------------------------
// Local Storage Session Management
// -------------------------------------------------------------
const SESSION_STORAGE_KEY = 'askio_bdapps_session';
const ACTIVE_SUBSCRIBERS_KEY = 'askio_active_subscribers';

export function isLocalSubscriber(mobileNumber: string): boolean {
  try {
    const { cleaned } = validateMobileNumber(mobileNumber);
    const num = cleaned || mobileNumber;
    const raw = localStorage.getItem(ACTIVE_SUBSCRIBERS_KEY);
    if (!raw) return false;
    const records = JSON.parse(raw);
    return Boolean(records[num] && records[num].subscribed);
  } catch (err) {
    return false;
  }
}

export function markLocalSubscriber(mobileNumber: string): void {
  try {
    const { cleaned } = validateMobileNumber(mobileNumber);
    const num = cleaned || mobileNumber;
    const raw = localStorage.getItem(ACTIVE_SUBSCRIBERS_KEY);
    const records = raw ? JSON.parse(raw) : {};
    records[num] = {
      subscribed: true,
      updatedAt: Date.now()
    };
    localStorage.setItem(ACTIVE_SUBSCRIBERS_KEY, JSON.stringify(records));
    saveSubscriptionSession(num);
  } catch (err) {
    console.warn('Failed to mark local subscriber:', err);
  }
}

export function unmarkLocalSubscriber(mobileNumber: string): void {
  try {
    const { cleaned } = validateMobileNumber(mobileNumber);
    const num = cleaned || mobileNumber;
    const raw = localStorage.getItem(ACTIVE_SUBSCRIBERS_KEY);
    if (raw) {
      const records = JSON.parse(raw);
      if (records[num]) {
        records[num] = {
          subscribed: false,
          unsubscribedAt: Date.now()
        };
        localStorage.setItem(ACTIVE_SUBSCRIBERS_KEY, JSON.stringify(records));
      }
    }
    clearSubscriptionSession();
  } catch (err) {
    console.warn('Failed to unmark local subscriber:', err);
  }
}

export function saveSubscriptionSession(mobileNumber: string): void {
  try {
    const session: StoredSession = {
      subscribed: true,
      mobileNumber,
      verifiedAt: Date.now(),
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.warn('Failed to save subscription session to localStorage:', err);
  }
}

export function getStoredSubscriptionSession(): StoredSession | null {
  try {
    const data = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!data) return null;
    const parsed = JSON.parse(data);
    if (parsed && parsed.subscribed && parsed.mobileNumber) {
      return parsed as StoredSession;
    }
  } catch (err) {
    console.warn('Failed to read subscription session from localStorage:', err);
  }
  return null;
}

export function clearSubscriptionSession(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear subscription session:', err);
  }
}

export const clearSubscriberSession = clearSubscriptionSession;
export const storeSubscriberSession = saveSubscriptionSession;
export function getStoredSubscriberMobile(): string | null {
  const session = getStoredSubscriptionSession();
  return session?.mobileNumber || null;
}
