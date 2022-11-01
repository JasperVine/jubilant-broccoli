import path from 'path';
import WebpackChain from 'webpack-chain';

export default (config: WebpackChain, outputDir: string, context: any) => {
  const { rootDir } = context;
  const outputPath = path.resolve(rootDir, outputDir);
  config.output.path(outputPath);

  return config;
};
