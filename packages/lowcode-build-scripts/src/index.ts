/* eslint-disable max-len */
import * as path from 'path';
import * as fs from 'fs-extra';
import JSON5 = require('json5');
import { IHash, Json, JsonArray, JsonValue, MaybeArray, MaybePromise } from './types';
import WebpackChain = require('webpack-chain');
import * as fg from 'fast-glob';
import camelCase = require('camelcase');
import { MultiStats, webpack } from 'webpack';
import { AggregatedResult } from '@jest/test-result';
import { GlobalConfig } from '@jest/types/build/Config';
import type WebpackDevServer from 'webpack-dev-server';
import log = require('./utils/log');
import deepmerge = require('deepmerge');

import _ = require('lodash');

const mergeConfig = <T>(currentValue: T, newValue: T): T => {
  // only merge when currentValue and newValue is object and array
  const isBothArray = Array.isArray(currentValue) && Array.isArray(newValue);
  const isBothObject = _.isPlainObject(currentValue) && _.isPlainObject(newValue);
  if (isBothArray || isBothObject) {
    return deepmerge(currentValue, newValue);
  } else {
    return newValue;
  }
};

export type CommandName = 'start' | 'build' | 'test';

const VALIDATION_MAP = {
  string: 'isString' as const,
  number: 'isNumber' as const,
  array: 'isArray' as const,
  object: 'isObject' as const,
  boolean: 'isBoolean' as const,
};

const USER_CONFIG_FILE = ['build.json', 'build.config.(js|ts)'];

const PLUGIN_CONTEXT_KEY = [
  'command' as const,
  'commandArgs' as const,
  'rootDir' as const,
  'userConfig' as const,
  'originalUserConfig' as const,
  'pkg' as const,
  'webpack' as const,
];

const PKG_FILE = 'package.json';

export type IWebpack = typeof webpack;

export interface IPluginConfigWebpack {
  (config: WebpackChain): Promise<void> | void;
}

export interface IModifyConfig {
  (userConfig: IUserConfig): Omit<IUserConfig, 'plugins'>;
}

export interface IModifyUserConfig {
  (configKey: string | IModifyConfig, value?: any, options?: { deepmerge: boolean }): void;
}

export interface IModeConfig {
  [name: string]: IUserConfig;
}

export type CommandArgs = IHash<any>;

export type IPluginList = Array<string | [string, Json]>;

export type IGetBuiltInPlugins = (userConfig: IUserConfig) => IPluginList;

export type CommandModule<T> = (context: Context, options: any) => Promise<T>;

export interface IUserConfig extends Json {
  plugins: IPluginList;
}

export interface ITaskConfig {
  name: string;
  chainConfig: WebpackChain;
  modifyFunctions: IPluginConfigWebpack[];
}

export interface ICommandModules<T = any> {
  [command: string]: CommandModule<T>;
}

export interface IHasMethod {
  (name: string): boolean;
}

export interface IOnHook {
  (eventName: string, callback: IOnHookCallback): void;
}

export type PluginContext = Pick<Context, typeof PLUGIN_CONTEXT_KEY[number]>;

export type UserConfigContext = PluginContext & {
  taskName: string;
};

export interface IContextOptions {
  command: CommandName;
  rootDir: string;
  args: CommandArgs;
  plugins?: IPluginList;
  getBuiltInPlugins?: IGetBuiltInPlugins;
  commandModules?: ICommandModules;
}

export interface IUserConfigWebpack {
  (config: WebpackChain, value: JsonValue, context: UserConfigContext): Promise<void> | void;
}

export interface IValidation {
  (value: any): boolean;
}

export type ValidationKey = keyof typeof VALIDATION_MAP;

export interface IUserConfigArgs {
  name: string;
  configWebpack?: IUserConfigWebpack;
  defaultValue?: any;
  validation?: ValidationKey | IValidation;
  ignoreTasks?: string[];
}

export interface IJestResult {
  results: AggregatedResult;
  globalConfig: GlobalConfig;
}

export interface IOnHookCallbackArg {
  err?: Error;
  args?: CommandArgs;
  stats?: MultiStats;
  url?: string;
  devServer?: WebpackDevServer;
  config?: any;
  result?: IJestResult;
}

