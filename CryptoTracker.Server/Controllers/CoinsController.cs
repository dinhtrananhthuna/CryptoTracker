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

    // GET: api/Coins
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Coin>>> GetCoins()
    {
        return Ok(await _portfolioService.GetCoinsAsync()); // Sử dụng service
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