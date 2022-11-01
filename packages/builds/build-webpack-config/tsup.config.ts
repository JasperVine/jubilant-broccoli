import { defineConfig } from 'tsup';

export default defineConfig(() => ({
  name: 'build-user-config',
  entry: ['src/**/*', 'src/*'],
  format: ['esm'],
  outDir: 'lib',
  splitting: false,
  dts: true,
  bundle: false,
  clean: true,
}));
