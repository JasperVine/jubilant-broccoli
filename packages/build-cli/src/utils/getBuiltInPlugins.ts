import type { GetBuiltInPlugins } from 'build-scripts';

const getBuiltInPlugins: GetBuiltInPlugins = () => {
  return ['build-plugin-app-core'];
};

export default getBuiltInPlugins;
