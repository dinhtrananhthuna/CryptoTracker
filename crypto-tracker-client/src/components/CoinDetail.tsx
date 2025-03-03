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
  InputLabel,
} from '@mui/material';
import { styled } from '@mui/system';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
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
    Line,

} from 'recharts';
import TransactionHistoryTable from './TransactionHistoryTable';
import { Transaction } from '../models';


const SectionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

// Interface cho kline data
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

// Interface cho CoinDetailDto
interface CoinDetailDto {
  symbol: string;
  name: string;
  image?: string;
  totalQuantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  currentValue: number;
  quoteAsset: string;
  highPrice: number;
  lowPrice: number;
  profitLoss: number;
}

// Custom tick formatter cho trục X (ngày/tháng/năm)
const CustomTickFormatter = (tick: number) => {
  const date = new Date(tick);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`; // D/M/YYYY
};

// Custom Tooltip (hiển thị ngày tháng theo định dạng MM-DD-YYYY)
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const date = new Date(data.openTime);
    const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}-${date.getFullYear()}`;

    return (
      <div className="custom-tooltip" style={{ backgroundColor: 'white', padding: '5px', border: '1px solid #ccc' }}>
        <p>{formattedDate}</p>
        <p>{`Close: ${data.close}`}</p>
        <p>{`Open: ${data.open}`}</p>
        <p>{`High: ${data.high}`}</p>
         <p>{`Low: ${data.low}`}</p>
        <p>{`Volume: ${data.volume}`}</p>
        {/* Thêm các thông tin khác nếu muốn */}
      </div>
    );
  }
  return null;
};

// Hàm tính Simple Moving Average (SMA)
function calculateSMA(data: BinanceKline[], period: number, field: keyof BinanceKline): (number | null)[] {
  const sma: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(null); // Không đủ dữ liệu
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
            const value = data[i - j][field];
            if(typeof value === 'number'){
                sum += value;
            }
            else{
                //Xử lý data
                return [];
            }
      }
      sma.push(sum / period);
    }
  }
  return sma;
}

function CoinDetail() {
  const [coin, setCoin] = useState<CoinDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [klines, setKlines] = useState<BinanceKline[]>([]);
  const [interval, setInterval] = useState('1d');
  const [maPeriod, setMaPeriod] = useState(20); // Chu kỳ MA (mặc định là 20)
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate(); // Lấy hook useNavigate

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

     const fetchTransactions = async (symbol: string) => {
         try {
            const response = await axios.get<Transaction[]>(`/api/transactions/bycoin/${symbol}`);
             setTransactions(response.data);
        } catch (error) {
             console.error("Error fetching transactions:", error);
          }
    };

  useEffect(() => {
    const fetchCoinDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get<CoinDetailDto>(`/api/coins/${symbol}/details`);
        setCoin(response.data);
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
// Fetch lại klines khi interval thay đổi
  useEffect(() => {
    if (coin) {
      fetchKlines(coin.symbol, interval);
    }
  }, [interval, coin]);

  //fetch transaction history
  useEffect(() => {
        if (coin?.symbol) {
            fetchTransactions(coin.symbol);
        }
    }, [coin?.symbol]);

  if (error) {
    return <Box p={2}><Typography color="error">{error}</Typography></Box>;
  }

  if (!coin) {
    return <Box p={2}><Typography>Coin not found.</Typography></Box>;
  }

    // Tính toán SMA (sau khi có dữ liệu klines)
    const sma20 = calculateSMA(klines, maPeriod, 'close');

    // Tạo một mảng dữ liệu mới, kết hợp klines và SMA
    const dataWithMA = klines.map((item, index) => ({
        ...item,
        sma20: sma20[index],
    }));

  const handleAddTransactionClick = () => {
    navigate(`/add-transaction?symbol=${coin.symbol}`); // Chuyển hướng, kèm theo symbol
  };

  return (
    <CustomLoading isLoading={loading}>
      <Box p={2}>
        {/* Header (giữ nguyên) */}
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
            <ComposedChart data={dataWithMA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="openTime" tickFormatter={CustomTickFormatter} />
              <YAxis  domain={['dataMin', 'dataMax']} />
              <Tooltip content={<CustomTooltip/>} />
              <Legend />
                {/* Đường MA */}
                 <Line type="monotone" dataKey="sma20" stroke="#ff7300" dot={false} />
                 {/* Đường giá (close) */}
                 <Line type="monotone" dataKey="close" stroke="#8884d8" dot={false} />
              <Brush dataKey="openTime" height={30} stroke="#8884d8" tickFormatter={CustomTickFormatter} />
            </ComposedChart>
          </ResponsiveContainer>
        </SectionPaper>

        {/* Coin Details, Description, Transaction History, Button (giữ nguyên) */}
         <SectionPaper>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6">Market Data</Typography>
                  <Divider sx={{ mb: 1 }} />
                  <Typography>24h High: ${coin ?  (coin.highPrice).toLocaleString(): 'Loading...'}</Typography>
                  <Typography>24h Low: ${coin? (coin.lowPrice).toLocaleString() : 'Loading...'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6">Your Holdings</Typography>
                  <Divider sx={{ mb: 1 }} />
                  <Typography>Total Quantity: {coin ? coin.totalQuantity: 'Loading'}</Typography>
                  <Typography>Average Buy Price: ${coin? coin.averageBuyPrice.toLocaleString(): 'Loading'}</Typography>
                  <Typography>Current Value: ${coin? coin.currentValue.toLocaleString() : 'Loading'}</Typography>
                  <Typography>
                    Profit/Loss:{' '}
                    <Chip
                      label={`${ coin? coin.profitLoss.toFixed(2) : 'Loading...'}`}
                      color={ coin && coin.profitLoss >= 0 ? 'success' : 'error'}
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
             <Divider sx={{ mb: 1 }} />
                {/* Sử dụng TransactionHistoryTable */}
              <TransactionHistoryTable transactions={transactions} />
            </SectionPaper>

            <Box mt={2} display="flex" justifyContent={"center"}>
                <Button variant="contained" color="primary" onClick={handleAddTransactionClick}>
                    Add Transaction
                </Button>
            </Box>
      </Box>
    </CustomLoading>
  );
}

export default CoinDetail;