/*
 * @Author: jinxu@tuzhanai.com
 * @Date: 2022-10-25 10:52:17
 * @LastEditors: jinxu@tuzhanai.com
 * @LastEditTime: 2022-10-25 11:07:24
 * @FilePath: /jubilant-broccoli/packages/webpack-service/__tests__/build.test.ts
 * @Description:
 * Copyright (c) 2022 by jinxu@tuzhanai.com, All Rights Reserved.
 */
import fs from 'fs-extra';
import path from 'path';
import webpackService from '../lib';
import { describe, beforeAll, test, expect } from 'vitest';

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
