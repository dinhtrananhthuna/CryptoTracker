using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CryptoTracker.Server.Data;
using CryptoTracker.Server.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
public class TransactionsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TransactionsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/Transactions
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Transaction>>> GetTransactions()
    {
        return await _context.Transactions.ToListAsync();
    }

    // GET: api/Transactions/ByCoin/BTCUSDT
    [HttpGet("ByCoin/{symbol}")] // Sửa route
    public async Task<ActionResult<IEnumerable<Transaction>>> GetTransactionsByCoin(string symbol)
    {
        return await _context.Transactions.Where(t => t.CoinId == symbol).ToListAsync(); // Sửa lại
    }

    // GET: api/Transactions/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Transaction>> GetTransaction(int id)
    {
        var transaction = await _context.Transactions.FindAsync(id);

        if (transaction == null)
        {
            return NotFound();
        }

        return transaction;
    }

    // POST: api/Transactions
    [HttpPost]
    public async Task<ActionResult<Transaction>> PostTransaction(Transaction transaction)
    {
        var coin = await _context.Coins.FindAsync(transaction.CoinId); // Tìm theo symbol
        if (coin == null)
        {
            return BadRequest("Invalid Coin Symbol.");
        }

        if (transaction.TransactionType == TransactionType.Buy)
        {
            coin.TotalQuantity += transaction.Quantity;
            coin.AverageBuyPrice = (coin.TotalQuantity * coin.AverageBuyPrice + transaction.Quantity * transaction.Price) / (coin.TotalQuantity + transaction.Quantity); // Tính lại
        }
        else // SELL
        {
            if (transaction.Quantity > coin.TotalQuantity)
            {
                return BadRequest("Cannot sell more than the total quantity.");
            }
            coin.TotalQuantity -= transaction.Quantity;
        }

        _context.Transactions.Add(transaction);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            return BadRequest(ex.Message);
        }


        return CreatedAtAction(nameof(GetTransaction), new { id = transaction.TransactionId }, transaction);
    }
    // PUT: api/Transactions/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutTransaction(int id, Transaction transaction)
    {
        if (id != transaction.TransactionId)
        {
            return BadRequest("ID mismatch.");
        }

        var existingTransaction = await _context.Transactions.FindAsync(id);
        if (existingTransaction == null)
        {
            return NotFound();
        }
        // Lấy thông tin coin
        var coin = await _context.Coins.FindAsync(transaction.CoinId);
        if (coin == null)
        {
            return BadRequest("Invalid Coin ID.");
        }

        // Hoàn tác thay đổi của giao dịch cũ
        if (existingTransaction.TransactionType == TransactionType.Buy)
        {
            coin.TotalQuantity -= existingTransaction.Quantity;
            if (coin.TotalQuantity > 0)
            {
                coin.AverageBuyPrice = (coin.TotalQuantity * coin.AverageBuyPrice - existingTransaction.Quantity * existingTransaction.Price) / coin.TotalQuantity;
            }
            else
            {
                coin.AverageBuyPrice = 0;
            }
        }
        else // SELL
        {
            coin.TotalQuantity += existingTransaction.Quantity;
            //Average buy price giữ nguyên
        }

        // Cập nhật các trường của transaction
        existingTransaction.TransactionDate = transaction.TransactionDate;
        existingTransaction.Quantity = transaction.Quantity;
        existingTransaction.Price = transaction.Price;
        existingTransaction.Fee = transaction.Fee;
        existingTransaction.Exchange = transaction.Exchange;
        existingTransaction.Notes = transaction.Notes;
        existingTransaction.TransactionType = transaction.TransactionType;

        // Áp dụng các thay đổi của giao dịch *mới*
        if (transaction.TransactionType == TransactionType.Buy)
        {
            coin.TotalQuantity += transaction.Quantity;
            coin.AverageBuyPrice = (coin.TotalQuantity * coin.AverageBuyPrice + transaction.Quantity * transaction.Price) / (coin.TotalQuantity + transaction.Quantity); // Tính lại
        }
        else
        {
            if (transaction.Quantity > coin.TotalQuantity)
            {
                return BadRequest("Cannot sell more than the total quantity.");
            }
            coin.TotalQuantity -= transaction.Quantity;
        }


        _context.Entry(existingTransaction).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!TransactionExists(id))
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

    // DELETE: api/Transactions/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTransaction(int id)
    {
        var transaction = await _context.Transactions.FindAsync(id);
        if (transaction == null)
        {
            return NotFound();
        }

        var coin = await _context.Coins.FindAsync(transaction.CoinId);
        if (coin == null)
        {
            // Không nên xảy ra, nhưng cứ xử lý cho chắc
            _context.Transactions.Remove(transaction);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        if (transaction.TransactionType == TransactionType.Buy)
        {
            coin.TotalQuantity -= transaction.Quantity;
            if (coin.TotalQuantity > 0)
            {
                coin.AverageBuyPrice = (coin.TotalQuantity * coin.AverageBuyPrice - transaction.Quantity * transaction.Price) / coin.TotalQuantity; // Tính lại
            }
            else
            {
                coin.AverageBuyPrice = 0;
            }

        }
        else // SELL
        {
            coin.TotalQuantity += transaction.Quantity;
        }

        _context.Transactions.Remove(transaction);
        await _context.SaveChangesAsync();

        return NoContent();
    }
    private bool TransactionExists(int id)
    {
        return _context.Transactions.Any(e => e.TransactionId == id);
    }
}