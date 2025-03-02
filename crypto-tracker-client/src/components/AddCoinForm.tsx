// src/components/AddCoinForm.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { Coin } from '../models'; // Import interface

function AddCoinForm() {
  const [symbol, setSymbol] = useState('');
  const [totalQuantity, setTotalQuantity] = useState('');
  const [averageBuyPrice, setAverageBuyPrice] = useState('');
  const [image, setImage] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent) => { // Sử dụng React.FormEvent
    event.preventDefault();
    setMessage('');

    try {
      const newCoin: Partial<Coin> = { // Partial<Coin> cho phép bỏ qua các required fields
        symbol: symbol,
        totalQuantity: parseFloat(totalQuantity),
        averageBuyPrice: parseFloat(averageBuyPrice),
        image: image,
      };

      const response = await axios.post<Coin>('/api/coins', newCoin); // Chỉ định kiểu dữ liệu
      setMessage(`Coin "${response.data.name}" added successfully!`);
      setSymbol('');
      setTotalQuantity('');
      setAverageBuyPrice('');
      setImage('');
    } catch (error: any) {
      console.error("Error adding coin:", error);
      if (error.response) {
        setMessage("Error: " + error.response.data);
      } else if (error.request) {
        setMessage("Error: No response from server");
      } else {
        setMessage("Error: " + error.message);
      }
    }
  };

  return (
    <div>
      <h2>Add New Coin</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Symbol (Binance):</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Total Quantity:</label>
          <input
            type="number"
            step="0.00000001"
            value={totalQuantity}
            onChange={(e) => setTotalQuantity(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Average Buy Price:</label>
          <input
            type="number"
            step="0.00000001"
            value={averageBuyPrice}
            onChange={(e) => setAverageBuyPrice(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Image URL (optional):</label>
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
        </div>

        <button type="submit">Add Coin</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default AddCoinForm;