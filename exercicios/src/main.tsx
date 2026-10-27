import { StrictMode, useState, type ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import { Demo as TelefoneDemo } from './01-input-telefone/Demo';
import './conceitos/conceitos.css';
import { Demo as UseRefDemo } from './conceitos/01-useRef/Demo';
import { Demo as UseIdDemo } from './conceitos/02-useId/Demo';
import { Demo as EstadoFotoDemo } from './conceitos/03-estado-foto/Demo';

const pages: { title: string; Component: ComponentType }[] = [
  { title: 'useRef', Component: UseRefDemo },
  { title: 'useId', Component: UseIdDemo },
  { title: 'Estado é uma foto', Component: EstadoFotoDemo },
  { title: 'Exercício: telefone', Component: TelefoneDemo },
];

function App() {
  const [current, setCurrent] = useState(0);
  const { Component } = pages[current]!;

  return (
    <main>
      <h1>React + TS: conceitos</h1>
      <nav>
        {pages.map((page, index) => (
          <button
            key={page.title}
            type="button"
            aria-current={index === current ? 'page' : undefined}
            onClick={() => setCurrent(index)}
          >
            {page.title}
          </button>
        ))}
      </nav>
      <Component />
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
