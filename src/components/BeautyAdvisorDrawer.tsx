import { useState, type FormEvent } from 'react';
import { Loader2, Send, Sparkles, X } from 'lucide-react';
import type { Language } from '../types.ts';
import { UI_STRINGS } from '../lib/i18n.ts';
import { askBeautyAdvisor } from '../lib/api.ts';

interface BeautyAdvisorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export function BeautyAdvisorDrawer({ isOpen, onClose, lang }: BeautyAdvisorDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const t = UI_STRINGS[lang].advisor;

  async function sendQuestion(questionText: string) {
    const clean = questionText.trim();
    if (!clean || loading) return;

    const nextHistory = [...messages, { role: 'user' as const, text: clean }];
    setMessages(nextHistory);
    setInput('');
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await askBeautyAdvisor({
        message: clean,
        language: lang,
        history: messages,
      });
      setMessages([...nextHistory, { role: 'assistant', text: res.reply }]);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to reach advisor.');
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void sendQuestion(input);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#2A1620]/35 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="advisor-title"
    >
      <div className="bg-white w-full max-w-md h-full flex flex-col border-s border-[#F4DAE4] shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 bg-[#FFF7FA] border-b border-[#F4DAE4] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#FCE8F0] text-[#CC4B7C] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 id="advisor-title" className="font-display text-lg font-bold text-[#2A1620]">
                {t.title}
              </h2>
              <p className="text-xs text-[#6E515E]">{t.subtitle}</p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="w-9 h-9 rounded-lg border border-[#F4DAE4] bg-white flex items-center justify-center text-[#2A1620] hover:bg-[#FCE8F0] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="p-4 bg-[#FFF7FA] border border-[#F4DAE4] rounded-2xl text-sm text-[#2A1620] leading-relaxed">
            {t.welcome}
          </div>

          {messages.length === 0 && (
            <div className="space-y-2 pt-1">
              {t.quickPrompts.map((promptText, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => void sendQuestion(promptText)}
                  className="w-full text-start p-3 bg-white hover:bg-[#FFF7FA] border border-[#F4DAE4] rounded-xl text-xs sm:text-sm text-[#6E515E] hover:text-[#2A1620] transition-colors cursor-pointer"
                >
                  {promptText}
                </button>
              ))}
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[88%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-[#CC4B7C] text-white'
                    : 'bg-[#FFF7FA] border border-[#F4DAE4] text-[#2A1620]'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#9D2F5A] px-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t.thinking}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-[#FFF7FA] border border-[#CC4B7C] rounded-xl text-xs text-[#9D2F5A]">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="p-4 bg-white border-t border-[#F4DAE4] flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.placeholder}
            disabled={loading}
            className="flex-1 min-h-[44px] px-3.5 py-2 bg-[#FFF9FB] border border-[#F4DAE4] rounded-xl text-sm text-[#2A1620] placeholder:text-[#9C7D8B] focus:outline-none focus:border-[#CC4B7C]"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label={t.send}
            className="min-w-[44px] min-h-[44px] px-4 bg-[#CC4B7C] hover:bg-[#B43A69] disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
