import React from 'react';
import { AI_CHATBOT_AVATAR_URL, AI_CHATBOT_AVATAR_FALLBACK } from '../constants/branding';

interface ChatbotAvatarProps {
  className?: string;
  sizeClassName?: string;
  showOnlineBadge?: boolean;
}

export const ChatbotAvatar: React.FC<ChatbotAvatarProps> = ({
  className = '',
  sizeClassName = 'w-9 h-9',
  showOnlineBadge = false
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center bg-transparent shrink-0 ${className}`}>
      <img
        src={AI_CHATBOT_AVATAR_URL}
        onError={(e) => {
          if (e.currentTarget.src !== AI_CHATBOT_AVATAR_FALLBACK) {
            e.currentTarget.src = AI_CHATBOT_AVATAR_FALLBACK;
          }
        }}
        alt="Askio Genie"
        className={`${sizeClassName} object-contain bg-transparent`}
        loading="eager"
      />
      {showOnlineBadge && (
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full animate-pulse" />
      )}
    </div>
  );
};
