import React, { useState } from 'react';
import { ShoppingItem } from '../types';

interface ShoppingListProps {
  items: ShoppingItem[];
  onToggle: (id: string) => void;
  onAdd: (name: string, category: string, price: number, quantity: number, amount: number, unit: string) => void;
  onDelete: (id: string) => void;
}

export const ShoppingList: React.FC<ShoppingListProps> = ({ items, onToggle, onAdd, onDelete }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Geral');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [amount, setAmount] = useState('1');
  const [unit, setUnit] = useState('kg');

  // Ordenação: Itens mais novos primeiro. Não filtramos os completados para que não "sumam".
  const sortedItems = [...items].sort((a, b) => b.createdAt - a.createdAt);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onAdd(
      name, 
      category, 
      parseFloat(price) || 0, 
      parseFloat(quantity) || 1, 
      parseFloat(amount) || 1,
      unit
    );
    setName('');
    setPrice('');
    setQuantity('1');
    setAmount('1');
  };

  const clearCompleted = () => {
    if (window.confirm("Deseja remover da lista todos os itens que já foram marcados como comprados?")) {
      items.filter(i => i.completed).forEach(i => onDelete(i.id));
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4">
            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Item</label>
            <input
              type="text"
              placeholder="Ex: Arroz, Leite..."
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="md:col-span-3">
            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Categoria</label>
            <select
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>Geral</option>
              <option>Alimentação</option>
              <option>Limpeza</option>
              <option>Higiene</option>
              <option>Hortifruti</option>
              <option>Carnes</option>
              <option>Bebidas</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Tamanho/Vol.</label>
            <div className="flex">
              <input
                type="number"
                step="0.1"
                className="w-full p-2.5 border border-slate-200 rounded-l-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <select
                className="p-2.5 border border-l-0 border-slate-200 rounded-r-xl bg-slate-50 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              >
                <option value="unid">unid</option>
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="L">L</option>
                <option value="ml">ml</option>
              </select>
            </div>
          </div>

          <div className="md:col-span-1">
            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Qtd.</label>
            <input
              type="number"
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div className="md:col-span-1">
            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Preço</label>
            <input
              type="number"
              step="0.01"
              placeholder="R$"
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        </div>
        
        <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
          Adicionar à Lista
        </button>
      </form>

      <div className="space-y-3">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
            Carrinho ({items.filter(i => i.completed).length}/{items.length})
          </h3>
          {items.some(i => i.completed) && (
            <button 
              onClick={clearCompleted}
              className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase bg-red-50 px-2 py-1 rounded-md transition"
            >
              Limpar Comprados
            </button>
          )}
        </div>

        {sortedItems.map(item => (
          <div 
            key={item.id} 
            className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${
              item.completed 
                ? 'bg-slate-50 border-slate-100 opacity-60' 
                : 'bg-white border-slate-200 shadow-sm hover:border-indigo-200'
            }`}
          >
            <input
              type="checkbox"
              className="w-6 h-6 rounded-full border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              checked={item.completed}
              onChange={() => onToggle(item.id)}
            />
            <div className="flex-1">
              <div className="flex items-baseline gap-2 flex-wrap">
                <p className={`font-bold text-lg leading-tight transition-all ${
                  item.completed ? 'line-through text-slate-400' : 'text-slate-800'
                }`}>
                  {item.name}
                </p>
                <div className="flex gap-1">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                    item.completed ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-500'
                  }`}>
                    {item.amount}{item.unit}
                  </span>
                  <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full uppercase">
                    x{item.quantity}
                  </span>
                </div>
              </div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{item.category}</p>
            </div>
            <div className="text-right">
              <p className={`font-mono font-black text-lg leading-tight ${
                item.completed ? 'text-slate-400' : 'text-indigo-600'
              }`}>
                R$ {(item.price * item.quantity).toFixed(2)}
              </p>
              <p className="text-[10px] text-slate-300 font-bold">Un: R${item.price.toFixed(2)}</p>
            </div>
            <button 
              onClick={() => onDelete(item.id)} 
              className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition ml-2"
              title="Excluir item"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}

        {items.length === 0 && (
          <div className="bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
            <p className="text-slate-400 font-bold italic text-sm">Sua lista está vazia!</p>
          </div>
        )}
      </div>
    </div>
  );
};