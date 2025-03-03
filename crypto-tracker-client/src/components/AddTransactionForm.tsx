// src/components/AddTransactionForm.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    Typography,
} from '@mui/material';
import { Coin, Transaction,TransactionType } from '../models';

function AddTransactionForm() {
    const [coinId, setCoinId] = useState('');
    const [transactionType, setTransactionType] = useState<TransactionType>(TransactionType.Buy);
    const [transactionDate, setTransactionDate] = useState(new Date().toISOString().slice(0, 16));
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [fee, setFee] = useState('');
    const [exchange, setExchange] = useState('');
    const [message, setMessage] = useState('');
    const [coins, setCoins] = useState<Coin[]>([]);
    const [error, setError] = useState<string | null>(null); // Thêm state error


    useEffect(() => {
        const fetchCoins = async () => {
            try {
                const response = await axios.get<Coin[]>('/api/coins');
                setCoins(response.data);
                if (response.data.length > 0) {
                    setCoinId(response.data[0].symbol);
                }
            } catch (error) {
                console.error("Error fetching coins:", error);
                setError("Failed to fetch coins.");
            }
        };
        fetchCoins();
    }, []);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setMessage('');
        setError(null)
        try {
            const newTransaction: Omit<Transaction, 'transactionId'> = {
                coinId: coinId,
                transactionType: transactionType,
                transactionDate: transactionDate,
                quantity: parseFloat(quantity),
                price: parseFloat(price),
                fee: parseFloat(fee || '0'),
                exchange: exchange,
            };

            const response = await axios.post<Transaction>('/api/transactions', newTransaction);
            setMessage('Transaction added successfully!');
            // Reset form
            setCoinId('');
            setTransactionType(TransactionType.Buy);
            setTransactionDate(new Date().toISOString().slice(0, 16));
            setQuantity('');
            setPrice('');
            setFee('');
            setExchange('');

        } catch (error: any) {
            console.error("Error adding transaction:", error);
             const errorMessage = error.response?.data || error.message;
            setError(errorMessage);
        }
    };

    return (
        <Box p={2}>
            <Typography variant="h5">Add New Transaction</Typography>
            <form onSubmit={handleSubmit}>
                <Box mb={2}>
                    <FormControl fullWidth variant="outlined">
                        <InputLabel id="coin-select-label">Coin</InputLabel>
                        <Select
                            labelId="coin-select-label"
                            value={coinId}
                            onChange={(e) => setCoinId(e.target.value as string)}
                            label="Coin"
                        >
                            {coins.map(coin => (
                                <MenuItem key={coin.symbol} value={coin.symbol}>
                                    {coin.name} ({coin.symbol})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
                <Box mb={2}>
                    <FormControl fullWidth variant="outlined">
                        <InputLabel id="type-select-label">Type</InputLabel>
                        <Select
                            labelId="type-select-label"
                            value={transactionType}
                            onChange={(e) => setTransactionType(e.target.value as TransactionType)}
                            label="Type"
                        >
                            <MenuItem value="Buy">Buy</MenuItem>
                            <MenuItem value="Sell">Sell</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <Box mb={2}>
                    <TextField
                        fullWidth
                        label="Date"
                        type="datetime-local"
                        value={transactionDate}
                        onChange={(e) => setTransactionDate(e.target.value)}
                        required
                        variant="outlined"
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </Box>
                <Box mb={2}>
                    <TextField
                        fullWidth
                        label="Quantity"
                        type="number"
                        //step={0.00000001}
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                        variant="outlined"
                    />
                </Box>
                <Box mb={2}>
                    <TextField
                        fullWidth
                        label="Price"
                        type="number"
                        //step={0.00000001}
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                        variant="outlined"
                    />
                </Box>
                <Box mb={2}>
                    <TextField
                        fullWidth
                        label="Fee (optional)"
                        type="number"
                        //step={0.00000001}
                        value={fee}
                        onChange={(e) => setFee(e.target.value)}
                        variant="outlined"
                    />
                </Box>
                <Box mb={2}>
                    <TextField
                        fullWidth
                        label="Exchange (optional)"
                        value={exchange}
                        onChange={(e) => setExchange(e.target.value)}
                        variant="outlined"
                    />
                </Box>

                <Button type="submit" variant="contained" color="primary">
                    Add Transaction
                </Button>
            </form>
            {message && <Typography mt={2}>{message}</Typography>}
            {error && <Typography mt={2} color="error">{error}</Typography>}
        </Box>
    );
}

export default AddTransactionForm;