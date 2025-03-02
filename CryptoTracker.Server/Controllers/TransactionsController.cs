using Microsoft.AspNetCore.Mvc;
using CryptoTracker.Server.Models;
using CryptoTracker.Server.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
public class TransactionsController : ControllerBase
{
    private readonly IPortfolioService _portfolioService;

    public TransactionsController(IPortfolioService portfolioService)
    {
        _portfolioService = portfolioService;
    }

    // GET: api/Transactions
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Transaction>>> GetTransactions()
    {
        return Ok(await _portfolioService.GetTransactionsAsync());
    }

    // GET: api/Transactions/ByCoin/BTCUSDT
    [HttpGet("ByCoin/{symbol}")]
    public async Task<ActionResult<IEnumerable<Transaction>>> GetTransactionsByCoin(string symbol)
    {
        return Ok(await _portfolioService.GetTransactionsByCoinAsync(symbol));
    }

    // GET: api/Transactions/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Transaction>> GetTransaction(int id)
    {
        var transaction = (await _portfolioService.GetTransactionsAsync()).FirstOrDefault(t => t.TransactionId == id); // Cách này không tối ưu, nhưng để cho đơn giản
        if (transaction == null)
        {
            return NotFound();
        }

        return transaction;
    }
    // Cách 2: Tối ưu hơn, thêm method vào service
    /*
    [HttpGet("{id}")]
    public async Task<ActionResult<Transaction>> GetTransaction(int id)
    {
      try{
        var transaction = await _portfolioService.GetTransactionByIdAsync(id); // Phương thức này cần được thêm vào IPortfolioService và PortfolioService

        if (transaction == null)
        {
            return NotFound();
        }
         return transaction;
      } catch (Exception ex){
          return BadRequest(ex.Message);
      }
    }
    */

    // POST: api/Transactions
    [HttpPost]
    public async Task<ActionResult<Transaction>> PostTransaction(Transaction transaction)
    {
        try
        {
            var newTransaction = await _portfolioService.AddTransactionAsync(transaction);
            return CreatedAtAction(nameof(GetTransaction), new { id = newTransaction.TransactionId }, newTransaction);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    // PUT: api/Transactions/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutTransaction(int id, Transaction transaction)
    {
        try
        {
            await _portfolioService.UpdateTransactionAsync(id, transaction);
            return NoContent();

        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    // DELETE: api/Transactions/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTransaction(int id)
    {
        try
        {
            await _portfolioService.DeleteTransactionAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}