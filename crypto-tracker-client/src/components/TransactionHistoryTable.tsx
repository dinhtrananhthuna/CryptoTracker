// src/components/TransactionHistoryTable.tsx
import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
} from '@mui/material';
import { Transaction, TransactionType } from '../models';
interface TransactionHistoryTableProps {
    transactions: Transaction[];
}

const TransactionHistoryTable: React.FC<TransactionHistoryTableProps> = ({ transactions }) => {
    if (!transactions || transactions.length === 0) {
        return <Typography>No transactions found.</Typography>;
    }

    return (
        <TableContainer component={Paper}>
            <Table aria-label="transaction history table">
                <TableHead>
                    <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Fee</TableCell>
                        <TableCell>Exchange</TableCell>
                        <TableCell>Notes</TableCell>
                        {/* Thêm các cột khác nếu cần */}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {transactions.map((transaction) => (
                        <TableRow key={transaction.transactionId}>
                            <TableCell>{new Date(transaction.transactionDate).toLocaleString()}</TableCell>
                            <TableCell>{transaction.transactionType === TransactionType.Buy ? 'Buy' : 'Sell'}</TableCell>
                            <TableCell align="right">{transaction.quantity}</TableCell>
                            <TableCell align="right">${transaction.price}</TableCell>
                             <TableCell align="right">{transaction.fee ? transaction.fee : 0}</TableCell>
                            <TableCell>{transaction.exchange}</TableCell>
                            <TableCell>{transaction.notes}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default TransactionHistoryTable;