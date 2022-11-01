import type { DefaultPluginAPI, UserConfigContext } from 'build-scripts';
import Config from 'webpack-chain';
import { ExtendsPluginAPI } from '@tuzki/scaffold-types';

export type ConfigFunc = (
  config: Config,
  configValue: any,
  context: UserConfigContext,
  api: DefaultPluginAPI<Config, ExtendsPluginAPI>
) => Config;
