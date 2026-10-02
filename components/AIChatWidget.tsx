'use client';
import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';

// 🌟 BULLETPROOF MARKDOWN FORMATTER
function formatMarkdown(text: string) {
  if (!text) return '';
  return text
    .replace(/^### (.*$)/gim, '<h4 class="text-purple-300 font-extrabold text-sm mt-3 mb-1.5 tracking-tight">$1</h4>')
    .replace(/^## (.*$)/gim, '<h3 class="text-white font-black text-base mt-3 mb-1.5 tracking-tight">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<strong class="text-white font-bold">$1</strong>')
    .replace(/^- (.*$)/gim, '<div class="flex items-start gap-2 my-1.5 ml-1"><span class="text-purple-400 font-bold mt-0.5">•</span><span class="text-gray-300 leading-snug">$1</span></div>')
    .replace(/^\* (.*$)/gim, '<div class="flex items-start gap-2 my-1.5 ml-1"><span class="text-purple-400 font-bold mt-0.5">•</span><span class="text-gray-300 leading-snug">$1</span></div>')
    .replace(/^(\d+)\. (.*$)/gim, '<div class="flex items-start gap-2 my-1.5 ml-1"><span class="text-purple-400 font-bold text-xs mt-0.5">$1.</span><span class="text-gray-300 leading-snug">$2</span></div>')
    .replace(/\n\n/g, '<div class="h-2.5"></div>')
    .replace(/\n/g, '<br />');
}

// 🌟 FLAWLESS TYPEWRITER ANIMATION (No more 'undefined' bugs!)
function ChatMessageContent({ text, isLastBot }: { text: string; isLastBot: boolean }) {
  const [displayedText, setDisplayedText] = useState(isLastBot ? '' : text);

  useEffect(() => {
    if (!isLastBot) {
      setDisplayedText(text);
      return;
    }

    let currentIdx = 0;
    setDisplayedText('');

    // Renders 3 characters at a time for a smooth, fast streaming effect
    const interval = setInterval(() => {
      currentIdx += 3; 
      if (currentIdx <= text.length) {
        setDisplayedText(text.slice(0, currentIdx));
      } else {
        setDisplayedText(text);
        clearInterval(interval);
      }
    }, 15); 

    return () => clearInterval(interval);
  }, [text, isLastBot]);

  return (
    <div 
      className="text-sm leading-relaxed break-words whitespace-normal text-gray-200"
      dangerouslySetInnerHTML={{ __html: formatMarkdown(displayedText) }} 
    />
  );
}

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    { role: 'model', text: 'Hi there! 👋 I am **PrimeBot**.\n\nHow can I help you with your NewarPrime journey today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    const newMessages = [...messages, { role: 'user', text: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages.slice(1)
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages([...newMessages, { role: 'model', text: data.text }]);
      } else {
        setMessages([...newMessages, { role: 'model', text: `🚨 Error: ${data.error || 'Something went wrong.'}` }]);
      }
    } catch {
      setMessages([...newMessages, { role: 'model', text: '🚨 Network error. Please check your internet connection.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-[100]">
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[330px] sm:w-[420px] h-[520px] max-h-[75vh] bg-[#0a0a0a] border border-gray-800 rounded-3xl shadow-[0_0_50px_rgba(147,51,234,0.3)] flex flex-col overflow-hidden animate-scale-up origin-bottom-right">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-900/60 via-[#0d0d0d] to-blue-900/60 p-4 border-b border-gray-800 flex justify-between items-center backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center shadow-lg border border-white/10">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-extrabold text-sm tracking-wide">PrimeBot AI</h3>
                <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Online
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-gray-400 hover:text-white p-1.5 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 bg-[#050505] scroll-smooth">
            {messages.map((msg, idx) => {
              const isLastBot = msg.role === 'model' && idx === messages.length - 1 && !isLoading;
              return (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[88%] p-3.5 rounded-2xl shadow-md ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-neutral-900/90 border border-white/5 rounded-tl-none'
                    }`}
                  >
                    <ChatMessageContent text={msg.text} isLastBot={isLastBot} />
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="p-3.5 rounded-2xl bg-neutral-900/90 border border-white/5 rounded-tl-none flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3.5 bg-[#0a0a0a] border-t border-gray-800">
            <form onSubmit={sendMessage} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about courses, tiers, earnings..."
                className="w-full bg-neutral-900 border border-gray-700/80 text-white text-sm rounded-full pl-4 pr-12 py-3 focus:outline-none focus:border-purple-500 transition-colors placeholder:text-gray-500"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-1.5 p-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-full transition-all disabled:opacity-40"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 relative ${
          isOpen
            ? 'bg-gray-800 border border-gray-700 shadow-xl'
            : 'bg-gradient-to-r from-purple-600 to-blue-600 shadow-[0_0_35px_rgba(147,51,234,0.7)] animate-bounce hover:animate-none'
        }`}
      >
        {isOpen ? <X size={24} className="text-white" /> : <Bot size={28} className="text-white" />}
      </button>
    </div>
  );
}