using OperationsHub.Domain.Enums;

namespace OperationsHub.Domain.Entities;

public sealed class Operacao
{
    public Guid Id { get; }
    public decimal Amount { get; }
    public OperacaoStatus Status { get; private set; }
    public DateTime CreatedAt { get; }

    public Operacao(decimal amount)
    {
        if (amount <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(amount), "Amount deve ser maior que zero.");
        }

        Id = Guid.NewGuid();
        Amount = amount;
        Status = OperacaoStatus.Criada;
        CreatedAt = DateTime.UtcNow;
    }

    public void Aprovar()
    {
        if (Status is OperacaoStatus.Processada or OperacaoStatus.Cancelada)
        {
            throw new InvalidOperationException("Não é possível aprovar uma operação processada ou cancelada.");
        }

        Status = OperacaoStatus.Aprovada;
    }

    public void Processar()
    {
        if (Status != OperacaoStatus.Aprovada)
        {
            throw new InvalidOperationException("Somente operações aprovadas podem ser processadas.");
        }

        Status = OperacaoStatus.Processada;
    }

    public void Cancelar()
    {
        if (Status == OperacaoStatus.Processada)
        {
            throw new InvalidOperationException("Não é possível cancelar uma operação já processada.");
        }

        Status = OperacaoStatus.Cancelada;
    }
}
