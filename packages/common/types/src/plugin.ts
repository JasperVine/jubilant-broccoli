import type { _Plugin } from 'build-scripts';
import { webpack } from 'webpack';
import WebpackChain from 'webpack-chain';

export interface ExtendsPluginAPI {
  webpack?: typeof webpack;
}

export type Plugin<Options = any> = (
  options?: Options
) => _Plugin<WebpackChain, ExtendsPluginAPI>;
