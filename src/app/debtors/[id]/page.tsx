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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import PaymentIcon from '@mui/icons-material/Payment';
import MessageIcon from '@mui/icons-material/Message';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useDebtors, Transaction } from '@/context/DebtorContext';

const COLLECTION_TYPES = [
  { id: 'relaxed', label: '輕鬆提醒', template: '欸跟你提醒一下～之前那筆 {total} 你那邊方便的時候再處理一下喔，不急但我這邊先對一下帳' },
  { id: 'neutral', label: '事務中性', template: '想跟你確認一下，之前那筆 {total} 目前還沒結清，方便的話再幫我確認一下處理時間，謝謝。' },
  { id: 'relational', label: '關係維持', template: '這筆 {total} 我這邊還沒收到，想先跟你確認一下狀況，我也不想因為這件事影響我們的關係，再麻煩你了。' },
  { id: 'polite', label: '明確但客氣', template: '這筆 {total} 我這邊需要整理帳目，想請你這幾天幫我處理一下，謝謝配合。' },
  { id: 'pressure', label: '現實壓力', template: '這筆 {total} 已經一段時間了，我這邊也有資金安排上的需要，想請你盡快協助處理。' },
  { id: 'final', label: '最後提醒', template: '這筆 {total} 再麻煩你最晚在這週內處理一下，謝謝你配合。' },
  { id: 'again', label: '再次提醒', template: '跟你再確認一下，之前那筆 {total} 目前還沒收到，不知道你那邊是不是有看到訊息？再麻煩你回覆一下狀況，謝謝。' },
];

