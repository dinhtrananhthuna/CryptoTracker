// Services/CoinGeckoService.cs
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration; // Để đọc cấu hình (nếu cần)

namespace CryptoTracker.Server.Services
{
    public class CoinGeckoService : ICoinGeckoService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey; // Nếu API yêu cầu API key
        private readonly string _baseUrl;

        public CoinGeckoService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            // _apiKey = configuration["CoinGecko:ApiKey"]; // Lấy API key từ configuration (nếu cần)
            _baseUrl = configuration["CoinGecko:BaseUrl"] ?? "https://api.coingecko.com/api/v3/"; // Đọc từ appsettings.json, nếu không có thì dùng default
            _httpClient.BaseAddress = new Uri(_baseUrl);

        }

        public async Task<decimal> GetCoinPrice(string coinId)
        {
            //https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd
            var response = await _httpClient.GetAsync($"simple/price?ids={coinId}&vs_currencies=usd");
            //var response = await _httpClient.GetAsync($"coins/{coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false"); // Thay thế bằng endpoint phù hợp

            response.EnsureSuccessStatusCode(); // Throw exception nếu có lỗi HTTP

            using (var stream = await response.Content.ReadAsStreamAsync())
            {
                // Deserialize JSON response.  Cấu trúc JSON có thể khác nhau tùy theo endpoint.
                // Đây là ví dụ cho endpoint /simple/price
                var jsonDocument = await JsonDocument.ParseAsync(stream);
                if (jsonDocument.RootElement.TryGetProperty(coinId, out var coinData))
                {
                    if (coinData.TryGetProperty("usd", out var priceElement))
                    {
                        if (priceElement.TryGetDecimal(out decimal price))
                        {
                            return price;
                        }
                    }
                }
                throw new Exception($"Could not get price for {coinId}");

                // Đây là ví dụ nếu dùng endpoint /coins/{id}
                /*
                var jsonDocument = await JsonDocument.ParseAsync(stream);
                var marketData = jsonDocument.RootElement.GetProperty("market_data");
                var currentPrice = marketData.GetProperty("current_price");
                var usdPrice = currentPrice.GetProperty("usd");
                return usdPrice.GetDecimal();
                */
            }
        }
    }
}