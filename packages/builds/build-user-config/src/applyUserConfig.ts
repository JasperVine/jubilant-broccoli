import type { DefaultPluginAPI, UserConfigContext } from 'build-scripts';
import Config from 'webpack-chain';
import { ExtendsPluginAPI } from '@tuzki/scaffold-types';
import baseUserConfigs from './config/user.config.js';
import unionBy from './utils/unionBy.js';
import type { ConfigFunc } from './config/constants.js';

export default async (
  api: DefaultPluginAPI<Config, ExtendsPluginAPI>,
  options?: any
) => {
  const { registerUserConfig } = api;

  const defaultConfig = await Promise.all(
    baseUserConfigs.map(async config => {
      const { name } = config;
      let configFunc: ConfigFunc;
      try {
        configFunc = (await import(`./userConfig/${name}.js`)).default;
      } catch (err: any) {
        throw new Error(err);
      }

      return {
        setConfig: (
          config: Config,
          configValue: any,
          context: UserConfigContext
        ) => {
          if (configFunc) {
            configFunc(config, configValue, context, api);
          }
        },
        ...config,
      };
    })
  );

  const finallyConfigs = unionBy(
    defaultConfig.concat(options?.customConfigs || []),
    'name'
  );

  registerUserConfig(finallyConfigs);
};
