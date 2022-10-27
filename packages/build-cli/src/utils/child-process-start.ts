import detect from 'detect-port';
import parse from 'yargs-parser';
import { isAbsolute, join } from 'path';
import { log } from '@tuzki/scaffold-webpack-service';
import inquirer, { QuestionCollection } from 'inquirer';
import buildService from './buildService.js';
import getBuiltInPlugins from './getBuiltInPlugins.js';

const rawArgv = parse(process.argv.slice(2));

const DEFAULT_PORT = rawArgv.port || process.env.PORT || 3333;
const DEFAULT_HOST = rawArgv.host || process.env.HOST || '0.0.0.0';
const defaultPort = parseInt(DEFAULT_PORT, 10);

const start = async () => {
  const newPort = await detect(defaultPort);
  if (newPort !== defaultPort) {
    const question: QuestionCollection = {
      type: 'confirm',
      name: 'shouldChangePort',
      message: `${defaultPort} 端口已被占用，是否使用 ${newPort} 端口启动？`,
      default: true,
    };
    const answer = await inquirer.prompt(question);
    if (!answer.shouldChangePort) {
      process.exit(1);
    }
  }

  process.env.NODE_ENV = 'development';
  rawArgv.port = newPort;
  rawArgv.host = DEFAULT_HOST;

  const { rootDir = process.cwd() } = rawArgv;

  delete rawArgv.rootDir;
  delete rawArgv._;
  try {
    await buildService.run({
      command: 'start',
      rootDir: isAbsolute(rootDir) ? rootDir : join(process.cwd(), rootDir),
      commandArgs: { ...rawArgv },
      getBuiltInPlugins,
    });
  } catch (err: any) {
    log.error('BUILT_CLI', err.message);
    console.error(err);
    process.exit(1);
  }
};

start();
