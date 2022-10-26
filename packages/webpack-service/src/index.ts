import { Service } from 'build-scripts';
import WebpackChain from 'webpack-chain';
import webpack from 'webpack';
import start from './start.js';
import build from './build.js';
import log from './utils/log.js';

const webpackService = new Service<
  WebpackChain,
  Record<'webpack', typeof webpack>
>({
  name: 'webpackService',
  command: {
    start,
    build,
  },
  extendsPluginAPI: {
    webpack,
  },
});

export default webpackService;

export { log };
