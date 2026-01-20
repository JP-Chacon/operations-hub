using Microsoft.AspNetCore.Mvc;
using OperationsHub.Application.DTOs.Operacoes;
using OperationsHub.Application.UseCases.Operacoes;

namespace OperationsHub.Api.Controllers;

[ApiController]
[Route("operacoes")]
public sealed class OperacoesController : ControllerBase
{
    private readonly CriarOperacaoUseCase _criarOperacao;
    private readonly AprovarOperacaoUseCase _aprovarOperacao;
    private readonly ProcessarOperacaoUseCase _processarOperacao;
    private readonly ListarOperacoesUseCase _listarOperacoes;

    public OperacoesController(
        CriarOperacaoUseCase criarOperacao,
        AprovarOperacaoUseCase aprovarOperacao,
        ProcessarOperacaoUseCase processarOperacao,
        ListarOperacoesUseCase listarOperacoes)
    {
        _criarOperacao = criarOperacao;
        _aprovarOperacao = aprovarOperacao;
        _processarOperacao = processarOperacao;
        _listarOperacoes = listarOperacoes;
    }

    [HttpPost]
    [ProducesResponseType(typeof(OperacaoResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CriarAsync(
        [FromBody] CriarOperacaoRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await _criarOperacao.ExecuteAsync(request, cancellationToken);
            return Created($"/operacoes/{result.Id}", result);
        }
        catch (ArgumentOutOfRangeException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id:guid}/aprovar")]
    [ProducesResponseType(typeof(OperacaoResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AprovarAsync(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var result = await _aprovarOperacao.ExecuteAsync(id, cancellationToken);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id:guid}/processar")]
    [ProducesResponseType(typeof(OperacaoResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ProcessarAsync(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var result = await _processarOperacao.ExecuteAsync(id, cancellationToken);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<OperacaoResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ListarAsync(CancellationToken cancellationToken)
    {
        var result = await _listarOperacoes.ExecuteAsync(cancellationToken);
        return Ok(result);
    }
}
