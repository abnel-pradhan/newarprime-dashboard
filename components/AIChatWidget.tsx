'use client';
import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: string, text: string}[]>([
    { role: 'model', text: 'Hi there! 👋 I am PrimeBot. How can I help you with your NewarPrime journey today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    } catch (error) {
      setMessages([...newMessages, { role: 'model', text: '🚨 Network error. Please check your internet connection.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-[100]">
      
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[320px] sm:w-[400px] h-[500px] max-h-[70vh] bg-[#0a0a0a] border border-gray-800 rounded-2xl shadow-[0_0_50px_rgba(147,51,234,0.3)] flex flex-col overflow-hidden animate-scale-up origin-bottom-right">
          
          <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-4 border-b border-gray-800 flex justify-between items-center backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">PrimeBot AI</h3>
                <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Online
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white p-1 hover:bg-white/10 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* 🌟 BUG FIX: Added overflow-x-hidden to prevent horizontal scrolling */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 bg-[#050505] scroll-smooth">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {/* 🌟 BUG FIX: Added break-words to force long unbroken text (like URLs) to wrap */}
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm break-words ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-sm' 
                    : 'bg-neutral-900 border border-gray-800 text-gray-200 rounded-tl-sm'
                }`}>
                  <div className="break-words" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] p-4 rounded-2xl bg-neutral-900 border border-gray-800 rounded-tl-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-[#0a0a0a] border-t border-gray-800">
            <form onSubmit={sendMessage} className="relative flex items-center">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..." 
                className="w-full bg-neutral-900 border border-gray-700 text-white text-sm rounded-full pl-4 pr-12 py-3 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-full transition-colors disabled:opacity-50 disabled:hover:bg-purple-600"
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
            : 'bg-gradient-to-r from-purple-600 to-blue-600 shadow-[0_0_40px_rgba(147,51,234,0.8)] animate-bounce hover:animate-none'
        }`}
      >
        {isOpen ? <X size={24} className="text-white" /> : <Bot size={28} className="text-white" />}
      </button>
    </div>
  );
}