export function onlyDigits(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 11);
}

export function formatPhone(digits: string): string {
  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);
  if (rest.length === 0) return ddd ? `(${ddd}` : '';

  // Com 11 dígitos é celular: 5 antes do hífen. Até 10, fixo (ou celular ainda incompleto): 4.
  const split = digits.length === 11 ? 5 : 4;
  const first = rest.slice(0, split);
  const last = rest.slice(split);
  return last ? `(${ddd}) ${first}-${last}` : `(${ddd}) ${first}`;
}
