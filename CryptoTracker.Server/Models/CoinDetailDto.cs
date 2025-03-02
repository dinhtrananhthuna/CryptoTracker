namespace CryptoTracker.Server.Models
{
    public class CoinDetailDto
    {
        // Thông tin từ bảng Coin
        public string Symbol { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Image { get; set; }
        public decimal TotalQuantity { get; set; }
        public decimal AverageBuyPrice { get; set; }
        public decimal CurrentPrice { get; set; }
        public decimal CurrentValue { get; set; }
        public string QuoteAsset { get; set; } = string.Empty;

        // Thông tin từ Binance 24hr ticker
        public decimal HighPrice { get; set; }
        public decimal LowPrice { get; set; }

        //Profit Loss
        public decimal ProfitLoss { get; set; }

        // Thêm các trường khác nếu cần (ví dụ: Description)
    }
}
