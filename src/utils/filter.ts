import { CustomConfig } from "../../types/index";
import _ from "lodash";

export class ConfigFilter {
  config: CustomConfig;
  constructor(config: CustomConfig) {
    this.config = config;
  }

  isEnableRecord(): boolean {
    return (
      _.get(this.config, "store.local-storage-advance.record_scope.enable") ==
      true
    );
  }

  isExtractReadme(): boolean {
    return _.get(
      this.config,
      "store.local-storage-advance.extract_readme",
      false
    );
  }

  isInRecordList(package_name: string): boolean {
    return _.map(_.get(this.config, "packages", {}), (value: any, key) => {
      if (value.record == true) {
        return key.replace(/\*$/i, "");
      }
    })
      .filter(value => value !== undefined)
      .some(filter => new RegExp(`^${filter}`).test(package_name));
  }

  isInRecordFilterList(package_name: string): boolean {
    return _.get(
      this.config,
      "store.local-storage-advance.record_scope.filter",
      []
    ).some(filter => new RegExp(`${filter}`).test(package_name));
  }
}
