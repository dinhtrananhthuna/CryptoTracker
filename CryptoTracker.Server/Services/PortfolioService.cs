// Services/PortfolioService.cs
using CryptoTracker.Server.Data;
using CryptoTracker.Server.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CryptoTracker.Server.Services
{
    public class PortfolioService : IPortfolioService
    {
        private readonly ApplicationDbContext _context;
        private readonly IBinanceService _binanceService;

        public PortfolioService(ApplicationDbContext context, IBinanceService binanceService)
        {
            _context = context;
            _binanceService = binanceService;
        }

        // Coin methods
        public async Task<IEnumerable<Coin>> GetCoinsAsync()
        {
            var coins = await _context.Coins.ToListAsync();
            foreach (var coin in coins)
            {
                try
                {
                    coin.CurrentPrice = await _binanceService.GetPrice(coin.Symbol);
                    coin.CurrentValue = coin.TotalQuantity * coin.CurrentPrice;
                }
                catch (Exception ex)
                {
                    // Log lỗi, có thể bỏ qua, hoặc set giá trị mặc định.
                }
            }
            return coins;
        }

        public async Task<Coin> GetCoinAsync(string symbol)
        {
            var coin = await _context.Coins.FindAsync(symbol);
            if (coin != null)
            {
                try
                {
                    coin.CurrentPrice = await _binanceService.GetPrice(coin.Symbol);
                    coin.CurrentValue = coin.TotalQuantity * coin.CurrentPrice;
                }
                catch (Exception)
                {
                    // Log
                }
            }
            return coin;

        }

        public async Task<Coin> AddCoinAsync(Coin coin)
        {
            if (await _context.Coins.AnyAsync(c => c.Symbol == coin.Symbol))
            {
                throw new Exception("Coin with this symbol already exists."); // Hoặc custom exception
            }

            try
            {
                var (baseAsset, quoteAsset) = await _binanceService.GetSymbolInfo(coin.Symbol);
                coin.Name = baseAsset;
                coin.QuoteAsset = quoteAsset;
            }
            catch (Exception)
            {
                throw new Exception("Invalid symbol or unable to retrieve coin information from Binance.");
            }


            _context.Coins.Add(coin);
            await _context.SaveChangesAsync();
            return coin;
        }

        public async Task UpdateCoinAsync(string symbol, Coin coin)
        {
            if (symbol != coin.Symbol)
            {
                throw new Exception("ID mismatch.");
            }
            var existingCoin = await _context.Coins.FindAsync(symbol);
            if (existingCoin == null)
            {
                throw new Exception("Coin not found");
            }
            // Cập nhật
            existingCoin.Image = coin.Image;

            _context.Entry(existingCoin).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CoinExists(symbol))
                {
                    throw new Exception("Coin not found");
                }
                else
                {
                    throw;
                }
            }

        }

        public async Task DeleteCoinAsync(string symbol)
        {
            var coin = await _context.Coins.FindAsync(symbol);
            if (coin == null)
            {
                throw new Exception("Coin not found.");
            }

            if (await _context.Transactions.AnyAsync(t => t.CoinId == symbol))
            {
                throw new Exception("Cannot delete coin because it has associated transactions.");
            }

            _context.Coins.Remove(coin);
            await _context.SaveChangesAsync();
        }
        private bool CoinExists(string symbol)
        {
            return _context.Coins.Any(e => e.Symbol == symbol);
        }
        // Transaction methods
        public async Task<IEnumerable<Transaction>> GetTransactionsAsync()
        {
            return await _context.Transactions.ToListAsync();
        }

        public async Task<IEnumerable<Transaction>> GetTransactionsByCoinAsync(string symbol)
        {
            return await _context.Transactions.Where(t => t.CoinId == symbol).ToListAsync();
        }

        public async Task<Transaction> AddTransactionAsync(Transaction transaction)
        {
            var coin = await _context.Coins.FindAsync(transaction.CoinId);
            if (coin == null)
            {
                throw new Exception("Invalid Coin Symbol.");
            }

            if (transaction.TransactionType == TransactionType.Buy)
            {
                coin.TotalQuantity += transaction.Quantity;
                coin.AverageBuyPrice = (coin.TotalQuantity * coin.AverageBuyPrice + transaction.Quantity * transaction.Price) / (coin.TotalQuantity + transaction.Quantity);
            }
            else // SELL
            {
                if (transaction.Quantity > coin.TotalQuantity)
                {
                    throw new Exception("Cannot sell more than the total quantity.");
                }
                coin.TotalQuantity -= transaction.Quantity;
            }

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();
            return transaction;
        }

        public async Task UpdateTransactionAsync(int id, Transaction transaction)
        {
            if (id != transaction.TransactionId)
            {
                throw new Exception("ID mismatch");
            }

            var existingTransaction = await _context.Transactions.FindAsync(id);
            if (existingTransaction == null)
            {
                throw new Exception("Transaction not found");
            }

            var coin = await _context.Coins.FindAsync(transaction.CoinId);
            if (coin == null)
            {
                throw new Exception("Invalid Coin ID.");
            }

            // Hoàn tác thay đổi của giao dịch cũ
            if (existingTransaction.TransactionType == TransactionType.Buy)
            {
                coin.TotalQuantity -= existingTransaction.Quantity;
                if (coin.TotalQuantity > 0)
                {
                    coin.AverageBuyPrice = (coin.TotalQuantity * coin.AverageBuyPrice - existingTransaction.Quantity * existingTransaction.Price) / coin.TotalQuantity;
                }
                else
                {
                    coin.AverageBuyPrice = 0;
                }

            }
            else // SELL
            {
                coin.TotalQuantity += existingTransaction.Quantity;
                //Average buy price giữ nguyên
            }

            // Cập nhật các trường của transaction
            existingTransaction.TransactionDate = transaction.TransactionDate;
            existingTransaction.Quantity = transaction.Quantity;
            existingTransaction.Price = transaction.Price;
            existingTransaction.Fee = transaction.Fee;
            existingTransaction.Exchange = transaction.Exchange;
            existingTransaction.Notes = transaction.Notes;
            existingTransaction.TransactionType = transaction.TransactionType;

            // Áp dụng các thay đổi của giao dịch *mới*
            if (transaction.TransactionType == TransactionType.Buy)
            {
                coin.TotalQuantity += transaction.Quantity;
                coin.AverageBuyPrice = (coin.TotalQuantity * coin.AverageBuyPrice + transaction.Quantity * transaction.Price) / (coin.TotalQuantity + transaction.Quantity); // Tính lại
            }
            else
            {
                if (transaction.Quantity > coin.TotalQuantity)
                {
                    throw new Exception("Cannot sell more than the total quantity");
                }
                coin.TotalQuantity -= transaction.Quantity;
            }


            _context.Entry(existingTransaction).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TransactionExists(id))
                {
                    throw new Exception("Transaction Not Found");
                }
                else
                {
                    throw;
                }
            }
        }

        public async Task DeleteTransactionAsync(int id)
        {
            var transaction = await _context.Transactions.FindAsync(id);
            if (transaction == null)
            {
                throw new Exception("Transaction not found.");
            }

            var coin = await _context.Coins.FindAsync(transaction.CoinId);
            if (coin == null)
            {
                _context.Transactions.Remove(transaction);
                await _context.SaveChangesAsync();
                return;
            }
            if (transaction.TransactionType == TransactionType.Buy)
            {
                coin.TotalQuantity -= transaction.Quantity;
                if (coin.TotalQuantity > 0)
                {
                    coin.AverageBuyPrice = (coin.TotalQuantity * coin.AverageBuyPrice - transaction.Quantity * transaction.Price) / coin.TotalQuantity; // Tính lại
                }
                else
                {
                    coin.AverageBuyPrice = 0; // Hoặc giá trị mặc định khác
                }

            }
            else // SELL
            {
                coin.TotalQuantity += transaction.Quantity;
            }

            _context.Transactions.Remove(transaction);
            await _context.SaveChangesAsync();
        }
        private bool TransactionExists(int id)
        {
            return _context.Transactions.Any(e => e.TransactionId == id);
        }
    }
}