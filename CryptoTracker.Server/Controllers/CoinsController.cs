using Microsoft.AspNetCore.Mvc;
using CryptoTracker.Server.Models;
using CryptoTracker.Server.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
public class CoinsController : ControllerBase
{
    private readonly IPortfolioService _portfolioService;

    public CoinsController(IPortfolioService portfolioService) // Inject IPortfolioService
    {
        _portfolioService = portfolioService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Coin>>> GetCoins(
         string? sort,
         string? order,
         string? filter,
         int page = 1,
         int pageSize = 10)
    {
        try
        {
            IEnumerable<Coin> coins = await _portfolioService.GetCoinsAsync();

            // Filtering
            if (!string.IsNullOrEmpty(filter))
            {
                coins = coins.Where(c => c.Symbol.Contains(filter, StringComparison.OrdinalIgnoreCase) ||
                                        c.Name.Contains(filter, StringComparison.OrdinalIgnoreCase));
            }

            // Sorting
            if (!string.IsNullOrEmpty(sort))
            {
                switch (sort.ToLower())
                {
                    case "name":
                        coins = order?.ToLower() == "desc" ? coins.OrderByDescending(c => c.Name) : coins.OrderBy(c => c.Name);
                        break;
                    case "symbol":
                        coins = order?.ToLower() == "desc" ? coins.OrderByDescending(c => c.Symbol) : coins.OrderBy(c => c.Symbol);
                        break;
                    case "totalquantity":
                        coins = order?.ToLower() == "desc" ? coins.OrderByDescending(c => c.TotalQuantity) : coins.OrderBy(c => c.TotalQuantity);
                        break;
                    case "averagebuyprice":
                        coins = order?.ToLower() == "desc" ? coins.OrderByDescending(c => c.AverageBuyPrice) : coins.OrderBy(c => c.AverageBuyPrice);
                        break;
                    case "currentprice":
                        coins = order?.ToLower() == "desc" ? coins.OrderByDescending(c => c.CurrentPrice) : coins.OrderBy(c => c.CurrentPrice);
                        break;
                    case "currentvalue":
                        coins = order?.ToLower() == "desc" ? coins.OrderByDescending(c => c.CurrentValue) : coins.OrderBy(c => c.CurrentValue);
                        break;
                    case "quoteasset":
                        coins = order?.ToLower() == "desc" ? coins.OrderByDescending(c => c.QuoteAsset) : coins.OrderBy(c => c.QuoteAsset);
                        break;
                    default:
                        coins = order?.ToLower() == "desc" ? coins.OrderByDescending(c => c.Symbol) : coins.OrderBy(c => c.Symbol); // Default
                        break;
                }
            }


            // Count total coins *before* pagination
            int totalCount = coins.Count();

            // Pagination.  Skip and Take *after* filtering and sorting
            coins = coins.Skip((page - 1) * pageSize).Take(pageSize).ToList();

            // Có thể trả về totalCount để frontend biết tổng số trang
            return Ok(new { data = coins, totalCount = totalCount });
        }
        catch (Exception ex)
        {
            // Log lỗi
            return StatusCode(500, "Internal Server Error"); // Hoặc trả về lỗi cụ thể hơn
        }

    }

    // GET: api/Coins/BTCUSDT
    [HttpGet("{symbol}")]
    public async Task<ActionResult<Coin>> GetCoin(string symbol)
    {
        var coin = await _portfolioService.GetCoinAsync(symbol); // Sử dụng service

        if (coin == null)
        {
            return NotFound();
        }

        return coin;
    }

    // POST: api/Coins
    [HttpPost]
    public async Task<ActionResult<Coin>> PostCoin(Coin coin)
    {
        try
        {
            var newCoin = await _portfolioService.AddCoinAsync(coin); // Sử dụng service
            return CreatedAtAction(nameof(GetCoin), new { symbol = newCoin.Symbol }, newCoin);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message); // Trả về lỗi từ service
        }
    }

    // PUT: api/Coins/BTCUSDT
    [HttpPut("{symbol}")]
    public async Task<IActionResult> PutCoin(string symbol, Coin coin)
    {
        try
        {
            await _portfolioService.UpdateCoinAsync(symbol, coin);
            return NoContent();
        }
        catch (Exception ex)
        {
            return NotFound(ex.Message); // Trả về lỗi từ service
        }

    }

    // DELETE: api/Coins/BTCUSDT
    [HttpDelete("{symbol}")]
    public async Task<IActionResult> DeleteCoin(string symbol)
    {
        try
        {
            await _portfolioService.DeleteCoinAsync(symbol);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message); // Trả về lỗi từ service
        }
    }
}