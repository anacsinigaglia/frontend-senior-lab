import { useEffect, useRef, useState } from 'react';
import { ProfilerSteps, RenderCount } from '../RenderCount';

/** Errado: as três linhas leem o mesmo `count` (a foto deste render). */
function PlusThreeWrong() {
  const [count, setCount] = useState(0);

  function addThree() {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  }

  return (
    <div className="panel bad">
      <h3>setCount(count + 1) × 3</h3>
      <p className="big">{count}</p>
      <button type="button" onClick={addThree}>+3</button>{' '}
      <button type="button" onClick={() => setCount(0)}>Zerar</button>
      <pre>{`setCount(count + 1); // count é 0 → 1
setCount(count + 1); // count ainda é 0 → 1
setCount(count + 1); // count ainda é 0 → 1`}</pre>
    </div>
  );
}

/** Certo: cada função recebe o resultado da anterior. */
function PlusThreeRight() {
  const [count, setCount] = useState(0);

  function addThree() {
    setCount((c) => c + 1);
    setCount((c) => c + 1);
    setCount((c) => c + 1);
  }

  return (
    <div className="panel good">
      <h3>setCount(c =&gt; c + 1) × 3</h3>
      <p className="big">{count}</p>
      <button type="button" onClick={addThree}>+3</button>{' '}
      <button type="button" onClick={() => setCount(0)}>Zerar</button>
      <pre>{`setCount(c => c + 1); // 0 → 1
setCount(c => c + 1); // 1 → 2
setCount(c => c + 1); // 2 → 3`}</pre>
    </div>
  );
}

/** A foto também vale para callbacks que rodam depois: um setTimeout vê o count do render em que foi criado. */
function DelayedRead() {
  const [count, setCount] = useState(0);
  const [stateSaw, setStateSaw] = useState<number | null>(null);
  const [refSaw, setRefSaw] = useState<number | null>(null);

  // Ref espelho: sempre guarda o count mais recente.
  const countRef = useRef(count);
  useEffect(() => {
    countRef.current = count;
  }, [count]);

  function readLater() {
    setStateSaw(null);
    setRefSaw(null);
    setTimeout(() => {
      setStateSaw(count); // a foto de quando você clicou
      setRefSaw(countRef.current); // o valor de agora
    }, 3000);
  }

  return (
    <div className="panel">
      <h3>Ler o valor 3 segundos depois</h3>
      <p className="big">{count}</p>
      <button type="button" onClick={readLater}>Ler daqui a 3 s</button>{' '}
      <button type="button" onClick={() => setCount((c) => c + 1)}>+1</button>
      <p>
        <code>count</code> dentro do timeout viu: <strong>{stateSaw ?? '…'}</strong>
        <br />
        <code>countRef.current</code> dentro do timeout viu: <strong>{refSaw ?? '…'}</strong>
      </p>
      <p className="note">
        Clique "Ler daqui a 3 s" e, logo depois, "+1" algumas vezes. O <code>count</code> vê o valor de quando você
        clicou; a ref vê o de agora. Este é o caso em que a ref ajuda com "valor atrasado": um callback que roda depois
        e precisa ler o mais recente. Para mostrar na tela, continua sendo state.
      </p>
    </div>
  );
}

export function Demo() {
  return (
    <section>
      <h2>Estado é uma foto do render</h2>
      <p>
        Em cada render, <code>count</code> é uma constante. Chamar <code>setCount</code> não muda essa constante: pede
        um render novo, em que <code>count</code> terá outro valor.
      </p>
      <div className="pair">
        <RenderCount id="mais-tres-errado">
          <PlusThreeWrong />
        </RenderCount>
        <RenderCount id="mais-tres-certo">
          <PlusThreeRight />
        </RenderCount>
      </div>
      <RenderCount id="leitura-atrasada">
        <DelayedRead />
      </RenderCount>

      <div className="panel">
        <h3>Como escrever</h3>
        <pre>{`// O próximo valor depende do anterior? Passe uma função.
setCount((c) => c + 1);
setItems((items) => [...items, novo]);
setOpen((open) => !open);

// O próximo valor não depende do anterior? Passe o valor.
setCount(0);
setQuery(event.target.value);`}</pre>
      </div>

      <ProfilerSteps>
        <ol>
          <li>Ligue "Highlight updates when components render" e grave (●) no Profiler.</li>
          <li>
            Clique "+3" nos dois painéis e pare a gravação. Cada clique gerou <strong>um</strong> commit, não três: o
            React junta os <code>setCount</code> do mesmo evento num render só (batching). O contador amarelo mostra o
            mesmo.
          </li>
          <li>
            Selecione o commit e clique no componente: em "Why did this render?" aparece{' '}
            <em>Hook 1 changed</em>. Para isso aparecer, ative "Record why each component rendered while profiling" na
            engrenagem.
          </li>
        </ol>
      </ProfilerSteps>
    </section>
  );
}
