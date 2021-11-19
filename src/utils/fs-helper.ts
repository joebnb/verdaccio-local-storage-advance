import fs from "fs/promises";
import path from "path";
import { createGunzip } from "zlib";
import tarStream from "tar-stream";

import { Logger } from "@verdaccio/types";
import { Stream } from "stream";

export const packageJSONFileName = "package.json";

export class FSHelper {
  path: string;
  logger: Logger;
  constructor(path: string, logger: Logger) {
    this.path = path;
    this.logger = logger;
  }
  public _getStoragePath(fileName = ""): string {
    const storagePath: string = path.join(this.path, fileName);
    return storagePath;
  }

  public async readPackage(package_path: string) {
    const packagePath = path.join(package_path, packageJSONFileName);
    const pkg = await fs.readFile(packagePath, { encoding: "utf-8" });
    return JSON.parse(pkg);
  }

  public async savePackage(package_path: string, pkg: any) {
    package_path = path.join(package_path, packageJSONFileName);
    const package_path_tmp = `package_path.tmp${String(Math.random()).substr(
      2
    )}`;
    await fs.writeFile(package_path_tmp, JSON.stringify(pkg), {
      encoding: "utf-8"
    });
    return await fs.rename(package_path_tmp, package_path);
  }

  public async readTarFile(file_path: string, fileStream: Stream) {
    return new Promise((resolve, reject) => {
      const extract = tarStream.extract();
      extract.on("entry", (header, stream, next) => {
        let file = "";

        stream.on("data", chunk => {
          file += chunk;
        });
        stream.on("end", function() {
          if (
            header?.name &&
            path.basename(header.name || "").toLowerCase() ==
              file_path.toLowerCase()
          ) {
            resolve(file);
          }
          file = "";
          next();
        });

        extract.on("finish", function() {
          file = "";
        });

        extract.on("error", e => {
          this.logger.error(e);
        });

        stream.resume();
      });

      fileStream.pipe(createGunzip()).pipe(extract);
    });
  }
}
