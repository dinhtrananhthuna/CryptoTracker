import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
    Divider,
} from '@mui/material';
import { Coin, Transaction, TransactionType } from '../models';

function AddTransactionForm({ onTransactionAdded }: { onTransactionAdded?: () => void }) {
    const [coinId, setCoinId] = useState('');
    const [transactionType, setTransactionType] = useState<TransactionType>(TransactionType.Buy);
    const [transactionDate, setTransactionDate] = useState(new Date().toISOString().slice(0, 16));
    const [quantity, setQuantity] = useState<number | null>(null); // Sửa kiểu
    const [price, setPrice] = useState<number | null>(null);     // Sửa kiểu
    const [fee, setFee] = useState<number | null>(null);       // Sửa kiểu
    const [exchange, setExchange] = useState('');
    const [notes, setNotes] = useState('');                 // Thêm state notes
    const [message, setMessage] = useState('');
    const [coins, setCoins] = useState<Coin[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [searchParams] = useSearchParams();
    const symbol = searchParams.get('symbol');

    useEffect(() => {
        const fetchCoins = async () => {
            try {
                const response = await axios.get<{ data: Coin[], totalCount: number }>('/api/coins');
                setCoins(response.data.data);
                if (response.data.data.length > 0 && !symbol) { // Chỉ set nếu không có symbol từ URL
                    setCoinId(response.data.data[0].symbol);
                }
            } catch (error) {
                console.error("Error fetching coins:", error);
                setError("Failed to fetch coins.");
            }
        };
        fetchCoins();

        // Nếu có symbol từ URL, set CoinId
        if (symbol) {
            setCoinId(symbol);
        }
    }, [symbol]); // Thêm symbol vào dependency array

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setMessage('');
        setError(null)

        // Kiểm tra symbol
        if (!symbol && !coinId) {
            setError("Coin symbol is required.");
            return;
        }

        const transactionCoinId = symbol || coinId;

        // Tạo object newTransaction
        const newTransaction: Omit<Transaction, 'transactionId'> = {
            coinId: transactionCoinId, // Dùng transactionCoinId
            transactionType: transactionType,
            transactionDate: transactionDate,
            quantity: quantity!,
            price: price!,
            fee: fee === null ? 0 : fee,  // Xử lý null cho fee
            exchange: exchange,
            notes: notes, // Sử dụng notes
        };

        try {
            const response = await axios.post<Transaction>('/api/transactions', newTransaction);
            setMessage('Transaction added successfully!');
            // Reset form
            // setCoinId(''); // Không reset coinId nếu đang ở trang detail
            setTransactionType(TransactionType.Buy);
            setTransactionDate(new Date().toISOString().slice(0, 16));
            setQuantity(null); // Reset
            setPrice(null);   // Reset
            setFee(null);     // Reset
            setExchange('');
            setNotes('');    // Reset notes

            if (onTransactionAdded) {
              onTransactionAdded();
            }

        } catch (error: any) {
            console.error("Error adding transaction:", error);
            let errorMessage = "An error occurred while adding the transaction.";

            if (error.response) {
                if (error.response.data) {
                    if (error.response.data.detail) {
                        errorMessage = error.response.data.detail;
                    } else if (error.response.data.message) {
                        errorMessage = error.response.data.message;
                    } else if (error.response.data.errors) {
                      const errorMessages = [];
                        for (const key in error.response.data.errors) {
                            errorMessages.push(error.response.data.errors[key].join(' '));
                        }
                        errorMessage = errorMessages.join(' ');
                    } else {
                      errorMessage = "Error: " + error.response.status; // Nếu không có message cụ thể
                    }
                }
            } else if (error.request) {
                errorMessage = "No response received from the server.";
            } else {
                errorMessage = error.message;
            }
            setError(errorMessage);
        }
    };

    return (
        <Box p={2}>
            <Box>
                <Typography variant="h5">Add New Transaction</Typography>
            </Box>
            <Box p={2}>
                <form onSubmit={handleSubmit}>
                    <Box mb={2}>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel id="coin-select-label">Coin</InputLabel>
                            <Select
                                labelId="coin-select-label"
                                id="coin-select"
                                value={coinId}
                                onChange={(e) => setCoinId(e.target.value as string)}
                                label="Coin"
                                disabled={!!symbol} // Disable nếu có symbol từ URL
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
                                id="type-select"
                                value={transactionType}
                                onChange={(e) => setTransactionType(e.target.value as TransactionType)}
                                label="Type"
                            >
                                <MenuItem value={TransactionType.Buy}>Buy</MenuItem>
                                <MenuItem value={TransactionType.Sell}>Sell</MenuItem>
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
                            value={quantity === null ? '' : quantity} // Xử lý null
                            onChange={(e) => {
                                const value = e.target.value;
                                setQuantity(value === '' ? null : parseFloat(value));
                            }}
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
                            value={price === null ? '' : price} // Xử lý null
                            onChange={(e) => {
                                const value = e.target.value;
                                setPrice(value === '' ? null : parseFloat(value));
                            }}
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
                            value={fee === null ? '' : fee} // Xử lý null
                            onChange={(e) => {
                                const value = e.target.value;
                                setFee(value === '' ? null : parseFloat(value));
                            }}
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
                    <Box mb={2}>
                        <TextField
                            fullWidth
                            label="Notes (optional)"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            variant="outlined"
                            multiline
                            rows={4}  // Nếu bạn muốn nhiều dòng
                        />
                    </Box>

                    <Button type="submit" variant="contained" color="primary">
                        Add Transaction
                    </Button>
                </form>
                {message && <Typography mt={2}>{message}</Typography>}
                {error && <Typography mt={2} color="error">{error}</Typography>}
            </Box>
        </Box> 
    );
}

export default AddTransactionForm;