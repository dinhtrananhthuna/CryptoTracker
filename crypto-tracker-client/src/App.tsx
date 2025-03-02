// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import CoinList from './components/CoinList';
import TransactionList from './components/TransactionList';
import AddCoinForm from './components/AddCoinForm';
import AddTransactionForm from './components/AddTransactionForm';
import CoinDetail from './components/CoinDetail';
import './App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <nav>
                    <ul>
                        <li>
                            <Link to="/">Coins</Link>
                        </li>
                        <li>
                            <Link to="/transactions">Transactions</Link>
                        </li>
                        <li>
                            <Link to="/add-coin">Add Coin</Link>
                        </li>
                        <li>
                            <Link to="/add-transaction">Add Transaction</Link>
                        </li>
                    </ul>
                </nav>

                <Routes>
                    <Route path="/" element={<CoinList />} />
                    <Route path="/transactions" element={<TransactionList />} />
                    <Route path="/add-coin" element={<AddCoinForm />} />
                    <Route path="/add-transaction" element={<AddTransactionForm />} />
                    <Route path="/coin/:symbol" element={<CoinDetail />} />
                    <Route path="*" element={<div>404 Not Found</div>}/>
                </Routes>
            </div>
        </Router>
    );
}

export default App;