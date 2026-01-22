import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon, PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { aiGuru } from '../services/api';

const AIGuruChat = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Namaste! I am your AI Guru. How can I guide you on your spiritual journey today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send history excluding the just added user message (as api call will include it if we structured it that way, 
      // but my backend implementation appends the message. 
      // Wait, in my backend: messages = request.history + [{"role": "user", "content": request.message}]
      // So I should pass the current messages (excluding the one I just added locally? No, including?)
      // If I pass `messages` (which includes the new user message), then backend appends it AGAIN?
      // My backend: `messages = request.history + ...`
      // So `request.history` should be previous messages.
      
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      
      const response = await aiGuru.chat(userMessage.content, history);
      
      const botMessage = { role: 'assistant', content: response.data.response };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("AI Guru error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I apologize, but I am having trouble connecting to the cosmic wisdom right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[80vh] border border-amber-100 dark:border-slate-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4 flex justify-between items-center text-white shadow-md">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-6 w-6 animate-pulse" />
            <h2 className="text-xl font-bold">AI Guru</h2>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1 transition-colors">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-slate-800 scrollbar-thin scrollbar-thumb-amber-200 dark:scrollbar-thumb-slate-600">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] p-3 rounded-2xl shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-amber-500 text-white rounded-br-none' 
                    : 'bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-gray-600'
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-700 p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 dark:border-gray-600">
                <div className="flex space-x-2 items-center h-5">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask for guidance..."
              className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all shadow-inner"
              disabled={isLoading}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIGuruChat;
