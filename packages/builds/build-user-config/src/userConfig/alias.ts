import path from 'path';
import WebpackChain from 'webpack-chain';

export default (config: WebpackChain, alias: Record<string, any>) => {
  const aliasWithRoot: Record<string, any> = {};
  Object.keys(alias).forEach(key => {
    if (typeof alias[key] === 'boolean' || path.isAbsolute(alias[key])) {
      aliasWithRoot[key] = alias[key];
    }
  });
  config.merge({
    resolve: {
      alias: aliasWithRoot,
    },
  });

  return config;
};
