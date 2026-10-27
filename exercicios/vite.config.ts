import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

// Com GABARITO=1, os testes importam a solução de referência em vez do seu código:
// `./PhoneInput` dentro de um .test.tsx vira `./gabarito/PhoneInput`.
function gabarito(): Plugin {
  return {
    name: 'gabarito',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (!process.env.GABARITO || !importer || !source.startsWith('./')) return null;
      if (!/\.test\.tsx?$/.test(importer)) return null;
      return this.resolve(source.replace('./', './gabarito/'), importer, { ...options, skipSelf: true });
    },
  };
}

export default defineConfig({
  plugins: [react(), gabarito()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    // O cache de módulos não sabe do GABARITO: sem caminhos separados, um modo reaproveita o resultado do outro.
    fsModuleCachePath: process.env.GABARITO ? 'node_modules/.vitest-cache-gabarito' : 'node_modules/.vitest-cache',
  },
});
