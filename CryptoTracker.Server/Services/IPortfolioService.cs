// Services/IPortfolioService.cs
using CryptoTracker.Server.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CryptoTracker.Server.Services
{
    public interface IPortfolioService
    {
        Task<CoinDetailDto> GetCoinDetailsAsync(string symbol);
        // Coin methods
        Task<IEnumerable<Coin>> GetCoinsAsync();
        Task<Coin> GetCoinAsync(string symbol);
        Task<Coin> AddCoinAsync(Coin coin);
        Task UpdateCoinAsync(string symbol, Coin coin);
        Task DeleteCoinAsync(string symbol);

        // Transaction methods
        Task<IEnumerable<Transaction>> GetTransactionsAsync();
        Task<IEnumerable<Transaction>> GetTransactionsByCoinAsync(string symbol);
        Task<Transaction> AddTransactionAsync(Transaction transaction);
        Task UpdateTransactionAsync(int id, Transaction transaction);
        Task DeleteTransactionAsync(int id);
    }
}