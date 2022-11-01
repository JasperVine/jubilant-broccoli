import path from 'path';
import { describe, beforeAll, test, expect, afterAll } from 'vitest';
import WebpackDevServer from 'webpack-dev-server';
import got from 'got';
import webpackService from '../lib';

describe('simple build test suite', () => {
  let server: WebpackDevServer | void;
  beforeAll(async () => {
    server = await webpackService.run({
      command: 'start',
      rootDir: path.join(__dirname, 'fixtures/basic-spa/'),
      commandArgs: {
        port: 4444,
      },
    });
  });

  test('dev server', () => {
    expect(server).toBeTruthy();
  });

  test('access dev bundle', async () => {
    const ret = await got('http://127.0.0.1:4444/index.js');
    expect(ret.statusCode).toBe(200);
  });

  afterAll(() => {
    if (server) {
      server.stop();
    }
  });
});
