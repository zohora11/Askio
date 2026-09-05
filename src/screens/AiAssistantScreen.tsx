import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  Send, 
  Trash2, 
  User, 
  Bot, 
  Eye, 
  HeartPulse, 
  Calendar, 
  BookOpen, 
  Copy, 
  Check,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { SUGGESTED_AI_PROMPTS } from '../data/mockData';
import { ChatbotAvatar } from '../components/ChatbotAvatar';
import { t } from '../constants/translations';

// Helper to render inline markdown styling
const renderFormattedInline = (line: string): React.ReactNode => {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*.*?\*\*|`.*?`|\*.*?\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(line.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-semibold text-zinc-900 dark:text-zinc-50">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={match.index} className="px-1.5 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-700/80 font-mono text-xs text-emerald-600 dark:text-emerald-400">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={match.index} className="italic text-zinc-700 dark:text-zinc-300">
          {token.slice(1, -1)}
        </em>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < line.length) {
    parts.push(line.substring(lastIndex));
  }

  return parts.length > 0 ? parts : line;
};

const FormattedMessage: React.FC<{ content: string; isUser: boolean }> = ({ content, isUser }) => {
  if (isUser) {
    return <div className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{content}</div>;
  }

  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockBuffer: string[] = [];
  let codeBlockLang = '';

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        renderedElements.push(
          <div key={`code-${idx}`} className="my-2 p-3 rounded-xl bg-zinc-900 text-zinc-100 dark:bg-black font-mono text-xs overflow-x-auto border border-zinc-800">
            {codeBlockLang && <div className="text-[10px] uppercase text-zinc-400 font-bold mb-1 tracking-wider">{codeBlockLang}</div>}
            <pre className="whitespace-pre">{codeBlockBuffer.join('\n')}</pre>
          </div>
        );
        codeBlockBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeBlockLang = trimmed.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockBuffer.push(line);
      continue;
    }

    if (!trimmed) {
      renderedElements.push(<div key={`empty-${idx}`} className="h-1.5" />);
      continue;
    }

    if (trimmed === '---' || trimmed === '***') {
      renderedElements.push(<hr key={`hr-${idx}`} className="my-2.5 border-zinc-200 dark:border-zinc-700/80" />);
      continue;
    }

    if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
      const headerText = trimmed.replace(/^#+\s*/, '');
      renderedElements.push(
        <h4 key={`h-${idx}`} className="font-bold text-zinc-900 dark:text-white pt-2 pb-0.5 text-base sm:text-lg">
          {renderFormattedInline(headerText)}
        </h4>
      );
      continue;
    }

    if (trimmed.startsWith('• ') || trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      const bulletText = trimmed.replace(/^([•\*\-]\s*)/, '');
      renderedElements.push(
        <div key={`b-${idx}`} className="flex items-start gap-2 pl-1 my-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
          <div className="flex-1">{renderFormattedInline(bulletText)}</div>
        </div>
      );
      continue;
    }

    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      const num = numMatch[1];
      const text = numMatch[2];
      renderedElements.push(
        <div key={`n-${idx}`} className="flex items-start gap-2 pl-1 my-0.5">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400 min-w-[1.2rem] text-xs sm:text-sm mt-0.5">
            {num}.
          </span>
          <div className="flex-1">{renderFormattedInline(text)}</div>
        </div>
      );
      continue;
    }

    renderedElements.push(
      <p key={`p-${idx}`} className="leading-relaxed">
        {renderFormattedInline(line)}
      </p>
    );
  }

  // If code block wasn't closed
  if (inCodeBlock && codeBlockBuffer.length > 0) {
    renderedElements.push(
      <div key="code-unclosed" className="my-2 p-3 rounded-xl bg-zinc-900 text-zinc-100 dark:bg-black font-mono text-xs overflow-x-auto border border-zinc-800">
        <pre className="whitespace-pre">{codeBlockBuffer.join('\n')}</pre>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 text-sm sm:text-base leading-relaxed text-zinc-800 dark:text-zinc-200">
      {renderedElements}
    </div>
  );
};

