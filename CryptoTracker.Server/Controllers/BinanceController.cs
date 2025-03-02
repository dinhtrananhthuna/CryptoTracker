using Microsoft.AspNetCore.Mvc;
using CryptoTracker.Server.Services;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
public class BinanceController : ControllerBase
{
    private readonly IBinanceService _binanceService;

    public BinanceController(IBinanceService binanceService)
    {
        _binanceService = binanceService;
    }

    [HttpGet("Get24hrTicker")]
    public async Task<ActionResult<BinanceService.Binance24hrTicker>> Get24hrTicker(string symbol)
    {
        try
        {
            var ticker = await _binanceService.Get24hrTicker(symbol);
            return Ok(ticker);
        }
        catch (Exception ex)
        {
            // Log lỗi
            return StatusCode(500, ex.Message); // Hoặc trả về BadRequest, tùy theo lỗi
        }
    }
}