export interface IOnGetWebpackConfig {
  (...args: IOnGetWebpackConfigArgs): void;
}

export interface IJestConfigFunction {
  (JestConfig: Json): Json;
}

export interface IApplyMethodAPI {
  (name: string, ...args: any[]): any;
}

export interface ICancelTask {
  (name: string): void;
}

export interface IOnHookCallback {
  (arg?: IOnHookCallbackArg): MaybePromise<void>;
}

export interface IMethodRegistration {
  (args?: any): void;
}

export interface IMethodCurry {
  (data?: any): IMethodRegistration;
}

export interface IMethodOptions {
  pluginName?: string;
}

type IMethod = [string, string] | string;

export interface IApplyMethod {
  (config: IMethod, ...args: any[]): any;
}

export interface IRegisterMethod {
  (name: string, fn: IMethodFunction, options?: IMethodOptions): void;
}

export interface IRegisterTask {
  (name: string, chainConfig: WebpackChain): void;
}

export interface IUserConfigRegistration {
  [key: string]: IUserConfigArgs;
}

export interface ICliOptionRegistration {
  [key: string]: ICliOptionArgs;
}

export interface ICliOptionArgs {
  name: string;
  configWebpack?: IUserConfigWebpack;
  commands?: string[];
  ignoreTasks?: string[];
}

export interface IModifyRegisteredConfigCallbacks<T> {
  (configArgs: T): T;
}

export interface IModifyConfigRegistration {
  (configFunc: IModifyRegisteredConfigCallbacks<IUserConfigRegistration>): void;
  (configName: string, configFunc: IModifyRegisteredConfigCallbacks<IUserConfigArgs>): void;
}

export interface IModifyCliRegistration {
  (configFunc: IModifyRegisteredConfigCallbacks<ICliOptionRegistration>): void;
  (configName: string, configFunc: IModifyRegisteredConfigCallbacks<ICliOptionArgs>): void;
}

export type IModifyRegisteredConfigArgs =
  | [string, IModifyRegisteredConfigCallbacks<IUserConfigArgs>]
  | [IModifyRegisteredConfigCallbacks<IUserConfigRegistration>];

export type IModifyRegisteredCliArgs =
  | [string, IModifyRegisteredConfigCallbacks<ICliOptionArgs>]
  | [IModifyRegisteredConfigCallbacks<ICliOptionRegistration>];

export type IOnGetWebpackConfigArgs = [string, IPluginConfigWebpack] | [IPluginConfigWebpack];

export type IMethodFunction = IMethodRegistration | IMethodCurry;

export type IPluginOptions = Json | JsonArray;

export type IRegistrationKey = 'modifyConfigRegistrationCallbacks' | 'modifyCliRegistrationCallbacks';

class Context {
  command: CommandName;

  commandArgs: CommandArgs;

  rootDir: string;

  pkg: Json;

  originalUserConfig: IUserConfig;

  plugins: any[];

  commandModules: ICommandModules = {};

  webpack: IWebpack;

  userConfig: IUserConfig;

  private options: IContextOptions;

  // 通过registerTask注册，存放初始的webpack-chain配置
  private configArr: ITaskConfig[];

  private modifyJestConfig: IJestConfigFunction[];

  private methodRegistration: { [name: string]: [IMethodFunction, any] };

  private eventHooks: {
    [name: string]: IOnHookCallback[];
  };

  private cancelTaskNames: string[];

  private userConfigRegistration: IUserConfigRegistration;

  private cliOptionRegistration: ICliOptionRegistration;

  private modifyConfigFns: IOnGetWebpackConfigArgs[];

  private modifyConfigRegistrationCallbacks: IModifyRegisteredConfigArgs[];

  private modifyCliRegistrationCallbacks: IModifyRegisteredCliArgs[];

  private internalValue: IHash<any>;

