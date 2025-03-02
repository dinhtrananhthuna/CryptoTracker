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
import CustomLoading from './CustomLoading'; // Import CustomLoading

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
    return <CustomLoading isLoading={loading} rows={4} columns={1} ><Box p={2}><Typography>Coin not found.</Typography></Box></CustomLoading>;
  }


  const profitLoss = (coin.currentPrice - coin.averageBuyPrice) * coin.totalQuantity;

  return (
    <CustomLoading isLoading={loading} rows={4} columns={1}> {/* Bọc nội dung trong CustomLoading */}
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
          <ChartPlaceholder />
        </SectionPaper>

        {/* Coin Details */}
        <SectionPaper>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Market Data</Typography>
              <Divider sx={{ mb: 1 }} />
              <Typography>Market Cap: $0</Typography>
              <Typography>24h High: $0</Typography>
              <Typography>24h Low: $0</Typography>
              <Typography>Total Supply: 0</Typography>
              <Typography>Circulating Supply: 0</Typography>
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

        {/* Transaction History */}
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