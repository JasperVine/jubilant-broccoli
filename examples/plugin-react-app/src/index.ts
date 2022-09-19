/*
 * @Author: jinxu@tuzhanai.com
 * @Date: 2022-09-13 10:50:22
 * @LastEditors: jinxu@tuzhanai.com
 * @LastEditTime: 2022-09-19 11:54:15
 * @FilePath: /jubilant-broccoli/examples/plugin-react-app/src/index.ts
 * @Description:
 * Copyright (c) 2022 by jinxu@tuzhanai.com, All Rights Reserved.
 */
import * as path from 'path';
import { IPlugin } from 'build-scripts';
import * as Config from 'webpack-chain';

const plugins: IPlugin = ({ context, registerTask, registerUserConfig }) => {
  const { rootDir } = context;

  registerTask('default', new Config());

  registerUserConfig({
    name: 'entry',
    validation: 'string',
    configWebpack: (config, value) => {
      config.entry('index').add(value as string);
    },
  });

  registerUserConfig({
    name: 'outputDir',
    validation: 'string',
    configWebpack: (config, value) => {
      config.output.path(path.join(rootDir, value as string));
    },
  });

  registerUserConfig({
    name: 'mode',
    validation: (value) => {
      return typeof value === 'string';
    },
    configWebpack: (config, value) => {
      config.mode(value as any);
    },
  });
};

export default plugins;
