
export interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number; // Quantidade de unidades (Ex: 2 sacos)
  amount: number;   // Peso/Volume por unidade (Ex: 5)
  unit: string;     // Unidade de medida (Ex: kg)
  completed: boolean;
  createdAt: number;
  imageUrl?: string;
}

export interface Wallet {
  id: string;
  bankName: string;
  balance: number;
  color: string;
  lastFour: string;
}

export type AppTab = 'list' | 'reports' | 'wallets' | 'chat';

export interface CategorySpend {
  name: string;
  value: number;
}
