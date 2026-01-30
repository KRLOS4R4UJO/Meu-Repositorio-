
import React, { useState } from 'react';
import { Wallet } from '../types';

interface WalletManagerProps {
  wallets: Wallet[];
  onAdd: (bankName: string, balance: number, color: string) => void;
  onDelete: (id: string) => void;
}

const COLORS = [
  { name: 'Indigo', class: 'bg-gradient-to-br from-indigo-500 to-purple-600' },
  { name: 'Rose', class: 'bg-gradient-to-br from-rose-500 to-pink-600' },
  { name: 'Emerald', class: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
  { name: 'Amber', class: 'bg-gradient-to-br from-amber-500 to-orange-600' },
  { name: 'Slate', class: 'bg-gradient-to-br from-slate-700 to-slate-900' },
];

export const WalletManager: React.FC<WalletManagerProps> = ({ wallets, onAdd, onDelete }) => {
  const [bankName, setBankName] = useState('');
  const [balance, setBalance] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0].class);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName || !balance) return;
    onAdd(bankName, parseFloat(balance), selectedColor);
    setBankName('');
    setBalance('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">Adicionar Novo Cartão</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nome do Banco / Cartão"
            className="p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
          />
          <input
            type="number"
            step="0.01"
            placeholder="Saldo Inicial (R$)"
            className="p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-xs font-bold text-slate-400 uppercase">Cor do Cartão:</span>
          {COLORS.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setSelectedColor(c.class)}
              className={`w-8 h-8 rounded-full ${c.class} ${selectedColor === c.class ? 'ring-4 ring-offset-2 ring-indigo-500' : ''}`}
            />
          ))}
        </div>
        <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-black transition">
          Vincular Cartão
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {wallets.map((wallet) => (
          <div key={wallet.id} className={`relative h-48 rounded-2xl p-6 text-white shadow-xl ${wallet.color} group overflow-hidden`}>
            <div className="absolute top-0 right-0 p-4 opacity-20">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div className="flex justify-between items-start relative z-10">
              <span className="font-black text-lg uppercase tracking-tighter">{wallet.bankName}</span>
              <button onClick={() => onDelete(wallet.id)} className="text-white/50 hover:text-white transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="mt-8 relative z-10">
              <p className="text-xs text-white/70 uppercase font-bold tracking-widest">Saldo Disponível</p>
              <p className="text-3xl font-black">R$ {wallet.balance.toFixed(2)}</p>
            </div>
            <div className="absolute bottom-4 left-6 font-mono text-sm opacity-60">
              **** **** **** {wallet.lastFour}
            </div>
          </div>
        ))}
        {wallets.length === 0 && (
          <div className="md:col-span-2 py-12 text-center bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold">Nenhum cartão cadastrado. Adicione um para começar a gastar!</p>
          </div>
        )}
      </div>
    </div>
  );
};
