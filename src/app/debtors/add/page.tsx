'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
} from '@mui/material';
import { useDebtors } from '@/context/DebtorContext';

export default function AddDebtorPage() {
  const router = useRouter();
  const { addDebtor } = useDebtors();
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDebtor(name);
    router.push('/debtors');
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom color="primary">
          新增債務人
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
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              type="submit"
              fullWidth
            >
              儲存
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
