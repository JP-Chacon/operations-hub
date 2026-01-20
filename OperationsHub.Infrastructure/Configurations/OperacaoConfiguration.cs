using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OperationsHub.Domain.Entities;
namespace OperationsHub.Infrastructure.Configurations;

public sealed class OperacaoConfiguration : IEntityTypeConfiguration<Operacao>
{
    public void Configure(EntityTypeBuilder<Operacao> builder)
    {
        builder.ToTable("operacoes");

        builder.HasKey(o => o.Id);

        builder.Property(o => o.Amount)
            .HasColumnType("numeric(18,2)")
            .IsRequired();

        builder.Property(o => o.Status)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(o => o.CreatedAt)
            .IsRequired();
    }
}
