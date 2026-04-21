'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Debtor {
  id: number;
  name: string;
  totalAmount: number;
}

interface DebtorContextType {
  debtors: Debtor[];
  addDebtor: (debtor: Omit<Debtor, 'id'>) => void;
  updateDebtor: (id: number, debtor: Omit<Debtor, 'id'>) => void;
  deleteDebtor: (id: number) => void;
}

const initialDebtors: Debtor[] = [
  { id: 1, name: '張三', totalAmount: 5000 },
  { id: 2, name: '李四', totalAmount: 12000 },
  { id: 3, name: '王五', totalAmount: 800 },
  { id: 4, name: '趙六', totalAmount: 25000 },
];

const DebtorContext = createContext<DebtorContextType | undefined>(undefined);

export function DebtorProvider({ children }: { children: ReactNode }) {
  const [debtors, setDebtors] = useState<Debtor[]>(initialDebtors);

  const addDebtor = (debtor: Omit<Debtor, 'id'>) => {
    setDebtors((prev) => [
      ...prev,
      { ...debtor, id: Math.max(0, ...prev.map((d) => d.id)) + 1 },
    ]);
  };

  const updateDebtor = (id: number, updatedData: Omit<Debtor, 'id'>) => {
    setDebtors((prev) =>
      prev.map((debtor) => (debtor.id === id ? { ...updatedData, id } : debtor))
    );
  };

  const deleteDebtor = (id: number) => {
    setDebtors((prev) => prev.filter((debtor) => debtor.id !== id));
  };

  return (
    <DebtorContext.Provider value={{ debtors, addDebtor, updateDebtor, deleteDebtor }}>
      {children}
    </DebtorContext.Provider>
  );
}

export function useDebtors() {
  const context = useContext(DebtorContext);
  if (context === undefined) {
    throw new Error('useDebtors must be used within a DebtorProvider');
  }
  return context;
}
