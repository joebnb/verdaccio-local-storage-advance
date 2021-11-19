import _ from "lodash";
import os, { type } from "os";
import path from "path";
import buildDebug from "debug";

import LocalDatabase from "@verdaccio/local-storage";
import { getMatchedPackagesSpec } from "@verdaccio/utils";

import LocalStorageFS from "./local-fs";
import {
  CustomConfig,
  SearchItemPkg,
  Score,
  SearchQuery,
  SearchItem
} from "../types/index";
import {
  Logger,
  Callback,
  IPluginStorage,
  PluginOptions,
  IPackageStorage,
  Config
} from "@verdaccio/types";

const debug = buildDebug("verdaccio:plugin:local-storage:experimental");

export default class VerdaccioStoragePlugin extends LocalDatabase
  implements IPluginStorage<CustomConfig> {
  config: CustomConfig & Config;
  version?: string;
  options: PluginOptions<CustomConfig>;
  private _logger: Logger;
  public constructor(
    config: CustomConfig,
    options: PluginOptions<CustomConfig>
  ) {
    super(config, options.logger);
    this.config = config;
    this._logger = options.logger;
    this.options = options;
  }
  init() {
    return super.init.apply(this, arguments as any);
  }

  public async getSecret(): Promise<string> {
    return super.getSecret.apply(this, arguments as any);
  }
  public async setSecret(secret: string): Promise<void> {
    return super.setSecret.apply(this, arguments as any);
  }

  // /**
  //  * Add a new element.
  //  * @param {*} name
  //  * @return {Error|*}
  //  */
  public async add(name: string): Promise<void> {
    return await super.add.apply(this, arguments as any);
  }

  /**
   * Return all database elements.
   * @return {Array}
   */
  public async get(): Promise<void> {
    return await super.get.apply(this, arguments as any);
  }

  public async getScore(_pkg: SearchItemPkg): Promise<Score> {
    return await super.getScore.apply(this, arguments as any);
  }

  /**
   * Perform a search in your registry
   * @param onPackage
   * @param onEnd
   * @param validateName
   */
  public async search(query: SearchQuery): Promise<SearchItem[]> {
    /**
     * Example of implementation:
     * try {
     *  someApi.getPackages((items) => {
     *   items.map(() => {
     *     if (validateName(item.name)) {
     *       onPackage(item);
     *     }
     *   });
     *  onEnd();
     * } catch(err) {
     *   onEnd(err);
     * }
     * });
     */
    return await super.search.apply(this, arguments as any);
  }

  /**
   * Remove an element from the database.
   * @param {*} name
   * @return {Error|*}
   */
  public async remove(name: string): Promise<void> {
    return await super.remove.apply(this, arguments as any);
  }

  public async clean(): Promise<void> {
    return super.clean.apply(this, arguments as any);
  }

  public getPackageStorage(packageName: string): IPackageStorage {
    const packageAccess = getMatchedPackagesSpec(
      packageName,
      this.config.packages
    );

    const packagePath: string = this._getLocalStoragePathChild(
      packageAccess ? packageAccess.storage : undefined
    );

    debug("storage path selected: ", packagePath);
    if (_.isString(packagePath) === false) {
      debug("the package %o has no storage defined ", packageName);
      return;
    }

    const packageStoragePath: string = path.join(
      path.resolve(this.getBaseConfigPath(), packagePath),
      packageName
    );

    debug("storage absolute path: ", packageStoragePath);
    return new LocalStorageFS(this.config, this.options, packageStoragePath);
  }
  private _getLocalStoragePathChild(storage: string | void): string {
    const globalConfigStorage = this.getStoragePathChild();
    if (_.isNil(globalConfigStorage)) {
      this._logger.error(
        "property storage in config.yaml is required for using  this plugin"
      );
      throw new Error(
        "property storage in config.yaml is required for using  this plugin"
      );
    } else {
      if (typeof storage === "string") {
        return path.join(globalConfigStorage as string, storage as string);
      }

      return globalConfigStorage as string;
    }
  }

  private getStoragePathChild() {
    const { storage } = this.config;
    if (typeof storage !== "string") {
      throw new TypeError("storage field is mandatory");
    }

    const storagePath = path.isAbsolute(storage)
      ? storage
      : path.normalize(path.join(this.getBaseConfigPathChild(), storage));
    debug("storage path %o", storagePath);
    return storagePath;
  }

  private getBaseConfigPathChild(): string {
    const default_config_path = path.join(
      os.homedir(),
      ".config",
      "verdaccio",
      "config.yaml"
    );
    return path.dirname(this.config.config_path || default_config_path);
  }
}
