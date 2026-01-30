
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ShoppingItem, CategorySpend } from '../types';

interface ReportViewProps {
  items: ShoppingItem[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export const ReportView: React.FC<ReportViewProps> = ({ items }) => {
  const categoryData = items.reduce((acc: CategorySpend[], item) => {
    const itemTotal = item.price * item.quantity;
    const existing = acc.find(c => c.name === item.category);
    if (existing) {
      existing.value += itemTotal;
    } else {
      acc.push({ name: item.category, value: itemTotal });
    }
    return acc;
  }, []);

  const totalSpent = items.filter(i => i.completed).reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalPotential = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-indigo-600 p-8 rounded-3xl shadow-xl shadow-indigo-100 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-indigo-100 font-bold uppercase tracking-wider text-xs mb-2">Já Investido no Carrinho</p>
          <p className="text-5xl font-black">R$ {totalSpent.toFixed(2)}</p>
        </div>
        
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <p className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-2">Orçamento Total Planejado</p>
          <p className="text-5xl font-black text-slate-800">R$ {totalPotential.toFixed(2)}</p>
          <div className="mt-4 w-full bg-slate-100 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-1000" 
              style={{ width: `${totalPotential > 0 ? (totalSpent / totalPotential) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 min-h-[400px]">
          <h3 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-widest text-center">Distribuição de Gastos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={8}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => `R$ ${value.toFixed(2)}`} 
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 min-h-[400px]">
          <h3 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-widest text-center">Ranking de Categorias</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fontWeight: 'bold' }} />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => `R$ ${value.toFixed(2)}`} 
              />
              <Bar dataKey="value" fill="#6366f1" radius={[0, 10, 10, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
