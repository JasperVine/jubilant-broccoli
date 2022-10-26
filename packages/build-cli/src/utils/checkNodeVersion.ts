/*
 * @Author: jinxu@tuzhanai.com
 * @Date: 2022-10-25 14:13:25
 * @LastEditors: jinxu@tuzhanai.com
 * @LastEditTime: 2022-10-25 14:19:43
 * @FilePath: /jubilant-broccoli/packages/build-cli/src/utils/checkNodeVersion.ts
 * @Description:
 * Copyright (c) 2022 by jinxu@tuzhanai.com, All Rights Reserved.
 */
import chalk from 'chalk';
import semver from 'semver';

export default function (
  requireNodeVersion: string,
  packageName = '@tuzki/scaffold-build-cli'
) {
  if (!semver.satisfies(process.version, requireNodeVersion)) {
    console.log();
    console.log(chalk.red(`  You are using Node ${process.version}`));
    console.log(
      chalk.red(
        `  ${packageName} requires Node ${requireNodeVersion}, please update Node.`
      )
    );
    console.log();
    console.log();
    process.exit(1);
  }
}
