import { FirestoreUserData } from './firebase';
import { validateMobileNumber } from './bdapps';

const TRUSTED_DEVICE_PREFIX = 'askio_device_trust_';

/**
 * Save device trust token for a phone number on the current device
 */
export function saveDeviceTrustForPhone(phone: string, userData: FirestoreUserData): void {
  try {
    const { cleaned } = validateMobileNumber(phone);
    const cleanPhone = cleaned || phone.trim();
    if (!cleanPhone) return;

    const payload: FirestoreUserData & { trustedAt: number } = {
      ...userData,
      phone: cleanPhone,
      trustedAt: Date.now()
    };

    localStorage.setItem(`${TRUSTED_DEVICE_PREFIX}${cleanPhone}`, JSON.stringify(payload));
    localStorage.setItem('askio_last_trusted_phone', cleanPhone);
  } catch (err) {
    console.warn('Failed to save device trust:', err);
  }
}

/**
 * Check if the current device is trusted for a phone number
 */
export function isDeviceTrustedForPhone(phone: string): boolean {
  return getTrustedDeviceUser(phone) !== null;
}

/**
 * Retrieve saved user credentials/profile for a trusted phone number on this device
 */
export function getTrustedDeviceUser(phone: string): FirestoreUserData | null {
  try {
    const { cleaned } = validateMobileNumber(phone);
    const cleanPhone = cleaned || phone.trim();
    if (!cleanPhone) return null;

    const raw = localStorage.getItem(`${TRUSTED_DEVICE_PREFIX}${cleanPhone}`);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (parsed && (parsed.uid || parsed.email) && parsed.phone === cleanPhone) {
      return parsed as FirestoreUserData;
    }
  } catch (err) {
    console.warn('Failed to parse device trust data:', err);
  }
  return null;
}

/**
 * Remove device trust for a phone number
 */
export function clearDeviceTrustForPhone(phone: string): void {
  try {
    const { cleaned } = validateMobileNumber(phone);
    const cleanPhone = cleaned || phone.trim();
    if (cleanPhone) {
      localStorage.removeItem(`${TRUSTED_DEVICE_PREFIX}${cleanPhone}`);
    }
  } catch (err) {
    console.warn('Failed to clear device trust:', err);
  }
}
