using OperationsHub.Application.DTOs.Operacoes;
using OperationsHub.Application.Interfaces;
using OperationsHub.Domain.Entities;

namespace OperationsHub.Application.UseCases.Operacoes;

public sealed class AprovarOperacaoUseCase
{
    private readonly IOperacaoRepository _operacaoRepository;

    public AprovarOperacaoUseCase(IOperacaoRepository operacaoRepository)
    {
        _operacaoRepository = operacaoRepository;
    }

    public async Task<OperacaoResponse> ExecuteAsync(
        Guid operacaoId,
        CancellationToken cancellationToken = default)
    {
        var operacao = await _operacaoRepository.GetByIdAsync(operacaoId, cancellationToken);
        if (operacao is null)
        {
            throw new KeyNotFoundException("Operação não encontrada.");
        }

        operacao.Aprovar();
        await _operacaoRepository.UpdateAsync(operacao, cancellationToken);

        return MapToResponse(operacao);
    }

    private static OperacaoResponse MapToResponse(Operacao operacao)
        => new(
            operacao.Id,
            operacao.Amount,
            operacao.Status.ToString(),
            operacao.CreatedAt);
}
