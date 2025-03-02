// src/components/CoinList.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Coin } from '../models';

function CoinList() {
    const [coins, setCoins] = useState<Coin[]>([]);
    const [error, setError] = useState<string | null>(null); // Khai báo kiểu string | null

    useEffect(() => {
        const fetchCoins = async () => {
            try {
                const response = await axios.get('/api/coins');
                setCoins(response.data);
                setError(null);
            } catch (error) {
                console.error("Error fetching coins:", error);
                setError("Failed to fetch coins. Please check your API connection."); // OK
            }
        };

        fetchCoins();
    }, []);

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!coins || coins.length === 0) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>Coin List</h2>
            <table>
                <thead>
                    <tr>
                        <th>Symbol</th>
                        <th>Name</th>
                        <th>Quote Asset</th>
                        <th>Total Quantity</th>
                        <th>Average Buy Price</th>
                        <th>Current Price</th>
                        <th>Current Value</th>
                    </tr>
                </thead>
                <tbody>
                    {coins.map(coin => (
                        <tr key={coin.symbol}>
                            <td>{coin.symbol}</td>
                            <td>{coin.name}</td>
                            <td>{coin.quoteAsset}</td>
                            <td>{coin.totalQuantity}</td>
                            <td>{coin.averageBuyPrice}</td>
                            <td>{coin.currentPrice}</td>
                            <td>{coin.currentValue}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default CoinList;