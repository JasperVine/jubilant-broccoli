import Config from 'webpack-chain';

export default (config: Config) => {
  // custom stat output by stats.toJson() calls
  config.stats('none');
  // set source map, https://webpack.js.org/configuration/devtool/#devtool
  config.devtool('cheap-module-source-map');
};
