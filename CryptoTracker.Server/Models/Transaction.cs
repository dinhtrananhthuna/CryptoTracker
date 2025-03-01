namespace CryptoTracker.Server.Models
{
    public class Transaction
    {
        public int TransactionId { get; set; }
        public string CoinId { get; set; } // Khóa ngoại
        public TransactionType TransactionType { get; set; }
        public DateTime TransactionDate { get; set; }
        public decimal Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal? Fee { get; set; } // Dấu ? cho phép null
        public string? Exchange { get; set; }
        public string? Notes { get; set; }

        public Coin Coin { get; set; } = null!; // Navigation property
    }

    // Enum cho TransactionType
    public enum TransactionType
    {
        Buy,
        Sell
    }
}
