import WebpackChain from 'webpack-chain';

export default (config: WebpackChain, value: string, context: any) => {
  const { command } = context;
  if (command === 'start') {
    config.output.publicPath(value);
  }
  return config;
};
