// src/components/TransactionList.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Typography,
    Box,
} from '@mui/material';
import { Transaction } from '../models';

function TransactionList() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            try {
                const response = await axios.get<Transaction[]>('/api/transactions');
                setTransactions(response.data);
                setError(null);
            } catch (error) {
                console.error("Error fetching transactions:", error);
                setError("Failed to fetch transactions.");
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    if (error) {
        return (
            <Box p={2}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress />
            </Box>
        );
    }

    if (!transactions || transactions.length === 0) {
        return <Box p={2}><Typography>No transactions found.</Typography></Box>;
    }

    return (
        <TableContainer component={Paper}>
            <Table aria-label="transaction table">
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Coin Symbol</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Fee</TableCell>
                        <TableCell>Exchange</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {transactions.map(transaction => (
                        <TableRow key={transaction.transactionId}>
                            <TableCell>{transaction.transactionId}</TableCell>
                            <TableCell>{transaction.coinId}</TableCell>
                            <TableCell>{transaction.transactionType}</TableCell>
                            <TableCell>{new Date(transaction.transactionDate).toLocaleString()}</TableCell>
                            <TableCell align="right">{transaction.quantity}</TableCell>
                            <TableCell align="right">{transaction.price}</TableCell>
                            <TableCell align="right">{transaction.fee}</TableCell>
                            <TableCell>{transaction.exchange}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default TransactionList;