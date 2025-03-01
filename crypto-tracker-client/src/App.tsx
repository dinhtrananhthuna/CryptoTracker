// src/App.tsx
import React, { useState, useEffect } from 'react';
import { getCoins } from './services/api';
import './App.css';

function App() {
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const data = await getCoins();
        setCoins(data);
      } catch (error) {
        console.error('Error fetching coins:', error);
      }
    };

    fetchCoins();
  }, []);

  return (
    <div className="App">
      <h1>Crypto Tracker</h1>
      <ul>
        {coins.map((coin: any) => (
          <li key={coin.coinId}>{coin.name} ({coin.symbol})</li>
        ))}
      </ul>
    </div>
  );
}

export default App;