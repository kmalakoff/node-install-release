export type StorageLocations = {
  cachePath: string;
  buildPath: string;
  installPath: string;
};

export type InstallResult = {
  version: string;
  installPath: string;
  execPath: string;
};

export interface InstallOptions {
  installPath?: string;
  name?: string;
  storagePath?: string;
  filename?: string;
}

export type InstallCallback = (err?: Error, result?: InstallResult) => void;
