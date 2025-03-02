// Services/IBinanceService.cs
using System.Text.Json.Serialization;

namespace CryptoTracker.Server.Services
{
    public interface IBinanceService
    {
        Task<decimal> GetPrice(string symbol);
        Task<(string BaseAsset, string QuoteAsset)> GetSymbolInfo(string symbol);
        // Thêm các phương thức khác nếu cần (ví dụ: lấy thông tin tài khoản, đặt lệnh...)
        Task<BinanceService.Binance24hrTicker> Get24hrTicker(string symbol);
    }

}