using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CryptoTracker.Server.Data;
using CryptoTracker.Server.Models;
using CryptoTracker.Server.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
public class CoinsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IBinanceService _binanceService;

    public CoinsController(ApplicationDbContext context, IBinanceService binanceService)
    {
        _context = context;
        _binanceService = binanceService;
    }

    // GET: api/Coins
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Coin>>> GetCoins()
    {
        var coins = await _context.Coins.ToListAsync();

        foreach (var coin in coins)
        {
            try
            {
                coin.CurrentPrice = await _binanceService.GetPrice(coin.Symbol);
                coin.CurrentValue = coin.TotalQuantity * coin.CurrentPrice;
            }
            catch (Exception ex)
            {
                // Log lỗi, có thể bỏ qua, hoặc set giá trị mặc định, tùy bạn.
                // _logger.LogError(ex, "Error getting price for {Symbol}", coin.Symbol);
            }
        }

        return coins;
    }

    // GET: api/Coins/BTCUSDT
    [HttpGet("{symbol}")]
    public async Task<ActionResult<Coin>> GetCoin(string symbol)
    {
        var coin = await _context.Coins.FindAsync(symbol);

        if (coin == null)
        {
            return NotFound();
        }

        try
        {
            coin.CurrentPrice = await _binanceService.GetPrice(symbol);
            coin.CurrentValue = coin.TotalQuantity * coin.CurrentPrice;
        }
        catch (Exception ex)
        {
            //Log
        }

        return coin;
    }

    // POST: api/Coins
    [HttpPost]
    public async Task<ActionResult<Coin>> PostCoin(Coin coin)
    {
        if (await _context.Coins.AnyAsync(c => c.Symbol == coin.Symbol))
        {
            return BadRequest("Coin with this symbol already exists.");
        }
        // Lấy thông tin bổ sung (nếu cần)
        try
        {
            var (baseAsset, quoteAsset) = await _binanceService.GetSymbolInfo(coin.Symbol);
            coin.Name = baseAsset; // Cập nhật Name (BaseAsset)
            coin.QuoteAsset = quoteAsset;
        }
        catch (Exception ex)
        {
            // Log lỗi ở đây
            return BadRequest("Invalid symbol or unable to retrieve coin information from Binance.");

        }

        _context.Coins.Add(coin);
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            return BadRequest(ex.Message);

        }


        return CreatedAtAction(nameof(GetCoin), new { symbol = coin.Symbol }, coin);
    }

    // PUT: api/Coins/BTCUSDT
    [HttpPut("{symbol}")]
    public async Task<IActionResult> PutCoin(string symbol, Coin coin)
    {
        if (symbol != coin.Symbol)
        {
            return BadRequest("ID mismatch.");
        }
        var existingCoin = await _context.Coins.FindAsync(symbol);
        if (existingCoin == null)
        {
            return NotFound();
        }
        // Chỉ cập nhật các trường cho phép
        existingCoin.Image = coin.Image; // Ví dụ
        // KHÔNG cập nhật TotalQuantity, AverageBuyPrice ở đây

        _context.Entry(existingCoin).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!CoinExists(symbol))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    // DELETE: api/Coins/BTCUSDT
    [HttpDelete("{symbol}")]
    public async Task<IActionResult> DeleteCoin(string symbol)
    {
        var coin = await _context.Coins.FindAsync(symbol);
        if (coin == null)
        {
            return NotFound();
        }

        if (await _context.Transactions.AnyAsync(t => t.CoinId == symbol)) // Sửa lại chỗ này
        {
            return BadRequest("Cannot delete coin because it has associated transactions.");
        }

        _context.Coins.Remove(coin);
        await _context.SaveChangesAsync();

        return NoContent();
    }
    private bool CoinExists(string symbol)
    {
        return _context.Coins.Any(e => e.Symbol == symbol);
    }
}