'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Transaction {
  id: number;
  date: string; // yyyy/MM/DD
  item: string; // 品項
  amount: number; // 正數代表他還我，負數代表我幫他付
  type: 'expense' | 'repayment';
}

export interface Debtor {
  id: number;
  name: string;
  transactions: Transaction[];
}

interface DebtorContextType {
  debtors: Debtor[];
  addDebtor: (name: string) => void;
  deleteDebtor: (id: number) => void;
  addTransaction: (debtorId: number, transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (debtorId: number, transactionId: number, transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (debtorId: number, transactionId: number) => void;
}

const initialDebtors: Debtor[] = [
  {
    id: 1,
    name: '張三',
    transactions: [
      { id: 1, date: '2024/04/01', item: '牛奶', amount: -40, type: 'expense' },
      { id: 2, date: '2024/04/02', item: '午餐', amount: -120, type: 'expense' },
      { id: 3, date: '2024/04/03', item: '車資', amount: -60, type: 'expense' },
      { id: 4, date: '2024/04/04', item: '還款', amount: 100, type: 'repayment' },
    ],
  },
  { id: 2, name: '李四', transactions: [] },
];

const DebtorContext = createContext<DebtorContextType | undefined>(undefined);

export function DebtorProvider({ children }: { children: ReactNode }) {
  const [debtors, setDebtors] = useState<Debtor[]>(initialDebtors);

  const addDebtor = (name: string) => {
    setDebtors((prev) => [
      ...prev,
      { id: Math.max(0, ...prev.map((d) => d.id)) + 1, name, transactions: [] },
    ]);
  };

  const deleteDebtor = (id: number) => {
    setDebtors((prev) => prev.filter((debtor) => debtor.id !== id));
  };

  const addTransaction = (debtorId: number, transaction: Omit<Transaction, 'id'>) => {
    setDebtors((prev) =>
      prev.map((debtor) => {
        if (debtor.id === debtorId) {
          const newId = Math.max(0, ...debtor.transactions.map((t) => t.id)) + 1;
          return {
            ...debtor,
            transactions: [...debtor.transactions, { ...transaction, id: newId }],
          };
        }
        return debtor;
      })
    );
  };

  const updateTransaction = (debtorId: number, transactionId: number, updatedData: Omit<Transaction, 'id'>) => {
    setDebtors((prev) =>
      prev.map((debtor) => {
        if (debtor.id === debtorId) {
          return {
            ...debtor,
            transactions: debtor.transactions.map((t) =>
              t.id === transactionId ? { ...updatedData, id: transactionId } : t
            ),
          };
        }
        return debtor;
      })
    );
  };

  const deleteTransaction = (debtorId: number, transactionId: number) => {
    setDebtors((prev) =>
      prev.map((debtor) => {
        if (debtor.id === debtorId) {
          return {
            ...debtor,
            transactions: debtor.transactions.filter((t) => t.id !== transactionId),
          };
        }
        return debtor;
      })
    );
  };

  return (
    <DebtorContext.Provider
      value={{
        debtors,
        addDebtor,
        deleteDebtor,
        addTransaction,
        updateTransaction,
        deleteTransaction,
      }}
    >
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
