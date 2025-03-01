// Models/Coin.cs

using CryptoTracker.Server.Models;

public class Coin
{
    //public string CoinId { get; set; } // Xóa
    public string Symbol { get; set; } // Giữ lại, hoặc đổi thành BaseAsset
    public string Name { get; set; } // BaseAsset
    public decimal TotalQuantity { get; set; }
    public decimal AverageBuyPrice { get; set; }
    public string? Image { get; set; }
    public string QuoteAsset { get; set; } // Thêm
    public decimal CurrentPrice { get; set; }
    public decimal CurrentValue { get; set; }
    public List<Transaction> Transactions { get; set; } = new List<Transaction>();
}