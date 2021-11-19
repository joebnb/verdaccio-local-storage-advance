import _ from "lodash";
import os from "os";
import path from "path";
import buildDebug from "debug";

import LocalDatabase from "@verdaccio/local-storage";
import { getMatchedPackagesSpec } from "@verdaccio/utils";

import { CustomConfig } from "../types/index";
import LocalStorageFS from "./local-fs";

import {
  Logger,
  Callback,
  IPluginStorage,
  PluginOptions,
  IPackageStorage,
  Config,
  onEndSearchPackage,
  onSearchPackage,
  onValidatePackage
} from "@verdaccio/types";

const debug = buildDebug("verdaccio:plugin:local-storage:experimental");

export default class VerdaccioStoragePlugin extends LocalDatabase
  implements IPluginStorage<CustomConfig> {
  config: CustomConfig & Config;
  version?: string;
  options: PluginOptions<CustomConfig>;
  public logger: Logger;
  public constructor(
    config: CustomConfig,
    options: PluginOptions<CustomConfig>
  ) {
    super(config, options.logger);
    this.config = config;
    this.logger = options.logger;
    this.options = options;
  }

  // /**
  //  * Add a new element.
  //  * @param {*} name
  //  * @return {Error|*}
  //  */
  public async add(name: string, callback: Callback): Promise<void> {
    return await super.add.apply(this, arguments as any);
  }

  /**
   * Perform a search in your registry
   * @param onPackage
   * @param onEnd
   * @param validateName
   */
  public async search(
    onPackage: onSearchPackage,
    onEnd: onEndSearchPackage,
    validateName: onValidatePackage
  ): Promise<void> {
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
  public async remove(name: string, callback: Callback): Promise<void> {
    return await super.remove.apply(this, arguments as any);
  }

  /**
   * Return all database elements.
   * @return {Array}
   */
  public async get(callback: Callback): Promise<void> {
    return await super.get.apply(this, arguments as any);
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
    const globalConfigStorage = this.getStoragePath();
    if (_.isNil(globalConfigStorage)) {
      this.logger.error(
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

  private getStoragePath() {
    const { storage } = this.config;
    if (typeof storage !== "string") {
      throw new TypeError("storage field is mandatory");
    }

    const storagePath = path.isAbsolute(storage)
      ? storage
      : path.normalize(path.join(this.getBaseConfigPath(), storage));
    debug("storage path %o", storagePath);
    return storagePath;
  }

  private getBaseConfigPath(): string {
    const default_config_path = path.join(
      os.homedir(),
      ".config",
      "verdaccio",
      "config.yaml"
    );
    return path.dirname(this.config.config_path || default_config_path);
  }
}
