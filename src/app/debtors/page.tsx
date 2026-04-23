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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import { useDebtors, Debtor } from '@/context/DebtorContext';

export default function DebtorsPage() {
  const router = useRouter();
  const { debtors, deleteDebtor } = useDebtors();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedDebtorId, setSelectedDebtorId] = useState<number | null>(null);

  const calculateTotal = (debtor: Debtor) => {
    // 總額 = -(所有負數相加) - (所有正數相加) ?
    // 邏輯確認：我幫他付 (-40) -> 他欠我 40；他還我 (+100) -> 他欠我 -100。
    // 所以 他欠我的總額 = -(transactions 金額的總和)
    const sum = debtor.transactions.reduce((acc, curr) => acc + curr.amount, 0);
    return -sum;
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
            onClick={() => router.push('/debtors/add')}
          >
            新增債務人
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

      <TableContainer component={Paper} elevation={2}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>名稱</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>欠款總金額</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {debtors.map((debtor) => (
              <TableRow key={debtor.id} hover>
                <TableCell>{debtor.name}</TableCell>
                <TableCell>${calculateTotal(debtor).toLocaleString()}</TableCell>
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
            ))}
            {debtors.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                  目前沒有債務人資料
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
    </Container>
  );
}
