import { log } from '@tuzki/scaffold-webpack-service';
import { fork, ChildProcess } from 'child_process';
import path from 'path';
import parse from 'yargs-parser';
import detect from 'detect-port';
import chokidar from 'chokidar';
import { createRequire } from 'module';

let child: ChildProcess | null = null;

const require = createRequire(import.meta.url);
const rawArgv = parse(process.argv.slice(2));
const configPath = path.resolve(rawArgv.config || 'build.json');
const childProcessPath = require.resolve('./utils/child-process-start.js');

const inspectRegExp = /^--(inspect(?:-brk)?)(?:=(?:([^:]+):)?(\d+))?$/;

async function modifyInspectArgv(
  execArgv: string[],
  processArgv: parse.Arguments
) {
  /**
   * Enable debugger by exec argv, eg. node --inspect node_modules/.bin/build-scripts start
   * By this way, there will be two inspector, because start.js is run as a child process.
   * So need to handle the conflict of port.
   */
  const result = await Promise.all(
    execArgv.map(async item => {
      const matchResult = inspectRegExp.exec(item);
      if (!matchResult) {
        return item;
      }
      // eslint-disable-next-line
      const [_, command, ip, port = 9229] = matchResult;
      const nPort = +port;
      const newPort = await detect(nPort);
      return `--${command}=${ip ? `${ip}:` : ''}${newPort}`;
    })
  );

  /**
   * Enable debugger by process argv, eg. npm run start --inspect
   * Need to change it as an exec argv.
   */
  if (processArgv.inspect) {
    const matchResult = /(?:([^:]+):)?(\d+)/.exec(rawArgv.inspect);
    // eslint-disable-next-line
    const [_, ip, port = 9229] = matchResult || [];
    const newPort = await detect(+port);
    result.push(`--inspect-brk=${ip ? `${ip}:` : ''}${newPort}`);
  }

  return result;
}

async function restartProcess() {
  const argv = await modifyInspectArgv(process.execArgv, rawArgv);

  const nProcessArgv = process.argv
    .slice(2)
    .filter(arg => arg.indexOf('--inspect') === -1);

  child = fork(childProcessPath, nProcessArgv, {
    execArgv: argv,
  });

  child.on('message', (data: any) => {
    if (data && data.type === 'RESTART_DEV') {
      child.kill();
      restartProcess();
    }

    if (process.send) {
      process.send(data);
    }
  });

  child.on('exit', code => {
    if (code) {
      process.exit(code);
    }
  });
}

export default async function () {
  restartProcess();

  const watcher = chokidar.watch(configPath, {
    ignoreInitial: true,
  });

  watcher.on('change', () => {
    log.info('BUILD_CLI', 'build.json has been changed');
    log.info('BUILD_CLI', 'restart dev server');
    child.kill();
    restartProcess();
  });

  watcher.on('error', (error: any) => {
    log.error('fail to watch file', error);
    process.exit(1);
  });
}
