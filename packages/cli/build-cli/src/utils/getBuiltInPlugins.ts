import type { GetBuiltInPlugins } from 'build-scripts';
import pluginCore from '@tuzki/scaffold-plugin-core';

const getBuiltInPlugins: GetBuiltInPlugins = () => {
  return [pluginCore()];
};

export default getBuiltInPlugins;
