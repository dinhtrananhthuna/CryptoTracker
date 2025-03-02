// Services/IBinanceService.cs
using Binance.Net.Interfaces;
using System.Text.Json.Serialization;

namespace CryptoTracker.Server.Services
{
    public interface IBinanceService
    {
        Task<decimal> GetPrice(string symbol);
        Task<(string BaseAsset, string QuoteAsset)> GetSymbolInfo(string symbol);
        // Thêm các phương thức khác nếu cần (ví dụ: lấy thông tin tài khoản, đặt lệnh...)
        Task<BinanceService.Binance24hrTicker> Get24hrTicker(string symbol);
        Task<List<BinanceService.BinanceKline>> GetKlines(string symbol, string interval, int? limit = null, long? startTime = null, long? endTime = null);
    }

}