import Config from 'webpack-chain';
import type { Mode } from './index';

export default (mode: Mode) => {
  const config = new Config();
  config.mode(mode);
  config.resolve.extensions.merge([
    '.js',
    '.json',
    '.jsx',
    '.ts',
    '.tsx',
    '.mjs',
    '.mts',
  ]);

  return config;
};
