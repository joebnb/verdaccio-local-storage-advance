import { Config } from "@verdaccio/types";

export interface CustomConfig extends Config {
  foo: string;
}

export declare type SearchMetrics = {
  quality: number;
  popularity: number;
  maintenance: number;
};
export declare type UnStable = {
  flags?: {
    unstable?: boolean;
  };
};
export declare type SearchItemPkg = {
  name: string;
  scoped?: string;
  path?: string;
  time?: number | Date;
};
export declare type SearchItem = {
  package: SearchItemPkg;
  score: Score;
} & UnStable;
export declare type Score = {
  final: number;
  detail: SearchMetrics;
};
export declare type SearchResults = {
  objects: SearchItemPkg[];
  total: number;
  time: string;
};
declare type PublisherMaintainer = {
  username: string;
  email: string;
};
export declare type SearchPackageBody = {
  name: string;
  scope: string;
  description: string;
  author: string | PublisherMaintainer;
  version: string;
  keywords: string | string[] | undefined;
  date: string;
  links?: {
    npm: string;
    homepage?: string;
    repository?: string;
    bugs?: string;
  };
  publisher?: any;
  maintainers?: PublisherMaintainer[];
};
export declare type SearchPackageItem = {
  package: SearchPackageBody;
  score: Score;
  searchScore?: number;
} & UnStable;
export declare const UNSCOPED = "unscoped";
export declare type SearchQuery = {
  text: string;
  size?: number;
  from?: number;
} & SearchMetrics;
export {};
