// src/components/AddTransactionForm.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Coin, Transaction } from '../models';

function AddTransactionForm() {
    const [coinId, setCoinId] = useState('');
    const [transactionType, setTransactionType] = useState<'Buy' | 'Sell'>('Buy'); // Cụ thể hóa kiểu
    const [transactionDate, setTransactionDate] = useState(new Date().toISOString().slice(0, 16));
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [fee, setFee] = useState('');
    const [exchange, setExchange] = useState('');
    const [message, setMessage] = useState('');
    const [coins, setCoins] = useState<Coin[]>([]);

    useEffect(() => {
        const fetchCoins = async () => {
            try {
                const response = await axios.get<Coin[]>('/api/coins'); // Chỉ định kiểu
                setCoins(response.data);
                if (response.data.length > 0) {
                    setCoinId(response.data[0].symbol);
                }
            } catch (error) {
                console.error("Error fetching coins:", error);
            }
        };
        fetchCoins();
    }, []);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            const newTransaction: Omit<Transaction, 'transactionId'> = { // Bỏ qua transactionId
                coinId: coinId,
                transactionType: transactionType,
                transactionDate: transactionDate,
                quantity: parseFloat(quantity),
                price: parseFloat(price),
                fee: parseFloat(fee || '0'), //  parseFloat(undefined) sẽ là NaN
                exchange: exchange,
            };

            const response = await axios.post<Transaction>('/api/transactions', newTransaction); // Chỉ định kiểu
            setMessage('Transaction added successfully!');
            // Reset form
            setCoinId('');
            setTransactionType('Buy');
            setTransactionDate(new Date().toISOString().slice(0, 16));
            setQuantity('');
            setPrice('');
            setFee('');
            setExchange('');

        } catch (error: any) {
            console.error("Error adding transaction:", error);
            setMessage("Error: " + (error.response?.data || error.message));
        }
    };

    return (
        <div>
            <h2>Add New Transaction</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Coin:</label>
                    <select value={coinId} onChange={(e) => setCoinId(e.target.value)}>
                        {coins.map(coin => (
                            <option key={coin.symbol} value={coin.symbol}>
                                {coin.name} ({coin.symbol})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Type:</label>
                    <select value={transactionType} onChange={(e) => setTransactionType(e.target.value as 'Buy'|'Sell')}>
                        <option value="Buy">Buy</option>
                        <option value="Sell">Sell</option>
                    </select>
                </div>
                <div>
                    <label>Date:</label>
                    <input
                        type="datetime-local"
                        value={transactionDate}
                        onChange={(e) => setTransactionDate(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Quantity:</label>
                    <input
                        type="number"
                        step="0.00000001"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Price:</label>
                    <input
                        type="number"
                        step="0.00000001"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Fee (optional):</label>
                    <input
                        type="number"
                        step="0.00000001"
                        value={fee}
                        onChange={(e) => setFee(e.target.value)}
                    />
                </div>
                <div>
                    <label>Exchange (optional):</label>
                    <input
                        type="text"
                        value={exchange}
                        onChange={(e) => setExchange(e.target.value)}
                    />
                </div>

                <button type="submit">Add Transaction</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}

export default AddTransactionForm;