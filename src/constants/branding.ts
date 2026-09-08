/**
 * Branding and Identity Assets
 * Provided by user:
 * - App Logo & Favicon Imgur: https://imgur.com/a/XvWGMcR -> Direct CDN: https://i.imgur.com/u7GpoWr.png
 * - AI Chatbot Avatar Imgur: https://imgur.com/a/xAY6iEy -> Direct CDN: https://i.imgur.com/t3kqUA7.png
 */

// App Logo & Favicon
export const APP_LOGO_IMGUR_PAGE = 'https://imgur.com/a/XvWGMcR';
export const APP_LOGO_URL = 'https://i.imgur.com/u7GpoWr.png';
export const APP_LOGO_FALLBACK = '/app-logo.png';

// AI Chatbot Avatar
export const AI_CHATBOT_IMGUR_PAGE = 'https://imgur.com/a/xAY6iEy';
export const AI_CHATBOT_AVATAR_URL = 'https://i.imgur.com/t3kqUA7.png';
export const AI_CHATBOT_AVATAR_FALLBACK = '/chatbot-avatar.png';

// Official Askio Android APK Download URL (GitHub Releases direct link)
export const ASKIO_APK_URL = 'https://github.com/zohora11/Askio/releases/download/Askio_Apk/Askio.apk';
export const APK_FILENAME = 'Askio.apk';
export const APK_FILE_SIZE = '18.4 MB';
export const APK_VERSION = 'v2.4';

/**
 * Initiates the direct browser download of the Askio Android APK from GitHub Releases.
 * Uses a clean standard browser anchor element without creating local files.
 */
export const triggerApkDownload = () => {
  try {
    const link = document.createElement('a');
    link.href = ASKIO_APK_URL;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('download', 'Askio.apk');
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      try {
        document.body.removeChild(link);
      } catch {
        // Element may already have been removed
      }
    }, 200);
  } catch (err) {
    console.warn('Fallback opening APK URL:', err);
    window.open(ASKIO_APK_URL, '_blank', 'noopener,noreferrer');
  }
};
