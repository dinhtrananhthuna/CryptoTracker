// src/components/TransactionList.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Transaction } from '../models'; // Import interface

function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get<Transaction[]>('/api/transactions'); // Chỉ định kiểu dữ liệu
        setTransactions(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setError("Failed to fetch transactions.");
      }
    };

    fetchTransactions();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!transactions || transactions.length === 0) {
    return <div>Loading transactions...</div>;
  }

  return (
    <div>
      <h2>Transaction List</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Coin Symbol</th>
            <th>Type</th>
            <th>Date</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Fee</th>
            <th>Exchange</th>
            {/* Add other columns as needed */}
          </tr>
        </thead>
        <tbody>
          {transactions.map(transaction => (
            <tr key={transaction.transactionId}>
              <td>{transaction.transactionId}</td>
              <td>{transaction.coinId}</td>
              <td>{transaction.transactionType}</td>
              <td>{new Date(transaction.transactionDate).toLocaleString()}</td>
              <td>{transaction.quantity}</td>
              <td>{transaction.price}</td>
              <td>{transaction.fee}</td>
              <td>{transaction.exchange}</td>
              {/* Display other transaction details */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionList;