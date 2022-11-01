import { Context } from 'build-scripts';
import deepmerge from 'deepmerge';
import WebpackChain from 'webpack-chain';
import DevServer from 'webpack-dev-server';
import type WebpackDevServer from 'webpack-dev-server';
import type { WebpackOptionsNormalized, MultiStats } from 'webpack';
import webpackStats from './utils/webpackStats.js';
import prepareURLs from './utils/prepareURLs.js';

type DevServerConfig = Record<string, any>;

const start = async (
  context: Context<
    WebpackChain,
    {
      webpack: any;
    }
  >
): Promise<void | WebpackDevServer> => {
  const configArr = context.getTaskConfig();
  const { command, commandArgs, extendsPluginAPI, applyHook, logger } = context;
  const { webpack } = extendsPluginAPI;
  await applyHook(`before.${command}.load`, {
    args: commandArgs,
    webpackConfig: configArr,
  });

  if (!configArr.length) {
    const errorMsg = 'No webpack config found.';
    logger.warn('CONFIG', errorMsg);
    await applyHook('error', { err: new Error(errorMsg) });
    return;
  }

  let serverUrl = '';
  let devServerConfig: DevServerConfig = {
    port: commandArgs.port || 3333,
    host: commandArgs.host || '0.0.0.0',
    https: commandArgs.https || false,
  };

  for (const item of configArr) {
    const { config: chainConfig } = item;
    const config = chainConfig.toConfig() as WebpackOptionsNormalized;
    if (config.devServer) {
      devServerConfig = deepmerge(devServerConfig, config.devServer);
    }
    // if --port or process.env.PORT has been set, overwrite option port
    if (process.env.USE_CLI_PORT) {
      devServerConfig.port = commandArgs.port;
    }
  }

  const webpackConfig = configArr.map(v => v.config.toConfig());
  console.log('🚀 ~ file: start.ts ~ line 55 ~ webpackConfig', webpackConfig);
  await applyHook(`before.${command}.run`, {
    args: commandArgs,
    config: webpackConfig,
  });

  let compiler;
  try {
    compiler = webpack(webpackConfig);
  } catch (err) {
    logger.error('CONFIG', 'Failed to load webpack config.');
    await applyHook('error', { err });
    throw err;
  }
  const protocol = devServerConfig.https ? 'https' : 'http';
  const urls = prepareURLs(
    protocol,
    devServerConfig.host,
    devServerConfig.port
  );
  serverUrl = urls.localUrlForBrowser;

  let isFirstCompile = true;
  // typeof(stats) is webpack.compilation.MultiStats
  compiler.hooks.done.tap('compileHook', async (stats: MultiStats) => {
    const isSuccessful = webpackStats({
      urls,
      stats,
      isFirstCompile,
    });
    if (isSuccessful) {
      isFirstCompile = false;
    }
    await applyHook(`after.${command}.compile`, {
      url: serverUrl,
      urls,
      isFirstCompile,
      stats,
    });
  });

  let devServer: WebpackDevServer;
  // require webpack-dev-server after context setup
  // context may hijack webpack resolve

  // static method getFreePort in v4
  if (DevServer.getFreePort) {
    devServer = new DevServer(devServerConfig, compiler);
  } else {
    devServer = new DevServer(compiler, devServerConfig);
  }

  await applyHook(`before.${command}.devServer`, {
    url: serverUrl,
    urls,
    devServer,
  });
  if (devServer.startCallback) {
    devServer.startCallback(() => {
      applyHook(`after.${command}.devServer`, {
        url: serverUrl,
        urls,
        devServer,
      });
    });
  } else {
    devServer.listen(
      devServerConfig.port,
      devServerConfig.host,
      async (err: Error) => {
        if (err) {
          logger.info('WEBPACK', '[ERR]: Failed to start webpack dev server');
          logger.error('WEBPACK', err.stack || err.toString());
        }
        await applyHook(`after.${command}.devServer`, {
          url: serverUrl,
          urls,
          devServer,
          err,
        });
      }
    );
  }

  return devServer;
};

export default start;
