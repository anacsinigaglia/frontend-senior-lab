import { useRef, useState } from 'react';
import { ProfilerSteps, RenderCount } from '../RenderCount';

// Só para a demo: guarda os intervals que a versão quebrada perde, para o botão "Limpar" conseguir parar.
const leaked = new Set<number>();

/** Sem useRef: o id do interval fica numa variável comum. */
function StopwatchWithLet() {
  const [seconds, setSeconds] = useState(0);
  let intervalId: number | undefined; // recriada como undefined a cada render

  function start() {
    intervalId = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    leaked.add(intervalId);
  }

  function stop() {
    clearInterval(intervalId); // depois do primeiro re-render, intervalId é undefined
  }

  return (
    <div className="panel bad">
      <h3>Sem useRef (let)</h3>
      <p className="big">{seconds}s</p>
      <button type="button" onClick={start}>Iniciar</button>{' '}
      <button type="button" onClick={stop}>Parar</button>
      <p className="note">
        Inicie e tente parar. Clique "Iniciar" duas vezes e veja contar em dobro.{' '}
        <button
          type="button"
          onClick={() => {
            leaked.forEach(clearInterval);
            leaked.clear();
            setSeconds(0);
          }}
        >
          Limpar
        </button>
      </p>
    </div>
  );
}

/** Com useRef: o id sobrevive aos re-renders. */
function StopwatchWithRef() {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<number | null>(null);

  function start() {
    if (intervalRef.current !== null) return; // já está rodando
    intervalRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
  }

  function stop() {
    if (intervalRef.current !== null) clearInterval(intervalRef.current);
    intervalRef.current = null;
  }

  return (
    <div className="panel good">
      <h3>Com useRef</h3>
      <p className="big">{seconds}s</p>
      <button type="button" onClick={start}>Iniciar</button>{' '}
      <button type="button" onClick={stop}>Parar</button>
      <p className="note">Para de verdade, e iniciar duas vezes não duplica.</p>
    </div>
  );
}

/** useRef não re-renderiza; useState sim. */
function RefVsState() {
  const clicksRef = useRef(0);
  const [clicksState, setClicksState] = useState(0);

  return (
    <div className="panel">
      <h3>Ref muda, mas a tela não fica sabendo</h3>
      <p>
        ref: <strong>{clicksRef.current}</strong> · state: <strong>{clicksState}</strong>
      </p>
      <button type="button" onClick={() => (clicksRef.current += 1)}>+1 na ref</button>{' '}
      <button type="button" onClick={() => setClicksState((c) => c + 1)}>+1 no state</button>
      <p className="note">
        Clique "+1 na ref" 5 vezes: nada muda na tela. Agora clique "+1 no state": o render acontece e a ref aparece
        com o valor acumulado. Ela nunca perdeu a conta, só não avisou o React.
      </p>
    </div>
  );
}

/** O outro uso: apontar para um elemento do DOM. */
function FocusInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="panel">
      <h3>Ref para o DOM</h3>
      <input ref={inputRef} placeholder="Busca" />{' '}
      <button type="button" onClick={() => inputRef.current?.focus()}>Focar na busca</button>
      <p className="note">
        <code>inputRef.current</code> é o próprio <code>&lt;input&gt;</code> do DOM. É assim que se chama{' '}
        <code>focus()</code>, <code>scrollIntoView()</code>, <code>showModal()</code>: coisas que não são estado, são
        comandos para o navegador.
      </p>
    </div>
  );
}

export function Demo() {
  return (
    <section>
      <h2>useRef</h2>
      <p>
        Uma caixa (<code>{'{ current }'}</code>) que o React guarda entre renders. Mudar o <code>current</code> não
        causa re-render.
      </p>
      <div className="pair">
        <RenderCount id="sem-ref">
          <StopwatchWithLet />
        </RenderCount>
        <RenderCount id="com-ref">
          <StopwatchWithRef />
        </RenderCount>
      </div>
      <RenderCount id="ref-vs-state">
        <RefVsState />
      </RenderCount>
      <RenderCount id="foco">
        <FocusInput />
      </RenderCount>

      <ProfilerSteps>
        <ol>
          <li>Instale a extensão React Developer Tools e abra a aba <strong>⚛ Profiler</strong>.</li>
          <li>
            Na engrenagem (⚙ → General), ligue <strong>Highlight updates when components render</strong>. Agora cada
            render pisca uma borda na tela.
          </li>
          <li>
            Clique "+1 na ref" algumas vezes: nada pisca. Clique "+1 no state": <code>RefVsState</code> pisca.
          </li>
          <li>
            Clique em ● (Record), inicie o cronômetro "Com useRef", espere 3 s e pare a gravação. Você verá um commit
            por segundo, e em cada um só <code>StopwatchWithRef</code> renderizou (os outros ficam cinza).
          </li>
          <li>
            Grave de novo clicando "Focar na busca": <strong>nenhum commit</strong>. Focar é um comando para o DOM, não
            muda estado.
          </li>
        </ol>
      </ProfilerSteps>
    </section>
  );
}
