import fs from 'fs-extra';
import path from 'path';
import { describe, beforeAll, test, expect } from 'vitest';
import webpackService from '../lib';

describe('simple build test suite', () => {
  beforeAll(async () => {
    await webpackService.run({
      command: 'build',
      rootDir: path.join(__dirname, 'fixtures/basic-spa/'),
      commandArgs: {},
    });
  });

  test('check output source', () => {
    expect(
      fs.existsSync(path.join(__dirname, 'fixtures/basic-spa/build/index.js'))
    );
  });
});
