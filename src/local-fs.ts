import _ from "lodash";
import LocalStorageFS from "@verdaccio/local-storage/lib/local-fs";

import LocalDB from "./local-db";
import { FSHelper } from "./utils/fs-helper";
import { ConfigFilter } from "./utils/filter";
import { getTarballVersion, getDistTarballUrl } from "./utils/package-util";

import { CustomConfig } from "../types/index";
import { ReadTarball } from "@verdaccio/streams";
import {
  Callback,
  IUploadTarball,
  Package,
  PluginOptions
} from "@verdaccio/types";

export default class LocalFS extends LocalStorageFS {
  fsHelper: FSHelper;
  localDB: LocalDB;
  config: CustomConfig;
  filter: ConfigFilter;
  constructor(
    config: CustomConfig,
    options: PluginOptions<CustomConfig>,
    path: string
  ) {
    const logger = options.logger;
    super(path, logger);
    this.config = config;
    this.fsHelper = new FSHelper(path, logger);
    this.localDB = new LocalDB(config, options);
    this.filter = new ConfigFilter(config);
  }

  public savePackage(name: string, value: Package, cb: Callback): void {
    this._addToDb(name);

    if (this.filter.isExtractReadme()) {
      this._addReadmeGuide(value);
    }

    super.savePackage.apply(this, arguments as any);
  }

  public updatePackage(
    name: string,
    updateHandler: Callback,
    onWrite: Callback,
    transformPackage: Function,
    onEnd: Callback
  ) {
    this._addToDb(name);

    const updateHandlerWarpper = (pkg, error) => {
      if (this.filter.isExtractReadme() && pkg?.readme != undefined) {
        this._addReadmeGuide(pkg);
      }
      updateHandler(pkg, error);
    };

    super.updatePackage(
      name,
      updateHandlerWarpper,
      onWrite,
      transformPackage,
      onEnd
    );
  }

  public async removePackage(): Promise<void> {
    if (this.filter.isEnableRecord()) {
      await this._removePackageDB();
    }
    return await super.removePackage.apply(this, arguments as any);
  }

  public writeTarball(name: string): IUploadTarball {
    const uploadStream = super.writeTarball.apply(this, arguments as any);

    if (this.filter.isExtractReadme()) {
      this._updateReadme(name, uploadStream);
    }

    return uploadStream;
  }

  public createPackage(name: string, value: Package, cb: Callback): void {
    super.createPackage.apply(this, arguments as any);
  }

  public readPackage(name: string, cb: Callback): void {
    super.readPackage.apply(this, arguments as any);
  }

  public async deletePackage(packageName: string): Promise<void> {
    return await super.deletePackage.apply(this, arguments as any);
  }

  public readTarball(name: string): ReadTarball {
    return super.readTarball.apply(this, arguments as any);
  }

  private _addToDb(name: string) {
    const isEnableRecord = this.filter.isEnableRecord();
    const isInFilter = this.filter.isInRecordFilterList(name);
    const isInRecordList = this.filter.isInRecordList(name);
    if (isEnableRecord && isInRecordList && !isInFilter) {
      this.localDB.add(name, () => {
        this.logger.info(`add package ${name} to db`);
      });
    }
  }

  private async _addReadmeGuide(pkg: Package) {
    if (pkg && pkg.readme?.toLocaleLowerCase() == "readme.md") {
      const packageName = pkg.name;
      const latestVersion = pkg["dist-tags"]?.latest;
      const latestTarball = getDistTarballUrl(packageName, latestVersion);

      pkg["_getReadmeFromTarball"] = true;
      pkg[
        "readme"
      ] = `**\`Refresh\`** this page to show README, [click here](/-/web/detail/${packageName}) to refresh.\n![ ](${latestTarball}) `;
    }
  }

  private async _updateReadme(tarball_name: string, FileStream) {
    const tarballVersion = getTarballVersion(tarball_name);

    const packageJSONPath = this.fsHelper._getStoragePath(".");
    this.fsHelper.readPackage(packageJSONPath).then(pkg => {
      const latestVersion = pkg["dist-tags"]?.latest;
      if (pkg._getReadmeFromTarball && latestVersion == tarballVersion) {
        this.fsHelper.readTarFile("readme.md", FileStream).then(data => {
          pkg.readme = data;
          this.fsHelper.savePackage(packageJSONPath, pkg);
        });
      }
    });
  }

  private async _removePackageDB() {
    const package_path = this.fsHelper._getStoragePath(".");
    return this.fsHelper
      .readPackage(package_path)
      .then(async d => {
        if (d && d.name) {
          this.logger.info(`remove ${d.name} from db`);
          this.localDB.remove(d.name, () => {});
        }
      })
      .catch(e => {
        this.logger.error(e);
      });
  }
}
