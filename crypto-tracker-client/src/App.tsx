// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CoinList from './components/CoinList';
import TransactionList from './components/TransactionList';
import AddCoinForm from './components/AddCoinForm';
import AddTransactionForm from './components/AddTransactionForm';
import CoinDetail from './components/CoinDetail';
import Layout from './components/Layout'; // Import Layout
import './App.css';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme(); // Hoặc custom theme của bạn

function App() {
  return (
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<CoinList />} />
                    <Route path="/transactions" element={<TransactionList />} />
                    <Route path="/add-coin" element={<AddCoinForm />} />
                    <Route path="/add-transaction" element={<AddTransactionForm />} />
                    <Route path="/coin/:symbol" element={<CoinDetail />} />
                    <Route path="*" element={<div>404 Not Found</div>} />
                </Routes>
            </Layout>
        </Router>
    </ThemeProvider>
  );
}

export default App;