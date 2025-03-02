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
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { styled } from '@mui/system';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import CustomLoading from './CustomLoading';
import {
    ComposedChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    Brush,
    ResponsiveContainer,
    BarChart,
    Bar,
    Rectangle
} from 'recharts';

const SectionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

// Interface cho kline data (nếu bạn chưa có)
interface BinanceKline {
    openTime: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    closeTime: number;
    quoteAssetVolume: number;
    numberOfTrades: number;
    takerBuyBaseAssetVolume: number;
    takerBuyQuoteAssetVolume: number;
}

// Interface cho CoinDetailDto (từ backend)
interface CoinDetailDto {
  symbol: string;
  name: string;
  image?: string; // Optional
  totalQuantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  currentValue: number;
  quoteAsset: string;
  highPrice: number; // Từ Binance 24h ticker
  lowPrice: number;   // Từ Binance 24h ticker
  profitLoss: number;
}
const CustomTickFormatter = (tick: number) => {
  return new Date(tick).toLocaleDateString(); // Or any other format you prefer
};
function CoinDetail() {
  const [coin, setCoin] = useState<CoinDetailDto | null>(null); // Sử dụng CoinDetailDto
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [klines, setKlines] = useState<BinanceKline[]>([]);
  const [interval, setInterval] = useState('1d');

  const { symbol } = useParams<{ symbol: string }>();

    // Fetch klines data
  const fetchKlines = async (symbol: string, interval: string) => {

      try{
        const response = await axios.get<BinanceKline[]>(`/api/Binance/klines?symbol=${symbol}&interval=${interval}`);
        setKlines(response.data);
        console.log(response.data)
      }
      catch(error: any){
         console.error("Error fetching Klines:", error);
      }
  }
  useEffect(() => {
    const fetchCoinDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get<CoinDetailDto>(`/api/coins/${symbol}/details`); // Gọi endpoint /details
        setCoin(response.data); // Dữ liệu trả về là CoinDetailDto
        setError(null);

        if(response.data){
            fetchKlines(response.data.symbol, interval);
        }
      } catch (error: any) {
        console.error('Error fetching coin details:', error);
        setError(error.response?.data || 'Failed to fetch coin details.');
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchCoinDetails();
    }
  }, [symbol]);
   useEffect(() => {
    if (coin) {
      fetchKlines(coin.symbol, interval);
    }
  }, [interval, coin]);

  if (error) {
    return <Box p={2}><Typography color="error">{error}</Typography></Box>;
  }

  if (!coin) {
    return <Box p={2}><Typography>Coin not found.</Typography></Box>;
  }

  // Không cần tính profitLoss ở đây nữa, vì đã có trong DTO

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
                </Box>
                </Grid>
            </Grid>
        </SectionPaper>

        {/* Chart */}
        <SectionPaper>
             <FormControl fullWidth>
                <InputLabel id="interval-select-label">Interval</InputLabel>
                <Select
                    labelId="interval-select-label"
                    id="interval-select"
                    value={interval}
                    label="Interval"
                    onChange={(e) => setInterval(e.target.value as string)}
                >
                    <MenuItem value="1d">1 Day</MenuItem>
                    <MenuItem value="4h">4 Hours</MenuItem>
                    <MenuItem value="1h">1 Hour</MenuItem>
                     <MenuItem value="15m">15 Minutes</MenuItem>
                </Select>
            </FormControl>
            <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={klines} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="openTime" tickFormatter={CustomTickFormatter}  />
                    <YAxis type="number" domain={['dataMin', 'dataMax']} />
                    <Tooltip />
                    <Legend />

                    {klines.map((entry, index) => (
                        <Rectangle
                            key={`candle-${index}`}
                            x={index * (100 / (klines.length + 2)) }
                            y={Math.max(entry.open, entry.close)}
                            width={(100 / (klines.length + 2)) * 0.8}
                            height={Math.abs(entry.open - entry.close)}
                            fill={entry.open > entry.close ? '#ef5350' : '#26a69a'}
                            radius={[4, 4, 0, 0]}
                        />
                    ))}
                <BarChart data={klines}>
                    <Bar dataKey="volume" fill="#8884d8"  />
                </BarChart>
                <Brush dataKey="openTime" height={30} stroke="#8884d8" tickFormatter={CustomTickFormatter} />
                </ComposedChart>
            </ResponsiveContainer>
        </SectionPaper>

        {/* Coin Details */}
        <SectionPaper>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Market Data</Typography>
              <Divider sx={{ mb: 1 }} />
              <Typography>24h High: ${coin.highPrice.toLocaleString()}</Typography>
              <Typography>24h Low: ${coin.lowPrice.toLocaleString()}</Typography>
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
                  label={`${coin.profitLoss.toFixed(2)}`}
                  color={coin.profitLoss >= 0 ? 'success' : 'error'}
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