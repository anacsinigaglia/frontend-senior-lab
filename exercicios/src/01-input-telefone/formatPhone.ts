/**
 * Etapa 1. Recebe qualquer texto e devolve só os dígitos, no máximo 11.
 *
 *   onlyDigits('(11) 98765-4321') === '11987654321'
 *   onlyDigits('abc')             === ''
 */
export function onlyDigits(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 11);
}

/**
 * Etapa 2. Recebe só dígitos (0 a 11) e devolve o texto formatado.
 * A tabela completa está no README.
 *
 *   formatPhone('1134567890')  === '(11) 3456-7890'
 *   formatPhone('11987654321') === '(11) 98765-4321'
 */
export function formatPhone(digits: string): string {
  // TODO

  return digits;
}
