// src/components/CoinDetail.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import {
    Card,
    CardContent,
    Typography,
    Avatar,
    Box,
    CircularProgress,
} from '@mui/material';
import { Coin } from '../models';

function CoinDetail() {
    const [coin, setCoin] = useState<Coin | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { symbol } = useParams<{ symbol: string }>();

    useEffect(() => {
        const fetchCoin = async () => {
            setLoading(true);
            try {
                const response = await axios.get<Coin>(`/api/coins/${symbol}`);
                setCoin(response.data);
                setError(null);
            } catch (error) {
                console.error('Error fetching coin:', error);
                setError('Failed to fetch coin details.');
            } finally {
                setLoading(false);
            }
        };

        if (symbol) {
            fetchCoin();
        }
    }, [symbol]);

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

    if (!coin) {
        return <Box p={2}><Typography>Coin not found.</Typography></Box>; // Hoặc redirect đến trang 404
    }

    return (
        <Card>
            <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                    {coin.image && (
                        <Avatar src={coin.image} alt={coin.name} sx={{ width: 56, height: 56, mr: 2 }} />
                    )}
                    <Typography variant="h5" component="div">
                        {coin.name} ({coin.symbol})
                    </Typography>
                </Box>
                 <Typography>Quote Asset: {coin.quoteAsset}</Typography>
                <Typography>Total Quantity: {coin.totalQuantity}</Typography>
                <Typography>Average Buy Price: {coin.averageBuyPrice}</Typography>
                <Typography>Current Price: {coin.currentPrice}</Typography>
                <Typography>Current Value: {coin.currentValue}</Typography>
            </CardContent>
        </Card>
    );
}

export default CoinDetail;