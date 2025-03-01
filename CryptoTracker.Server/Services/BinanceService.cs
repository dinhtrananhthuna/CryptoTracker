// Services/BinanceService.cs
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Text.Json.Serialization;
using System.Security.Cryptography;
using System.Text;

namespace CryptoTracker.Server.Services
{
    public class BinanceService : IBinanceService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly string _secretKey;
        private readonly string _baseUrl;

        public BinanceService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["Binance:ApiKey"] ?? "";
            _secretKey = configuration["Binance:SecretKey"] ?? "";
            _baseUrl = configuration["Binance:BaseUrl"] ?? "https://api.binance.com/api/v3/";
            _httpClient.BaseAddress = new Uri(_baseUrl);
            // Thêm API Key vào header (cho các request không cần signature)
            _httpClient.DefaultRequestHeaders.Add("X-MBX-APIKEY", _apiKey);
        }
        public async Task<decimal> GetPrice(string symbol)
        {
            // https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT
            var response = await _httpClient.GetAsync($"ticker/price?symbol={symbol}");
            response.EnsureSuccessStatusCode();

            using (var stream = await response.Content.ReadAsStreamAsync())
            {
                var ticker = await JsonSerializer.DeserializeAsync<BinanceTicker>(stream);
                return decimal.Parse(ticker.Price);
            }
        }
        public async Task<(string BaseAsset, string QuoteAsset)> GetSymbolInfo(string symbol)
        {
            var response = await _httpClient.GetAsync("exchangeInfo"); // Không cần symbol ở đây
            response.EnsureSuccessStatusCode();
            using (var stream = await response.Content.ReadAsStreamAsync())
            {
                var exchangeInfo = await JsonSerializer.DeserializeAsync<ExchangeInfo>(stream);
                var symbolInfo = exchangeInfo.Symbols.FirstOrDefault(s => s.Symbol == symbol);

                if (symbolInfo == null)
                {
                    throw new Exception($"Symbol {symbol} not found on Binance.");
                }
                return (symbolInfo.BaseAsset, symbolInfo.QuoteAsset);
            }
        }

        //(Optional) Thêm các methods khác để gọi các API endpoints cần thiết
        // Ví dụ phương thức có sử dụng HMACSHA256 signature
        // private string GenerateSignature(string data)
        //    {
        //      byte[] keyBytes = Encoding.UTF8.GetBytes(_secretKey);
        //       byte[] dataBytes = Encoding.UTF8.GetBytes(data);
        //
        //        using (HMACSHA256 hmac = new HMACSHA256(keyBytes))
        //       {
        //            byte[] hash = hmac.ComputeHash(dataBytes);
        //            return BitConverter.ToString(hash).Replace("-", "").ToLower();
        //        }
        //    }
    }
    // DTOs
    public class BinanceTicker
    {
        [JsonPropertyName("symbol")]
        public string Symbol { get; set; }

        [JsonPropertyName("price")]
        public string Price { get; set; }
    }
    public class ExchangeInfo
    {
        [JsonPropertyName("symbols")]
        public List<SymbolInfo> Symbols { get; set; }
    }

    public class SymbolInfo
    {
        [JsonPropertyName("symbol")]
        public string Symbol { get; set; }

        [JsonPropertyName("status")]
        public string Status { get; set; }

        [JsonPropertyName("baseAsset")]
        public string BaseAsset { get; set; }

        [JsonPropertyName("quoteAsset")]
        public string QuoteAsset { get; set; }
        // ... các trường khác nếu cần
    }
}