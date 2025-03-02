// src/components/CoinList.tsx
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
import { Coin } from '../models';

function CoinList() {
    const [coins, setCoins] = useState<Coin[]>([]);
    const [loading, setLoading] = useState(true); // Thêm state loading
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCoins = async () => {
            setLoading(true); // Bắt đầu loading
            try {
                const response = await axios.get<Coin[]>('/api/coins');
                setCoins(response.data);
                setError(null);
            } catch (error) {
                console.error("Error fetching coins:", error);
                setError("Failed to fetch coins. Please check your API connection.");
            } finally {
                setLoading(false); // Kết thúc loading
            }
        };

        fetchCoins();
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
                <CircularProgress /> {/* Hiển thị loading spinner */}
            </Box>
        );
    }
      if (!coins || coins.length === 0) {
        return <Box p={2}><Typography>No coins found.</Typography></Box>;
    }

    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>Symbol</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell align="right">Quote Asset</TableCell>
                        <TableCell align="right">Total Quantity</TableCell>
                        <TableCell align="right">Average Buy Price</TableCell>
                        <TableCell align="right">Current Price</TableCell>
                        <TableCell align="right">Current Value</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {coins.map((coin) => (
                        <TableRow
                            key={coin.symbol}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">
                                {coin.symbol}
                            </TableCell>
                            <TableCell>{coin.name}</TableCell>
                             <TableCell align="right">{coin.quoteAsset}</TableCell>
                            <TableCell align="right">{coin.totalQuantity}</TableCell>
                            <TableCell align="right">{coin.averageBuyPrice}</TableCell>
                            <TableCell align="right">{coin.currentPrice}</TableCell>
                            <TableCell align="right">{coin.currentValue}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default CoinList;