  constructor(options: IContextOptions) {
    const { rootDir = process.cwd(), args = {}, command } = options || {};
    this.rootDir = rootDir;
    this.options = options;
    this.commandArgs = args;
    this.command = command;
    this.configArr = [];
    this.eventHooks = {};
    this.methodRegistration = {};
    this.cancelTaskNames = [];
    this.modifyConfigFns = [];
    this.modifyJestConfig = [];
    this.internalValue = {};
    this.userConfigRegistration = {};
    this.cliOptionRegistration = {};
    this.modifyConfigRegistrationCallbacks = [];
    this.modifyCliRegistrationCallbacks = [];
    this.pkg = this.getProjectFile(PKG_FILE);
  }

  resolvePlugins = (builtInPlugins: IPluginList): Array<Record<string, any>> => {
    const userPlugins = [...builtInPlugins, ...(this.userConfig.plugins || [])].map(
      (pluginInfo): Record<string, any> => {
        let fn: any = (): void => {};
        if (_.isFunction(pluginInfo)) {
          return {
            fn: pluginInfo,
            option: {},
          };
        }
        const plugins: [string, IPluginOptions] = Array.isArray(pluginInfo) ? pluginInfo : [pluginInfo, undefined];
        const pluginResolveDir = process.env.EXTRA_PLUGIN_DIR
          ? [process.env.EXTRA_PLUGIN_DIR, this.rootDir]
          : [this.rootDir];
        const pluginPath = path.isAbsolute(plugins[0])
          ? plugins[0]
          : require.resolve(plugins[0], { paths: pluginResolveDir });
        const options = plugins[1];
        fn = require(pluginPath);
        return {
          name: plugins[0],
          pluginPath,
          fn: fn.default || fn || ((): void => {}),
          options,
        };
      },
    );
    return userPlugins;
  };

  registerMethod: IRegisterMethod = (name, fn, options) => {
    if (this.methodRegistration[name]) {
      throw new Error(`[Error] method '${name}' already registered`);
    } else {
      const registration = [fn, options] as [IMethodFunction, IMethodOptions];
      this.methodRegistration[name] = registration;
    }
  };

  applyMethod: IApplyMethod = (config, ...args) => {
    const [methodName, pluginName] = Array.isArray(config) ? config : [config];
    if (this.methodRegistration[methodName]) {
      const [registerMethod, methodOptions] = this.methodRegistration[methodName];
      if (methodOptions?.pluginName) {
        return (registerMethod as IMethodCurry)(pluginName)(...args);
      } else {
        return (registerMethod as IMethodRegistration)(...args);
      }
    } else {
      throw new Error(`apply unknown method ${methodName}`);
    }
  };

  resolveConfig = async (): Promise<void> => {
    this.userConfig = await this.getUserConfig();
    this.originalUserConfig = { ...this.userConfig };
    const { plugins = [], getBuiltInPlugins = () => [] } = this.options;
    const builtInPlugins: IPluginList = [...plugins, ...getBuiltInPlugins(this.userConfig)];
    const webpackInstancePath = this.userConfig.customWebpack
      ? require.resolve('webpack', { paths: [this.rootDir] })
      : 'webpack';
    this.webpack = require(webpackInstancePath);
    this.plugins = this.resolvePlugins(builtInPlugins);
  };

  applyHook = async (key: string, opts = {}): Promise<void> => {
    const hooks = this.eventHooks[key] || [];

    for (const fn of hooks) {
      await fn(opts);
    }
  };

  onHook: IOnHook = async (key, fn) => {
    if (!Array.isArray(this.eventHooks[key])) {
      this.eventHooks[key] = [];
    }
    this.eventHooks[key].push(fn);
  };

  registerTask: IRegisterTask = async (name, chainConfig) => {
    const exist = this.configArr.find((config): boolean => config.name === name);
    if (!exist) {
      this.configArr.push({
        name,
        chainConfig,
        modifyFunctions: [],
      });
    } else {
      throw new Error(`[Error] config '${name}' already exists!`);
    }
  };

  getAllTask = (): string[] => {
    return this.configArr.map((config) => config.name);
  };

  getAllPlugin = (dataKeys = ['pluginPath', 'options', 'name']) => {
    return this.plugins.map((pluginInfo) => {
      return _.pick(pluginInfo, dataKeys);
    });
  };

