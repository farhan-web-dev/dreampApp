import React, { useState, useEffect, useRef } from 'react';
import { createChatSession, sendMessageStream } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { GenerateContentResponse } from '@google/genai';

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session on mount
    chatSessionRef.current = createChatSession();
    
    // Add initial greeting
    setMessages([
      {
        id: 'init',
        role: 'model',
        text: 'Hello! I am your AI wedding planning assistant. Ask me anything about themes, etiquette, or planning tips.',
        timestamp: Date.now(),
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatSessionRef.current) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const resultStream = await sendMessageStream(chatSessionRef.current, userMsg.text);
      
      const botMsgId = (Date.now() + 1).toString();
      let fullResponse = '';

      // Add placeholder bot message
      setMessages((prev) => [
        ...prev,
        { id: botMsgId, role: 'model', text: '', timestamp: Date.now() },
      ]);

      for await (const chunk of resultStream) {
        const c = chunk as GenerateContentResponse;
        const text = c.text || '';
        fullResponse += text;
        
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMsgId ? { ...msg, text: fullResponse } : msg
          )
        );
      }
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'model', text: "I'm sorry, I encountered an error. Please try again.", timestamp: Date.now() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
      {/* Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-700 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-serif text-lg text-rose-100">Wedding Planner AI</h3>
          <p className="text-xs text-slate-400">Powered by Gemini 3 Pro</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-slate-600' : 'bg-rose-500'
              }`}
            >
              {msg.role === 'user' ? (
                <User className="w-4 h-4 text-slate-200" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-slate-700 text-slate-100 rounded-tr-none'
                  : 'bg-rose-900/40 text-rose-50 rounded-tl-none border border-rose-900/50'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
             <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center shrink-0">
               <Bot className="w-4 h-4 text-white" />
             </div>
             <div className="bg-rose-900/40 px-4 py-3 rounded-2xl rounded-tl-none border border-rose-900/50">
               <Loader2 className="w-4 h-4 animate-spin text-rose-300" />
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-900 border-t border-slate-700">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about wedding themes, dresses, or tips..."
            className="w-full bg-slate-800 text-slate-100 rounded-xl pl-4 pr-12 py-3 border border-slate-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 placeholder-slate-500 transition-all"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg disabled:opacity-50 disabled:hover:bg-rose-600 transition-colors"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;