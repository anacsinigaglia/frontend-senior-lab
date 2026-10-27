import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { formatPhone, onlyDigits } from './formatPhone';
import { PhoneInput } from './PhoneInput';

/**
 * Componente de teste: guarda o valor em estado (como um formulário real faria)
 * e mostra o que foi guardado num <output>, para conferir tela e estado ao mesmo tempo.
 */
function ControlledPhone({ onChange }: { onChange?: (digits: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <>
      <PhoneInput
        label="Telefone"
        value={value}
        onChange={(digits) => {
          setValue(digits);
          onChange?.(digits);
        }}
      />
      <output data-testid="stored">{value}</output>
    </>
  );
}

function setup(onChange?: (digits: string) => void) {
  const user = userEvent.setup();
  render(<ControlledPhone onChange={onChange} />);
  const input = screen.getByLabelText('Telefone');
  const stored = screen.getByTestId('stored');
  return { user, input, stored };
}

describe('Etapa 1 · onlyDigits', () => {
  it('remove tudo o que não é dígito', () => {
    expect(onlyDigits('(11) 98765-4321')).toBe('11987654321');
    expect(onlyDigits('a1b2 c3')).toBe('123');
  });

  it('limita o resultado a 11 dígitos', () => {
    expect(onlyDigits('119876543210000')).toBe('11987654321');
  });

  it('devolve string vazia quando não há dígitos', () => {
    expect(onlyDigits('abc')).toBe('');
    expect(onlyDigits('')).toBe('');
  });
});

describe('Etapa 2 · formatPhone', () => {
  it.each([
    ['', ''],
    ['1', '(1'],
    ['11', '(11'],
    ['119', '(11) 9'],
    ['113456', '(11) 3456'],
    ['1134567', '(11) 3456-7'],
    ['1134567890', '(11) 3456-7890'],
    ['11987654321', '(11) 98765-4321'],
  ])("formata '%s' como '%s'", (digits, expected) => {
    expect(formatPhone(digits)).toBe(expected);
  });

  it('formata fixo completo como (11) 3456-7890', () => {
    expect(formatPhone('1134567890')).toBe('(11) 3456-7890');
  });

  it('formata celular completo como (11) 98765-4321', () => {
    expect(formatPhone('11987654321')).toBe('(11) 98765-4321');
  });

  it('só mostra um separador quando já existe um dígito depois dele', () => {
    expect(formatPhone('11')).not.toMatch(/\)/);
    expect(formatPhone('113456')).not.toMatch(/-/);
  });
});

describe('Etapa 3 · input controlado', () => {
  it('ao digitar 11987654321 mostra (11) 98765-4321 e guarda só os dígitos', async () => {
    const { user, input, stored } = setup();
    await user.type(input, '11987654321');
    expect(input).toHaveValue('(11) 98765-4321');
    expect(stored).toHaveTextContent('11987654321');
  });

  it('onChange recebe sempre só dígitos, nunca o texto formatado', async () => {
    const onChange = vi.fn();
    const { user, input } = setup(onChange);
    await user.type(input, '1198765');
    expect(onChange).toHaveBeenCalled();
    for (const [digits] of onChange.mock.calls) {
      expect(digits).toMatch(/^\d*$/);
    }
    expect(onChange).toHaveBeenLastCalledWith('1198765');
  });

  it('ignora letras digitadas', async () => {
    const { user, input, stored } = setup();
    await user.type(input, '1a1b9');
    expect(input).toHaveValue('(11) 9');
    expect(stored).toHaveTextContent('119');
  });

  it('não aceita mais de 11 dígitos', async () => {
    const { user, input, stored } = setup();
    await user.type(input, '119876543210');
    expect(input).toHaveValue('(11) 98765-4321');
    expect(stored).toHaveTextContent(/^11987654321$/);
  });

  it('backspace em (11) 9 apaga o dígito e deixa (11), sem travar no separador', async () => {
    const { user, input, stored } = setup();
    await user.type(input, '119');
    await user.type(input, '{Backspace}');
    expect(input).toHaveValue('(11');
    expect(stored).toHaveTextContent(/^11$/);
  });

  it('backspace em (11) 3456-7 apaga o dígito e deixa (11) 3456, sem travar no hífen', async () => {
    const { user, input, stored } = setup();
    await user.type(input, '1134567');
    await user.type(input, '{Backspace}');
    expect(input).toHaveValue('(11) 3456');
    expect(stored).toHaveTextContent(/^113456$/);
  });

  it('ao colar (11) 98765-4321 guarda 11987654321', async () => {
    const { user, input, stored } = setup();
    await user.click(input);
    await user.paste('(11) 98765-4321');
    expect(input).toHaveValue('(11) 98765-4321');
    expect(stored).toHaveTextContent(/^11987654321$/);
  });
});

describe('Etapa 4 · semântica', () => {
  const noop = () => {};

  it('o label está associado ao input (getByLabelText encontra o campo)', () => {
    render(<PhoneInput label="Celular" value="" onChange={noop} />);
    expect(screen.getByLabelText('Celular').tagName).toBe('INPUT');
  });

  it('usa type="tel"', () => {
    render(<PhoneInput label="Celular" value="" onChange={noop} />);
    expect(screen.getByLabelText('Celular')).toHaveAttribute('type', 'tel');
  });

  it('usa inputmode="numeric" para abrir o teclado numérico no celular', () => {
    render(<PhoneInput label="Celular" value="" onChange={noop} />);
    expect(screen.getByLabelText('Celular')).toHaveAttribute('inputmode', 'numeric');
  });

  it('usa autocomplete="tel-national" para o navegador sugerir o telefone sem +55', () => {
    render(<PhoneInput label="Celular" value="" onChange={noop} />);
    expect(screen.getByLabelText('Celular')).toHaveAttribute('autocomplete', 'tel-national');
  });

  it('com hint, o texto de ajuda faz parte da descrição acessível do input', () => {
    render(<PhoneInput label="Celular" value="" onChange={noop} hint="Com DDD" />);
    expect(screen.getByLabelText('Celular')).toHaveAccessibleDescription(
      expect.stringContaining('Com DDD'),
    );
  });

  it('sem hint, o input não tem aria-describedby', () => {
    render(<PhoneInput label="Celular" value="" onChange={noop} />);
    expect(screen.getByLabelText('Celular')).not.toHaveAttribute('aria-describedby');
  });

  it('dois PhoneInput na mesma página têm ids diferentes', () => {
    render(
      <>
        <PhoneInput label="Celular" value="" onChange={noop} />
        <PhoneInput label="Fixo" value="" onChange={noop} />
      </>,
    );
    const celular = screen.getByLabelText('Celular');
    const fixo = screen.getByLabelText('Fixo');
    expect(celular.id).not.toBe('');
    expect(fixo.id).not.toBe('');
    expect(celular.id).not.toBe(fixo.id);
  });
});

describe('Etapa 5 · props nativas', () => {
  const noop = () => {};

  it('repassa name, required, disabled e placeholder para o input', () => {
    render(
      <PhoneInput
        label="Celular"
        value=""
        onChange={noop}
        name="celular"
        required
        disabled
        placeholder="(00) 00000-0000"
      />,
    );
    const input = screen.getByLabelText('Celular');
    expect(input).toHaveAttribute('name', 'celular');
    expect(input).toBeRequired();
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('placeholder', '(00) 00000-0000');
  });

  it('usa o id recebido por prop e o label continua funcionando', () => {
    render(<PhoneInput label="Celular" value="" onChange={noop} id="tel-contato" />);
    expect(screen.getByLabelText('Celular')).toHaveAttribute('id', 'tel-contato');
  });
});
