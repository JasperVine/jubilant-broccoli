import { Service } from 'build-scripts';
import WebpackChain from 'webpack-chain';
import webpack from 'webpack';
import webpackStart from './start.js';
import webpackBuild from './build.js';
import log from './utils/log.js';

const webpackService = new Service<WebpackChain>({
  name: 'webpackService',
  command: {
    start: webpackStart,
    build: webpackBuild,
  },
  extendsPluginAPI: {
    webpack,
  },
});

export default webpackService;

export { webpackStart, webpackBuild, log };
