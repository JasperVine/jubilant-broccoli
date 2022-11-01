import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import WebpackChain from 'webpack-chain';

export default (config: WebpackChain, analyzer: boolean) => {
  if (analyzer) {
    config
      .plugin('webpack-bundle-analyzer')
      .use(BundleAnalyzerPlugin, [{ analyzerPort: 9000 }]);
  }
  return config;
};
