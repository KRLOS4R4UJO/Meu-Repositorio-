
import React, { useState, useEffect } from 'react';
import { ShoppingItem, AppTab, Wallet } from './types';
import { ShoppingList } from './components/ShoppingList';
import { ReportView } from './components/ReportView';
import { AIChat } from './components/AIChat';
import { WalletManager } from './components/WalletManager';
import { geminiService, decodeAudioData, decodeBase64 } from './services/geminiService';

const App: React.FC = () => {
  const [items, setItems] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('shopping-items');
    return saved ? JSON.parse(saved) : [];
  });

  const [wallets, setWallets] = useState<Wallet[]>(() => {
    const saved = localStorage.getItem('shopping-wallets');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<AppTab>('list');

  // Load shared list from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareData = params.get('share');
    if (shareData) {
      try {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(shareData))));
        if (Array.isArray(decoded) && window.confirm('Uma lista compartilhada foi detectada. Deseja importá-la? Isso substituirá sua lista atual.')) {
          setItems(decoded);
          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (e) {
        console.error("Failed to parse shared list", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('shopping-items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('shopping-wallets', JSON.stringify(wallets));
  }, [wallets]);

  const addItem = (name: string, category: string, price: number, quantity: number, amount: number, unit: string) => {
    const newItem: ShoppingItem = {
      id: Math.random().toString(36).substring(7),
      name,
      category,
      price,
      quantity,
      amount,
      unit,
      completed: false,
      createdAt: Date.now()
    };
    setItems([newItem, ...items]);
  };

  const addWallet = (bankName: string, balance: number, color: string) => {
    const newWallet: Wallet = {
      id: Math.random().toString(36).substring(7),
      bankName,
      balance,
      color,
      lastFour: Math.floor(1000 + Math.random() * 9000).toString()
    };
    setWallets([...wallets, newWallet]);
  };

  const deleteWallet = (id: string) => {
    setWallets(wallets.filter(w => w.id !== id));
  };

  const toggleItem = (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const isCompleting = !item.completed;
    const totalCost = item.price * item.quantity;

    if (wallets.length > 0) {
      const updatedWallets = [...wallets];
      if (isCompleting) {
        let remainingToDebit = totalCost;
        for (let i = 0; i < updatedWallets.length; i++) {
          if (updatedWallets[i].balance >= remainingToDebit) {
            updatedWallets[i].balance -= remainingToDebit;
            remainingToDebit = 0;
            break;
          } else {
            remainingToDebit -= updatedWallets[i].balance;
            updatedWallets[i].balance = 0;
          }
        }
        if (remainingToDebit > 0) updatedWallets[0].balance -= remainingToDebit;
      } else {
        updatedWallets[0].balance += totalCost;
      }
      setWallets(updatedWallets);
    }

    setItems(items.map(i => i.id === id ? { ...i, completed: isCompleting } : i));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleShare = () => {
    try {
      const data = btoa(unescape(encodeURIComponent(JSON.stringify(items))));
      const url = `${window.location.origin}${window.location.pathname}?share=${data}`;
      navigator.clipboard.writeText(url).then(() => {
        alert('Link da lista copiado para a área de transferência!');
      });
    } catch (e) {
      console.error("Error sharing", e);
      alert('Erro ao gerar link de compartilhamento.');
    }
  };

  const totalWalletBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  const getBalanceColorClass = (balance: number) => {
    if (balance > 100) return 'text-slate-800';
    if (balance > 50) return 'text-yellow-500';
    if (balance > 20) return 'text-red-500';
    return 'text-orange-600';
  };

  const readListAloud = async () => {
    const toBuy = items.filter(i => !i.completed);
    if (toBuy.length === 0) return;
    const text = `Saldo total de ${totalWalletBalance.toFixed(2)} reais. Faltam comprar ${toBuy.length} itens.`;
    try {
      const base64Audio = await geminiService.textToSpeech(text);
      if (base64Audio) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const decoded = decodeBase64(base64Audio);
        const buffer = await decodeAudioData(decoded, audioCtx, 24000, 1);
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.start();
      }
    } catch (err) {}
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            SmartShop <span className="text-indigo-600 italic">AI</span>
          </h1>
          <p className="text-slate-500 font-medium">Gestão financeira e compras inteligentes</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleShare}
            className="bg-indigo-50 text-indigo-600 p-3 rounded-full shadow-sm border border-indigo-100 hover:bg-indigo-100 transition"
            title="Compartilhar Link"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
          </button>

          <button 
            onClick={readListAloud}
            className="bg-white p-3 rounded-full shadow-sm border border-slate-200 hover:bg-slate-50 transition"
            title="Ler Lista"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10a7.971 7.971 0 00-2.343-5.657 1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.983 5.983 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.983 3.983 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
            </svg>
          </button>
          
          <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1">
            {['list', 'reports', 'wallets', 'chat'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as AppTab)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition uppercase tracking-tighter ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                {tab === 'list' ? 'Lista' : tab === 'reports' ? 'Relatórios' : tab === 'wallets' ? 'Carteira' : 'IA'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="min-h-[500px]">
        {activeTab === 'list' && (
          <ShoppingList items={items} onToggle={toggleItem} onAdd={addItem} onDelete={deleteItem} />
        )}
        {activeTab === 'reports' && <ReportView items={items} />}
        {activeTab === 'wallets' && (
          <WalletManager wallets={wallets} onAdd={addWallet} onDelete={deleteWallet} />
        )}
        {activeTab === 'chat' && (
          <AIChat items={items} onShare={handleShare} />
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 md:p-6 shadow-2xl z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Saldo Total Disponível</p>
            <p className={`text-2xl font-black transition-colors duration-500 ${getBalanceColorClass(totalWalletBalance)}`}>
              R$ {totalWalletBalance.toFixed(2)}
            </p>
          </div>

          <div className="flex gap-4">
             <button className="flex flex-col items-center gap-1 group" onClick={() => setActiveTab('wallets')}>
              <div className={`p-3 rounded-2xl transition shadow-lg ${activeTab === 'wallets' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
            </button>
            
            <button className="flex flex-col items-center gap-1 group">
              <div className="bg-indigo-600 p-4 rounded-full -mt-10 shadow-xl hover:scale-110 transition active:scale-95 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
            </button>
          </div>
          
          <div className="text-right hidden sm:block">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Custo da Lista</p>
            <p className="text-xl font-black text-slate-400">
              R$ {items.filter(i => !i.completed).reduce((s, i) => s + (i.price * i.quantity), 0).toFixed(2)}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
