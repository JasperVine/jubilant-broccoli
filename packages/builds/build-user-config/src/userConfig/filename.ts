import WebpackChain from 'webpack-chain';

export default (config: WebpackChain, filename: string) => {
  if (filename) {
    config.output.filename(filename);
  }

  return config;
};
