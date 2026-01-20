using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OperationsHub.Application.Interfaces;
using OperationsHub.Infrastructure.Persistence;
using OperationsHub.Infrastructure.Repositories;

namespace OperationsHub.Infrastructure.DependencyInjection;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.AddScoped<IOperacaoRepository, OperacaoRepository>();

        return services;
    }
}
