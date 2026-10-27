import { useState } from 'react';
import { PhoneInput } from './PhoneInput';

export function Demo() {
  const [phone, setPhone] = useState('');

  return (
    <section>
      <h2>01 · Input de telefone</h2>
      <PhoneInput label="Celular" value={phone} onChange={setPhone} hint="Com DDD. Ex.: (11) 98765-4321" />
      <p>
        Valor no estado: <code>{JSON.stringify(phone)}</code>
      </p>
    </section>
  );
}
