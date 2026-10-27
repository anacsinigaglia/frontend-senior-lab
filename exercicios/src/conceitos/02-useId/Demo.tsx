import { useId } from 'react';
import { ProfilerSteps } from '../RenderCount';

/** Sem useId: id fixo. Funciona com um campo; com dois, os ids se repetem. */
function FieldFixedId({ label }: { label: string }) {
  return (
    <p>
      <label htmlFor="campo">{label}</label>
      <br />
      <input id="campo" />
    </p>
  );
}

/** Com useId: cada instância ganha um id próprio. */
function FieldUseId({ label }: { label: string }) {
  const id = useId();
  return (
    <p>
      <label htmlFor={id}>{label}</label> <code>{id}</code>
      <br />
      <input id={id} />
    </p>
  );
}

export function Demo() {
  return (
    <section>
      <h2>useId</h2>
      <p>
        <code>htmlFor</code> e <code>aria-describedby</code> ligam elementos por id, e id tem que ser único na página.
        Num componente reutilizável, um id fixo se repete.
      </p>
      <div className="pair">
        <div className="panel bad">
          <h3>Sem useId (id="campo")</h3>
          <FieldFixedId label="Celular" />
          <FieldFixedId label="Telefone fixo" />
          <p className="note">Clique no texto "Telefone fixo": o foco vai para o campo de cima.</p>
        </div>
        <div className="panel good">
          <h3>Com useId</h3>
          <FieldUseId label="Celular" />
          <FieldUseId label="Telefone fixo" />
          <p className="note">Cada label foca o seu campo.</p>
        </div>
      </div>
      <p className="note">
        Por que não <code>Math.random()</code>? Mudaria a cada render, e no SSR o servidor geraria um id e o navegador
        outro (hydration mismatch). O <code>useId</code> é estável e igual nos dois lados. E não use para{' '}
        <code>key</code> de lista: a key vem do dado.
      </p>
      <ProfilerSteps>
        <p>
          Aqui o Profiler não ajuda (não é assunto de render). Use a aba <strong>Elements</strong> do DevTools do
          navegador: inspecione os dois inputs da esquerda e veja os dois com <code>id="campo"</code>. Depois abra a aba{' '}
          <strong>Accessibility</strong> do segundo input: o "Name" vem vazio, porque nenhum label aponta só para ele.
        </p>
      </ProfilerSteps>
    </section>
  );
}