  cancelTask: ICancelTask = (name) => {
    if (this.cancelTaskNames.includes(name)) {
      log.info('TASK', `task ${name} has already been canceled`);
    } else {
      this.cancelTaskNames.push(name);
    }
  };

  onGetWebpackConfig: IOnGetWebpackConfig = (...args: IOnGetWebpackConfigArgs) => {
    this.modifyConfigFns.push(args);
  };

  onGetJestConfig = (fn: IJestConfigFunction) => {
    this.modifyJestConfig.push(fn);
  };

  setValue = (key: string | number, value: any) => {
    this.internalValue[key] = value;
  };

  getValue = (key: string | number): any => {
    return this.internalValue[key];
  };

  registerUserConfig = (args: MaybeArray<IUserConfigArgs>): void => {
    this.registerConfig('userConfig', args);
  };

  registerCliOption = (args: MaybeArray<ICliOptionArgs>): void => {
    this.registerConfig('cliOption', args, (name) => {
      return camelCase(name, { pascalCase: false });
    });
  };

  hasRegistration = (name: string, type: 'cliOption' | 'userConfig' = 'userConfig'): boolean => {
    const mappedType = type === 'userConfig' ? 'userConfigRegistration' : 'cliOptionRegistration';
    return Object.keys(this[mappedType] || {}).includes(name);
  };

  hasMethod: IHasMethod = (name) => {
    return !!this.methodRegistration[name];
  };

  modifyUserConfig: IModifyUserConfig = (configKey, value, options) => {
    const errorMsg = 'config plugins is not support to be modified';
    const { deepmerge: mergeInDeep } = options;
    if (typeof configKey === 'string') {
      if (configKey === 'plugins') {
        throw new Error(errorMsg);
      }
      const configPath = configKey.split('.');
      const originalValue = _.get(this.userConfig, configPath);
      const newValue = typeof value !== 'function' ? value : value(originalValue);
      // eslint-disable-next-line max-len
      _.set(this.userConfig, configPath, mergeInDeep ? mergeConfig<JsonValue>(originalValue, newValue) : newValue);
    } else if (typeof configKey === 'function') {
      const modifiedValue = configKey(this.userConfig);
      if (_.isPlainObject(modifiedValue)) {
        if (Object.prototype.hasOwnProperty.call(modifiedValue, 'plugins')) {
          // remove plugins while it is not support to be modified
          log.verbose('[modifyUserConfig]', 'delete plugins of user config while it is not support to be modified');
          delete modifiedValue.plugins;
        }
        Object.keys(modifiedValue).forEach((modifiedConfigKey) => {
          const originalValue = this.userConfig[modifiedConfigKey];
          this.userConfig[modifiedConfigKey] = mergeInDeep
            ? mergeConfig<JsonValue>(originalValue, modifiedValue[modifiedConfigKey])
            : modifiedValue[modifiedConfigKey];
        });
      } else {
        throw new Error('modifyUserConfig must return a plain object');
      }
    }
  };

  modifyConfigRegistration: IModifyConfigRegistration = (...args: IModifyRegisteredConfigArgs) => {
    this.modifyConfigRegistrationCallbacks.push(args);
  };

  modifyCliRegistration: IModifyCliRegistration = (...args: IModifyRegisteredCliArgs) => {
    this.modifyCliRegistrationCallbacks.push(args);
  };

  runConfigModification = async (): Promise<void> => {
    const callbackRegistrations = ['modifyConfigRegistrationCallbacks', 'modifyCliRegistrationCallbacks'];
    callbackRegistrations.forEach((registrationKey) => {
      const registrations = this[registrationKey as IRegistrationKey] as Array<
      IModifyRegisteredConfigArgs | IModifyRegisteredConfigArgs
      >;
      registrations.forEach(([name, callback]) => {
        const modifyAll = _.isFunction(name);
        const configRegistrations =
          this[
            registrationKey === 'modifyConfigRegistrationCallbacks' ? 'userConfigRegistration' : 'cliOptionRegistration'
          ];
        if (modifyAll) {
          const modifyFunction = name as IModifyRegisteredConfigCallbacks<IUserConfigRegistration>;
          const modifiedResult = modifyFunction(configRegistrations);
          Object.keys(modifiedResult).forEach((configKey) => {
            configRegistrations[configKey] = {
              ...(configRegistrations[configKey] || {}),
              ...modifiedResult[configKey],
            };
          });
        } else if (typeof name === 'string') {
          if (!configRegistrations[name]) {
            throw new Error(`Config key '${name}' is not registered`);
          }
          const configRegistration = configRegistrations[name];
          configRegistrations[name] = {
            ...configRegistration,
            ...callback(configRegistration),
          };
        }
      });
    });
  };

