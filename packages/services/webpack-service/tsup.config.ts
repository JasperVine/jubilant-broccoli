import { defineConfig } from 'tsup';

export default defineConfig(() => ({
  name: 'webpack-service',
  entry: ['src/**/*', 'src/*'],
  format: ['esm'],
  outDir: 'lib',
  splitting: false,
  dts: true,
  bundle: false,
  clean: true,
}));
