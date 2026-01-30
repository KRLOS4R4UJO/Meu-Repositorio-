
import React, { useState, useEffect, useRef } from 'react';
import { geminiService } from '../services/geminiService';
import { ShoppingItem } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AIChatProps {
  items: ShoppingItem[];
  onShare: () => void;
}

export const AIChat: React.FC<AIChatProps> = ({ items, onShare }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Olá! Sou seu assistente de compras. Posso ajudar com receitas, economias ou analisar sua lista atual.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // Cria um contexto com os itens atuais da lista
      const listContext = items.length > 0 
        ? `A lista atual do usuário contém: ${items.map(i => `${i.quantity}x ${i.name} (${i.amount}${i.unit})`).join(', ')}.`
        : 'A lista de compras está vazia no momento.';

      const chat = await geminiService.startChat();
      // Envia o contexto como primeira mensagem "invisível" ou no prompt
      const fullPrompt = `Contexto do Sistema: ${listContext}\n\nUsuário: ${userMsg}`;
      
      const result = await chat.sendMessage({ message: fullPrompt });
      setMessages(prev => [...prev, { role: 'model', text: result.text || 'Desculpe, não consegui processar isso.' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Houve um erro na comunicação com o Gemini. Tente novamente.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
        <h3 className="font-bold flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          Gemini Pro Assistant
        </h3>
        <button 
          onClick={onShare}
          className="text-xs bg-indigo-500 hover:bg-indigo-400 px-3 py-1 rounded-full transition flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
          </svg>
          Gerar Link
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-slate-100 text-slate-800 rounded-tl-none'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 p-3 rounded-2xl animate-pulse text-slate-500">
              Pensando...
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-slate-100 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pergunte sobre sua lista..."
          className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <button 
          disabled={loading}
          className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
};
