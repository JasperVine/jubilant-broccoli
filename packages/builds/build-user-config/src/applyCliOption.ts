/*
 * @Author: jinxu@tuzhanai.com
 * @Date: 2022-11-01 11:16:28
 * @LastEditors: jinxu@tuzhanai.com
 * @LastEditTime: 2022-11-01 16:30:25
 * @FilePath: /jubilant-broccoli/packages/build-user-config/src/applyCliOption.ts
 * @Description:
 * Copyright (c) 2022 by jinxu@tuzhanai.com, All Rights Reserved.
 */
import type { DefaultPluginAPI, UserConfigContext } from 'build-scripts';
import Config from 'webpack-chain';
import { ExtendsPluginAPI } from '@tuzki/scaffold-types';
import optionConfig from './config/option.config.js';
import type { ConfigFunc } from './config/constants.js';

export default async (
  api: DefaultPluginAPI<Config, ExtendsPluginAPI>,
  options?: any
) => {
  const { registerCliOption } = api;
  const mergedOptionConfig = {
    ...optionConfig,
    ...(options?.customOptionConfig || {}),
  };

  const optionKeys = Object.keys(mergedOptionConfig);

  const cliOption = await Promise.all(
    optionKeys.map(async optionKey => {
      const { module, commands } = mergedOptionConfig[optionKey];
      const moduleName = module || optionKey;
      const optionDefinition = {
        name: optionKey,
        commands,
      };
      let configFunc: ConfigFunc;
      if (module !== false) {
        try {
          configFunc = (await import(`./cliOption/${moduleName}.js`)).default;
        } catch (err: any) {
          throw new Error(err);
        }
      }
      return {
        ...optionDefinition,
        setConfig: (
          config: Config,
          configValue: any,
          context: UserConfigContext
        ) => {
          if (configFunc) {
            configFunc(config, configValue, context, api);
          }
        },
      };
    })
  );

  registerCliOption(cliOption);
};
