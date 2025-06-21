import type { VersionOptions } from 'node-resolve-versions';

export interface File {
  filename: string;
  starting: string;
}

export interface FilePath {
  src: string;
  dest: string;
  optional?: boolean;
}

export type StorageLocations = {
  cachePath: string;
  buildPath: string;
  installPath: string;
};

export type InstallResult = {
  version: string;
  installPath: string;
  execPath: string;
  platform: NodeJS.Platform;
};

export interface InstallOptions extends VersionOptions {
  type?: string;
  compression?: boolean;
  installPath?: string;
  buildPath?: string;
  name?: string;
  storagePath?: string;
  filename?: string;
  platform?: NodeJS.Platform;
  arch?: NodeJS.Architecture;
  cachePath?: string;
}

export interface Target {
  platform: NodeJS.Platform;
  arch: NodeJS.Architecture;
}

export type InstallCallback = (err?: Error, result?: InstallResult) => void;
export type NoParamCallback = (err?: Error) => void;
