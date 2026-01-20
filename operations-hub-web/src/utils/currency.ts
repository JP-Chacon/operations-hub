export function parseCurrencyBR(value: string): number {
  const digits = value.replace(/\D/g, '')
  if (!digits) {
    return 0
  }
  return Number(digits) / 100
}

export function formatCurrencyBR(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatCurrencyBRInput(value: string): {
  display: string
  numeric: number
} {
  const digits = value.replace(/\D/g, '')
  if (!digits) {
    return { display: '', numeric: 0 }
  }
  const numeric = Number(digits) / 100
  return { display: formatCurrencyBR(numeric), numeric }
}
