# verdaccio-local-storage-advance

📦 A alternative File system storage plugin base on `@verdaccio/local-storage` but adds useful external features:
  * record uplink package name in database list.
  * display README.md from tarball.

> note:this plugin only tested on verdaccio v5,it's also support v6 in theory,maybe support v4.

---

## Install
```shell
npm install verdaccio-local-storage-advance
```
## Introduce
### record_scope
save package name to database when create/update package meta data from uplink.

### extract_readme
if uplink data didn't contain readme,it will get readme from latest tarball and add into package meta data.

> note: extract_readme only execut once on latest tarball save to your local.other case not execute.

## Configuration
```yaml
store:
  local-storage-advance:
    record_scope:
      enable: true # enable record uplink package name feature. default: false | boolean string[]
      filter: ['^@babel','^@emotion/ui'] # ignore record scope / packages.default: [] | Regexp string[]
    extract_readme: true # enable extract readme from tarball. default: true | boolean

packages:
 '@nettools/*':
    access: $all
    publish: undefined
    unpublish: undefined
    proxy: arti
    record: true  # enable record for this uplink package scope

  '**':  # do not record global,it's will cause verdaccio work slow when have too many record.
    access: $all
    publish: undefined
    unpublish: undefined
    proxy: npmjs
```
## Change log
0.0.10 update deps

