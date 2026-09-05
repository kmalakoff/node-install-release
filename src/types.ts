import type { VersionOptions } from 'node-resolve-versions';

export interface File {
  filename: string;
  starting: string;
}

// process.report.getReport().header: glibcVersionRuntime is a string on glibc and absent on musl
export interface ReportHeader {
  glibcVersionRuntime?: string;
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

// InstallOptions after createStoragePaths/DEFAULT_STORAGE_PATHS have been merged in.
export type ResolvedInstallOptions = InstallOptions & StorageLocations;

export interface Target {
  platform: NodeJS.Platform;
  arch: NodeJS.Architecture;
}

export type ChecksumResult = {
  actual: string;
  expected: string;
  match: boolean;
};

export type InstallCallback = (err?: Error | null, result?: InstallResult) => void;
export type NoParamCallback = (err?: Error | null) => void;
export type ChecksumCallback = (err?: Error | null, checksum?: ChecksumResult) => void;
