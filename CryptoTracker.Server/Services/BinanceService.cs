// Services/BinanceService.cs
using System;
using System.Net;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Text.Json.Serialization;
using System.Linq;
using Polly;
using Polly.Retry;
using Binance.Net.Interfaces;

namespace CryptoTracker.Server.Services
{
    public class BinanceService : IBinanceService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly string _secretKey;
        private readonly string _baseUrl;
        private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy; // Sử dụng Polly

        public BinanceService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["Binance:ApiKey"] ?? "";
            _secretKey = configuration["Binance:SecretKey"] ?? "";
            _baseUrl = configuration["Binance:BaseUrl"] ?? "https://api.binance.com/api/v3/";


            if (string.IsNullOrEmpty(_apiKey))
            {
                throw new ArgumentException("Binance API Key is not configured.");
            }
            // Secret Key có thể null/empty nếu chỉ gọi các public endpoints

            _httpClient.BaseAddress = new Uri(_baseUrl);
            _httpClient.DefaultRequestHeaders.Add("X-MBX-APIKEY", _apiKey);

            // Cấu hình retry policy (Polly)
            _retryPolicy = Policy
                .Handle<HttpRequestException>()
                .OrResult<HttpResponseMessage>(response => (int)response.StatusCode == 429 || (int)response.StatusCode == 418) // 429: Rate limit, 418: IP banned
                .WaitAndRetryAsync(
                    retryCount: 3, // Số lần thử lại
                    sleepDurationProvider: attempt => TimeSpan.FromSeconds(Math.Pow(2, attempt)) // Exponential backoff (2^1, 2^2, 2^3 giây)
                    , onRetry: (outcome, timespan, retryAttempt, context) =>
                    {
                        // Log lỗi hoặc thông báo (có thể sử dụng ILogger)
                        Console.WriteLine($"Retry {retryAttempt} after {timespan.TotalSeconds} seconds.  Status code: {outcome.Result?.StatusCode}, Exception: {outcome.Exception?.Message}");
                    }

                );
        }


        public async Task<decimal> GetPrice(string symbol)
        {
            HttpResponseMessage response = await _retryPolicy.ExecuteAsync(async () => //Sử dụng await ở đây
            {
                return await _httpClient.GetAsync($"ticker/price?symbol={symbol}"); // Trả về HttpResponseMessage
            });

            // Xử lý lỗi chi tiết
            if (!response.IsSuccessStatusCode)
            {
                if (response.StatusCode == HttpStatusCode.NotFound)
                {
                    throw new Exception($"Symbol '{symbol}' not found.");
                }
                else if ((int)response.StatusCode == 429 || (int)response.StatusCode == 418)
                {
                    //Đã được xử lý trong retry policy, nhưng vẫn throw để thoát khỏi ExecuteAsync
                    throw new HttpRequestException($"Rate limit exceeded or IP banned. Status code: {response.StatusCode}");
                }
                else
                {
                    // Các lỗi khác
                    string errorContent = await response.Content.ReadAsStringAsync();
                    throw new HttpRequestException($"Binance API error: {response.StatusCode} - {errorContent}");
                }
            }

            using (var stream = await response.Content.ReadAsStreamAsync())
            {
                var ticker = await JsonSerializer.DeserializeAsync<BinanceTicker>(stream);
                if (ticker == null)
                {
                    throw new Exception("Deserialize failed");
                }
                return decimal.Parse(ticker.Price);
            }
        }


        public async Task<(string BaseAsset, string QuoteAsset)> GetSymbolInfo(string symbol)
        {
            HttpResponseMessage response = await _retryPolicy.ExecuteAsync(async () => // Chú ý await
            {
                return await _httpClient.GetAsync("exchangeInfo"); // Trả về HttpResponseMessage, không cần symbol
            });

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
        public async Task<Binance24hrTicker> Get24hrTicker(string symbol)
        {
            // Sử dụng ExecuteAsync, và trả về HttpResponseMessage từ hàm async bên trong
            HttpResponseMessage response = await _retryPolicy.ExecuteAsync(async () =>
            {
                return await _httpClient.GetAsync($"ticker/24hr?symbol={symbol}");
            });

            response.EnsureSuccessStatusCode(); // Kiểm tra lỗi HTTP

            using (var stream = await response.Content.ReadAsStreamAsync())
            {
                var ticker = await JsonSerializer.DeserializeAsync<Binance24hrTicker>(stream);
                if (ticker == null)
                {
                    throw new Exception("Deserialize error");
                }
                return ticker; // Trả về ticker *sau khi* kiểm tra null
            }
        }

        public async Task<List<BinanceKline>> GetKlines(string symbol, string interval, int? limit = null, long? startTime = null, long? endTime = null)
        {
            // Sử dụng ExecuteAsync, và trả về HttpResponseMessage từ hàm async bên trong
            HttpResponseMessage response = await _retryPolicy.ExecuteAsync(async () =>
            {
                var url = $"klines?symbol={symbol}&interval={interval}";
                if (limit.HasValue)
                {
                    url += $"&limit={limit.Value}";
                }
                if (startTime.HasValue)
                {
                    url += $"&startTime={startTime.Value}";
                }
                if (endTime.HasValue)
                {
                    url += $"&endTime={endTime.Value}";
                }

                return await _httpClient.GetAsync(url); // Trả về HttpResponseMessage
            });

            response.EnsureSuccessStatusCode(); // Kiểm tra lỗi HTTP

            using (var stream = await response.Content.ReadAsStreamAsync())
            {
                // Chú ý: Binance trả về klines dưới dạng mảng của mảng, không phải mảng của object
                var klines = await JsonSerializer.DeserializeAsync<List<List<object>>>(stream);
                if (klines == null)
                {
                    throw new Exception("data null");
                }

                // Convert sang List<BinanceKline>
                return klines.Select(k => new BinanceKline
                {
                    OpenTime = long.Parse(k[0].ToString()),
                    Open = decimal.Parse(k[1].ToString()),
                    High = decimal.Parse(k[2].ToString()),
                    Low = decimal.Parse(k[3].ToString()),
                    Close = decimal.Parse(k[4].ToString()),
                    Volume = decimal.Parse(k[5].ToString()),
                    CloseTime = long.Parse(k[6].ToString()),
                    QuoteAssetVolume = decimal.Parse(k[7].ToString()),
                    NumberOfTrades = int.Parse(k[8].ToString()),
                    TakerBuyBaseAssetVolume = decimal.Parse(k[9].ToString()),
                    TakerBuyQuoteAssetVolume = decimal.Parse(k[10].ToString()),
                    // Ignore field 11
                }).ToList();
            }
        }

        public class BinanceKline
        {
            public long OpenTime { get; set; }
            public decimal Open { get; set; }
            public decimal High { get; set; }
            public decimal Low { get; set; }
            public decimal Close { get; set; }
            public decimal Volume { get; set; }
            public long CloseTime { get; set; }
            public decimal QuoteAssetVolume { get; set; }
            public int NumberOfTrades { get; set; }
            public decimal TakerBuyBaseAssetVolume { get; set; }
            public decimal TakerBuyQuoteAssetVolume { get; set; }
        }

        // Các DTOs
        public class BinanceTicker
        {
            [JsonPropertyName("symbol")]
            public string Symbol { get; set; }

            [JsonPropertyName("price")]
            public string Price { get; set; } // Để string
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

        }
        public class Binance24hrTicker
        {
            [JsonPropertyName("highPrice")]
            public string HighPrice { get; set; } = string.Empty;

            [JsonPropertyName("lowPrice")]
            public string LowPrice { get; set; } = string.Empty;

            // Thêm các thuộc tính khác nếu bạn cần (ví dụ: volume)
        }
    }
}