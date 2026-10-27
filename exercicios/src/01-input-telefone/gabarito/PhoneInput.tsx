import { ChangeEvent, useEffect, useId, useLayoutEffect, useRef, type ComponentPropsWithoutRef } from 'react';
import { formatPhone, onlyDigits } from './formatPhone';

type PhoneInputProps = Omit<ComponentPropsWithoutRef<'input'>, 'value' | 'onChange' | 'type'> & {
  label: string;
  value: string;
  onChange: (digits: string) => void;
  hint?: string;
};

export function PhoneInput({ label, value, onChange, hint, id, ...rest }: PhoneInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;

  const inputRef = useRef<HTMLInputElement>(null);
  const digitsBeforeCursorRef = useRef<number | null>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const typed = event.target.value;
    const cursor = event.target.selectionStart ?? typed.length;
    digitsBeforeCursorRef.current = onlyDigits(typed.slice(0, cursor)).length;
    onChange(onlyDigits(typed))

  }

  useLayoutEffect(() => {
    const input = inputRef.current;
    const digitsBefore = digitsBeforeCursorRef.current;

    if (!input || digitsBefore === null) return;

    let pos = 0;
    let seen = 0;

    while (pos < input.value.length && seen < digitsBefore) {
      if (/\d/.test(input.value[pos]!)) seen++;
      pos++;
    }

    input.setSelectionRange(pos, pos);
    digitsBeforeCursorRef.current = null;
  }, [value])

  return (
    <div>
      <label htmlFor={inputId}>{label}</label>
      <input
        {...rest}
        id={inputId}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        aria-describedby={hint ? hintId : undefined}
        value={formatPhone(value)}
        onChange={handleChange}
        ref={inputRef}
      />
      {hint && <small id={hintId}>{hint}</small>}
    </div>
  );
}
