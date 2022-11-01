import { webpackBuild, webpackStart } from '@tuzki/scaffold-webpack-service';
import { Service } from 'build-scripts';
import WebpackChain from 'webpack-chain';
import webpack from 'webpack';

const buildService = new Service<WebpackChain>({
  name: 'buildService',
  command: {
    start: ctx => {
      const { userConfig } = ctx;
      if (!userConfig.vite) {
        webpackStart(ctx);
      }
    },
    build: ctx => {
      const { userConfig } = ctx;
      if (!userConfig.vite) {
        webpackBuild(ctx);
      }
    },
  },
  extendsPluginAPI: {
    webpack,
  },
});

export default buildService;
