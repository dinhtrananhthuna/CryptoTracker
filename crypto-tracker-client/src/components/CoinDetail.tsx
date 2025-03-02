import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Avatar,
  Chip,
  Divider,
  Button,
  Paper,
} from '@mui/material';
import { styled } from '@mui/system';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Coin } from '../models';
import CustomLoading from './CustomLoading';

const SectionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const ChartPlaceholder = () => (
  <Box
    sx={{
      height: 300,
      width: '100%',
      backgroundColor: 'grey.200',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <Typography>Chart Placeholder</Typography>
  </Box>
);

interface Binance24hrTicker {  // Định nghĩa interface cho data 24h
    highPrice: string;
    lowPrice: string;
}

function CoinDetail() {
  const [coin, setCoin] = useState<Coin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticker24h, setTicker24h] = useState<Binance24hrTicker | null>(null); // Thêm state

  const { symbol } = useParams<{ symbol: string }>();

  useEffect(() => {
    const fetchCoin = async () => {
      setLoading(true);
      try {
        const response = await axios.get<Coin>(`/api/coins/${symbol}`);
        setCoin(response.data);
        setError(null);

           // Gọi API để lấy 24h ticker data
        const tickerResponse = await axios.get<Binance24hrTicker>(`/api/Binance/Get24hrTicker?symbol=${symbol}`); // Giả sử bạn có endpoint này
        setTicker24h(tickerResponse.data);

      } catch (error: any) {
        console.error('Error fetching coin:', error);
        setError(error.response?.data || 'Failed to fetch coin details.');
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchCoin();
    }
  }, [symbol]);

  if (error) {
    return <Box p={2}><Typography color="error">{error}</Typography></Box>;
  }

  if (!coin) {
     return <Box p={2}><Typography>Coin not found.</Typography></Box>; // Hoặc redirect đến trang 404
  }

  const profitLoss = (coin.currentPrice - coin.averageBuyPrice) * coin.totalQuantity;

  return (
    <CustomLoading isLoading={loading}>
      <Box p={2}>
        {/* Header */}
        <SectionPaper>
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <Avatar src={coin.image} alt={coin.name} sx={{ width: 56, height: 56 }} />
            </Grid>
            <Grid item>
              <Typography variant="h5">{coin.name} ({coin.symbol})</Typography>
            </Grid>
            <Grid item xs>
              <Box display="flex" justifyContent="flex-end" alignItems="center">
                <Typography variant="h6" sx={{ mr: 1 }}>
                  ${coin.currentPrice.toLocaleString()}
                </Typography>
                {/* Placeholder for 24h change */}
              </Box>
            </Grid>
          </Grid>
        </SectionPaper>

        {/* Chart */}
        <SectionPaper>
            <ChartPlaceholder/>
        </SectionPaper>

        {/* Coin Details */}
        <SectionPaper>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Market Data</Typography>
              <Divider sx={{ mb: 1 }} />
                {/* Sử dụng ticker24h data */}
                <Typography>24h High: ${ticker24h ? parseFloat(ticker24h.highPrice).toLocaleString() : 'Loading...'}</Typography>
                <Typography>24h Low: ${ticker24h ? parseFloat(ticker24h.lowPrice).toLocaleString() : 'Loading...'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Your Holdings</Typography>
              <Divider sx={{ mb: 1 }} />
              <Typography>Total Quantity: {coin.totalQuantity}</Typography>
              <Typography>Average Buy Price: ${coin.averageBuyPrice.toLocaleString()}</Typography>
              <Typography>Current Value: ${coin.currentValue.toLocaleString()}</Typography>
              <Typography>
                Profit/Loss:{' '}
                <Chip
                  label={`${profitLoss.toFixed(2)}`}
                  color={profitLoss >= 0 ? 'success' : 'error'}
                  variant="outlined"
                />
              </Typography>
            </Grid>
          </Grid>
        </SectionPaper>

        {/* Description */}
         <SectionPaper>
            <Typography variant="h6">Description</Typography>
            <Divider sx={{ mb: 1 }} />
            <Typography>No Description</Typography>
          </SectionPaper>
         <SectionPaper>
              <Typography variant="h6">Transaction History</Typography>
                <Typography>Transaction history table will go here.</Typography>
          </SectionPaper>

        <Box mt={2} display="flex" justifyContent={"center"}>
            <Button variant="contained" color="primary">
                Add Transaction
            </Button>
        </Box>
      </Box>
    </CustomLoading>
  );
}

export default CoinDetail;