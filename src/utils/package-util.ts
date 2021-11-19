import path from "path";
export function getTarballVersion(tarball_name: string) {
  const fileName = tarball_name.replace(path.extname(tarball_name), "");
  const lastSepreator = fileName.lastIndexOf("-") + 1;
  const version = fileName.substr(lastSepreator);
  return version;
}

export function getDistTarballUrl(package_name: string, version: string) {
  const basename = path.basename(package_name);
  return `/${package_name}/-/${basename}-${version}.tgz`;
}
