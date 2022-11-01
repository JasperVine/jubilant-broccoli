export default [
  {
    name: 'alias',
    validation: 'object',
    defaultValue: {},
  },
  {
    name: 'devPublicPath',
    validation: 'string',
    defaultValue: '/',
  },
  {
    name: 'entry',
    defaultValue: 'src/index.jsx',
    validation: 'string|array|object',
  },
  {
    name: 'filename',
    validation: 'string',
    defaultValue: '[name].js',
  },
  {
    name: 'outputDir',
    validation: 'string',
    defaultValue: 'build',
  },
  {
    name: 'publicPath',
    validation: 'string',
    defaultValue: '/',
  },
];
