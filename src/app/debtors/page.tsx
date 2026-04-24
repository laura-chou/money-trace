'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  DialogContentText,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import { useDebtors, Debtor } from '@/context/DebtorContext';

export default function DebtorsPage() {
  const router = useRouter();
  const { debtors, deleteDebtor, addDebtor } = useDebtors();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newDebtorName, setNewDebtorName] = useState('');
  const [selectedDebtorId, setSelectedDebtorId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const calculateTotal = (debtor: Debtor) => {
    const sum = debtor.transactions.reduce((acc, curr) => acc + curr.amount, 0);
    // 欠款金額為0時不能是負的
    return Math.max(0, -sum);
  };

  const getStatusInfo = (amount: number) => {
    if (amount >= 10000) return { label: '嚴重欠款', color: '#d32f2f' }; // 紅
    if (amount >= 1000) return { label: '中度欠款', color: '#ed6c02' }; // 橘
    if (amount >= 1) return { label: '輕微欠款', color: '#fbc02d' }; // 黃
    return { label: '已結清', color: '#2e7d32' }; // 綠
  };

  const handleLogout = () => {
    router.push('/login');
  };

  const handleDeleteClick = (id: number) => {
    setSelectedDebtorId(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedDebtorId !== null) {
      deleteDebtor(selectedDebtorId);
      setOpenDeleteDialog(false);
      setSelectedDebtorId(null);
    }
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setSelectedDebtorId(null);
  };

  const handleAddDebtor = () => {
    if (newDebtorName.trim()) {
      addDebtor(newDebtorName.trim());
      setNewDebtorName('');
      setOpenAddDialog(false);
    }
  };

  const filteredDebtors = debtors.filter((debtor) => {
    const amount = calculateTotal(debtor);
    const statusInfo = getStatusInfo(amount);

    const matchesSearch = debtor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || statusInfo.label === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          債務人列表
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ mr: 2 }}
            onClick={() => setOpenAddDialog(true)}
          >
            新增
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            登出
          </Button>
        </Box>
      </Box>

      {/* 搜尋與篩選區塊 */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          label="搜尋名稱"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="status-filter-label">債務狀態</InputLabel>
          <Select
            labelId="status-filter-label"
            value={statusFilter}
            label="債務狀態"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">全部狀態</MenuItem>
            <MenuItem value="嚴重欠款">嚴重欠款 ($10,000+)</MenuItem>
            <MenuItem value="中度欠款">中度欠款 ($1,000-$9,999)</MenuItem>
            <MenuItem value="輕微欠款">輕微欠款 ($1-$999)</MenuItem>
            <MenuItem value="已結清">已結清 ($0)</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper} elevation={2}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>名稱</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>欠款總金額</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>狀態</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDebtors.map((debtor) => {
              const amount = calculateTotal(debtor);
              const status = getStatusInfo(amount);
              return (
                <TableRow key={debtor.id} hover>
                  <TableCell>{debtor.name}</TableCell>
                  <TableCell>${amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={status.label}
                      sx={{
                        backgroundColor: status.color,
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                  <IconButton
                    color="primary"
                    aria-label="edit"
                    sx={{ mr: 1 }}
                    onClick={() => router.push(`/debtors/${debtor.id}`)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    aria-label="delete"
                    onClick={() => handleDeleteClick(debtor.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredDebtors.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  找不到符合條件的債務人資料
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 刪除確認視窗 */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>確認刪除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            您確定要刪除這位債務人嗎？此操作無法復原。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            取消
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            刪除
          </Button>
        </DialogActions>
      </Dialog>

      {/* 新增債務人視窗 */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
      >
        <DialogTitle>新增債務人</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="債務人名稱"
            type="text"
            fullWidth
            variant="outlined"
            value={newDebtorName}
            onChange={(e) => setNewDebtorName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddDebtor();
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenAddDialog(false)}>取消</Button>
          <Button onClick={handleAddDebtor} variant="contained" disabled={!newDebtorName.trim()}>
            新增
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
