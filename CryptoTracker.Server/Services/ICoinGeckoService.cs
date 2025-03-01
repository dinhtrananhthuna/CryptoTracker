// Services/ICoinGeckoService.cs
namespace CryptoTracker.Server.Services
{
    public interface ICoinGeckoService
    {
        Task<decimal> GetCoinPrice(string coinId);
        // Có thể thêm các phương thức khác nếu cần (ví dụ: lấy lịch sử giá)
        // Task<List<decimal>> GetHistoricalPrices(string coinId, int days);
    }
}