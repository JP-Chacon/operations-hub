using OperationsHub.Application.UseCases.Operacoes;
using OperationsHub.Infrastructure.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 🔹 CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Infrastructure + UseCases
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddScoped<CriarOperacaoUseCase>();
builder.Services.AddScoped<AprovarOperacaoUseCase>();
builder.Services.AddScoped<ProcessarOperacaoUseCase>();
builder.Services.AddScoped<ListarOperacoesUseCase>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 🔹 ATIVAR CORS (antes dos controllers)
app.UseCors("AllowFrontend");

app.UseHttpsRedirection();
app.MapControllers();

app.Run();
