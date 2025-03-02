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

    [HttpGet("klines")]
    public async Task<ActionResult<List<BinanceService.BinanceKline>>> GetKlines(string symbol, string interval, int? limit = null, long? startTime = null, long? endTime = null)
    {
        try
        {
            var klines = await _binanceService.GetKlines(symbol, interval, limit, startTime, endTime);
            return Ok(klines);
        }
        catch (Exception ex)
        {
            // Log lỗi
            return StatusCode(500, ex.Message);
        }
    }
}