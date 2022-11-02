import parse from 'yargs-parser';
import { log } from '@tuzki/scaffold-webpack-service';
import { isAbsolute, join } from 'path';
import buildService from './utils/buildService.js';
import getBuiltInPlugins from './utils/getBuiltInPlugins.js';

const build = async () => {
  process.env.NODE_ENV = 'production';
  const rawArgv = parse(process.argv.slice(2));

  const { rootDir = process.cwd() } = rawArgv;

  delete rawArgv.rootDir;
  delete rawArgv._;
  try {
    await buildService.run({
      command: 'build',
      commandArgs: { ...rawArgv },
      rootDir: isAbsolute(rootDir) ? rootDir : join(process.cwd(), rootDir),
      getBuiltInPlugins,
    });
  } catch (err: any) {
    log.error('BUILT_CLI', err.message);
    console.error(err);
    process.exit(1);
  }
};

export default build;
