using CryptoTracker.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace CryptoTracker.Server.Data
{
    // ApplicationDbContext.cs
    // ApplicationDbContext.cs
    // Data/ApplicationDbContext.cs
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Coin> Coins { get; set; }
        public DbSet<Transaction> Transactions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Cấu hình primary key cho Coin (sử dụng Symbol/BaseAsset làm key)
            modelBuilder.Entity<Coin>().HasKey(c => c.Symbol);

            // Cấu hình quan hệ (nếu cần thiết, EF Core thường tự suy ra được)
            modelBuilder.Entity<Transaction>()
                .HasOne(t => t.Coin)
                .WithMany(c => c.Transactions)
                .HasForeignKey(t => t.CoinId);
        }
    }
}
