// Data/ApplicationDbContextFactory.cs
using CryptoTracker.Server.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System.IO;

public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        // Tạo ConfigurationBuilder để đọc appsettings.json
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json") // Hoặc appsettings.Development.json
            .Build();

        // Lấy connection string
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        // Tạo DbContextOptionsBuilder
        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        optionsBuilder.UseSqlServer(connectionString); // Hoặc UseSqlite, UseNpgsql

        return new ApplicationDbContext(optionsBuilder.Options);
    }
}