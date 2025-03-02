import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography, // Xóa CircularProgress
    Box,
    TableSortLabel,
    TextField,
    InputAdornment,
    IconButton,
    Pagination,
    Button,
    Grid,
    Chip
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { Coin } from '../models';
import { useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';
import CustomLoading from './CustomLoading'; // Import CustomLoading


// ... (headCells, EnhancedTableProps, EnhancedTableHead - giữ nguyên) ...
interface HeadCell {
    id: keyof Coin | 'profitLoss';
    label: string;
    numeric: boolean;
}

const headCells: readonly HeadCell[] = [
    { id: 'symbol', numeric: false, label: 'Symbol' },
    { id: 'name', numeric: false, label: 'Name' },
    { id: 'quoteAsset', numeric: false, label: 'Quote Asset' },
    { id: 'totalQuantity', numeric: true, label: 'Total Quantity' },
    { id: 'averageBuyPrice', numeric: true, label: 'Average Buy Price' },
    { id: 'currentPrice', numeric: true, label: 'Current Price' },
    { id: 'currentValue', numeric: true, label: 'Current Value' },
    { id: 'profitLoss', numeric: true, label: 'Profit/Loss' },
    { id: 'image', numeric: false, label: 'View Detail' },

];

interface EnhancedTableProps {
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Coin | 'profitLoss') => void;
    order: 'asc' | 'desc';
    orderBy: string;

}

function EnhancedTableHead(props: EnhancedTableProps) {
    const { order, orderBy, onRequestSort } = props;

    const createSortHandler =
        (property: keyof Coin | 'profitLoss') => (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

    return (
        <TableHead>
            <TableRow>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.numeric ? 'right' : 'left'}
                        sortDirection={orderBy === headCell.id ? order : false}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={createSortHandler(headCell.id)}
                        >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                                <Box component="span" sx={visuallyHidden}>
                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                </Box>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

function CoinList() {
    const [coins, setCoins] = useState<Coin[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');
    const [orderBy, setOrderBy] = useState<keyof Coin | 'profitLoss'>('symbol');
    const [filter, setFilter] = useState('');
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
     const navigate = useNavigate();

    const fetchCoins = useCallback(async () => {
        setLoading(true); // Bắt đầu loading
        try {
            const response = await axios.get<{ data: Coin[], totalCount: number }>('/api/coins', {
                params: {
                    sort: orderBy,
                    order: order,
                    filter: filter,
                    page: page,
                    pageSize: rowsPerPage
                }
            });

            // Kiểm tra xem response.data có phải là mảng không
            if (Array.isArray(response.data.data)) {
                setCoins(response.data.data);
            } else {
                // Xử lý trường hợp response.data.data không phải là mảng
                console.error("API returned unexpected data format:", response.data);
                setError("Data format error.");
                setCoins([]); // Đặt coins thành mảng rỗng để tránh lỗi map
            }

            setTotalCount(response.data.totalCount);
            setError(null); // Xóa lỗi cũ (nếu có)

        } catch (error) {
            console.error("Error fetching coins:", error);
            setError("Failed to fetch coins. Please check your API connection and data format.");
            setCoins([]); // Đặt coins thành mảng rỗng trong trường hợp lỗi
        } finally {
            setLoading(false); // Kết thúc loading
        }
    }, [order, orderBy, filter, page, rowsPerPage]);

    useEffect(() => {
        fetchCoins();
    }, [fetchCoins]);

    const handleRequestSort = (
        event: React.MouseEvent<unknown>,
        property: keyof Coin | 'profitLoss',
    ) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
        setPage(1); // Reset page về 1 khi sort
    };
    //Debounce
    const debouncedFetchCoins = useCallback(debounce(fetchCoins, 300), [fetchCoins]);
    // Sử dụng useCallback với handleFilterChange
    const handleFilterChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = event.target.value;
            setFilter(newValue);
            setPage(1);
            debouncedFetchCoins(); // Gọi hàm đã debounce khi giá trị thay đổi
        },
        [debouncedFetchCoins] // Phụ thuộc vào debouncedFetchCoins
    );

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleResetFilter = () => {
        setFilter('');
        setPage(1)
    };
    const handleViewDetail = (symbol: string) => {
        navigate(`/coin/${symbol}`);
    };


    if (error) {
        return (
            <Box p={2}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    //  Không cần check loading ở đây nữa

    return (
        <Box p={2}>
            <Typography variant="h4" gutterBottom>Coin List</Typography>

            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={8}>
                    <TextField
                        fullWidth
                        label="Search by Symbol/Name"
                        variant="outlined"
                        margin="normal"
                        value={filter}
                        onChange={handleFilterChange} // Sử dụng handleFilterChange
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                     <IconButton onClick={debouncedFetchCoins}>
                                        <SearchIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleResetFilter}
                        startIcon={<ClearIcon />}
                    >
                        Reset Filter
                    </Button>
                </Grid>
            </Grid>
            {/* Bọc TableContainer trong CustomLoading */}
            <CustomLoading isLoading={loading} rows={10} columns={8}>

                <TableContainer component={Paper}>
                    <Table aria-label="coin table">
                        <EnhancedTableHead
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={handleRequestSort}
                        />
                        <TableBody>
                            {coins.map((coin) => {
                                const profitLoss = (coin.currentPrice - coin.averageBuyPrice) * coin.totalQuantity;

                                return (
                                    <TableRow key={coin.symbol}>
                                        <TableCell component="th" scope="row">
                                            {coin.symbol}
                                        </TableCell>
                                        <TableCell>{coin.name}</TableCell>
                                        <TableCell align="right">{coin.quoteAsset}</TableCell>
                                        <TableCell align="right">{coin.totalQuantity}</TableCell>
                                        <TableCell align="right">{coin.averageBuyPrice}</TableCell>
                                        <TableCell align="right">{coin.currentPrice}</TableCell>
                                        <TableCell align="right">{coin.currentValue}</TableCell>
                                        <TableCell align="right">
                                             <Chip
                                                label={`${profitLoss.toFixed(2)}`}
                                                color={profitLoss >= 0 ? 'success' : 'error'}
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                              <Button variant="outlined" color="primary" onClick={() => handleViewDetail(coin.symbol)}>
                                                View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CustomLoading>

            <Box mt={2} display="flex" justifyContent="center">
                <Pagination
                    count={Math.ceil(totalCount / rowsPerPage)}
                    page={page}
                    onChange={handleChangePage}
                    color="primary"
                />
            </Box>
        </Box>
    );
}

export default CoinList;