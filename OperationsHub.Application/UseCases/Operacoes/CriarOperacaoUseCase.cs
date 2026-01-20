using OperationsHub.Application.DTOs.Operacoes;
using OperationsHub.Application.Interfaces;
using OperationsHub.Domain.Entities;

namespace OperationsHub.Application.UseCases.Operacoes;

public sealed class CriarOperacaoUseCase
{
    private readonly IOperacaoRepository _operacaoRepository;

    public CriarOperacaoUseCase(IOperacaoRepository operacaoRepository)
    {
        _operacaoRepository = operacaoRepository;
    }

    public async Task<OperacaoResponse> ExecuteAsync(
        CriarOperacaoRequest request,
        CancellationToken cancellationToken = default)
    {
        var operacao = new Operacao(request.Amount);
        await _operacaoRepository.AddAsync(operacao, cancellationToken);

        return MapToResponse(operacao);
    }

    private static OperacaoResponse MapToResponse(Operacao operacao)
        => new(
            operacao.Id,
            operacao.Amount,
            operacao.Status.ToString(),
            operacao.CreatedAt);
}
