using OperationsHub.Application.DTOs.Operacoes;
using OperationsHub.Application.Interfaces;
using OperationsHub.Domain.Entities;

namespace OperationsHub.Application.UseCases.Operacoes;

public sealed class ListarOperacoesUseCase
{
    private readonly IOperacaoRepository _operacaoRepository;

    public ListarOperacoesUseCase(IOperacaoRepository operacaoRepository)
    {
        _operacaoRepository = operacaoRepository;
    }

    public async Task<IReadOnlyList<OperacaoResponse>> ExecuteAsync(
        CancellationToken cancellationToken = default)
    {
        var operacoes = await _operacaoRepository.ListAsync(cancellationToken);
        return operacoes.Select(MapToResponse).ToList();
    }

    private static OperacaoResponse MapToResponse(Operacao operacao)
        => new(
            operacao.Id,
            operacao.Amount,
            operacao.Status.ToString(),
            operacao.CreatedAt);
}
