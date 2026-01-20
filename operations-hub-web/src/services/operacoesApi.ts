export type Operacao = {
  id: string
  amount: number
  status: string
  createdAt: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL não está configurada.')
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Erro inesperado na API.')
  }
  return (await response.json()) as T
}

export async function listarOperacoes(): Promise<Operacao[]> {
  const response = await fetch(`${API_BASE_URL}/operacoes`)
  return handleResponse<Operacao[]>(response)
}

export async function criarOperacao(amount: number): Promise<Operacao> {
  const response = await fetch(`${API_BASE_URL}/operacoes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount }),
  })
  return handleResponse<Operacao>(response)
}

export async function aprovarOperacao(id: string): Promise<Operacao> {
  const response = await fetch(`${API_BASE_URL}/operacoes/${id}/aprovar`, {
    method: 'PUT',
  })
  return handleResponse<Operacao>(response)
}

export async function processarOperacao(id: string): Promise<Operacao> {
  const response = await fetch(`${API_BASE_URL}/operacoes/${id}/processar`, {
    method: 'PUT',
  })
  return handleResponse<Operacao>(response)
}
