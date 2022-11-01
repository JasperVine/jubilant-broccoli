import type { Plugin } from '@tuzki/scaffold-types';
import getWebpackConfig from '@tuzki/scaffold-build-webpack-config';
import {
  applyCliOption,
  applyUserConfig,
} from '@tuzki/scaffold-build-user-config';

const plugin: Plugin<any> = () => ({
  name: '@tuzki/scaffold-plugin-core',
  setup: async api => {
    const { registerTask, context } = api;
    const { command } = context;
    const mode = command === 'start' ? 'development' : 'production';

    await applyCliOption(api);
    await applyUserConfig(api);

    const taskName = 'web';
    const webpackConfig = getWebpackConfig(mode);
    webpackConfig.name(taskName);

    registerTask(taskName, webpackConfig);
  },
});

export default plugin;
