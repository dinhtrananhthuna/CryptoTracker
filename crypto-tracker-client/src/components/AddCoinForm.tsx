// src/components/AddCoinForm.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Box, Typography } from '@mui/material';
import { Coin } from '../models';

function AddCoinForm() {
    const [symbol, setSymbol] = useState('');
    const [totalQuantity, setTotalQuantity] = useState('');
    const [averageBuyPrice, setAverageBuyPrice] = useState('');
    const [image, setImage] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState<string | null>(null); // Thêm state error

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setMessage('');
        setError(null);

        try {
            const newCoin: Partial<Coin> = {
                symbol: symbol,
                totalQuantity: parseFloat(totalQuantity),
                averageBuyPrice: parseFloat(averageBuyPrice),
                image: image,
            };

            const response = await axios.post<Coin>('/api/coins', newCoin);
            setMessage(`Coin "${response.data.name}" added successfully!`);
            setSymbol('');
            setTotalQuantity('');
            setAverageBuyPrice('');
            setImage('');
        } catch (error: any) {
            console.error("Error adding coin:", error);
            const errorMessage = error.response?.data || error.message;
            setError(errorMessage); // Set error message
        }
    };

    return (
        <Box p={2}>
            <Typography variant="h5">Add New Coin</Typography>
            <form onSubmit={handleSubmit}>
                <Box mb={2}>
                    <TextField
                        fullWidth
                        label="Symbol (Binance)"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value)}
                        required
                        variant="outlined"
                    />
                </Box>
                <Box mb={2}>
                    <TextField
                        fullWidth
                        label="Total Quantity"
                        type="number"
                        //step="0.00000001"
                        value={totalQuantity}
                        onChange={(e) => setTotalQuantity(e.target.value)}
                        required
                        variant="outlined"
                    />
                </Box>
                <Box mb={2}>
                    <TextField
                        fullWidth
                        label="Average Buy Price"
                        type="number"
                        //step="0.00000001"
                        value={averageBuyPrice}
                        onChange={(e) => setAverageBuyPrice(e.target.value)}
                        required
                        variant="outlined"
                    />
                </Box>
                <Box mb={2}>
                    <TextField
                        fullWidth
                        label="Image URL (optional)"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        variant="outlined"
                    />
                </Box>

                <Button type="submit" variant="contained" color="primary">
                    Add Coin
                </Button>
            </form>
            {message && <Typography mt={2}>{message}</Typography>}
            {error && <Typography mt={2} color="error">{error}</Typography>} {/* Hiển thị error */}
        </Box>
    );
}

export default AddCoinForm;