  runUserConfig = async (): Promise<void> => {
    for (const configInfoKey in this.userConfig) {
      if (!['plugins', 'customWebpack'].includes(configInfoKey)) {
        const configInfo = this.userConfigRegistration[configInfoKey];
        if (!configInfo) {
          throw new Error(`[Config File] Config key '${configInfoKey}' is not supported`);
        }
        const { name, validation, ignoreTasks } = configInfo;
        const configValue = this.userConfig[name];

        if (validation) {
          let validationInfo;
          if (_.isString(validation)) {
            // split validation string
            const supportTypes = validation.split('|') as ValidationKey[];
            validationInfo = supportTypes.some((supportType) => {
              const fnName = VALIDATION_MAP[supportType];
              if (!fnName) {
                throw new Error(`validation does not support ${supportType}`);
              }
              return _[fnName](configValue);
            });
          } else {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            validationInfo = await validation(configValue);
          }
        }

        if (configInfo.configWebpack) {
          await this.runConfigWebpack(configInfo.configWebpack, configValue, ignoreTasks);
        }
      }
    }
  };

  runConfigWebpack = async (fn: IUserConfigWebpack, configValue: JsonValue, ignoreTasks: string[] | null) => {
    for (const webpackConfig of this.configArr) {
      const taskName = webpackConfig.name;
      let ignoreConfig = false;
      if (Array.isArray(ignoreTasks)) {
        ignoreConfig = ignoreTasks.some((ignoreTask) => {
          return new RegExp(ignoreTask).exec(taskName);
        });
      }

      if (!ignoreConfig) {
        const userConfigContext = {
          ..._.pick(this, PLUGIN_CONTEXT_KEY),
          taskName,
        };
        await fn(webpackConfig.chainConfig, configValue, userConfigContext);
      }
    }
  };

  runWebpackFunctions = async (): Promise<void> => {
    this.modifyConfigFns.forEach(([name, func]) => {
      const isAll = _.isFunction(name);
      if (isAll) {
        this.configArr.forEach((config) => {
          config.modifyFunctions.push(name);
        });
      } else {
        this.configArr.forEach((config) => {
          if (config.name === name) {
            config.modifyFunctions.push(func);
          }
        });
      }
    });

    for (const configInfo of this.configArr) {
      for (const func of configInfo.modifyFunctions) {
        await func(configInfo.chainConfig);
      }
    }
  };

  runCliOption = async () => {
    for (const cliOpt in this.commandArgs) {
      if (this.command !== 'test' || cliOpt !== 'jestArgv') {
        const { commands, name, configWebpack, ignoreTasks } = this.cliOptionRegistration[cliOpt] || {};
        if (!name || !(commands || []).includes(this.command)) {
          throw new Error(`cli option '${cliOpt}' is not supported when run command '${this.command}'`);
        }
        if (configWebpack) {
          await this.runConfigWebpack(configWebpack, this.commandArgs[cliOpt], ignoreTasks);
        }
      }
    }
  };

  registerCommandModules(moduleKey: string, module: CommandModule<any>): void {
    if (this.commandModules[moduleKey]) {
      log.warn('CONFIG', `command module ${moduleKey} already been registered`);
    }
    this.commandModules[moduleKey] = module;
  }

  getCommandModule(options: {
    command: CommandName;
    commandArgs: CommandArgs;
    userConfig: IUserConfig;
  }): CommandModule<any> {
    const { command } = options;
    if (this.commandModules[command]) {
      return this.commandModules[command];
    } else {
      throw new Error(`command ${command} is not support`);
    }
  }

