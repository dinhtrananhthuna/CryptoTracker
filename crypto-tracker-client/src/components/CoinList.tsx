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
    CircularProgress,
    Typography,
    Box,
    TableSortLabel,
    TextField,
    InputAdornment,
    IconButton,
    Pagination,
    Button,  // Import Button
    Grid      // For layout
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear'; // Import Clear icon
import { Coin } from '../models';
import { useNavigate } from 'react-router-dom';

// ... (headCells, EnhancedTableProps, EnhancedTableHead - giữ nguyên) ...
interface HeadCell {
    id: keyof Coin;
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
    { id: 'image', numeric: false, label: 'View Detail' }, //for view detail
];
interface EnhancedTableProps {
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Coin) => void;
    order: 'asc' | 'desc';
    orderBy: string;

}

function EnhancedTableHead(props: EnhancedTableProps) {
    const { order, orderBy, onRequestSort } = props;

    const createSortHandler =
        (property: keyof Coin) => (event: React.MouseEvent<unknown>) => {
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
    const [orderBy, setOrderBy] = useState<keyof Coin>('symbol');
    const [filter, setFilter] = useState('');
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const navigate = useNavigate();

    const debounce = useCallback(
        (func: (...args: any[]) => void, delay: number) => {
            let timeoutId: NodeJS.Timeout;
            return (...args: any[]) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func(...args);
                }, delay);
            };
        },
        []
    );

    const fetchCoins = useCallback(async () => {
        setLoading(true);
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
            setCoins(response.data.data);
            setTotalCount(response.data.totalCount);
            setError(null);
        } catch (error) {
            console.error("Error fetching coins:", error);
            setError("Failed to fetch coins. Please check your API connection.");
        } finally {
            setLoading(false);
        }
    }, [order, orderBy, filter, page, rowsPerPage]);

    useEffect(() => {
        fetchCoins();
    }, [fetchCoins]);

    const handleRequestSort = (
        event: React.MouseEvent<unknown>,
        property: keyof Coin,
    ) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
        setPage(1);
    };

    const handleFilterChange = debounce((value: string) => {
        setFilter(value);
        setPage(1);
    }, 300);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleResetFilter = () => {
        setFilter(''); // Xóa giá trị filter
        // Không cần gọi fetchCoins() ở đây, vì useEffect sẽ theo dõi thay đổi của filter
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

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress />
            </Box>
        );
    }

    if (!coins || coins.length === 0) {
        return <Box p={2}><Typography>No coins found.</Typography></Box>;
    }

    return (
        <Box p={2}>
            <Typography variant="h4" gutterBottom>Coin List</Typography>

            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={10}>
                    <TextField
                        fullWidth
                        label="Search by Symbol/Name"
                        variant="outlined"
                        margin="normal"
                        onChange={(e) => handleFilterChange(e.target.value)}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton>
                                        <SearchIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={2}>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleResetFilter}
                        startIcon={<ClearIcon />} // Thêm icon cho đẹp
                    >
                        Reset Filter
                    </Button>
                </Grid>
            </Grid>

            <TableContainer component={Paper}>
                <Table aria-label="coin table">
                   <EnhancedTableHead
                        order={order}
                        orderBy={orderBy}
                        onRequestSort={handleRequestSort}
                    />
                    <TableBody>
                        {coins.map((coin) => (
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
                                    <Button variant="outlined" color="primary" onClick={() => handleViewDetail(coin.symbol)}>
                                         View Details
                                     </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

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