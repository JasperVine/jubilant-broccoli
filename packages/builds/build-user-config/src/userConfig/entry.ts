import WebpackChain from 'webpack-chain';

export default (config: WebpackChain, value: WebpackChain.EntryPoint) => {
  let entry: Record<string, any>;
  if (Array.isArray(value) || typeof value === 'string') {
    entry = {
      index: value,
    };
  } else if (Object.prototype.toString.call(value) === '[object Object]') {
    entry = value;
  }
  config.entryPoints.clear();
  config.merge({ entry });

  return config;
};
