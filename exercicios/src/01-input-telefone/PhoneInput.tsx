// Etapas 3 a 5: veja o README.

// TODO (etapa 5): além destas, aceitar as props nativas de <input> (name, required, disabled...),
// sem deixar passar `value`, `onChange` nem `type` nativos.
type PhoneInputProps = {
  label: string;
  /** Só dígitos, ex.: '11987654321'. */
  value: string;
  /** Recebe só dígitos, nunca o texto formatado. */
  onChange: (digits: string) => void;
  /** Texto de ajuda abaixo do campo. */
  hint?: string;
};

export function PhoneInput({ label, value, onChange, hint }: PhoneInputProps) {
  // TODO
  return <input />;
}
