using Microsoft.EntityFrameworkCore;
using OperationsHub.Application.Interfaces;
using OperationsHub.Domain.Entities;
using OperationsHub.Infrastructure.Persistence;

namespace OperationsHub.Infrastructure.Repositories;

public sealed class OperacaoRepository : IOperacaoRepository
{
    private readonly ApplicationDbContext _context;

    public OperacaoRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Operacao operacao, CancellationToken cancellationToken = default)
    {
        await _context.Operacoes.AddAsync(operacao, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public Task<Operacao?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => _context.Operacoes.FirstOrDefaultAsync(o => o.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Operacao>> ListAsync(CancellationToken cancellationToken = default)
        => await _context.Operacoes.AsNoTracking().ToListAsync(cancellationToken);

    public async Task UpdateAsync(Operacao operacao, CancellationToken cancellationToken = default)
    {
        _context.Operacoes.Update(operacao);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
