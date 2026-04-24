'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import PaymentIcon from '@mui/icons-material/Payment';
import { useDebtors, Transaction } from '@/context/DebtorContext';

export default function DebtorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const { debtors, addTransaction, updateTransaction, deleteTransaction } = useDebtors();

  const debtor = debtors.find((d) => d.id === id);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'add_expense' | 'add_repayment' | 'edit'>('add_expense');
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);

  // 表單狀態
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0].replace(/-/g, '/'));

  useEffect(() => {
    if (!debtor) {
      router.push('/debtors');
    }
  }, [debtor, router]);

  if (!debtor) return null;

  const totalAmount = Math.max(0, -debtor.transactions.reduce((acc, curr) => acc + curr.amount, 0));

  const handleOpenAdd = (type: 'add_expense' | 'add_repayment') => {
    setDialogType(type);
    setItem(type === 'add_repayment' ? '還款' : '');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0].replace(/-/g, '/'));
    setOpenDialog(true);
  };

  const handleOpenEdit = (transaction: Transaction) => {
    setDialogType('edit');
    setSelectedTransactionId(transaction.id);
    setItem(transaction.item);
    setAmount(Math.abs(transaction.amount).toString());
    setDate(transaction.date);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTransactionId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    // 邏輯：expense 是負數 (我幫他付)，repayment 是正數 (他還我)
    let finalAmount = numAmount;
    let type: 'expense' | 'repayment' = 'expense';

    if (dialogType === 'add_expense') {
      finalAmount = -numAmount;
      type = 'expense';
    } else if (dialogType === 'add_repayment') {
      finalAmount = numAmount;
      type = 'repayment';
    } else if (dialogType === 'edit' && selectedTransactionId !== null) {
      const original = debtor.transactions.find(t => t.id === selectedTransactionId);
      type = original?.type || 'expense';
      finalAmount = type === 'expense' ? -numAmount : numAmount;
    }

    const transactionData = {
      date,
      item,
      amount: finalAmount,
      type,
    };

    if (dialogType === 'edit' && selectedTransactionId !== null) {
      updateTransaction(id, selectedTransactionId, transactionData);
    } else {
      addTransaction(id, transactionData);
    }

    handleCloseDialog();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <MuiLink
            underline="hover"
            color="inherit"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              router.push('/debtors');
            }}
          >
            債務人列表
          </MuiLink>
          <Typography color="text.primary">{debtor.name}</Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            {debtor.name} - 債務明細
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/debtors')}
          >
            返回列表
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={3} sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                目前欠款總額
              </Typography>
              <Typography variant="h3">
                ${totalAmount.toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                系統根據下方明細即時計算
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ display: 'flex', gap: 2, height: '100%', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="error"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => handleOpenAdd('add_expense')}
              sx={{ px: 4, py: 1.5 }}
            >
              新增消費 (我幫他付)
            </Button>
            <Button
              variant="contained"
              color="success"
              size="large"
              startIcon={<PaymentIcon />}
              onClick={() => handleOpenAdd('add_repayment')}
              sx={{ px: 4, py: 1.5 }}
            >
              新增還款 (他還我)
            </Button>
          </Box>
        </Grid>
      </Grid>

      <TableContainer component={Paper} elevation={2}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>日期</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>品項</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>金額</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {debtor.transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                  <Typography color="textSecondary">目前沒有任何明細紀錄</Typography>
                </TableCell>
              </TableRow>
            ) : (
              debtor.transactions.map((t) => (
                <TableRow key={t.id} hover>
                  <TableCell>{t.date}</TableCell>
                  <TableCell>{t.item}</TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      color: t.amount < 0 ? 'error.main' : 'success.main',
                    }}
                  >
                    {t.amount < 0 ? `- $${Math.abs(t.amount).toLocaleString()}` : `+ $${t.amount.toLocaleString()}`}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleOpenEdit(t)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => deleteTransaction(id, t.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 新增/編輯 彈窗 */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="xs">
        <DialogTitle>
          {dialogType === 'add_expense' ? '新增消費' : dialogType === 'add_repayment' ? '新增還款' : '編輯明細'}
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="日期"
                  placeholder="yyyy/MM/DD"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="品項"
                  required
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="金額"
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseDialog}>取消</Button>
            <Button variant="contained" type="submit">
              {dialogType === 'edit' ? '更新' : '儲存'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
}
