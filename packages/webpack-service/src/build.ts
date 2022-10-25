import { Context } from 'build-scripts';
import WebpackChain from 'webpack-chain';
import type webpack from 'webpack';
import path from 'path';
import fs from 'fs-extra';
import webpackStats from './utils/webpackStats';

export default async (
  context: Context<
    WebpackChain,
    {
      webpack: any;
    }
  >
): Promise<void> => {
  const configArr = context.getTaskConfig();
  const { command, commandArgs, applyHook, rootDir, extendsPluginAPI, logger } =
    context;

  const { webpack } = extendsPluginAPI;
  await applyHook(`before.${command}.load`, {
    args: commandArgs,
    webpackConfig: configArr,
  });

  if (!configArr.length) {
    const errorMsg = 'No webpack config found.';
    logger.warn('CONFIG', errorMsg);
    await applyHook('error', { err: new Error(errorMsg) });
  }

  const defaultPath = path.resolve(rootDir, 'build');
  configArr.forEach(v => {
    try {
      const userBuildPath = v.config.output.get('path');
      const buildPath = path.resolve(rootDir, userBuildPath);
      fs.emptyDirSync(buildPath);
    } catch (e) {
      if (fs.existsSync(defaultPath)) {
        fs.emptyDirSync(defaultPath);
      }
    }
  });

  const webpackConfig = configArr.map(v => v.config.toConfig());
  await applyHook(`before.${command}.run`, {
    args: commandArgs,
    config: webpackConfig,
  });

  let compiler: webpack.MultiCompiler;
  try {
    compiler = webpack(webpackConfig);
  } catch (err) {
    logger.error('CONFIG', 'Failed to load webpack config.');
    await applyHook('error', { err });
    throw err;
  }

  const result = await new Promise((resolve, reject): void => {
    compiler.run((err, stats) => {
      if (err) {
        logger.error('WEBPACK', err.stack || err.toString());
        reject(err);
        return;
      }

      const isSuccessful = webpackStats({
        stats,
      });
      if (isSuccessful) {
        compiler?.close?.(() => {});
        resolve({
          stats,
        });
      } else {
        reject(new Error('webpack compile error'));
      }
    });
  });

  await applyHook(`after.${command}.compile`, result);
};