  setUp = async (): Promise<ITaskConfig[]> => {
    await this.resolveConfig();
    await this.runPlugins();
    await this.runConfigModification();
    await this.runUserConfig();
    await this.runWebpackFunctions();
    await this.runCliOption();
    this.configArr = this.configArr.filter((config) => !this.cancelTaskNames.includes(config.name));
    return this.configArr;
  };

  getWebpackConfig = (): ITaskConfig[] => {
    return this.configArr;
  };

  run = async <T, P>(options?: T): Promise<P> => {
    const { command, commandArgs } = this;
    await this.setUp();
    const commandModule = this.getCommandModule({ command, commandArgs, userConfig: this.userConfig });
    return commandModule(this, options);
  };

  private registerConfig = (
    type: string,
    args: MaybeArray<IUserConfigArgs> | MaybeArray<ICliOptionArgs>,
    parseName?: (name: string) => string,
  ) => {
    const registerKey = `${type}Registration` as 'userConfigRegistration' | 'cliOptionRegistration';
    if (!this[registerKey]) {
      throw new Error(`unknown register type: ${type}, use available types (userConfig or cliOption) instead`);
    }

    const configArr = _.isArray(args) ? args : [args];
    configArr.forEach((conf): void => {
      const confName = parseName ? parseName(conf.name) : conf.name;
      if (this[registerKey][confName]) {
        throw new Error(`${conf.name} already registered in ${type}`);
      }

      this[registerKey][confName] = conf;

      if (
        type === 'userConfig' &&
        _.isUndefined(this.userConfig[confName]) &&
        Object.prototype.hasOwnProperty.call(conf, 'defaultValue')
      ) {
        this.userConfig[confName] = (conf as IUserConfigArgs).defaultValue;
      }
    });
  };

  private getProjectFile = (fileName: string): Json => {
    const configPath = path.resolve(this.rootDir, fileName);

    let config = {};
    if (fs.existsSync(configPath)) {
      config = fs.readJsonSync(configPath);
    }

    return config;
  };

  private getUserConfig = async (): Promise<IUserConfig> => {
    const { config } = this.commandArgs;
    let configPath = '';
    if (config) {
      configPath = path.isAbsolute(config) ? config : path.resolve(this.rootDir, config);
    } else {
      const [defaultUserConfig] = await fg(USER_CONFIG_FILE, { cwd: this.rootDir, absolute: true });
      configPath = defaultUserConfig;
    }
    let userConfig: IUserConfig = {
      plugins: [],
    };

    if (configPath && fs.existsSync(configPath)) {
      userConfig = JSON5.parse(fs.readFileSync(configPath, 'utf8'));
    }
    return userConfig;
  };

  private runPlugins = async (): Promise<void> => {
    for (const pluginInfo of this.plugins) {
      const { fn, options, name: pluginName } = pluginInfo;
      const pluginContext = _.pick(this, PLUGIN_CONTEXT_KEY);
      const applyMethod: IApplyMethodAPI = (methodName, ...args) => {
        return this.applyMethod([methodName, pluginName], ...args);
      };

      const pluginAPI = {
        log,
        context: pluginContext,
        registerTask: this.registerTask,
        getAllTask: this.getAllTask,
        getAllPlugin: this.getAllPlugin,
        cancelTask: this.cancelTask,
        onGetWebpackConfig: this.onGetWebpackConfig,
        onGetJestConfig: this.onGetJestConfig,
        onHook: this.onHook,
        setValue: this.setValue,
        getValue: this.getValue,
        registerUserConfig: this.registerUserConfig,
        hasRegistration: this.hasRegistration,
        registerCliOption: this.registerCliOption,
        registerMethod: this.registerMethod,
        applyMethod,
        hasMethod: this.hasMethod,
        modifyUserConfig: this.modifyUserConfig,
        modifyConfigRegistration: this.modifyConfigRegistration,
        modifyCliRegistration: this.modifyCliRegistration,
      };
      await fn(pluginAPI, options);
    }
  };
}

export default Context;
