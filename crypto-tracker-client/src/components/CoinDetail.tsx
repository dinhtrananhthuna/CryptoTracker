// src/components/CoinDetail.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Coin } from '../models';

function CoinDetail() {
  const [coin, setCoin] = useState<Coin | null>(null); // Có thể là null
  const [error, setError] = useState<string | null>(null);
  const { symbol } = useParams<{ symbol: string }>(); // Lấy symbol từ URL

  useEffect(() => {
    const fetchCoin = async () => {
      try {
        const response = await axios.get<Coin>(`/api/coins/${symbol}`); // Chỉ định kiểu
        setCoin(response.data);
        setError(null)
      } catch (error) {
        console.error('Error fetching coin:', error);
        setError('Failed to fetch coin details.');
      }
    };
     if (symbol) {
          fetchCoin();
        }
  }, [symbol]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!coin) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>{coin.name} ({coin.symbol})</h2>
       <p>Quote Asset: {coin.quoteAsset}</p>
      <p>Total Quantity: {coin.totalQuantity}</p>
      <p>Average Buy Price: {coin.averageBuyPrice}</p>
      <p>Current Price: {coin.currentPrice}</p>
      <p>Current Value: {coin.currentValue}</p>
      {coin.image && <img src={coin.image} alt={coin.name} />}
    </div>
  );
}

export default CoinDetail;