'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
} from '@mui/material';
import { useDebtors } from '@/context/DebtorContext';

export default function EditDebtorPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const { debtors, updateDebtor } = useDebtors();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    const debtor = debtors.find((d) => d.id === id);
    if (debtor) {
      setName(debtor.name);
      setAmount(debtor.totalAmount.toString());
    } else {
      router.push('/debtors');
    }
  }, [id, debtors, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateDebtor(id, {
      name,
      totalAmount: Number(amount),
    });
    router.push('/debtors');
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom color="primary">
          編輯債務人
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="名稱"
            required
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            fullWidth
            label="欠款總金額"
            type="number"
            required
            margin="normal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              type="submit"
              fullWidth
            >
              更新
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => router.push('/debtors')}
            >
              取消
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
