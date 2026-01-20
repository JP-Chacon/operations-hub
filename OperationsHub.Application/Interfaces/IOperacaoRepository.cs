using OperationsHub.Domain.Entities;

namespace OperationsHub.Application.Interfaces;

public interface IOperacaoRepository
{
    Task AddAsync(Operacao operacao, CancellationToken cancellationToken = default);
    Task<Operacao?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Operacao>> ListAsync(CancellationToken cancellationToken = default);
    Task UpdateAsync(Operacao operacao, CancellationToken cancellationToken = default);
}