export const AiAssistantScreen: React.FC = () => {
  const { chatMessages, sendChatMessage, clearChatHistory, isAiGenerating, language } = useApp();
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiGenerating]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(inputText);
    setInputText('');
  };

  const handlePromptChipClick = (prompt: string) => {
    sendChatMessage(prompt);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[550px] max-w-4xl mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-lg animate-fade-in">
      {/* Header with Live Guide Status Indicator */}
      <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <ChatbotAvatar sizeClassName="w-10 h-10" showOnlineBadge={false} />

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                {t('ai.title', language)}
              </h2>
              <span className="hidden sm:inline px-2 py-0.5 text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 rounded-full">
                Gemini Live
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>{language === 'bn' ? 'অনলাইন • যেকোনো প্রশ্ন টাইপ করুন' : 'Online • Ask anything in English or বাংলা'}</span>
            </div>
          </div>
        </div>

        <button
          id="clear-chat-btn"
          onClick={clearChatHistory}
          className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
          title="Clear conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Suggestion Chips */}
      <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-200/80 dark:border-zinc-800/80 overflow-x-auto flex items-center gap-2 scrollbar-none">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 pl-1 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" /> Prompts:
        </span>
        {SUGGESTED_AI_PROMPTS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handlePromptChipClick(item.prompt)}
            className="px-3 py-1.5 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:border-emerald-500 dark:hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 whitespace-nowrap transition-all shadow-2xs hover:scale-[1.02]"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
        {chatMessages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="shrink-0 bg-transparent flex items-center justify-center mt-0.5">
                  <ChatbotAvatar sizeClassName="w-8 h-8" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 sm:p-5 shadow-xs transition-all ${
                  isUser
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-tr-xs'
                    : msg.isError
                    ? 'bg-amber-50/90 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 rounded-tl-xs border border-amber-300/80 dark:border-amber-700/80'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-xs border border-zinc-200/60 dark:border-zinc-700/60'
                }`}
              >
                {/* Context badge if present */}
                {msg.contextResource && (
                  <div className="mb-2.5 px-3 py-1.5 rounded-xl bg-black/10 dark:bg-white/10 text-xs flex items-center gap-1.5 font-medium">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Inquiring about: <strong>{msg.contextResource.title}</strong></span>
                  </div>
                )}

                <FormattedMessage content={msg.text} isUser={isUser} />

                <div className="flex items-center justify-between gap-4 mt-2.5 pt-2 border-t border-black/10 dark:border-white/10 text-[11px] opacity-70">
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => handleCopyText(msg.id, msg.text)}
                      className="flex items-center gap-1 hover:opacity-100 transition-opacity"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isAiGenerating && (
          <div className="flex gap-3 justify-start">
            <div className="shrink-0 bg-transparent flex items-center justify-center">
              <ChatbotAvatar sizeClassName="w-8 h-8" />
            </div>
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-3xl rounded-tl-xs p-4 flex items-center gap-2 border border-zinc-200/60 dark:border-zinc-700/60 text-xs text-zinc-500">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              <span>Askio AI is synthesizing guidance...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={handleSend}
        className="p-3 sm:p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
      >
        <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
          <input
            type="text"
            id="ai-chat-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask AI anything: book summaries, PDF guides, coding, research..."
            className="flex-1 bg-transparent text-sm sm:text-base text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-400 py-1"
          />
          <button
            type="submit"
            id="send-ai-chat-btn"
            disabled={!inputText.trim() || isAiGenerating}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white transition-all shrink-0"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-between text-[11px] text-zinc-400 px-2 mt-2">
          <span>Askio AI search & assistance engine in English and বাংলা.</span>
          <span className="hidden sm:inline">Press Enter to send</span>
        </div>
      </form>
    </div>
  );
};
