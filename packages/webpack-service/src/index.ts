import { Service } from 'build-scripts';
import WebpackChain from 'webpack-chain';
import webpack from 'webpack';
import start from './start';
import build from './build';

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