export default function DebtorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const { debtors, addTransaction, updateTransaction, deleteTransaction } = useDebtors();

  const debtor = debtors.find((d) => d.id === id);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'add_expense' | 'add_repayment' | 'edit'>('add_expense');
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);

  // 討債對話框狀態
  const [openCollectionDialog, setOpenCollectionDialog] = useState(false);
  const [collectionMode, setCollectionMode] = useState<'manual' | 'auto'>('manual');
  const [collectionType, setCollectionType] = useState(COLLECTION_TYPES[0].id);
  const [collectionMessage, setCollectionMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // 表單狀態
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0].replace(/-/g, '/'));

  // 篩選狀態
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (!debtor) {
      router.push('/debtors');
    }
  }, [debtor, router]);

  if (!debtor) return null;

  const totalAmount = Math.max(0, -debtor.transactions.reduce((acc, curr) => acc + curr.amount, 0));

  const generateMessage = (typeId: string) => {
    const type = COLLECTION_TYPES.find(t => t.id === typeId) || COLLECTION_TYPES[0];
    const details = debtor.transactions
      .map(t => `${t.date} ${t.item}: ${t.amount < 0 ? '-' : '+'}$${Math.abs(t.amount).toLocaleString()}`)
      .join('\n');

    const totalStr = `$${totalAmount.toLocaleString()}`;
    const message = `${type.template.replace('{total}', totalStr)}\n\n【明細】\n${details}\n\n總計欠款：${totalStr}`;
    return message;
  };

  const handleOpenCollection = (mode: 'manual' | 'auto') => {
    setCollectionMode(mode);
    setCollectionType(COLLECTION_TYPES[0].id);
    setCollectionMessage(generateMessage(COLLECTION_TYPES[0].id));
    setOpenCollectionDialog(true);
  };

  const handleCollectionTypeChange = (typeId: string) => {
    setCollectionType(typeId);
    setCollectionMessage(generateMessage(typeId));
  };

  const handleManualShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '債務提醒',
          text: collectionMessage,
        });
        setSnackbar({ open: true, message: '分享成功', severity: 'success' });
        setOpenCollectionDialog(false);
      } catch (e) {
        if (e instanceof Error && e.name !== 'AbortError') {
          console.error('Share failed:', e);
          setSnackbar({ open: true, message: '分享失敗', severity: 'error' });
        }
      }
    } else {
      // 降級處理：複製到剪貼簿
      try {
        await navigator.clipboard.writeText(collectionMessage);
        setSnackbar({ open: true, message: '瀏覽器不支援直接分享，已將內容複製到剪貼簿', severity: 'success' });
        setOpenCollectionDialog(false);
      } catch {
        setSnackbar({ open: true, message: '複製失敗，請手動選取文字', severity: 'error' });
      }
    }
  };

  const handleAutoSubmit = () => {
    setIsSubmitting(true);
    // 模擬 API 呼叫
    setTimeout(() => {
      setIsSubmitting(false);
      setSnackbar({ open: true, message: '自動討債請求已送出', severity: 'success' });
      setOpenCollectionDialog(false);
    }, 1500);
  };

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

  const filteredTransactions = debtor.transactions.filter(t => {
    if (!startDate && !endDate) return true;

    // 將 yyyy/MM/DD 轉換為可以比較的數字或 Date
    const tDate = t.date.replace(/\//g, '-');

    if (startDate && tDate < startDate) return false;
    if (endDate && tDate > endDate) return false;

    return true;
  });

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
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            債務明細
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

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 8.5 }}>
          <Card elevation={3} sx={{ bgcolor: '#1a237e', color: 'white', borderRadius: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                {debtor.name}目前欠款總額
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', my: 1 }}>
                ${totalAmount.toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                系統根據下方明細即時計算
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%', justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="medium"
                startIcon={<AddIcon />}
                onClick={() => handleOpenAdd('add_expense')}
                sx={{
                  bgcolor: '#d32f2f',
                  '&:hover': { bgcolor: '#b71c1c' },
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  justifyContent: 'center'
                }}
              >
                代付
              </Button>
              <Button
                variant="contained"
                size="medium"
                startIcon={<PaymentIcon />}
                onClick={() => handleOpenAdd('add_repayment')}
                sx={{
                  bgcolor: '#2e7d32',
                  '&:hover': { bgcolor: '#1b5e20' },
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  justifyContent: 'center'
                }}
              >
                還款
              </Button>
          </Box>
        </Grid>
      </Grid>

      {/* 篩選與討債按鈕區塊 */}
      <Box sx={{
        mb: 3,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', md: 'center' },
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2
      }}>
        <Box sx={{
          display: 'flex',
          gap: { xs: 1, sm: 2 },
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <TextField
            type="date"
            size="small"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            label="開始日期"
            sx={{ flex: { xs: 1, sm: 'none' } }}
          />
          <Typography sx={{ display: { xs: 'none', sm: 'block' } }}>至</Typography>
          <TextField
            type="date"
            size="small"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            label="結束日期"
            sx={{ flex: { xs: 1, sm: 'none' } }}
          />
          <Button
            variant="text"
            onClick={() => { setStartDate(''); setEndDate(''); }}
            sx={{ ml: { xs: 0, sm: 1 }, color: 'primary.main', fontWeight: 'bold' }}
          >
            清除
          </Button>
        </Box>

        <Box sx={{
          display: 'flex',
          gap: 2,
          flexDirection: { xs: 'row', sm: 'row' },
          justifyContent: { xs: 'space-between', md: 'flex-end' }
        }}>
          <Button
            variant="outlined"
            size="medium"
            fullWidth={false}
            startIcon={<MessageIcon />}
            onClick={() => handleOpenCollection('manual')}
            sx={{
              flex: 1,
              px: { xs: 1, sm: 3 },
              py: 1,
              borderRadius: 2,
              color: '#1a237e',
              borderColor: '#1a237e',
              bgcolor: '#f5f5f5',
              fontWeight: 'bold',
              whiteSpace: 'nowrap'
            }}
          >
            手動討債
          </Button>
          <Button
            variant="outlined"
            size="medium"
            fullWidth={false}
            startIcon={<SmartToyIcon />}
            onClick={() => handleOpenCollection('auto')}
            sx={{
              flex: 1,
              px: { xs: 1, sm: 3 },
              py: 1,
              borderRadius: 2,
              color: '#7b1fa2',
              borderColor: '#7b1fa2',
              bgcolor: '#fdfbff',
              fontWeight: 'bold',
              whiteSpace: 'nowrap'
            }}
          >
            自動討債
          </Button>
        </Box>
      </Box>

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
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                  <Typography color="textSecondary">找不到符合條件的明細紀錄</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((t) => (
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

      {/* 討債彈窗 */}
      <Dialog open={openCollectionDialog} onClose={() => setOpenCollectionDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {collectionMode === 'manual' ? '手動討債' : '自動討債'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="collection-type-label">提醒類型</InputLabel>
              <Select
                labelId="collection-type-label"
                value={collectionType}
                label="提醒類型"
                onChange={(e) => handleCollectionTypeChange(e.target.value)}
              >
                {COLLECTION_TYPES.map((type) => (
                  <MenuItem key={type.id} value={type.id}>{type.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="訊息內容"
              multiline
              rows={10}
              value={collectionMessage}
              onChange={(e) => setCollectionMessage(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenCollectionDialog(false)} disabled={isSubmitting}>取消</Button>
          {collectionMode === 'manual' ? (
            <Button variant="contained" color="primary" onClick={handleManualShare}>
              分享給其他人
            </Button>
          ) : (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleAutoSubmit}
              disabled={isSubmitting}
              startIcon={isSubmitting && <CircularProgress size={20} color="inherit" />}
            >
              {isSubmitting ? '傳送中...' : '送出請求'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* 通知 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
