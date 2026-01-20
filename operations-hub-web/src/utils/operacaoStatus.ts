export type StatusOperacao = 'Criada' | 'Aprovada' | 'Processada' | 'Cancelada'

export const STATUS_LABELS: Record<StatusOperacao, string> = {
  Criada: 'Criada',
  Aprovada: 'Aprovada',
  Processada: 'Processada',
  Cancelada: 'Cancelada',
}

export const STATUS_VARIANTS: Record<StatusOperacao, string> = {
  Criada: 'status--criada',
  Aprovada: 'status--aprovada',
  Processada: 'status--processada',
  Cancelada: 'status--cancelada',
}

export function canAprovar(status: StatusOperacao) {
  return status === 'Criada'
}

export function canProcessar(status: StatusOperacao) {
  return status === 'Aprovada'
}
