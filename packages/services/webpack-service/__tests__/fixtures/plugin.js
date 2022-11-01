import path from 'path';
import Config from 'webpack-chain';

const plugin = ({ registerTask, context: { rootDir } }) => {
  const config = new Config();
  config.mode('development');
  config.entry('index').add(path.join(rootDir, 'src/index.js'));
  config.output.path(path.join(rootDir, 'build'));
  config.merge({
    devServer: {},
  });
  registerTask('web', config);
};

export default plugin;
