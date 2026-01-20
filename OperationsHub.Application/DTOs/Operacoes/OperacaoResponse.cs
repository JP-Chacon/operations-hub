namespace OperationsHub.Application.DTOs.Operacoes;

public sealed record OperacaoResponse(
    Guid Id,
    decimal Amount,
    string Status,
    DateTime CreatedAt
);
