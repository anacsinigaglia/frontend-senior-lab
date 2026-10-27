import { Profiler, useRef, type ReactNode } from 'react';

/**
 * Mostra quantas vezes o conteúdo foi renderizado (commits, medidos pelo <Profiler> do React).
 * O número é escrito direto no DOM por uma ref: se fosse estado, contar o render causaria outro render.
 */
export function RenderCount({ id, children }: { id: string; children: ReactNode }) {
  const countRef = useRef(0);
  const badgeRef = useRef<HTMLSpanElement>(null);

  function handleRender() {
    countRef.current += 1;
    if (badgeRef.current) {
      badgeRef.current.textContent = `renders: ${countRef.current}`;
      badgeRef.current.animate([{ background: '#fd0' }, { background: 'transparent' }], 600);
    }
  }

  return (
    <div className="render-count">
      <span ref={badgeRef} className="badge">renders: 0</span>
      <Profiler id={id} onRender={handleRender}>
        {children}
      </Profiler>
    </div>
  );
}

/** Passo a passo para repetir o experimento no Profiler do React DevTools. */
export function ProfilerSteps({ children }: { children: ReactNode }) {
  return (
    <details className="profiler">
      <summary>Ver no React DevTools</summary>
      {children}
    </details>
  );
}
