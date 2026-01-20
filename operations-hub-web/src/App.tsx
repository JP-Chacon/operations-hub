import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import './App.css'
import {
  aprovarOperacao,
  criarOperacao,
  listarOperacoes,
  processarOperacao,
  type Operacao,
} from './services/operacoesApi'
import {
  STATUS_LABELS,
  STATUS_VARIANTS,
  canAprovar,
  canProcessar,
  type StatusOperacao,
} from './utils/operacaoStatus'
import { formatCurrencyBRInput } from './utils/currency'
import { useAuth } from './context/AuthContext'

function App() {
  const { isAuthenticated, userName, login, logout } = useAuth()
  const [operacoes, setOperacoes] = useState<Operacao[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})
  const [amountInput, setAmountInput] = useState('')
  const [amountValue, setAmountValue] = useState(0)
  const [createLoading, setCreateLoading] = useState(false)
  const [loginUser, setLoginUser] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginLoading, setLoginLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'Todos' | StatusOperacao>(
    'Todos',
  )
  const [minAmountInput, setMinAmountInput] = useState('')
  const [minAmountValue, setMinAmountValue] = useState(0)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(
    null,
  )
  const toastTimeoutRef = useRef<number | null>(null)
  const highlightTimeoutRef = useRef<number | null>(null)
  const loginUserRef = useRef<HTMLInputElement | null>(null)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement | null>(null)

  const totalAmount = useMemo(
    () => operacoes.reduce((acc, op) => acc + op.amount, 0),
    [operacoes],
  )
  const totalPendentes = useMemo(
    () => operacoes.filter((op) => op.status !== 'Processada').length,
    [operacoes],
  )
  const totalProcessadas = useMemo(
    () => operacoes.filter((op) => op.status === 'Processada').length,
    [operacoes],
  )
  const totalAprovadas = useMemo(
    () => operacoes.filter((op) => op.status === 'Aprovada').length,
    [operacoes],
  )
  const amountInvalid = amountInput !== '' && amountValue <= 0
  const amountError =
    (error ?? '').includes('valor válido') || (error ?? '').includes('valor')

  const carregarOperacoes = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listarOperacoes()
      setOperacoes(data)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar operações.')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await carregarOperacoes()
    setRefreshing(false)
  }

  useEffect(() => {
    void carregarOperacoes()
  }, [])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current)
    }
    toastTimeoutRef.current = window.setTimeout(() => {
      setToast(null)
      toastTimeoutRef.current = null
    }, 3000)
  }

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current)
      }
      if (highlightTimeoutRef.current) {
        window.clearTimeout(highlightTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoginError(null)
    setLoginLoading(true)
    const ok = login(loginUser, loginPassword)
    if (!ok) {
      setLoginError('Usuário ou senha inválidos.')
      setLoginLoading(false)
      return
    }
    setLoginUser('')
    setLoginPassword('')
    setLoginLoading(false)
    showToast('Login realizado com sucesso.', 'success')
  }

  const formatarId = (id: string) => {
    if (id.length <= 12) {
      return id
    }
    return `${id.slice(0, 8)}...${id.slice(-4)}`
  }

  const copiarId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id)
      showToast('ID copiado', 'success')
    } catch {
      showToast('Não foi possível copiar o ID.', 'error')
    }
  }

  const aplicarFiltro = (lista: Operacao[]) => {
    return lista.filter((op) => {
      const statusOk = statusFilter === 'Todos' || op.status === statusFilter
      const valorOk =
        !minAmountInput || (Number.isFinite(minAmountValue) && op.amount >= minAmountValue)
      return statusOk && valorOk
    })
  }

  const operacoesFiltradas = useMemo(
    () => aplicarFiltro(operacoes),
    [operacoes, statusFilter, minAmountValue],
  )

  const criarNovaOperacao = async () => {
    if (!isAuthenticated) {
      showToast('Faça login para criar operações.', 'error')
      return
    }
    setError(null)
    if (!amountInput || amountValue <= 0) {
      setError('Informe um valor válido maior que zero.')
      return
    }

    setCreateLoading(true)
    try {
      const nova = await criarOperacao(amountValue)
      setOperacoes((prev) => [nova, ...prev])
      setAmountInput('')
      setAmountValue(0)
      showToast('Operação criada com sucesso.', 'success')
      setHighlightedId(nova.id)
      if (highlightTimeoutRef.current) {
        window.clearTimeout(highlightTimeoutRef.current)
      }
      highlightTimeoutRef.current = window.setTimeout(() => {
        setHighlightedId(null)
        highlightTimeoutRef.current = null
      }, 1200)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao criar operação.'
      setError(message)
      showToast(message, 'error')
    } finally {
      setCreateLoading(false)
    }
  }

  const executarAcao = async (
    id: string,
    action: (operacaoId: string) => Promise<Operacao>,
  ) => {
    if (!isAuthenticated) {
      showToast('Faça login para executar esta ação.', 'error')
      return
    }
    setActionLoading((prev) => ({ ...prev, [id]: true }))
    setError(null)
    try {
      const atualizado = await action(id)
      setOperacoes((prev) =>
        prev.map((op) => (op.id === id ? atualizado : op)),
      )
      const mensagem =
        action === aprovarOperacao
          ? 'Operação aprovada com sucesso.'
          : 'Operação processada com sucesso.'
      showToast(mensagem, 'success')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao executar ação.'
      setError(message)
      showToast(message, 'error')
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }))
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="login-page">
        {toast && (
          <div className={`toast toast--${toast.type}`}>{toast.message}</div>
        )}
        <div className="login-branding">
          <div className="login-branding__content">
            <span className="login-brand">Operations Hub</span>
            <h1>Painel operacional para decisões financeiras</h1>
            <p>
              Controle operações críticas com clareza, velocidade e governança.
              Visibilidade total do fluxo de aprovações e processamento.
            </p>
          </div>
        </div>
        <div className="login-content">
          <div className="login-card">
            <div>
              <h2>Acesso ao sistema</h2>
              <p className="muted">Informe suas credenciais para continuar.</p>
            </div>
            <form className="login-form" onSubmit={handleLogin}>
              <div className="form__field">
                <label htmlFor="login-user">Usuário</label>
                <input
                  id="login-user"
                  name="login-user"
                  type="text"
                  placeholder="admin"
                  value={loginUser}
                  onChange={(event) => setLoginUser(event.target.value)}
                  ref={loginUserRef}
                  required
                  disabled={loginLoading}
                />
              </div>
              <div className="form__field">
                <label htmlFor="login-password">Senha</label>
                <input
                  id="login-password"
                  name="login-password"
                  type="password"
                  placeholder="admin"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  required
                  disabled={loginLoading}
                />
              </div>
              <button
                className={`button button--primary button--block ${
                  loginLoading ? 'button--loading' : ''
                }`}
                type="submit"
                disabled={loginLoading}
              >
                {loginLoading ? 'Entrando...' : 'Entrar'}
              </button>
              {loginError && <span className="input-error">{loginError}</span>}
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      {toast && (
        <div className={`toast toast--${toast.type}`}>{toast.message}</div>
      )}
      <header className="app-header">
        <div className="app-header__content">
          <div className="brand">
            <strong>Operations Hub</strong>
            <span className="brand-subtitle">
              Gestão operacional com foco em decisões críticas
            </span>
          </div>
          <div className="header-actions">
            <div className="user-menu" ref={userMenuRef}>
              <button
                className="user-menu__trigger"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                type="button"
              >
                <span className="user-avatar">
                  {(userName ?? 'Admin').charAt(0).toUpperCase()}
                </span>
                <span className="user-name">Olá, {userName ?? 'Admin'}</span>
                <span className="user-caret">▾</span>
              </button>
              {isUserMenuOpen && (
                <div className="user-menu__dropdown">
                  <button className="user-menu__item" onClick={logout} type="button">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="app-main">
        <section className="dashboard-title">
          <div>
            <h1>Visão geral das operações</h1>
            <p className="muted">
              Acompanhe o status, volume e prioridade das operações em um só lugar.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="section__header">
            <h2>Resumo</h2>
          </div>
          <div className="stats">
            <div className="stat-card stat-card--blue">
              <span className="stat-icon">●</span>
              <span className="stat-label">Total de operações</span>
              <strong className="stat-value">{operacoes.length}</strong>
              <span className="stat-meta">Visão consolidada do sistema</span>
            </div>
            <div className="stat-card stat-card--green">
              <span className="stat-icon">●</span>
              <span className="stat-label">Volume total</span>
              <strong className="stat-value">
                {totalAmount.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </strong>
              <span className="stat-meta">Somatório das operações registradas</span>
            </div>
            <div className="stat-card stat-card--orange">
              <span className="stat-icon">●</span>
              <span className="stat-label">Operações pendentes</span>
              <strong className="stat-value">{totalPendentes}</strong>
              <span className="stat-meta">Aguardando processamento final</span>
            </div>
          </div>
        </section>

        <section className="section section--actions">
          <div className="section__header">
            <h2>Ações rápidas</h2>
          </div>
          <div className="actions-container">
            <div className="filters">
              <div className="form__field">
                <label htmlFor="status-filter">Status</label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as 'Todos' | StatusOperacao)
                  }
                >
                  <option value="Todos">Todos</option>
                  <option value="Criada">Criada</option>
                  <option value="Aprovada">Aprovada</option>
                  <option value="Processada">Processada</option>
                </select>
              </div>
              <div className="form__field">
                <label htmlFor="min-amount">Valor mínimo</label>
                <input
                  id="min-amount"
                  name="min-amount"
                  type="text"
                  inputMode="numeric"
                  placeholder="R$ 0,00"
                  value={minAmountInput}
                  onChange={(event) => {
                    const { display, numeric } = formatCurrencyBRInput(
                      event.target.value,
                    )
                    setMinAmountInput(display)
                    setMinAmountValue(numeric)
                    const input = event.target
                    window.requestAnimationFrame(() => {
                      input.setSelectionRange(
                        input.value.length,
                        input.value.length,
                      )
                    })
                  }}
                />
              </div>
            </div>

            <div className="quick-actions">
              <form
                className="form"
                onSubmit={(event) => {
                  event.preventDefault()
                  void criarNovaOperacao()
                }}
              >
                <div className="form__field">
                  <label htmlFor="amount">Valor</label>
                  <input
                    id="amount"
                    name="amount"
                    type="text"
                    inputMode="numeric"
                    placeholder="Valor da operação (R$)"
                    value={amountInput}
                    onChange={(event) => {
                      const { display, numeric } = formatCurrencyBRInput(
                        event.target.value,
                      )
                      setAmountInput(display)
                      setAmountValue(numeric)
                      const input = event.target
                      window.requestAnimationFrame(() => {
                        input.setSelectionRange(
                          input.value.length,
                          input.value.length,
                        )
                      })
                    }}
                    required
                    className={amountInvalid && amountError ? 'input--error' : undefined}
                    disabled={!isAuthenticated || createLoading}
                  />
                  {amountInvalid && amountError && (
                    <span className="input-error">Informe um valor maior que zero.</span>
                  )}
                </div>
                <button
                  className="button button--primary"
                  type="submit"
                  disabled={createLoading || !isAuthenticated}
                >
                  <span className="button__icon">+</span>
                  {createLoading ? 'Criando...' : 'Criar operação'}
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section__header">
            <h2>Insights rápidos</h2>
          </div>
          <div className="insights">
            <div className="insight-card">
              <span className="insight-label">Processadas</span>
              <strong>{totalProcessadas}</strong>
              <span className="muted">Operações concluídas</span>
            </div>
            <div className="insight-card">
              <span className="insight-label">Aprovadas</span>
              <strong>{totalAprovadas}</strong>
              <span className="muted">Prontas para processar</span>
            </div>
            <div className="insight-card">
              <span className="insight-label">Pendências</span>
              <strong>{totalPendentes}</strong>
              <span className="muted">Demandam atenção</span>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section__header">
            <h2>Operações</h2>
            <div className="section__actions">
              {loading && <span className="muted">Carregando...</span>}
              {lastUpdated && (
                <span className="muted">
                  Última atualização:{' '}
                  {lastUpdated.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
              <button
                className="button button--ghost"
                onClick={handleRefresh}
                disabled={refreshing}
                type="button"
              >
                {refreshing && <span className="spinner" />}
                {refreshing ? 'Atualizando...' : 'Atualizar'}
              </button>
            </div>
          </div>

          {error && <div className="alert">{error}</div>}

          {!loading && (
            <div className="table-summary">
              Mostrando {operacoesFiltradas.length} de {operacoes.length} operações
            </div>
          )}

          {!loading && operacoes.length === 0 && (
            <div className="empty-state">
              Ainda não há operações. Crie a primeira para começar.
            </div>
          )}

          {!loading && operacoes.length > 0 && operacoesFiltradas.length === 0 && (
            <div className="empty-state">
              Nenhuma operação encontrada com os filtros aplicados. Ajuste os filtros
              e tente novamente.
            </div>
          )}

          {(loading || operacoesFiltradas.length > 0) && (
            <div className="table-wrapper panel">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th>Criada em</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                      <tr key={`skeleton-${index}`} className="row--skeleton">
                        <td colSpan={5}>
                          <div className="skeleton-row" />
                        </td>
                      </tr>
                    ))
                  ) : (
                    operacoesFiltradas.map((op) => {
                      const status = op.status as StatusOperacao
                      const emAcao = actionLoading[op.id]
                      const isNew = op.id === highlightedId
                      const rowClass = [
                        isNew ? 'row--new' : '',
                        emAcao ? 'row--loading' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')

                      return (
                        <tr key={op.id} className={rowClass || undefined}>
                          <td className="id-cell">
                            <span className="mono">{formatarId(op.id)}</span>
                            <button
                              type="button"
                              className="copy-button"
                              onClick={() => copiarId(op.id)}
                              aria-label="Copiar ID completo"
                            >
                              Copiar
                            </button>
                          </td>
                          <td>
                            {op.amount.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                          </td>
                          <td>
                            <span className={`status ${STATUS_VARIANTS[status]}`}>
                              {STATUS_LABELS[status] ?? status}
                            </span>
                          </td>
                          <td>
                            {new Date(op.createdAt).toLocaleString('pt-BR')}
                          </td>
                          <td className="actions">
                            {canAprovar(status) && (
                              <button
                                className={`button button--primary ${
                                  emAcao ? 'button--loading' : ''
                                }`}
                                onClick={() => executarAcao(op.id, aprovarOperacao)}
                                disabled={emAcao || !isAuthenticated}
                              >
                                {emAcao ? 'Aprovando...' : 'Aprovar'}
                              </button>
                            )}
                            {canProcessar(status) && (
                              <button
                                className={`button button--secondary ${
                                  emAcao ? 'button--loading' : ''
                                }`}
                                onClick={() =>
                                  executarAcao(op.id, processarOperacao)
                                }
                                disabled={emAcao || !isAuthenticated}
                              >
                                {emAcao ? 'Processando...' : 'Processar'}
                              </button>
                            )}
                            {emAcao && (
                              <span className="action-feedback">Atualizando</span>
                            )}
                            {status === 'Processada' && (
                              <span className="final-state">✔ Finalizada</span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
