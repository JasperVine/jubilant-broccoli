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
