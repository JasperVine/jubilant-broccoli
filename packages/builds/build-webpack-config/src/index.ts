import getBaseConfig from './webpack.base.js';
import configDev from './webpack.dev.js';
import configBuild from './webpack.build.js';

export type Mode = 'development' | 'production';

export default (mode: Mode = 'development') => {
  const config = getBaseConfig(mode);
  if (mode === 'development') {
    configDev(config);
  } else {
    configBuild(config);
  }
  return config;
};
